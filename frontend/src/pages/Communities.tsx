import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, MoreVertical, ArrowLeft, Plus, Loader2, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Community {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  isPublic: boolean;
  memberCount: number;
  unreadCount: number;
  lastActivity: string;
  createdBy: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    avatar: string;
  };
  type: 'text' | 'image' | 'file';
  isEdited: boolean;
  createdAt: string;
}

const API_BASE_URL = '/api';

const Communities = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create community form state
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'general' as const,
    isPublic: true
  });
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch communities
  const fetchCommunities = async () => {
    try {
      setIsLoadingCommunities(true);
      const token = localStorage.getItem('jan_awaaz_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/communities?search=${searchQuery}`, {
        headers
      });
      const data = await res.json();
      
      if (data.success) {
        setCommunities(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load communities',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load communities',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  // Fetch messages for a community
  const fetchMessages = async (communityId: string) => {
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem('jan_awaaz_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/communities/${communityId}/messages`, {
        headers
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data);
        
        // Mark messages as read
        if (isAuthenticated && token) {
          await fetch(`${API_BASE_URL}/communities/${communityId}/messages/read`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          // Refresh communities to update unread count
          fetchCommunities();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedCommunity || !isAuthenticated) return;

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem('jan_awaaz_token');
      
      const res = await fetch(`${API_BASE_URL}/communities/${selectedCommunity._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageInput })
      });

      const data = await res.json();

      if (data.success) {
        setMessages([...messages, data.data]);
        setMessageInput('');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send message',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Create new community
  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !isAuthenticated) return;

    try {
      setIsCreatingCommunity(true);
      const token = localStorage.getItem('jan_awaaz_token');
      
      const res = await fetch(`${API_BASE_URL}/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCommunity)
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community created successfully!'
        });
        setIsCreateDialogOpen(false);
        setNewCommunity({
          name: '',
          description: '',
          category: 'general',
          isPublic: true
        });
        fetchCommunities();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create community',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: 'Error',
        description: 'Failed to create community',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingCommunity(false);
    }
  };

  // Load communities on mount and when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCommunities();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load messages when community is selected
  useEffect(() => {
    if (selectedCommunity) {
      fetchMessages(selectedCommunity._id);
    }
  }, [selectedCommunity]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">Communities</h1>
              {isAuthenticated && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="default">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Community</DialogTitle>
                      <DialogDescription>
                        Start a new community to connect with others
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Community Name *</Label>
                        <Input
                          id="name"
                          placeholder="Downtown Residents"
                          value={newCommunity.name}
                          onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="A community for downtown residents to discuss local issues..."
                          value={newCommunity.description}
                          onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newCommunity.category}
                          onValueChange={(value: any) => setNewCommunity({ ...newCommunity, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="neighborhood">Neighborhood</SelectItem>
                            <SelectItem value="city-wide">City-Wide</SelectItem>
                            <SelectItem value="interest-group">Interest Group</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateCommunity}
                        disabled={!newCommunity.name.trim() || isCreatingCommunity}
                      >
                        {isCreatingCommunity && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        Create Community
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
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
            {isLoadingCommunities ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : communities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No communities found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'Try a different search' : 'Be the first to create one!'}
                </p>
                {isAuthenticated && !searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </Button>
                )}
              </div>
            ) : (
              communities.map((community) => (
                <motion.div
                  key={community._id}
                  whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCommunity(community)}
                  className={`p-4 border-b border-border cursor-pointer smooth-transition ${
                    selectedCommunity?._id === community._id ? 'bg-accent/50' : ''
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
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(community.lastActivity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate line-clamp-1">
                          {community.description || 'No description'}
                        </p>
                        {community.unreadCount > 0 && (
                          <Badge className="ml-2 notification-dot rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                            {community.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {community.category.replace('-', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
                <p className="text-xs text-muted-foreground">
                  {selectedCommunity.memberCount} {selectedCommunity.memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>
              
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to send a message in this community!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isMe = user && message.sender._id === user.id;
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        {!isMe && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-xs font-medium text-muted-foreground mb-1">
                              {message.sender.name}
                            </span>
                          )}
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isMe
                                ? 'chat-bubble-sent'
                                : 'chat-bubble-received border border-border'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            {message.isEdited && (
                              <span className="text-xs text-muted-foreground italic"> (edited)</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              {isAuthenticated ? (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={isSendingMessage}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!messageInput.trim() || isSendingMessage}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    Please login to send messages
                  </p>
                </div>
              )}
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
