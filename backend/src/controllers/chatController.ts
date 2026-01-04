import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import ChatHistory from '../models/ChatHistory';
import { detectLanguage, translateText, getLanguageName } from '../utils/translator';

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
    const { message, sessionId, ignoreHistory } = req.body;
    const userId = req.user?.id || null; // Optional - supports anonymous chat

    console.log('💬 Received chat message:', { message, sessionId, userId, ignoreHistory });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect user's language from their message
    const userLanguage = detectLanguage(message);
    const languageName = getLanguageName(userLanguage);
    console.log(`🌍 Detected language: ${languageName} (${userLanguage})`);

    // Build messages array with history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are CivicBot, a helpful civic engagement assistant. Introduce yourself as CivicBot.

Help users report city issues, find information about their community, and answer questions about civic services.

IMPORTANT FORMATTING RULES - YOU MUST FOLLOW THESE:
1. **Use Markdown Headings**: Start with ## for main sections, ### for subsections
2. **Use Bullet Points**: Use - or * for lists (never plain text lists)
3. **Use Numbered Lists**: Use 1., 2., 3. for sequential steps
4. **Use Bold Text**: Use **bold** for emphasis on important words or phrases
5. **Use Separators**: Use --- to create visual breaks between major sections
6. **Use Emojis**: Add relevant emojis (✅ ❌ 💡 🔹 📌 etc.) to make content engaging
7. **Short Paragraphs**: Keep paragraphs to 2-3 sentences max
8. **Clear Structure**: Always organize information hierarchically
9. **Visual Hierarchy**: Use spacing and formatting to create scannable content
10. **Use Code Blocks**: Use \`backticks\` for technical terms or specific values

EXAMPLE FORMAT FOR YOUR RESPONSES:

## 📋 Main Topic

Brief introduction (1-2 sentences).

### ✅ Step-by-Step Guide:

1. **First Step** - Brief description
2. **Second Step** - Brief description
3. **Third Step** - Brief description

---

### 💡 Important Points:

- **Point one** - Explanation
- **Point two** - Explanation
- **Point three** - Explanation

---

### 🔹 Additional Information:

Short paragraph with **key terms highlighted**.

---

Would you like help with something specific? Let me know! 😊

REMEMBER: Always structure your responses clearly with headings, lists, and visual elements!`
      }
    ];

    // Only fetch and use chat history if ignoreHistory is not true
    let chatHistory = null;
    if (!ignoreHistory && (userId || sessionId)) {
      // Only fetch history if we have a valid userId or sessionId
      const query: any = {};
      
      if (userId && sessionId) {
        query.$or = [
          { userId: userId },
          { sessionId: sessionId }
        ];
      } else if (userId) {
        query.userId = userId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      // Fetch chat history for context
      chatHistory = await ChatHistory.findOne(query).sort({ createdAt: -1 });

      // Add last 10 messages from history for context
      if (chatHistory && chatHistory.messages) {
        const recentMessages = chatHistory.messages.slice(-10);
        messages.push(...recentMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })));
      }
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
      console.log('✅ HF Router Response (English):', aiResponse.substring(0, 100) + '...');

      // Translate response to user's language if not English
      let finalResponse = aiResponse;
      let translationNote = '';
      if (userLanguage !== 'en') {
        console.log(`🔄 Translating response to ${languageName}...`);
        try {
          const translatedText = await translateText(aiResponse, 'en', userLanguage);
          
          // Check if translation actually happened (it will return original if not supported)
          if (translatedText !== aiResponse) {
            finalResponse = translatedText;
            console.log(`✅ Translation complete:`, finalResponse.substring(0, 100) + '...');
          } else {
            // Translation not available for this language
            console.log(`⚠️ Translation not available for ${languageName}, using English`);
            translationNote = `\n\n---\n\n*Note: Full ${languageName} translation is not yet available. Response provided in English.*`;
            finalResponse = aiResponse + translationNote;
          }
        } catch (translateError) {
          console.error('⚠️ Translation failed, using English response:', translateError);
          translationNote = `\n\n---\n\n*Note: Translation service temporarily unavailable. Response provided in English.*`;
          finalResponse = aiResponse + translationNote;
        }
      }

      // Save to chat history only if not ignoring history and we have a valid session
      if (!ignoreHistory && (userId || sessionId)) {
        const newMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [
          { role: 'user' as const, content: message, timestamp: new Date() },
          { role: 'assistant' as const, content: finalResponse, timestamp: new Date() }
        ];

        if (chatHistory) {
          chatHistory.messages.push(...newMessages);
          await chatHistory.save();
        } else {
          // Create new chat history only if we have a sessionId
          const effectiveSessionId = sessionId || (userId ? `user-${userId}` : `anon-${Date.now()}`);
          await ChatHistory.create({
            userId: userId,
            sessionId: effectiveSessionId,
            messages: newMessages
          });
        }
      }

      res.json({
        response: finalResponse,
        sessionId: chatHistory?.sessionId || sessionId,
        detectedLanguage: userLanguage,
        languageName: languageName
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
