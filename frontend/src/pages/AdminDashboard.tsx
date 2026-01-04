import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://codemeet-yaus.onrender.com/api';

interface DashboardMetrics {
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  rejectedIssues: number;
  resolutionRate: number;
  avgResponseTime: number;
}

interface TrendData {
  date: string;
  pending: number;
  resolved: number;
  rejected: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [metricsRes, trendsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard/metrics`),
        axios.get(`${API_URL}/admin/dashboard/trends`),
      ]);

      // Backend returns { metrics, issuesByPriority, issuesByCategory, recentIssues }
      setMetrics(metricsRes.data.metrics);

      // Backend returns { trends }
      const trendsData = trendsRes.data.trends.map((t: any) => ({
        date: t._id,
        pending: t.pending,
        inProgress: t.inProgress,
        resolved: t.resolved,
      }));
      setTrends(trendsData);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statusData = metrics
    ? [
        { name: 'Pending', value: metrics.pendingIssues, color: '#fbbf24' },
        { name: 'In Progress', value: metrics.inProgressIssues, color: '#3b82f6' },
        { name: 'Resolved', value: metrics.resolvedIssues, color: '#10b981' },
        { name: 'Rejected', value: metrics.rejectedIssues, color: '#ef4444' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Overview of civic issues and system performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total Issues
            </CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics?.totalIssues || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All reported issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {metrics?.pendingIssues || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {metrics?.resolvedIssues || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics?.resolutionRate.toFixed(1)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Avg Response Time
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {metrics?.avgResponseTime?.toFixed(1) || 0}h
            </div>
            <p className="text-xs text-gray-500 mt-1">Time to first response</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Issue Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="pending" stroke="#fbbf24" name="Pending" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
