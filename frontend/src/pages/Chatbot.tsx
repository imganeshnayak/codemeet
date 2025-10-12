import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/AppLayout';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
}

const QUICK_ACTIONS = [
  { label: 'Apply for Permit', keyword: 'apply for permit' },
  { label: 'Report Pothole', keyword: 'report pothole' },
  { label: 'Office Hours', keyword: 'office hours' },
  { label: 'File Complaint', keyword: 'file complaint' },
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load history on mount
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    try {
      console.log('📚 Loading chat history for session:', sessionId);
      const res = await fetch(`/api/chat/history/${sessionId}`);
      if (!res.ok) {
        console.log('No history found or error loading history');
        // show a default welcome message
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I'm your CivicHub assistant. I can help you with permits, reporting issues, office hours, and more. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const data = await res.json();
      console.log('📚 History data:', data);
      if (data && Array.isArray(data.messages) && data.messages.length > 0) {
        // convert messages from {role, content, timestamp} to this page's shape
        const conv = data.messages.map((m: any, idx: number) => ({
          id: `${idx}-${m.timestamp || idx}`,
          text: m.content || m.text || '',
          sender: m.role === 'user' ? 'user' : 'bot',
          timestamp: m.timestamp || new Date(),
        }));
        setMessages(conv);
      } else {
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I'm your CivicHub assistant. I can help you with permits, reporting issues, office hours, and more. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load history', err);
      setMessages([
        {
          id: 'welcome',
          text: "Hello! I'm your CivicHub assistant. I can help you with permits, reporting issues, office hours, and more. How can I assist you today?",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message locally
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('🚀 Sending message to backend (page chatbot):', text);
      console.log('📍 Session ID:', sessionId);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      console.log('📡 Response status:', res.status);

      if (!res.ok) {
        const txt = await res.text();
        console.error('API error:', txt);
        throw new Error('API error');
      }

      const data = await res.json();
      console.log('✅ Received data:', data);

      const botReply = (data && (data.response || data.reply || data.aiResponse)) || 'Sorry, I could not get a reply.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat send error', err);
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        text: 'Sorry, there was an error contacting the assistant. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      }] );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (keyword: string) => {
    // Use the keyword as a short user message and call the backend
    sendMessage(keyword);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Civic Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-powered city services helper</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border bg-muted/30">
          <p className="text-sm font-medium mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.keyword}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.keyword)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'chat-bubble-sent'
                    : 'chat-bubble-received border border-border'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-received border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about city services..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chatbot;
