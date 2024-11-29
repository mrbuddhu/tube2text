'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function Settings() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    usage: true,
    newsletter: false,
  });
  const [exportFormat, setExportFormat] = useState('markdown');
  const [activeTab, setActiveTab] = useState('preferences');

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access settings.</div>;
  }

  const handleNotificationChange = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev],
    }));
    toast({
      title: "Success",
      description: "Notification preferences updated",
    });
  };

  const handleExportFormatChange = (format: string) => {
    setExportFormat(format);
    toast({
      title: "Success",
      description: "Default export format updated",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb items={[{ label: 'Settings', href: '/settings' }]} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Export Preferences</h2>
            <div className="space-y-4">
              <RadioGroup value={exportFormat} onValueChange={handleExportFormatChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="markdown" id="markdown" />
                  <Label htmlFor="markdown">Markdown</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Plain Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="html" id="html" />
                  <Label htmlFor="html">HTML</Label>
                </div>
              </RadioGroup>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-500">{user.emailAddresses[0].emailAddress}</p>
              </div>
              <Button variant="outline">Change Password</Button>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="usage-alerts">Usage Alerts</Label>
                <Switch
                  id="usage-alerts"
                  checked={notifications.usage}
                  onCheckedChange={() => handleNotificationChange('usage')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newsletter">Newsletter</Label>
                <Switch
                  id="newsletter"
                  checked={notifications.newsletter}
                  onCheckedChange={() => handleNotificationChange('newsletter')}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
