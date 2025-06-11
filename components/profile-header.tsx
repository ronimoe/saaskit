"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { MapPin, Calendar, Globe, Building2, Phone, Mail } from 'lucide-react'
import { getProfileDisplayName, parseBillingAddress } from '@/lib/database-utils'
import type { Profile } from '@/types/database'

interface ProfileHeaderProps {
  profile: Profile
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayName = getProfileDisplayName(profile)
  const billingAddress = parseBillingAddress(profile.billing_address)
  const initials = getInitials(displayName)

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Badge 
            variant="secondary" 
            className="absolute -bottom-2 -right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Active
          </Badge>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 mr-1" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4 mr-1" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            {profile.company_name && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{profile.company_name}</span>
              </div>
            )}
            
            {profile.website_url && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <a 
                  href={profile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Website
                </a>
              </div>
            )}

            {billingAddress && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{billingAddress.city}, {billingAddress.country}</span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Member since {formatDate(profile.created_at)}</span>
            </div>
          </div>

          {/* Preferences Badges */}
          <div className="flex flex-wrap gap-2">
            {profile.email_notifications && (
              <Badge variant="outline" className="text-xs">
                Email Notifications
              </Badge>
            )}
            {profile.marketing_emails && (
              <Badge variant="outline" className="text-xs">
                Marketing Emails
              </Badge>
            )}
            {profile.timezone && (
              <Badge variant="outline" className="text-xs">
                {profile.timezone}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Edit Avatar
          </Button>
        </div>
      </div>
    </GlassCard>
  )
} 