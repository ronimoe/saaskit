'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link, AlertTriangle } from 'lucide-react';

interface AccountLinkingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLink: () => Promise<void>;
  provider: string;
  email: string;
  message?: string;
}

export function AccountLinkingDialog({
  isOpen,
  onClose,
  onConfirmLink,
  provider,
  email,
  message
}: AccountLinkingDialogProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmLink = async () => {
    try {
      setIsLinking(true);
      setError(null);
      await onConfirmLink();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link accounts');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCancel = () => {
    if (!isLinking) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Your Accounts
          </DialogTitle>
          <DialogDescription>
            {message || `An account with ${email} already exists. Would you like to link your ${provider} account?`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Linking your accounts will allow you to sign in using either your email/password or your {provider} account.
              Your existing data and settings will be preserved.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-sm font-medium">Account Details:</div>
            <div className="text-sm text-muted-foreground">
              <div>Email: {email}</div>
              <div>Provider: {provider}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLinking}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLink}
            disabled={isLinking}
            className="w-full sm:w-auto"
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking Accounts...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Link Accounts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 