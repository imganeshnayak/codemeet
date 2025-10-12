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
  timestamp: Date;
}

// Mock bot responses
const BOT_RESPONSES: Record<string, string> = {
  permit: 'You can apply for permits at city.gov/permits or visit City Hall at 123 Main St. You\'ll need ID, proof of residence, and the application fee.',
  pothole: 'To report a pothole, go to the Home tab and click "Report Issue". Select "Roads" as the category and mark the location on the map.',
  hours: 'City offices are open Monday-Friday, 9:00 AM - 5:00 PM. We\'re closed on weekends and public holidays.',
  complaint: 'To file a complaint, you can use the Home tab to report issues or call our hotline at (555) 123-4567.',
  payment: 'You can pay bills online at city.gov/payments, by mail, or in person at City Hall during business hours.',
  default: 'I\'m here to help with permits, issue reporting, office hours, payments, and general inquiries. What would you like to know?',
};

const QUICK_ACTIONS = [
  { label: 'Apply for Permit', keyword: 'permit' },
  { label: 'Report Pothole', keyword: 'pothole' },
  { label: 'Office Hours', keyword: 'hours' },
  { label: 'File Complaint', keyword: 'complaint' },
];

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your CivicHub assistant. I can help you with permits, reporting issues, office hours, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return BOT_RESPONSES.default;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (keyword: string) => {
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
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
