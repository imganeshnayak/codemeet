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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemPrompt + '\n\n' + userPrompt,
          sessionId: 'report-gen-' + Date.now()
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
      const res = await fetch('/api/issues?limit=20');
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
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please log in to vote.', variant: 'destructive' });
        return;
      }

      const res = await fetch(`/api/issues/${issueId}/vote`, {
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
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.message || 'Failed to vote', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to vote', variant: 'destructive' });
    }
  };

  const filteredIssues = communityIssues.filter(issue => 
    selectedTab === 'all' || issue.status === selectedTab
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Community Issues Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Community Issues</h2>
            <p className="text-muted-foreground">Issues reported by others in your city - Vote to show support!</p>
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

                    {/* Vote Button */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{issue.votes || 0} votes</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(issue._id)}
                        className="gap-1"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Vote
                      </Button>
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

                        {/* Vote Button */}
                        <div className="mt-auto pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{issue.votes || 0} votes</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(issue._id)}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Report City Issues</h1>
            <p className="text-muted-foreground">Help improve our community by reporting issues</p>
          </div>
          
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" onClick={() => setReportDialogOpen(true)}>
                <Plus className="w-5 h-5" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report a New Issue</DialogTitle>
                <DialogDescription>
                  Fill in the details below to report a city issue
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateReport} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="h-64 rounded-lg overflow-hidden border map-container">
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

                <Button type="submit" className="w-full" size="lg">
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
    </AppLayout>
  );
};

export default Home;
