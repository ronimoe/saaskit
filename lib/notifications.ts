import { toast, ExternalToast } from 'sonner';
import { ReactElement, JSXElementConstructor, MouseEvent } from 'react';

export interface NotificationOptions extends Omit<ExternalToast, 'action' | 'cancel'> {
  action?: {
    label: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  cancel?: {
    label: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  persistent?: boolean;
}

export interface PromiseNotificationOptions {
  loading: string;
  success: string | ((data: unknown) => string);
  error: string | ((error: unknown) => string);
  description?: string;
  finally?: () => void;
}

class NotificationService {
  /**
   * Display a success notification
   */
  success(message: string, options?: NotificationOptions) {
    const { action, cancel, persistent, ...toastOptions } = options || {};
    return toast.success(message, {
      ...toastOptions,
      duration: persistent ? Infinity : (toastOptions.duration ?? 4000),
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      cancel: cancel ? {
        label: cancel.label,
        onClick: cancel.onClick,
      } : undefined,
    });
  }

  /**
   * Display an error notification
   */
  error(message: string, options?: NotificationOptions) {
    const { action, cancel, persistent, ...toastOptions } = options || {};
    return toast.error(message, {
      ...toastOptions,
      duration: persistent ? Infinity : (toastOptions.duration ?? 6000),
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      cancel: cancel ? {
        label: cancel.label,
        onClick: cancel.onClick,
      } : undefined,
    });
  }

  /**
   * Display an informational notification
   */
  info(message: string, options?: NotificationOptions) {
    const { action, cancel, persistent, ...toastOptions } = options || {};
    return toast.info(message, {
      ...toastOptions,
      duration: persistent ? Infinity : (toastOptions.duration ?? 4000),
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      cancel: cancel ? {
        label: cancel.label,
        onClick: cancel.onClick,
      } : undefined,
    });
  }

  /**
   * Display a warning notification
   */
  warning(message: string, options?: NotificationOptions) {
    const { action, cancel, persistent, ...toastOptions } = options || {};
    return toast.warning(message, {
      ...toastOptions,
      duration: persistent ? Infinity : (toastOptions.duration ?? 5000),
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      cancel: cancel ? {
        label: cancel.label,
        onClick: cancel.onClick,
      } : undefined,
    });
  }

  /**
   * Display a basic notification
   */
  message(message: string, options?: NotificationOptions) {
    const { action, cancel, persistent, ...toastOptions } = options || {};
    return toast(message, {
      ...toastOptions,
      duration: persistent ? Infinity : (toastOptions.duration ?? 4000),
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      cancel: cancel ? {
        label: cancel.label,
        onClick: cancel.onClick,
      } : undefined,
    });
  }

  /**
   * Display a custom notification with React component
   */
  custom(component: (id: string | number) => ReactElement<unknown, string | JSXElementConstructor<unknown>>, options?: ExternalToast) {
    return toast.custom(component, {
      ...options,
      duration: options?.duration ?? 4000,
    });
  }

  /**
   * Display a loading notification
   */
  loading(message: string, options?: ExternalToast) {
    return toast.loading(message, options);
  }

  /**
   * Handle promise-based notifications (loading -> success/error)
   */
  promise<T>(
    promise: Promise<T>,
    options: PromiseNotificationOptions,
    toastOptions?: ExternalToast
  ) {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      ...toastOptions,
    });
  }

  /**
   * Dismiss a specific notification by ID
   */
  dismiss(toastId?: string | number) {
    return toast.dismiss(toastId);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    return toast.dismiss();
  }

  // Convenience methods for common use cases

  /**
   * Authentication success notification
   */
  authSuccess(message: string = 'Successfully signed in!') {
    return this.success(message, {
      description: 'Welcome back to your dashboard',
    });
  }

  /**
   * Authentication error notification
   */
  authError(message: string = 'Authentication failed', description?: string) {
    return this.error(message, {
      description: description || 'Please check your credentials and try again',
    });
  }

  /**
   * Form validation error notification
   */
  formError(message: string = 'Please check your input', description?: string) {
    return this.error(message, {
      description: description || 'Some fields contain invalid data',
    });
  }

  /**
   * Form submission success notification
   */
  formSuccess(message: string = 'Changes saved successfully!') {
    return this.success(message, {
      description: 'Your information has been updated',
    });
  }

  /**
   * Payment success notification
   */
  paymentSuccess(message: string = 'Payment successful!') {
    return this.success(message, {
      description: 'Your subscription has been activated',
    });
  }

  /**
   * Payment error notification
   */
  paymentError(message: string = 'Payment failed', description?: string) {
    return this.error(message, {
      description: description || 'Please check your payment details and try again',
    });
  }

  /**
   * Network error notification
   */
  networkError(message: string = 'Connection failed') {
    return this.error(message, {
      description: 'Please check your internet connection and try again',
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }

  /**
   * Feature unavailable notification
   */
  featureUnavailable(featureName: string) {
    return this.warning(`${featureName} is not available`, {
      description: 'This feature is currently disabled or under maintenance',
    });
  }

  /**
   * Subscription required notification
   */
  subscriptionRequired(message: string = 'Subscription required') {
    return this.warning(message, {
      description: 'Please upgrade your plan to access this feature',
      action: {
        label: 'Upgrade',
        onClick: () => window.location.href = '/pricing',
      },
    });
  }

  /**
   * Copy to clipboard success notification
   */
  copied(text?: string) {
    return this.success('Copied to clipboard!', {
      description: text ? `Copied: ${text}` : undefined,
    });
  }

  /**
   * File upload progress notification
   */
  uploadProgress(filename: string, progress: number) {
    return this.loading(`Uploading ${filename}... ${Math.round(progress)}%`);
  }

  /**
   * File upload success notification
   */
  uploadSuccess(filename: string) {
    return this.success('Upload complete!', {
      description: `${filename} has been uploaded successfully`,
    });
  }

  /**
   * File upload error notification
   */
  uploadError(filename: string, error?: string) {
    return this.error('Upload failed', {
      description: error || `Failed to upload ${filename}`,
    });
  }
}

// Create and export a singleton instance
export const notifications = new NotificationService();

// Export types for use in other files
export type { ExternalToast };

// Default export for convenience
export default notifications; 