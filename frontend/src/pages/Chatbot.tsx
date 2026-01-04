import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Mic, MapPin, Bell, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chatbot() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'bot' }>>([
    { id: '1', text: "Hello 👋, I'm your Jan Awaaz Assistant. How can I help today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Initialize sessionId immediately instead of null
  const [sessionId] = useState<string>(() => `chatbot-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSpline, setShowSpline] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userId = Date.now().toString();
    const userMessage = { id: `u-${userId}`, text: text.trim(), sender: 'user' as const };
    setMessages((m) => [...m, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'AI service error');
      }

      const data = await res.json();
      const botText = data.response || 'Sorry, I could not generate a reply.';
      const botMessage = { id: `b-${Date.now()}`, text: botText, sender: 'bot' as const };
      setMessages((m) => [...m, botMessage]);
    } catch (e) {
      console.error('Send message error', e);
      const errMsg = { id: `err-${Date.now()}`, text: 'Error: failed to send message', sender: 'bot' as const };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsSending(false);
      // After response arrives, restore spline if user isn't typing
      setTimeout(() => {
        setShowSpline(!isTyping);
      }, 200);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSending) return;
    // When user sends a message, hide the spline assistant to the side
    setIsTyping(false);
    setShowSpline(false);
    sendMessage(inputValue);
  };

  // Manage typing state with a short debounce
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    // mark typing true immediately when user types
    setIsTyping(Boolean(value));
    setShowSpline(false);
    // when user stops typing for 1.2s, consider typing finished
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
      // only show spline when not sending
      if (!isSending) setShowSpline(true);
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="relative flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border bg-card flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Jan Awaaz Assistant</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered civic reporting helper
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border bg-muted/30 grid grid-cols-3 md:grid-cols-6 gap-3">
        <Button variant="secondary" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Report
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <Bell className="w-4 h-4" /> Alerts
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <Info className="w-4 h-4" /> Info
        </Button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-xs md:max-w-lg ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/40'}`}>
              <CardContent className="p-3 prose prose-sm max-w-none dark:prose-invert">
                {m.sender === 'bot' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-2 text-foreground" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 text-foreground" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1 text-foreground" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-foreground" {...props} />,
                      li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                      hr: ({node, ...props}) => <hr className="my-4 border-border" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  <span className="text-primary-foreground">{m.text}</span>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Typing indicator shown while awaiting bot response */}
        {isSending && (
          <div className="flex justify-start">
            <Card className="max-w-xs md:max-w-lg bg-muted/40">
              <CardContent className="p-3 prose prose-sm max-w-none dark:prose-invert">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div aria-live="polite" className="flex items-center">
                    <span className="typing-dot inline-block w-2 h-2 bg-foreground rounded-full mr-1" />
                    <span className="typing-dot inline-block w-2 h-2 bg-foreground rounded-full mr-1" />
                    <span className="typing-dot inline-block w-2 h-2 bg-foreground rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          className="flex-1"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onFocus={() => {
            // when input focused, show spline only if not typing
            if (!isTyping && !isSending) setShowSpline(true);
          }}
        />
        <Button variant="outline" size="icon" type="button" onClick={() => !isSending && sendMessage(inputValue)}>
          <Mic className="w-4 h-4" />
        </Button>
        <Button disabled={isSending} type="submit" size="icon" className="bg-primary text-primary-foreground">
          <Send className="w-4 h-4" />
        </Button>

        {/* Small Spline robot removed to avoid duplicate appearance */}
        </form>

      {/* Floating 3D Robot Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: showSpline ? 1 : 0.25,
          x: showSpline ? 0 : 180
        }}
        transition={{ duration: 0.45 }}
        className="absolute bottom-20 right-4 w-40 h-40 md:w-56 md:h-56 overflow-hidden bg-transparent"
        aria-hidden={!showSpline}
      >
        <iframe
          src="https://my.spline.design/greetingrobot-S0D5T8vmFbhMNtZ3WcbXZpdw/"
          frameBorder="0"
          width="100%"
          height="100%"
          title="AI Robot Assistant"
          allowFullScreen
        />
      </motion.div>
    </div>
    </AppLayout>
  );
}

// Inline styles for typing animation (scoped to this module)
const style = `
.typing-dot { opacity: 0.3; animation: typing 1s infinite; }
.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing { 0% { transform: translateY(0); opacity: 0.3 } 50% { transform: translateY(-4px); opacity: 1 } 100% { transform: translateY(0); opacity: 0.3 } }
`;

// Inject the style tag into the document head when this module loads
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.setAttribute('data-from', 'chatbot-typing');
  s.innerHTML = style;
  document.head.appendChild(s);
}
