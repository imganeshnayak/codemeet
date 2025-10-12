import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Mic, MapPin, Bell, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Chatbot() {
  return (
    <div className="relative flex flex-col h-screen bg-background text-foreground max-w-4xl mx-auto shadow-lg rounded-2xl overflow-hidden border border-border">
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
        <div className="flex justify-start">
          <Card className="max-w-xs md:max-w-sm bg-muted/40">
            <CardContent className="p-3">
              Hello 👋, I’m your Jan Awaaz Assistant. How can I help today?
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Card className="max-w-xs md:max-w-sm bg-primary text-primary-foreground">
            <CardContent className="p-3">Report a pothole near my street.</CardContent>
          </Card>
        </div>

        <div className="flex justify-start">
          <Card className="max-w-xs md:max-w-sm bg-muted/40">
            <CardContent className="p-3">
              Got it! Please share your location or photo of the issue 📍
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border bg-card flex items-center gap-2">
        <Input placeholder="Type your message..." className="flex-1" />
        <Button variant="outline" size="icon">
          <Mic className="w-4 h-4" />
        </Button>
        <Button size="icon" className="bg-primary text-primary-foreground">
          <Send className="w-4 h-4" />
        </Button>
      </div>

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
  );
}
