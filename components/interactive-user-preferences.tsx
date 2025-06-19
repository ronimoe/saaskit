'use client'

/**
 * Interactive User Preferences Component
 * 
 * Client-side component for managing user preferences with real-time updates.
 * Integrates with server actions and applies preferences to the UI immediately.
 */

import { useState, useTransition } from 'react'
import { Eye, Monitor, Bell, Palette, Code, Volume2, Zap, Sun, Moon, Laptop } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { updateSinglePreferenceAction, resetUserPreferencesAction } from '@/app/actions/user-preferences'
import { applyPreferencesToDocument } from '@/lib/user-preferences'
import type { UserPreferences } from '@/types/database'
import { toast } from 'sonner'

interface InteractiveUserPreferencesProps {
  initialPreferences: UserPreferences
}

export function InteractiveUserPreferences({ initialPreferences }: InteractiveUserPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isPending, startTransition] = useTransition()

  // Update a single preference
  const updatePreference = async (key: keyof UserPreferences, value: unknown) => {
    // Optimistic update
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    // Apply changes to document immediately
    applyPreferencesToDocument(newPreferences)
    
    startTransition(async () => {
      const result = await updateSinglePreferenceAction(key as any, value as any)
      
      if (!result.success) {
        // Revert on error
        setPreferences(preferences)
        applyPreferencesToDocument(preferences)
        toast.error(result.error || 'Failed to update preference')
      } else {
        toast.success('Preference updated successfully')
      }
    })
  }

  // Reset all preferences to defaults
  const resetPreferences = async () => {
    startTransition(async () => {
      const result = await resetUserPreferencesAction()
      
      if (result.success) {
        // Reset to defaults
        const defaultPrefs = {
          ...preferences,
          theme_mode: 'system' as const,
          compact_mode: false,
          reduce_motion: false,
          high_contrast: false,
          large_text: false,
          screen_reader_optimized: false,
          browser_notifications: false,
          sound_effects: false,
          debug_mode: false,
          show_layout_guides: false,
          console_logging: true,
          enable_animations: true,
          enable_glassmorphism: true,
        }
        setPreferences(defaultPrefs)
        applyPreferencesToDocument(defaultPrefs)
        toast.success('Preferences reset to defaults')
      } else {
        toast.error(result.error || 'Failed to reset preferences')
      }
    })
  }

  const getThemeIcon = (mode: string) => {
    switch (mode) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Laptop className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Display Preferences */}
      <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold">Display Preferences</h3>
            </div>
            {isPending && (
              <Badge variant="secondary" className="text-xs">
                Saving...
              </Badge>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Theme Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode" className="text-sm font-medium">
                Theme Mode
              </Label>
              <Select 
                value={preferences.theme_mode} 
                onValueChange={(value) => updatePreference('theme_mode', value)}
                disabled={isPending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {getThemeIcon(preferences.theme_mode)}
                      <span className="capitalize">{preferences.theme_mode}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Laptop className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode" className="text-sm font-medium">
                Compact Mode
              </Label>
              <Switch 
                id="compact-mode" 
                checked={preferences.compact_mode}
                onCheckedChange={(checked) => updatePreference('compact_mode', checked)}
                disabled={isPending}
              />
            </div>
            
            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion" className="text-sm font-medium">
                Reduce Motion
              </Label>
              <Switch 
                id="reduce-motion" 
                checked={preferences.reduce_motion}
                onCheckedChange={(checked) => updatePreference('reduce_motion', checked)}
                disabled={isPending}
              />
            </div>

            {/* Enable Animations */}
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-animations" className="text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Enable Animations</span>
                </div>
              </Label>
              <Switch 
                id="enable-animations" 
                checked={preferences.enable_animations}
                onCheckedChange={(checked) => updatePreference('enable_animations', checked)}
                disabled={isPending}
              />
            </div>

            {/* Enable Glassmorphism */}
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-glassmorphism" className="text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Enable Glassmorphism</span>
                </div>
              </Label>
              <Switch 
                id="enable-glassmorphism" 
                checked={preferences.enable_glassmorphism}
                onCheckedChange={(checked) => updatePreference('enable_glassmorphism', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Accessibility */}
      <GlassCard variant="primary" size="lg" depth="medium" glow="subtle">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">Accessibility</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast
              </Label>
              <Switch 
                id="high-contrast" 
                checked={preferences.high_contrast}
                onCheckedChange={(checked) => updatePreference('high_contrast', checked)}
                disabled={isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="large-text" className="text-sm font-medium">
                Large Text
              </Label>
              <Switch 
                id="large-text" 
                checked={preferences.large_text}
                onCheckedChange={(checked) => updatePreference('large_text', checked)}
                disabled={isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader" className="text-sm font-medium">
                Screen Reader Optimized
              </Label>
              <Switch 
                id="screen-reader" 
                checked={preferences.screen_reader_optimized}
                onCheckedChange={(checked) => updatePreference('screen_reader_optimized', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard variant="secondary" size="lg" depth="low" glow="subtle">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notifications" className="text-sm font-medium">
                Browser Notifications
              </Label>
              <Switch 
                id="browser-notifications" 
                checked={preferences.browser_notifications}
                onCheckedChange={(checked) => updatePreference('browser_notifications', checked)}
                disabled={isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-effects" className="text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <span>Sound Effects</span>
                </div>
              </Label>
              <Switch 
                id="sound-effects" 
                checked={preferences.sound_effects}
                onCheckedChange={(checked) => updatePreference('sound_effects', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Developer Options */}
      <GlassCard variant="secondary" size="lg" depth="low" glow="subtle">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold">Developer Options</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode" className="text-sm font-medium">
                Debug Mode
              </Label>
              <Switch 
                id="debug-mode" 
                checked={preferences.debug_mode}
                onCheckedChange={(checked) => updatePreference('debug_mode', checked)}
                disabled={isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-guides" className="text-sm font-medium">
                Show Layout Guides
              </Label>
              <Switch 
                id="show-guides" 
                checked={preferences.show_layout_guides}
                onCheckedChange={(checked) => updatePreference('show_layout_guides', checked)}
                disabled={isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="console-logging" className="text-sm font-medium">
                Console Logging
              </Label>
              <Switch 
                id="console-logging" 
                checked={preferences.console_logging}
                onCheckedChange={(checked) => updatePreference('console_logging', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={resetPreferences}
          disabled={isPending}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
} 