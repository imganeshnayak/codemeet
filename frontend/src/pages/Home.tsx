import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Camera, Plus, Filter, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import Chatbot from '@/components/Chatbot';
import React, { Suspense, useEffect } from 'react';
import dynamic from 'react';
import Autoplay from 'embla-carousel-autoplay';
import 'leaflet/dist/leaflet.css';
const MapClient = React.lazy(() => import('@/components/MapClient'));


const categories = [
  { label: 'Roads', value: 'pothole' },
  { label: 'Lighting', value: 'streetlight' },
  { label: 'Vandalism', value: 'graffiti' },
  { label: 'Trash', value: 'garbage' },
  { label: 'Water', value: 'water' },
  { label: 'Other', value: 'other' },
];
const priorities = ['low', 'medium', 'high'];

const statusColors: Record<string, string> = {
  pending: 'status-pending',
  'in-progress': 'status-in-progress',
  resolved: 'status-resolved',
};

// Map marker component to handle clicks
// ``MapClient`` is lazy-loaded below. We render it only on the client after mount.

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [communityIssues, setCommunityIssues] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '',
  });
  const { toast } = useToast();

  // Automatically capture geolocation when opening the report modal
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (reportDialogOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [reportDialogOpen]);

  // Generate AI report and navigate to summary page
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced system prompt for professional government report format
    const systemPrompt = `You are a professional civic issue report writer for government authorities.

CRITICAL INSTRUCTIONS:
- Write ONLY the official report content
- Use formal, professional language suitable for government submission
- Format as a structured report with clear sections
- NO conversational language (no "Certainly!", "Here's", "Let me know")
- NO suggestions about next steps, submission methods, or contact information
- NO questions or offers to help further
- NO emojis, excessive punctuation, or casual language
- NO URLs, links, or references to websites/apps
- NO markdown formatting (*, #, etc.)

REQUIRED FORMAT:
1. Issue Summary (2-3 sentences)
2. Detailed Description
3. Impact Assessment
4. Recommended Action

Keep it professional, factual, and ready for official submission.`;

    const userPrompt = `Generate an official civic issue report with the following details:

Title: ${formData.title}
Description: ${formData.description}
Category: ${formData.category}
Priority: ${formData.priority}
Location: ${formData.address}
Coordinates: ${formData.location.lat}, ${formData.location.lng}`;

    let aiSummary = '';
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemPrompt + '\n\n' + userPrompt,
          sessionId: 'report-gen-' + Date.now(),
          ignoreHistory: true  // Don't use chat history for report generation
        })
      });
      if (res.ok) {
        const data = await res.json();
        aiSummary = data.response || '';
      } else {
        aiSummary = 'AI summary could not be generated.';
      }
    } catch (err) {
      aiSummary = 'AI summary could not be generated.';
    }
    // For demo, photos are not handled yet
    const report = { ...formData, aiSummary, photos: [] };
    navigate('/report-summary', { state: { report } });
  };

  // client-only flag to avoid rendering react-leaflet during SSR/hydration
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  // Load community issues on mount
  useEffect(() => {
    loadCommunityIssues();
  }, []);

  const loadCommunityIssues = async () => {
    setLoadingIssues(true);
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/issues?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setCommunityIssues(data.data?.issues || []);
      } else {
        setCommunityIssues([]);
      }
    } catch (err) {
      console.error('Failed to load community issues:', err);
      setCommunityIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleVote = async (issueId: string) => {
    try {
      const token = localStorage.getItem('jan_awaaz_token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please log in to vote.', variant: 'destructive' });
        return;
      }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast({ title: 'Vote Recorded!', description: 'Your vote has been counted.' });
        // Reload issues to reflect new vote count
        loadCommunityIssues();
        // If detail dialog is open, refresh the selected issue
        if (selectedIssue && selectedIssue._id === issueId) {
          const issueRes = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}`);
          if (issueRes.ok) {
            const issueData = await issueRes.json();
            setSelectedIssue(issueData.data.issue);
          }
        }
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.message || 'Failed to vote', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to vote', variant: 'destructive' });
    }
  };

  const handleViewDetails = async (issueId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${issueId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedIssue(data.data.issue);
        setIsDetailDialogOpen(true);
      } else {
        toast({ title: 'Error', description: 'Failed to load issue details', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load issue details', variant: 'destructive' });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast({ title: 'Error', description: 'Comment cannot be empty', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('jan_awaaz_token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please log in to comment.', variant: 'destructive' });
        return;
      }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/issues/${selectedIssue._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comments: [
            ...selectedIssue.comments,
            {
              user: JSON.parse(localStorage.getItem('jan_awaaz_user') || '{}').id,
              text: commentText,
              createdAt: new Date(),
            }
          ]
        }),
      });

      if (res.ok) {
        toast({ title: 'Comment Added!', description: 'Your comment has been posted.' });
        setCommentText('');
        // Refresh issue details
  const issueRes = await fetch(`${import.meta.env.VITE_API_URL}/issues/${selectedIssue._id}`);
        if (issueRes.ok) {
          const issueData = await issueRes.json();
          setSelectedIssue(issueData.data.issue);
        }
        loadCommunityIssues();
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.message || 'Failed to add comment', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add comment', variant: 'destructive' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const filteredIssues = communityIssues.filter(issue => 
    selectedTab === 'all' || issue.status === selectedTab
  );

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto">
        {/* Community Issues Section */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Community Issues</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Issues reported by others in your city - Vote to show support!</p>
          </div>

          {loadingIssues ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading community issues...</p>
            </div>
          ) : communityIssues.length === 0 ? (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <p className="text-muted-foreground">No community issues yet. Be the first to report!</p>
            </div>
          ) : communityIssues.length <= 3 ? (
            // Show grid for 3 or fewer issues
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityIssues.map((issue, index) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-lg smooth-transition">
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleViewDetails(issue._id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={statusColors[issue.status] || 'status-pending'}>
                          {issue.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">
                              {issue.location?.address || 'Location not specified'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Vote and Comment Buttons */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{issue.votes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          <span>{issue.comments?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(issue._id);
                          }}
                          className="gap-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Vote
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Show carousel for more than 3 issues
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {communityIssues.map((issue, index) => (
                  <CarouselItem key={issue._id} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Card className="p-4 hover:shadow-lg smooth-transition h-full">
                        <div 
                          className="cursor-pointer flex flex-col h-full" 
                          onClick={() => handleViewDetails(issue._id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={statusColors[issue.status] || 'status-pending'}>
                              {issue.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold mb-2">{issue.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {issue.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="line-clamp-1">
                                  {issue.location?.address || 'Location not specified'}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {issue.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Vote and Comment Buttons */}
                        <div className="mt-auto pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{issue.votes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MessageCircle className="w-4 h-4" />
                              <span>{issue.comments?.length || 0}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(issue._id);
                            }}
                            className="gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Vote
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Report City Issues</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Help improve our community by reporting issues</p>
          </div>
          
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setReportDialogOpen(true)}>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Report a New Issue</DialogTitle>
                <DialogDescription className="text-sm">
                  Fill in the details below to report a city issue
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateReport} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Pothole on Main Street"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location (Click on map to select)</Label>
                  <div className="h-48 sm:h-64 rounded-lg overflow-hidden border map-container">
                    {mounted ? (
                      <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading map...</div>}>
                        <MapClient
                          center={[formData.location.lat, formData.location.lng]}
                          onLocationSelect={(lat: number, lng: number) => setFormData({ ...formData, location: { lat, lng } })}
                        />
                      </Suspense>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">Loading map...</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full text-sm sm:text-base" size="lg">
                  Generate Report
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-lg smooth-transition cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={statusColors[issue.status]}>
                    {issue.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{issue.date}</span>
                </div>
                
                <h3 className="font-semibold mb-2">{issue.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {issue.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {issue.address}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {issue.category}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues found in this category</p>
          </div>
        )}
      </div>

      {/* Floating Chatbot Button */}
      {!isChatOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Button
            size="lg"
            onClick={() => setIsChatOpen(true)}
            className="rounded-full w-16 h-16 shadow-2xl"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Issue Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedIssue && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedIssue.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap">
                      <Badge className={statusColors[selectedIssue.status] || 'status-pending'}>
                        {selectedIssue.status}
                      </Badge>
                      <Badge variant="outline">{selectedIssue.category}</Badge>
                      <Badge variant="outline">{selectedIssue.priority} priority</Badge>
                      <span className="text-xs">
                        {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedIssue.description}</p>
                </div>

                {/* AI Summary */}
                {selectedIssue.aiSummary && (
                  <div>
                    <h3 className="font-semibold mb-2">Official Report Summary</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-line">{selectedIssue.aiSummary}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <p className="text-muted-foreground">{selectedIssue.location?.address || 'Address not specified'}</p>
                  {selectedIssue.location?.coordinates && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Coordinates: {selectedIssue.location.coordinates[1]}, {selectedIssue.location.coordinates[0]}
                    </p>
                  )}
                </div>

                {/* Images */}
                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedIssue.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Issue photo ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Vote Section */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{selectedIssue.votes || 0} votes</span>
                  </div>
                  <Button
                    onClick={() => handleVote(selectedIssue._id)}
                    variant="outline"
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Vote for this issue
                  </Button>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Comments ({selectedIssue.comments?.length || 0})
                  </h3>
                  
                  {/* Comment Input */}
                  <div className="mb-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="gap-2"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedIssue.comments && selectedIssue.comments.length > 0 ? (
                      selectedIssue.comments.map((comment: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm">User</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Home;
