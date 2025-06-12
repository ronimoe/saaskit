'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, User, Building, Globe, Phone, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { createClient } from '@/utils/supabase/client';
import { createProfileData, validateProfileData } from '@/lib/database-utils';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ProfileFormData } from '@/types/database';

interface OAuthData {
  email: string;
  full_name: string;
  avatar_url: string;
  provider: string;
}

interface ProfileCompletionFormProps {
  user: SupabaseUser;
  oauthData: OAuthData;
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
];

export function ProfileCompletionForm({ user, oauthData }: ProfileCompletionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: oauthData.full_name || '',
    phone: '',
    company_name: '',
    website_url: '',
    timezone: 'UTC',
    email_notifications: true,
    marketing_emails: false,
  });

  const updateField = (field: keyof ProfileFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateProfileData(formData);
    if (!validation.isValid) {
      toast.error('Please fix the following errors:', {
        description: validation.errors.join('\n')
      });
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        
        // Create profile data for insertion
        const profileData = createProfileData(user.id, user.email!, formData);
        
        // Insert the profile
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);

        if (error) {
          console.error('Profile creation error:', error);
          toast.error('Failed to create profile. Please try again.');
          return;
        }

        toast.success('Profile created successfully! Welcome to SaaS Kit!');
        
        // Redirect to profile page
        router.push('/profile');
        
      } catch (error) {
        console.error('Profile completion error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        
        // Create minimal profile with just required fields
        const minimalProfileData = createProfileData(user.id, user.email!, {
          full_name: oauthData.full_name || null,
          timezone: 'UTC',
          email_notifications: true,
          marketing_emails: false,
        });
        
        const { error } = await supabase
          .from('profiles')
          .insert(minimalProfileData);

        if (error) {
          console.error('Minimal profile creation error:', error);
          toast.error('Failed to create profile. Please try again.');
          return;
        }

        toast.success('Profile created! You can complete it later in settings.');
        router.push('/profile');
        
      } catch (error) {
        console.error('Skip profile completion error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Personal Information</h3>
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
              className="bg-white/50 dark:bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="pl-10 bg-white/50 dark:bg-white/5"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Professional Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Professional Information</h3>
          <span className="text-sm text-muted-foreground">(optional)</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="company_name" className="text-sm font-medium">
              Company Name
            </label>
            <Input
              id="company_name"
              value={formData.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              placeholder="Your company name"
              className="bg-white/50 dark:bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website_url" className="text-sm font-medium">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website_url"
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => updateField('website_url', e.target.value)}
                placeholder="https://example.com"
                className="pl-10 bg-white/50 dark:bg-white/5"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Preferences */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <Select value={formData.timezone || 'UTC'} onValueChange={(value) => updateField('timezone', value)}>
              <SelectTrigger className="bg-white/50 dark:bg-white/5">
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="flex-1 h-12"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Profile...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Complete Profile
            </>
          )}
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          onClick={handleSkip}
          disabled={isPending}
          className="sm:w-auto h-12 bg-white/50 dark:bg-white/5 border-white/20 hover:bg-white/70 dark:hover:bg-white/10"
        >
          Skip for Now
        </Button>
      </div>

      {/* Provider Info */}
      {oauthData.provider !== 'email' && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Signed up with {oauthData.provider === 'google' ? 'Google' : oauthData.provider} • 
            {oauthData.email}
          </p>
        </div>
      )}
    </form>
  );
} 