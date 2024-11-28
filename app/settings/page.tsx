'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    email: true,
    usage: true,
    newsletter: false,
  });
  const [exportFormat, setExportFormat] = useState('markdown');

  const handleNotificationChange = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev],
    }));
    toast.success('Preferences updated');
  };

  const handleExportFormatChange = (format: string) => {
    setExportFormat(format);
    toast.success('Default export format updated');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="pb-5 border-b border-gray-200">
            <h3 className="text-2xl font-bold leading-6 text-gray-900">Account Settings</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage your account preferences and settings
            </p>
          </div>

          {/* Profile Section */}
          <div className="mt-10">
            <h4 className="text-lg font-medium text-gray-900">Profile Information</h4>
            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">
                      {session?.user?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mt-10">
            <h4 className="text-lg font-medium text-gray-900">Notification Preferences</h4>
            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key} Notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive notifications about your {key}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`${
                          value
                            ? 'bg-indigo-600'
                            : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            value ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Preferences */}
          <div className="mt-10">
            <h4 className="text-lg font-medium text-gray-900">Export Preferences</h4>
            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Default Export Format
                    </label>
                    <div className="mt-2">
                      <select
                        value={exportFormat}
                        onChange={(e) => handleExportFormatChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                        <option value="txt">Plain Text</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-10">
            <h4 className="text-lg font-medium text-red-600">Danger Zone</h4>
            <div className="mt-4 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <button
                    onClick={() => toast.error('Contact support to delete account')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
