import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/components/AppLayout';

interface Community {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  members: number;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

// Mock communities
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Downtown Residents',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DR',
    lastMessage: 'Anyone know when the street fair is?',
    lastTime: '10:45 AM',
    unreadCount: 3,
    members: 245,
  },
  {
    id: '2',
    name: 'Park Improvement Group',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PIG',
    lastMessage: 'Great turnout at the cleanup event!',
    lastTime: 'Yesterday',
    unreadCount: 0,
    members: 128,
  },
  {
    id: '3',
    name: 'City Council Updates',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CCU',
    lastMessage: 'New zoning proposal posted',
    lastTime: '2 days ago',
    unreadCount: 1,
    members: 1024,
  },
  {
    id: '4',
    name: 'Neighborhood Watch',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NW',
    lastMessage: 'Meeting scheduled for Thursday',
    lastTime: '3 days ago',
    unreadCount: 0,
    members: 89,
  },
];

// Mock messages for selected community
const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'John Doe',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    text: 'Hey everyone! Did anyone see the notice about the street fair?',
    timestamp: '10:30 AM',
    isMe: false,
  },
  {
    id: '2',
    sender: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
    text: 'Yes! It\'s scheduled for next Saturday at Central Park',
    timestamp: '10:32 AM',
    isMe: true,
  },
  {
    id: '3',
    sender: 'Sarah Smith',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    text: 'Perfect! I\'ll be there with my family 🎉',
    timestamp: '10:35 AM',
    isMe: false,
  },
  {
    id: '4',
    sender: 'Mike Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    text: 'Anyone know when the street fair is?',
    timestamp: '10:45 AM',
    isMe: false,
  },
];

const Communities = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunities = mockCommunities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // In a real app, this would send the message
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen">
        {/* Communities List (hidden on mobile when chat is open) */}
        <div
          className={`${
            selectedCommunity ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-80 lg:w-96 border-r border-border bg-card`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-3">Communities</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Communities List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCommunities.map((community) => (
              <motion.div
                key={community.id}
                whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCommunity(community)}
                className={`p-4 border-b border-border cursor-pointer smooth-transition ${
                  selectedCommunity?.id === community.id ? 'bg-accent/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={community.avatar} />
                    <AvatarFallback>{community.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{community.name}</h3>
                      <span className="text-xs text-muted-foreground">{community.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{community.lastMessage}</p>
                      {community.unreadCount > 0 && (
                        <Badge className="ml-2 notification-dot rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                          {community.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{community.members} members</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat View */}
        {selectedCommunity ? (
          <div className="flex flex-col flex-1">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedCommunity(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedCommunity.avatar} />
                <AvatarFallback>{selectedCommunity.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="font-semibold">{selectedCommunity.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedCommunity.members} members</p>
              </div>
              
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${message.isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!message.isMe && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col ${message.isMe ? 'items-end' : 'items-start'}`}>
                    {!message.isMe && (
                      <span className="text-xs font-medium text-muted-foreground mb-1">
                        {message.sender}
                      </span>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.isMe
                          ? 'chat-bubble-sent'
                          : 'chat-bubble-received border border-border'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-center p-8">
            <div>
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Select a Community</h2>
              <p className="text-muted-foreground">
                Choose a community from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Communities;
