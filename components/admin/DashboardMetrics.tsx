'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabaseAdmin } from '@/lib/supabase';

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
    totalRevenue: 0,
    conversionRate: 0,
  });

  const [processingTimes, setProcessingTimes] = useState([]);
  const [errors, setErrors] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchProcessingTimes();
    fetchErrors();
    fetchRecentPayments();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 300000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    const { data: users } = await supabaseAdmin
      .from('analytics_events')
      .select('user_id')
      .eq('event_name', 'user_signed_up');

    const { data: videos } = await supabaseAdmin
      .from('transcriptions')
      .select('id');

    const { data: payments } = await supabaseAdmin
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'payment_initiated');

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.properties.amount || 0), 0) || 0;
    const conversionRate = users?.length ? (payments?.length || 0) / users.length * 100 : 0;

    setMetrics({
      totalUsers: users?.length || 0,
      activeUsers: users?.length || 0, // Active in last 30 days
      totalVideos: videos?.length || 0,
      totalRevenue,
      conversionRate
    });
  }

  async function fetchProcessingTimes() {
    const { data } = await supabaseAdmin
      .from('performance_metrics')
      .select('*')
      .eq('metric_name', 'video_processing_time')
      .order('created_at', { ascending: false })
      .limit(100);

    setProcessingTimes(data || []);
  }

  async function fetchErrors() {
    const { data } = await supabaseAdmin
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    setErrors(data || []);
  }

  async function fetchRecentPayments() {
    const { data } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'payment_initiated')
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentPayments(data || []);
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">{metrics.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold">{metrics.activeUsers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
          <p className="text-2xl font-bold">{metrics.totalVideos}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold">${metrics.totalRevenue}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Processing Times Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Processing Times</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processingTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="created_at" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Errors */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Errors</h3>
        <div className="space-y-4">
          {errors.map((error) => (
            <div key={error.id} className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-700 font-medium">{error.error_type}</p>
              <p className="text-sm text-red-600">{error.error_message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(error.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Payments */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Payments</h3>
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-700 font-medium">
                ${payment.properties.amount} - {payment.properties.tier}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
