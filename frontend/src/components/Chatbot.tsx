import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Load chat history when opened
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      console.log('📚 Loading chat history for session:', sessionId);
      const response = await fetch(`/api/chat/history/${sessionId}`);
      const data = await response.json();
      console.log('📚 History data:', data);

      if (data.messages && data.messages.length > 0) {
        console.log('✅ Loaded', data.messages.length, 'messages from history');
        setMessages(data.messages);
      } else {
        console.log('📝 No history found, showing welcome message');
        // Welcome message
        setMessages([{
          role: 'assistant',
          content: 'Hello! I\'m your civic engagement assistant. I can help you:\n\n• Report city issues\n• Find information about your community\n• Answer questions about civic services\n\nHow can I help you today?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    console.log('🚀 Sending message to backend:', messageToSend);
    console.log('📍 Session ID:', sessionId);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: sessionId
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.details || errorJson.error || 'Failed to get response');
        } catch (e) {
          throw new Error('Failed to get response: ' + response.statusText);
        }
      }

      const data = await response.json();
      console.log('✅ Received data:', data);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('💥 Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50 flex flex-col">
      <Card className="flex flex-col h-full shadow-2xl border-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Civic Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground animate-pulse" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
