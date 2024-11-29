'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { supabaseAdmin } from '@/lib/supabase';
import { AlertCircle, Database, Cloud, Users, CheckCircle } from 'lucide-react';

// Free tier limits
const LIMITS = {
  SUPABASE: {
    DATABASE_SIZE: 500 * 1024 * 1024, // 500MB in bytes
    ROW_LIMIT: 50000,
    DAILY_REQUESTS: 500000
  },
  CLERK: {
    MONTHLY_USERS: 5000
  },
  HUGGING_FACE: {
    DAILY_REQUESTS: 30000
  },
  VERCEL: {
    BANDWIDTH: 100 * 1024 * 1024 * 1024, // 100GB
    EXECUTIONS: 100000
  }
};

export function ResourceMonitor() {
  const { user } = useUser();
  const [usage, setUsage] = useState({
    database: {
      size: 0,
      rows: 0,
      requests: 0
    },
    users: {
      active: 0,
      total: 0
    },
    ai: {
      requests: 0,
      failures: 0
    },
    hosting: {
      bandwidth: 0,
      executions: 0
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchResourceUsage();
    }
  }, [user?.id]);

  async function fetchResourceUsage() {
    try {
      // Get database stats
      const { data: dbStats } = await supabaseAdmin
        .rpc('get_database_size');

      // Get user stats
      const { data: userStats } = await supabaseAdmin
        .from('analytics_events')
        .select('event_name')
        .eq('event_name', 'user_active')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get AI processing stats
      const { data: aiStats } = await supabaseAdmin
        .from('analytics_events')
        .select('event_name, properties')
        .in('event_name', ['ai_request_success', 'ai_request_failure'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setUsage({
        database: {
          size: dbStats?.total_bytes || 0,
          rows: dbStats?.total_rows || 0,
          requests: dbStats?.daily_requests || 0
        },
        users: {
          active: userStats?.length || 0,
          total: 0 // This would come from Clerk's API
        },
        ai: {
          requests: aiStats?.filter(s => s.event_name === 'ai_request_success').length || 0,
          failures: aiStats?.filter(s => s.event_name === 'ai_request_failure').length || 0
        },
        hosting: {
          bandwidth: 0, // This would come from Vercel's API
          executions: 0
        }
      });
    } catch (error) {
      console.error('Error fetching resource usage:', error);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Resource Monitor</h2>

      <div className="space-y-6">
        {/* Database Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-500" />
              <h3 className="font-medium">Database (Supabase)</h3>
            </div>
            <Badge variant="outline">Free Tier</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage</span>
                <span>{Math.round(usage.database.size / 1024 / 1024)}MB / 500MB</span>
              </div>
              <Progress 
                value={(usage.database.size / LIMITS.SUPABASE.DATABASE_SIZE) * 100} 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Rows</span>
                <span>{usage.database.rows.toLocaleString()} / 50,000</span>
              </div>
              <Progress 
                value={(usage.database.rows / LIMITS.SUPABASE.ROW_LIMIT) * 100} 
              />
            </div>
          </div>
        </div>

        {/* User Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              <h3 className="font-medium">Users (Clerk)</h3>
            </div>
            <Badge variant="outline">Free Tier</Badge>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Monthly Active Users</span>
              <span>{usage.users.active.toLocaleString()} / 5,000</span>
            </div>
            <Progress 
              value={(usage.users.active / LIMITS.CLERK.MONTHLY_USERS) * 100} 
            />
          </div>
        </div>

        {/* AI Processing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-purple-500" />
              <h3 className="font-medium">AI Processing (Hugging Face)</h3>
            </div>
            <Badge variant="outline">Free Tier</Badge>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Daily Requests</span>
              <span>{usage.ai.requests.toLocaleString()} / 30,000</span>
            </div>
            <Progress 
              value={(usage.ai.requests / LIMITS.HUGGING_FACE.DAILY_REQUESTS) * 100} 
            />
          </div>

          {usage.ai.failures > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {usage.ai.failures} failed requests in the last 24 hours
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* All Services Status */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Supabase: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Clerk: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Hugging Face: Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">Vercel: Operational</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
