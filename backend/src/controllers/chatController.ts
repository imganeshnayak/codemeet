import { Request, Response } from 'express';
import ChatHistory from '../models/ChatHistory';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
        content: 'You are a helpful civic engagement assistant. Help users report city issues, find information about their community, and answer questions about civic services. Be concise and friendly.'
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

    // Call OpenRouter API
    console.log('🤖 Calling OpenRouter API...');
    console.log('📝 Sending messages:', JSON.stringify(messages, null, 2));

    // Read API key at request time so changes to process.env are respected
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    // Debug API key presence (masked)
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY is missing from environment');
      return res.status(500).json({ error: 'OpenRouter API key not configured on server' });
    }
    try {
      const masked = OPENROUTER_API_KEY.length > 10 ? `${OPENROUTER_API_KEY.slice(0,8)}...${OPENROUTER_API_KEY.slice(-4)}` : OPENROUTER_API_KEY;
      console.log('🔐 OPENROUTER_API_KEY present (masked):', masked);
    } catch (e) {
      console.log('🔐 OPENROUTER_API_KEY present');
    }
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5173',
        'X-Title': 'CodeMeet - Civic Engagement Platform',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: messages
      })
    });

    console.log('📡 OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenRouter API error:', errorData);
      return res.status(response.status).json({ 
        error: 'AI service error',
        details: errorData 
      });
    }

    const data = await response.json() as OpenRouterResponse;
    const aiResponse = data.choices[0].message.content;
    console.log('✅ AI Response:', aiResponse);

    // Save to chat history
    const newMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [
      { role: 'user' as const, content: message, timestamp: new Date() },
      { role: 'assistant' as const, content: aiResponse, timestamp: new Date() }
    ];

    if (chatHistory) {
      // Update existing history
      chatHistory.messages.push(...newMessages);
      await chatHistory.save();
    } else {
      // Create new history
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

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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
