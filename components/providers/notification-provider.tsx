'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { notifications, NotificationOptions, PromiseNotificationOptions, ExternalToast } from '@/lib/notifications';
import { ReactElement, JSXElementConstructor } from 'react';

interface NotificationContextType {
  // Core notification methods
  success: (message: string, options?: NotificationOptions) => string | number;
  error: (message: string, options?: NotificationOptions) => string | number;
  info: (message: string, options?: NotificationOptions) => string | number;
  warning: (message: string, options?: NotificationOptions) => string | number;
  message: (message: string, options?: NotificationOptions) => string | number;
  
  // Advanced notification methods
  custom: (component: (id: string | number) => ReactElement<unknown, string | JSXElementConstructor<unknown>>, options?: ExternalToast) => string | number;
  loading: (message: string, options?: ExternalToast) => string | number;
  promise: <T>(promise: Promise<T>, options: PromiseNotificationOptions, toastOptions?: ExternalToast) => string | number;
  
  // Control methods
  dismiss: (toastId?: string | number) => void;
  dismissAll: () => void;
  
  // Convenience methods for common use cases
  authSuccess: (message?: string) => string | number;
  authError: (message?: string, description?: string) => string | number;
  formError: (message?: string, description?: string) => string | number;
  formSuccess: (message?: string) => string | number;
  paymentSuccess: (message?: string) => string | number;
  paymentError: (message?: string, description?: string) => string | number;
  networkError: (message?: string) => string | number;
  featureUnavailable: (featureName: string) => string | number;
  subscriptionRequired: (message?: string) => string | number;
  copied: (text?: string) => string | number;
  uploadProgress: (filename: string, progress: number) => string | number;
  uploadSuccess: (filename: string) => string | number;
  uploadError: (filename: string, error?: string) => string | number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const contextValue: NotificationContextType = {
    // Core notification methods
    success: notifications.success.bind(notifications),
    error: notifications.error.bind(notifications),
    info: notifications.info.bind(notifications),
    warning: notifications.warning.bind(notifications),
    message: notifications.message.bind(notifications),
    
    // Advanced notification methods
    custom: notifications.custom.bind(notifications),
    loading: notifications.loading.bind(notifications),
    promise: notifications.promise.bind(notifications),
    
    // Control methods
    dismiss: notifications.dismiss.bind(notifications),
    dismissAll: notifications.dismissAll.bind(notifications),
    
    // Convenience methods
    authSuccess: notifications.authSuccess.bind(notifications),
    authError: notifications.authError.bind(notifications),
    formError: notifications.formError.bind(notifications),
    formSuccess: notifications.formSuccess.bind(notifications),
    paymentSuccess: notifications.paymentSuccess.bind(notifications),
    paymentError: notifications.paymentError.bind(notifications),
    networkError: notifications.networkError.bind(notifications),
    featureUnavailable: notifications.featureUnavailable.bind(notifications),
    subscriptionRequired: notifications.subscriptionRequired.bind(notifications),
    copied: notifications.copied.bind(notifications),
    uploadProgress: notifications.uploadProgress.bind(notifications),
    uploadSuccess: notifications.uploadSuccess.bind(notifications),
    uploadError: notifications.uploadError.bind(notifications),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}

// Export types for use in other components
export type { NotificationOptions, PromiseNotificationOptions, ExternalToast }; 