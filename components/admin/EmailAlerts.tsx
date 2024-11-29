'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabaseAdmin } from '@/lib/supabase';

export function EmailAlerts() {
  const [settings, setSettings] = useState({
    errorAlerts: true,
    paymentAlerts: true,
    dailyReports: true,
    alertEmail: '',
    errorThreshold: 5, // Number of errors before alerting
    revenueGoal: 1000, // Revenue goal for alerts
  });

  async function saveSettings() {
    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({
        settings: settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving settings:', error);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Email Alert Settings</h2>

      <div className="space-y-6">
        {/* Error Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Error Alerts</h3>
            <p className="text-sm text-gray-500">
              Get notified when errors exceed threshold
            </p>
          </div>
          <Switch
            checked={settings.errorAlerts}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, errorAlerts: checked })}
          />
        </div>

        {settings.errorAlerts && (
          <div className="ml-6">
            <label className="text-sm text-gray-500">Error Threshold</label>
            <Input
              type="number"
              value={settings.errorThreshold}
              onChange={(e) => 
                setSettings({ 
                  ...settings, 
                  errorThreshold: parseInt(e.target.value) 
                })}
              className="mt-1"
            />
          </div>
        )}

        {/* Payment Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Payment Alerts</h3>
            <p className="text-sm text-gray-500">
              Get notified for new payments
            </p>
          </div>
          <Switch
            checked={settings.paymentAlerts}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, paymentAlerts: checked })}
          />
        </div>

        {/* Daily Reports */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Daily Reports</h3>
            <p className="text-sm text-gray-500">
              Receive daily summary reports
            </p>
          </div>
          <Switch
            checked={settings.dailyReports}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, dailyReports: checked })}
          />
        </div>

        {/* Alert Email */}
        <div>
          <label className="text-sm text-gray-500">Alert Email</label>
          <Input
            type="email"
            value={settings.alertEmail}
            onChange={(e) => 
              setSettings({ ...settings, alertEmail: e.target.value })}
            className="mt-1"
            placeholder="admin@example.com"
          />
        </div>

        {/* Revenue Goal */}
        <div>
          <label className="text-sm text-gray-500">Revenue Goal ($)</label>
          <Input
            type="number"
            value={settings.revenueGoal}
            onChange={(e) => 
              setSettings({ 
                ...settings, 
                revenueGoal: parseInt(e.target.value) 
              })}
            className="mt-1"
          />
        </div>

        <Button 
          className="w-full"
          onClick={saveSettings}
        >
          Save Alert Settings
        </Button>
      </div>
    </Card>
  );
}
