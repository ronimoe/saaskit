'use client'

import { useState, useEffect } from 'react'
import { MapPin, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface BillingAddressFormProps {
  userId: string
  onAddressUpdate?: (address: BillingAddress) => void
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
]

export function BillingAddressForm({ userId, onAddressUpdate }: BillingAddressFormProps) {
  const [address, setAddress] = useState<BillingAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingAddress()
  }, [userId])

  const fetchBillingAddress = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/billing-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch billing address')
      }

      const data = await response.json()
      
      if (data.success && data.address) {
        setAddress(data.address)
      }
    } catch (error) {
      console.error('Error fetching billing address:', error)
      setError(error instanceof Error ? error.message : 'Failed to load billing address')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/stripe/billing-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, address }),
      })

      if (!response.ok) {
        throw new Error('Failed to update billing address')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Billing address updated successfully!')
        onAddressUpdate?.(address)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(data.error || 'Failed to update billing address')
      }
    } catch (error) {
      console.error('Error updating billing address:', error)
      setError(error instanceof Error ? error.message : 'Failed to update billing address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof BillingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (successMessage) setSuccessMessage(null)
  }

  if (isLoading) {
    return (
      <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Billing Address</h2>
              <p className="text-muted-foreground">Loading address information...</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 animate-pulse opacity-75"></div>
            <div className="relative">
              <MapPin className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Billing Address</h2>
            <p className="text-muted-foreground">
              Manage your billing address for invoices and payments.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              value={address.line1}
              onChange={(e) => handleInputChange('line1', e.target.value)}
              placeholder="Street address"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="line2">Address Line 2</Label>
            <Input
              id="line2"
              value={address.line2 || ''}
              onChange={(e) => handleInputChange('line2', e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province *</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State or Province"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code *</Label>
            <Input
              id="postal_code"
              value={address.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="Postal code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={address.country}
              onValueChange={(value) => handleInputChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={isSaving || !address.line1 || !address.city || !address.state || !address.postal_code}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Address
              </>
            )}
          </Button>
        </div>
      </form>
    </GlassCard>
  )
} 