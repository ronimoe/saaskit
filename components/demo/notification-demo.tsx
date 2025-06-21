'use client';

import { useNotifications } from '@/components/providers/notification-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationDemo() {
  const notifications = useNotifications();

  const testNotifications = () => {
    // Test basic notifications
    notifications.success('Success! Everything is working perfectly.');
    
    setTimeout(() => {
      notifications.info('Here\'s some helpful information.');
    }, 500);
    
    setTimeout(() => {
      notifications.warning('This is a warning message.');
    }, 1000);
    
    setTimeout(() => {
      notifications.error('This is an error message.');
    }, 1500);

    // Test convenience methods
    setTimeout(() => {
      notifications.authSuccess();
    }, 2000);

    setTimeout(() => {
      notifications.paymentSuccess();
    }, 2500);
  };

  const testPromiseNotification = () => {
    const mockPromise = new Promise((resolve) => {
      setTimeout(() => resolve('Data loaded!'), 2000);
    });

    notifications.promise(mockPromise, {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data',
    });
  };

  const testPersistentNotification = () => {
    notifications.info('This notification will stay until dismissed', {
      persistent: true,
      action: {
        label: 'Dismiss',
        onClick: () => notifications.dismissAll(),
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification System Demo</CardTitle>
        <CardDescription>
          Test the integrated notification system using the useNotifications hook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={testNotifications} className="w-full">
          Test Multiple Notifications
        </Button>
        <Button onClick={testPromiseNotification} variant="outline" className="w-full">
          Test Promise Notification
        </Button>
        <Button onClick={testPersistentNotification} variant="outline" className="w-full">
          Test Persistent Notification
        </Button>
        <Button 
          onClick={() => notifications.dismissAll()} 
          variant="destructive" 
          className="w-full"
        >
          Dismiss All
        </Button>
      </CardContent>
    </Card>
  );
} 