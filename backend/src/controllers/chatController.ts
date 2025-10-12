import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import ChatHistory from '../models/ChatHistory';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

// Extend Express Request to include user (when authenticated)
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Send a message and get AI response
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id || null; // Optional - supports anonymous chat

    console.log('💬 Received chat message:', { message, sessionId, userId });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch chat history for context
    const chatHistory = await ChatHistory.findOne({
      $or: [
        { userId: userId },
        { sessionId: sessionId }
      ]
    }).sort({ createdAt: -1 });

    // Build messages array with history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are CivicBot, a helpful civic engagement assistant. Introduce yourself as CivicBot. Help users report city issues, find information about their community, and answer questions about civic services. Answer in a clear, conversational, and well-structured way, just like ChatGPT. Use Markdown formatting for headings, lists, and highlights.'
      }
    ];

    // Add last 10 messages from history for context
    if (chatHistory && chatHistory.messages) {
      const recentMessages = chatHistory.messages.slice(-10);
      messages.push(...recentMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })));
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Use Hugging Face router endpoint with OpenAI SDK
    const HF_TOKEN = process.env.HF_TOKEN;
    const HF_MODEL = process.env.HF_MODEL;
    if (!HF_TOKEN) {
      console.error('❌ HF_TOKEN is missing from environment');
      return res.status(500).json({ error: 'Hugging Face token not configured on server' });
    }
    if (!HF_MODEL) {
      console.error('❌ HF_MODEL is missing from environment');
      return res.status(500).json({ error: 'Hugging Face model not configured (set HF_MODEL)' });
    }

    console.log('🔧 Using Hugging Face router model:', HF_MODEL);

    const client = new OpenAI({
      baseURL: 'https://router.huggingface.co/v1',
      apiKey: HF_TOKEN,
    });

    try {
      const chatCompletion = await client.chat.completions.create({
        model: HF_MODEL,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      });
      const aiResponse = chatCompletion.choices?.[0]?.message?.content;
      if (!aiResponse) {
        console.error('❌ Unexpected Hugging Face router response', chatCompletion);
        return res.status(502).json({ error: 'Hugging Face router returned unexpected response', details: chatCompletion });
      }
      console.log('✅ HF Router Response:', aiResponse);

      // Save to chat history
      const newMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [
        { role: 'user' as const, content: message, timestamp: new Date() },
        { role: 'assistant' as const, content: aiResponse, timestamp: new Date() }
      ];

      if (chatHistory) {
        chatHistory.messages.push(...newMessages);
        await chatHistory.save();
      } else {
        await ChatHistory.create({
          userId: userId,
          sessionId: sessionId || `anon-${Date.now()}`,
          messages: newMessages
        });
      }

      res.json({
        response: aiResponse,
        sessionId: chatHistory?.sessionId || sessionId
      });
    } catch (err: any) {
      console.error('❌ Hugging Face router request error:', err?.message || err);
      return res.status(502).json({ error: 'Hugging Face router request failed', details: err?.message || String(err) });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Health check for Hugging Face router
export const healthCheck = async (_req: Request, res: Response) => {
  const provider = 'huggingface-router';
  const status: any = { provider, checks: {} };

  if (process.env.HF_TOKEN && process.env.HF_MODEL) {
    try {
      const client = new OpenAI({
        baseURL: 'https://router.huggingface.co/v1',
        apiKey: process.env.HF_TOKEN,
      });
      const chatCompletion = await client.chat.completions.create({
        model: process.env.HF_MODEL,
        messages: [{ role: 'user', content: 'health check' }],
      });
      status.checks.huggingface = { ok: true, status: 200 };
    } catch (e: any) {
      status.checks.huggingface = { ok: false, error: e?.message || String(e) };
    }
  } else {
    status.checks.huggingface = { ok: false, error: 'HF_TOKEN or HF_MODEL not set' };
  }

  res.json(status);
};

// Get chat history
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const chatHistory = await ChatHistory.findOne({
      $or: [
        { userId: userId },
        { sessionId: sessionId }
      ]
    });

    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chatHistory.messages });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Clear chat history
export const clearChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    await ChatHistory.deleteOne({
      $or: [
        { userId: userId },
        { sessionId: sessionId }
      ]
    });

    res.json({ message: 'Chat history cleared' });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
