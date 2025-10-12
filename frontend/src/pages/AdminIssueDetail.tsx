import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  images: string[];
  afterPhotos?: string[];
  reportedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    department?: string;
  };
  assignedDepartment?: string;
  votes: number;
  adminNotes: Array<{
    admin: { name: string };
    note: string;
    isPublic: boolean;
    timestamp: Date;
  }>;
  statusHistory: Array<{
    status: string;
    changedBy: { name: string };
    reason?: string;
    timestamp: Date;
  }>;
  rejectionReason?: string;
  createdAt: string;
}

const AdminIssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Action states
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  const fetchIssueDetail = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/issues/${id}`);
      if (response.data.success) {
        const issueData = response.data.data;
        setIssue(issueData);
        setNewStatus(issueData.status);
        setNewPriority(issueData.priority);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch issue details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === issue?.status) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/admin/issues/${id}/status`, {
        status: newStatus,
      });
      
      toast({
        title: 'Success',
        description: 'Issue status updated successfully',
      });
      
      fetchIssueDetail();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePriority = async () => {
    if (!newPriority || newPriority === issue?.priority) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/admin/issues/${id}/priority`, {
        priority: newPriority,
      });
      
      toast({
        title: 'Success',
        description: 'Priority updated successfully',
      });
      
      fetchIssueDetail();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update priority',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!adminNote.trim()) return;
    
    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/admin/issues/${id}/notes`, {
        note: adminNote,
        isPublic: isPublicNote,
      });
      
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
      
      setAdminNote('');
      setIsPublicNote(false);
      fetchIssueDetail();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add note',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a rejection reason',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/admin/issues/${id}/reject`, {
        rejectionReason,
      });
      
      toast({
        title: 'Success',
        description: 'Issue rejected successfully',
      });
      
      fetchIssueDetail();
      setRejectionReason('');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reject issue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Issue not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    'under-review': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/issues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusColors[issue.status]}>
                {issue.status.replace('-', ' ')}
              </Badge>
              <Badge className={priorityColors[issue.priority]}>
                {issue.priority}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {issue.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{issue.description}</p>
              </div>

              {issue.images && issue.images.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Issue photo ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Reported By
                  </p>
                  <p className="font-medium">{issue.reportedBy.name}</p>
                  <p className="text-sm text-gray-500">{issue.reportedBy.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reported On
                  </p>
                  <p className="font-medium">
                    {new Date(issue.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </p>
                  <p className="font-medium">{issue.location.address || 'No address'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Votes
                  </p>
                  <p className="font-medium">{issue.votes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Badge className={statusColors[history.status]}>
                          {history.status.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Changed by: {history.changedBy.name}
                      </p>
                      {history.reason && (
                        <p className="text-sm text-gray-500 mt-1">{history.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.adminNotes && issue.adminNotes.length > 0 ? (
                issue.adminNotes.map((note, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{note.admin.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={note.isPublic ? 'default' : 'secondary'} className="text-xs">
                          {note.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{note.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No notes yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel - Right Side */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                onClick={handleUpdateStatus}
                disabled={isSubmitting || newStatus === issue.status}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Update Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                onClick={handleUpdatePriority}
                disabled={isSubmitting || newPriority === issue.priority}
              >
                Update Priority
              </Button>
            </CardContent>
          </Card>

          {/* Add Admin Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Add Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add admin note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublicNote}
                  onChange={(e) => setIsPublicNote(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-600">
                  Make this note public (visible to reporter)
                </label>
              </div>
              <Button 
                className="w-full" 
                onClick={handleAddNote}
                disabled={isSubmitting || !adminNote.trim()}
              >
                Add Note
              </Button>
            </CardContent>
          </Card>

          {/* Reject Issue */}
          {issue.status !== 'rejected' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Issue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Rejection reason (required)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <Button 
                  variant="destructive"
                  className="w-full" 
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  Reject Issue
                </Button>
              </CardContent>
            </Card>
          )}

          {issue.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{issue.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminIssueDetail;
