import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

/**
 * Dashboard Settings Page
 * 
 * Test page for breadcrumb navigation and dashboard layout
 */
export default function DashboardSettingsPage() {
  const settingsCategories = [
    {
      title: 'Account Settings',
      description: 'Manage your account information and preferences',
      icon: User,
      items: ['Personal Information', 'Email Preferences', 'Password & Security']
    },
    {
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      icon: Bell,
      items: ['Email Notifications', 'Push Notifications', 'SMS Alerts']
    },
    {
      title: 'Privacy & Security',
      description: 'Control your privacy and security settings',
      icon: Shield,
      items: ['Two-Factor Authentication', 'Login Sessions', 'Data Export']
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      icon: Palette,
      items: ['Theme Settings', 'Layout Preferences', 'Accessibility']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="text-sm">{item}</span>
                      <Button variant="ghost" size="sm">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings and account management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Export Data
            </Button>
            <Button variant="outline">
              Reset Preferences
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 