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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSending) return;
    sendMessage(inputValue);
  };

  return (
    <AppLayout>
      <div className="relative flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground max-w-4xl mx-auto shadow-lg rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-border">
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-border bg-card flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Jan Awaaz Assistant</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI-powered civic reporting helper
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 sm:p-4 border-b border-border bg-muted/30 grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        <Button variant="secondary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" aria-label="Report Issue">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline sm:inline">Report</span>
        </Button>
        <Button variant="secondary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" aria-label="View Alerts">
          <Bell className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline sm:inline">Alerts</span>
        </Button>
        <Button variant="secondary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4" aria-label="Get Information">
          <Info className="w-3 h-3 sm:w-4 sm:h-4" /> Info
        </Button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[85%] sm:max-w-xs md:max-w-lg ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/40'}`}>
              <CardContent className="p-2 sm:p-3 prose prose-sm max-w-none dark:prose-invert text-sm">
                {m.sender === 'bot' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({node, ...props}) => <h2 className="text-base sm:text-lg font-bold mt-3 sm:mt-4 mb-1 sm:mb-2 text-foreground" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm sm:text-base font-semibold mt-2 sm:mt-3 mb-1 sm:mb-2 text-foreground" {...props} />,
                      p: ({node, ...props}) => <p className="mb-1 sm:mb-2 text-foreground text-xs sm:text-sm" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 sm:pl-5 mb-1 sm:mb-2 space-y-0.5 sm:space-y-1 text-foreground text-xs sm:text-sm" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 sm:pl-5 mb-1 sm:mb-2 space-y-0.5 sm:space-y-1 text-foreground text-xs sm:text-sm" {...props} />,
                      li: ({node, ...props}) => <li className="text-foreground text-xs sm:text-sm" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                      hr: ({node, ...props}) => <hr className="my-2 sm:my-4 border-border" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  <span className="text-primary-foreground text-xs sm:text-sm">{m.text}</span>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t border-border bg-card flex items-center gap-1.5 sm:gap-2">
        <Input
          placeholder="Type your message..."
          className="flex-1 text-sm sm:text-base"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button variant="outline" size="icon" type="button" onClick={() => !isSending && sendMessage(inputValue)} className="h-9 w-9 sm:h-10 sm:w-10">
          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button disabled={isSending} type="submit" size="icon" className="bg-primary text-primary-foreground h-9 w-9 sm:h-10 sm:w-10">
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>

        {/* Small robot iframe next to the send button (kept visually) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-12 h-12 md:w-14 md:h-14 overflow-hidden bg-transparent"
        >
          <div className="relative w-full h-full">
            <iframe
              src="https://my.spline.design/greetingrobot-S0D5T8vmFbhMNtZ3WcbXZpdw/?embed=1&ui=0&background=transparent&branding=0"
              width="100%"
              height="100%"
              title="AI Robot Assistant"
              allowFullScreen
              style={{ border: 0, background: 'transparent' }}
            />

            {/* Visual mask to hide Spline watermark/branding area (visual hack) */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                right: 0,
                bottom: 0,
                width: '60%',
                height: '20%',
                background: 'linear-gradient(transparent, rgba(255,255,255,0.98))',
                pointerEvents: 'none'
              }}
            />
          </div>
        </motion.div>
      </form>

      {/* Floating 3D Robot Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute bottom-20 right-4 w-40 h-40 md:w-56 md:h-56 overflow-hidden bg-transparent"
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
