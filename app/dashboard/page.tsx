import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, CreditCard, TrendingUp, Settings, User } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard Home Page
 * 
 * Main dashboard landing page that displays:
 * - Welcome message with user information
 * - Key metrics and statistics cards
 * - Quick action buttons for common tasks
 * - Overview of account status and recent activity
 */
export default function DashboardPage() {
  // Mock data for demonstration - in real app, this would come from API calls
  const metrics = [
    {
      title: 'Total Usage',
      value: '2,845',
      change: '+12%',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'API calls this month'
    },
    {
      title: 'Active Users',
      value: '573',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Monthly active users'
    },
    {
      title: 'Revenue',
      value: '$1,234',
      change: '+18%',
      changeType: 'positive' as const,
      icon: CreditCard,
      description: 'Monthly recurring revenue'
    },
    {
      title: 'Growth Rate',
      value: '24%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Month over month growth'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Profile',
      description: 'Update your account information and preferences',
      href: '/profile',
      icon: User,
      variant: 'default' as const
    },
    {
      title: 'View Settings',
      description: 'Configure application settings and preferences',
      href: '/settings',
      icon: Settings,
      variant: 'outline' as const
    },
    {
      title: 'Billing & Plans',
      description: 'Manage subscription and payment methods',
      href: '/billing',
      icon: CreditCard,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to your Dashboard
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your account activity and key metrics.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <span>{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button variant={action.variant} className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest account activity and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Profile updated successfully</p>
                <p className="text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">New subscription activated</p>
                <p className="text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">API usage limit reached 80%</p>
                <p className="text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 