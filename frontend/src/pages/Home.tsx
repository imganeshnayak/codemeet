import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock issues data
const mockIssues = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'Roads',
    status: 'in-progress',
    priority: 'high',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St',
    date: '2025-10-10',
    image: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Streetlight Not Working',
    description: 'Streetlight has been out for 3 days',
    category: 'Lighting',
    status: 'pending',
    priority: 'medium',
    location: { lat: 40.7148, lng: -74.0070 },
    address: '456 Oak Ave',
    date: '2025-10-11',
    image: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Graffiti Removal Needed',
    description: 'Vandalism on public building',
    category: 'Vandalism',
    status: 'resolved',
    priority: 'low',
    location: { lat: 40.7108, lng: -74.0050 },
    address: '789 Park Blvd',
    date: '2025-10-09',
    image: '/placeholder.svg'
  },
];

const categories = ['Roads', 'Lighting', 'Vandalism', 'Trash', 'Water', 'Other'];
const priorities = ['low', 'medium', 'high'];

const statusColors: Record<string, string> = {
  pending: 'status-pending',
  'in-progress': 'status-in-progress',
  resolved: 'status-resolved',
};

// Map marker component to handle clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  );
}

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Issue Reported!',
      description: 'Your issue has been submitted successfully.',
    });
    setIsDialogOpen(false);
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      location: { lat: 40.7128, lng: -74.0060 },
      address: '',
    });
  };

  const filteredIssues = mockIssues.filter(issue => 
    selectedTab === 'all' || issue.status === selectedTab
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Report City Issues</h1>
            <p className="text-muted-foreground">Help improve our community by reporting issues</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
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
              <form onSubmit={handleSubmit} className="space-y-4">
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
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
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
                    <MapContainer
                      center={[formData.location.lat, formData.location.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker
                        onLocationSelect={(lat, lng) => {
                          setFormData({ ...formData, location: { lat, lng } });
                        }}
                      />
                    </MapContainer>
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
                  Submit Report
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
    </AppLayout>
  );
};

export default Home;
