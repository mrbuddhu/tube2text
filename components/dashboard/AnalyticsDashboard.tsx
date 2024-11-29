'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getAnalytics } from '@/lib/analytics';

interface AnalyticsData {
  dailyProcessing: {
    date: string;
    count: number;
  }[];
  videoCategories: {
    name: string;
    value: number;
  }[];
  totalVideos: number;
  successRate: number;
  avgProcessingTime: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    dailyProcessing: [],
    videoCategories: [],
    totalVideos: 0,
    successRate: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  function fetchAnalytics() {
    const analytics = getAnalytics();
    
    // Process events for daily stats
    const dailyStats = new Map<string, number>();
    let successCount = 0;
    let totalProcessingTime = 0;
    let processingTimeCount = 0;

    analytics.events.forEach(event => {
      const date = event.timestamp.split('T')[0];
      
      if (event.eventName === 'VIDEO_PROCESSING_COMPLETED') {
        // Count daily completions
        dailyStats.set(date, (dailyStats.get(date) || 0) + 1);
        successCount++;
        
        // Track processing time
        if (event.properties.processingTime) {
          totalProcessingTime += event.properties.processingTime;
          processingTimeCount++;
        }
      }
    });

    // Calculate video categories from successful processing events
    const categories = new Map<string, number>();
    analytics.events
      .filter(e => e.eventName === 'VIDEO_PROCESSING_COMPLETED')
      .forEach(event => {
        const category = event.properties.videoCategory || 'Uncategorized';
        categories.set(category, (categories.get(category) || 0) + 1);
      });

    // Format data for charts
    const dailyProcessing = Array.from(dailyStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    const videoCategories = Array.from(categories.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories

    // Calculate metrics
    const totalVideos = successCount;
    const totalAttempts = analytics.events.filter(e => 
      e.eventName === 'VIDEO_PROCESSING_STARTED'
    ).length;
    const successRate = totalAttempts ? (successCount / totalAttempts) * 100 : 0;
    const avgProcessingTime = processingTimeCount ? 
      totalProcessingTime / processingTimeCount : 0;

    setData({
      dailyProcessing,
      videoCategories,
      totalVideos,
      successRate,
      avgProcessingTime
    });
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Videos</h3>
          <p className="text-3xl font-bold">{data.totalVideos}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <p className="text-3xl font-bold">{data.successRate.toFixed(1)}%</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Avg. Processing Time</h3>
          <p className="text-3xl font-bold">{data.avgProcessingTime.toFixed(1)}s</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Processing Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Processing</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyProcessing}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Video Categories Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Video Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.videoCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.videoCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
