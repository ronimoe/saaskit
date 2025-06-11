'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface SyncSubscriptionButtonProps {
  userId: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function SyncSubscriptionButton({ 
  userId, 
  className = '', 
  size = 'default' 
}: SyncSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync with Stripe')
      }
      
      const data = await response.json()
      
      toast.success('Subscription synced with Stripe', {
        description: 'Your subscription data has been updated.',
        duration: 3000,
      })
      
      // Refresh the page to show updated data
      window.location.reload()
      
    } catch (error) {
      console.error('Error syncing with Stripe:', error)
      
      toast.error('Sync Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleSync}
      disabled={isLoading}
      className={className}
      title="Force sync with Stripe (debug)"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${size === 'default' ? 'mr-2' : ''}`} />
      {size !== 'icon' && size !== 'sm' && 'Sync'}
    </Button>
  )
} 