import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import axios from 'axios';

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
    // Priority: OpenRouter > Gemini > Hugging Face
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL;
    let finalResponse = '';
    let translationNote = '';
    let englishResponse = '';

    if (OPENROUTER_KEY && OPENROUTER_MODEL) {
      // Use OpenRouter (OpenAI-compatible API)
      console.log('🔧 Using OpenRouter model:', OPENROUTER_MODEL);

      const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: OPENROUTER_KEY,
      });

      try {
        const chatCompletion = await client.chat.completions.create({
          model: OPENROUTER_MODEL,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        });
        const aiResponse = chatCompletion.choices?.[0]?.message?.content;
        if (!aiResponse) {
          console.error('❌ Unexpected OpenRouter response', chatCompletion);
          return res.status(502).json({ error: 'OpenRouter returned unexpected response', details: chatCompletion });
        }
        console.log('✅ OpenRouter Response (English):', aiResponse.substring(0, 100) + '...');
        englishResponse = aiResponse;
      } catch (err: any) {
        console.error('❌ OpenRouter request error:', err?.message || err);
        return res.status(502).json({ error: 'OpenRouter request failed', details: err?.message || String(err) });
      }
    }

    if (!englishResponse && GEMINI_KEY && GEMINI_MODEL) {
      try {
        console.log('🔧 Using Gemini model (HTTP):', GEMINI_MODEL);

        // Build a plain-text prompt from messages for Gemini
        const promptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

        // HTTP Implementation for Gemini
        // Note: Different models use different endpoints. 
        // gemini-pro uses v1beta/models/gemini-pro:generateContent
        // others might use generateText. Trying generateContent as it is standard for current Gemini models.

        let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
        let geminiPayload: any = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
          }
        };

        // Fallback for older models (PaLM 2 legacy) if model string suggests 'text-bison'
        if (GEMINI_MODEL.includes('bison')) {
          geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(GEMINI_MODEL)}:generateText?key=${GEMINI_KEY}`;
          geminiPayload = {
            prompt: { text: promptText },
            temperature: 0.2,
            maxOutputTokens: 512,
          };
        }

        const gRes = await axios.post(geminiUrl, geminiPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });

        const gData = gRes.data;
        if (gRes.status >= 400) {
          console.error('Gemini HTTP error', gRes.status, gData);
          return res.status(502).json({ error: 'Gemini returned HTTP error', status: gRes.status, details: gData });
        }

        // Handle response shape for generateContent (Gemini)
        let aiResp = gData?.candidates?.[0]?.content?.parts?.[0]?.text;

        // Handle response shape for generateText (PaLM 2 / older)
        if (!aiResp) {
          aiResp = gData?.candidates?.[0]?.content || gData?.output?.[0]?.content || gData?.generation?.[0]?.text || gData?.candidates?.[0]?.output?.[0]?.content || '';
        }

        if (!aiResp) {
          console.error('❌ Unexpected Gemini HTTP response', gData);
          return res.status(502).json({ error: 'Gemini returned unexpected response', details: gData });
        }

        console.log('✅ Gemini HTTP Response (English):', aiResp.substring(0, 120) + '...');
        englishResponse = aiResp;

      } catch (gErr: any) {
        console.error('❌ Gemini request error:', gErr?.message || gErr);
        if (gErr.response) {
          console.error('Data:', gErr.response.data);
        }
        return res.status(502).json({ error: 'Gemini request failed', details: gErr?.message || String(gErr) });
      }
    } else {
      // Use Hugging Face router endpoint with OpenAI SDK as fallback
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
        englishResponse = aiResponse;
      } catch (err: any) {
        console.error('❌ Hugging Face router request error:', err?.message || err);
        return res.status(502).json({ error: 'Hugging Face router request failed', details: err?.message || String(err) });
      }
    }

    // By default use the English response as the baseline
    finalResponse = englishResponse;

    // Translate response to user's language if not English
    if (userLanguage !== 'en') {
      console.log(`🔄 Translating response to ${languageName}...`);
      try {
        const translatedText = await translateText(englishResponse, 'en', userLanguage);
        // If translation returned something different, use it
        if (translatedText && translatedText !== englishResponse) {
          finalResponse = translatedText;
          console.log(`✅ Translation complete:`, finalResponse.substring(0, 100) + '...');
        } else {
          console.log(`⚠️ Translation not available for ${languageName}, using English`);
          translationNote = `\n\n---\n\n*Note: Full ${languageName} translation is not yet available. Response provided in English.*`;
          finalResponse = englishResponse + translationNote;
        }
      } catch (translateError) {
        console.error('⚠️ Translation failed, using English response:', translateError);
        translationNote = `\n\n---\n\n*Note: Translation service temporarily unavailable. Response provided in English.*`;
        finalResponse = englishResponse + translationNote;
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

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Health check for configured AI provider(s)
export const healthCheck = async (_req: Request, res: Response) => {
  const status: any = { provider: 'ai', checks: {} };

  // Check Gemini
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    try {
      // Use generateContent for modern models (Gemini 1.0+, 2.0+)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: "health check" }] }],
        generationConfig: { maxOutputTokens: 1 }
      };

      const resp = await axios.post(url, payload, { timeout: 10000 });
      status.checks.gemini = { ok: true, status: resp.status };
    } catch (e: any) {
      status.checks.gemini = { ok: false, error: e?.message || String(e) };
    }
  } else {
    status.checks.gemini = { ok: false, error: 'GEMINI_API_KEY or GEMINI_MODEL not set' };
  }

  // Check Hugging Face router as fallback
  if (process.env.HF_TOKEN && process.env.HF_MODEL) {
    try {
      const client = new OpenAI({
        baseURL: 'https://router.huggingface.co/v1',
        apiKey: process.env.HF_TOKEN,
      });
      await client.chat.completions.create({ model: process.env.HF_MODEL, messages: [{ role: 'user', content: 'health check' }] });
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
