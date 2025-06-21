"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Check } from 'lucide-react'
import { transformProfileFormData, validateProfileData, parseBillingAddress } from '@/lib/database-utils'
import { createClient } from '@/utils/supabase/client'
import { handleSupabaseResponse } from '@/lib/supabase'
import { useNotifications } from '@/components/providers/notification-provider'
import type { Profile, ProfileFormData, BillingAddress } from '@/types/database'

interface ProfileFormProps {
  profile: Profile
}

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const notifications = useNotifications()
  
  const initialBillingAddress = parseBillingAddress(profile.billing_address)
  
  const [formData, setFormData] = useState<ProfileFormData & { billing_address?: BillingAddress }>({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    company_name: profile.company_name || '',
    website_url: profile.website_url || '',
    timezone: profile.timezone || 'UTC',
    email_notifications: profile.email_notifications ?? true,
    marketing_emails: profile.marketing_emails ?? false,
    billing_address: initialBillingAddress || undefined,
  })

  const [billingForm, setBillingForm] = useState({
    line1: initialBillingAddress?.line1 || '',
    line2: initialBillingAddress?.line2 || '',
    city: initialBillingAddress?.city || '',
    state: initialBillingAddress?.state || '',
    postal_code: initialBillingAddress?.postal_code || '',
    country: initialBillingAddress?.country || '',
  })

  const updateField = (field: keyof ProfileFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsSuccess(false)
  }

  const updateBillingField = (field: keyof BillingAddress, value: string) => {
    setBillingForm(prev => ({ ...prev, [field]: value }))
    setIsSuccess(false)
  }

  const attemptUpdate = async (updateData: Record<string, unknown>, retryCount = 0): Promise<void> => {
    const maxRetries = 2
    
    try {
      const supabase = createClient()
      
      const response = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()

      const result = handleSupabaseResponse(response)

      if (result.error) {
        console.error('Error updating profile:', result.error)
        notifications.formError(`Failed to update profile: ${result.error}`)
        return
      }

      setIsSuccess(true)
      notifications.formSuccess('Profile updated successfully!')
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)

    } catch (error) {
      let errorMessage = 'An unexpected error occurred'
      let shouldRetry = false
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Handle specific network errors
        if (error.message.includes('Failed to fetch')) {
          shouldRetry = retryCount < maxRetries
          errorMessage = shouldRetry 
            ? `Network connection error. Retrying... (attempt ${retryCount + 1}/${maxRetries + 1})`
            : 'Network connection error. Please check your internet connection and try again.'
        } else if (error.message.includes('NetworkError')) {
          shouldRetry = retryCount < maxRetries
          errorMessage = shouldRetry 
            ? `Network error. Retrying... (attempt ${retryCount + 1}/${maxRetries + 1})`
            : 'Network error occurred. Please try again.'
        } else if (error.message.includes('timeout')) {
          shouldRetry = retryCount < maxRetries
          errorMessage = shouldRetry 
            ? `Request timeout. Retrying... (attempt ${retryCount + 1}/${maxRetries + 1})`
            : 'Request timeout. Please try again.'
        }
      }
      
      // Log detailed error information
      console.error('Error updating profile:', {
        message: errorMessage,
        retryCount,
        willRetry: shouldRetry,
        originalError: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString()
      })
      
      if (shouldRetry) {
        // Show retry message
        notifications.info(errorMessage)
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return attemptUpdate(updateData, retryCount + 1)
      } else {
        notifications.formError(`Failed to update profile: ${errorMessage}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build complete billing address if any field is filled
    const billingAddress = billingForm.line1 || billingForm.city || billingForm.postal_code || billingForm.country
      ? {
          line1: billingForm.line1,
          line2: billingForm.line2 || undefined,
          city: billingForm.city,
          state: billingForm.state || undefined,
          postal_code: billingForm.postal_code,
          country: billingForm.country,
        }
      : undefined

    const dataToValidate = {
      ...formData,
      billing_address: billingAddress,
    }

    // Validate form data
    const validation = validateProfileData(dataToValidate)
    if (!validation.isValid) {
      notifications.formError(`Please fix the following errors:\n${validation.errors.join('\n')}`)
      return
    }

    startTransition(async () => {
      const updateData = transformProfileFormData({
        ...dataToValidate,
        billing_address: billingAddress,
      })
      
      await attemptUpdate(updateData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal details and contact information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => updateField('full_name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company_name" className="text-sm font-medium">
              Company Name
            </label>
            <Input
              id="company_name"
              value={formData.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              placeholder="Your company name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website_url" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => updateField('website_url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <Select value={formData.timezone || 'UTC'} onValueChange={(value) => updateField('timezone', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Billing Address */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Billing Address</h3>
          <p className="text-sm text-muted-foreground">
            Optional billing address for invoices and payments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="line1" className="text-sm font-medium">
              Address Line 1
            </label>
            <Input
              id="line1"
              value={billingForm.line1}
              onChange={(e) => updateBillingField('line1', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="line2" className="text-sm font-medium">
              Address Line 2 <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="line2"
              value={billingForm.line2}
              onChange={(e) => updateBillingField('line2', e.target.value)}
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <Input
              id="city"
              value={billingForm.city}
              onChange={(e) => updateBillingField('city', e.target.value)}
              placeholder="New York"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium">
              State/Province <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="state"
              value={billingForm.state}
              onChange={(e) => updateBillingField('state', e.target.value)}
              placeholder="NY"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="postal_code" className="text-sm font-medium">
              Postal Code
            </label>
            <Input
              id="postal_code"
              value={billingForm.postal_code}
              onChange={(e) => updateBillingField('postal_code', e.target.value)}
              placeholder="10001"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <Input
              id="country"
              value={billingForm.country}
              onChange={(e) => updateBillingField('country', e.target.value)}
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Preferences */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Manage your notification and communication preferences.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="email_notifications" className="text-sm font-medium">
                Email Notifications
              </label>
              <p className="text-sm text-muted-foreground">
                Receive important updates and notifications via email.
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={formData.email_notifications ?? true}
              onCheckedChange={(checked) => updateField('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="marketing_emails" className="text-sm font-medium">
                Marketing Emails
              </label>
              <p className="text-sm text-muted-foreground">
                Receive newsletters, product updates, and promotional content.
              </p>
            </div>
            <Switch
              id="marketing_emails"
              checked={formData.marketing_emails ?? false}
              onCheckedChange={(checked) => updateField('marketing_emails', checked)}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit" disabled={isPending} className="relative">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        
        {isSuccess && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Profile updated successfully
          </Badge>
        )}
      </div>
    </form>
  )
} 