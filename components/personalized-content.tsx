"use client"

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Star, 
  Settings, 
  Palette, 
  Bell,
  Eye,
  Volume2,
  Zap,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react'
import type { Profile, Subscription } from '@/types/database'
import { useUserProgress } from '@/hooks/useUserProgress'

interface PersonalizedContentProps {
  profile: Profile
  subscriptions: Subscription[]
}

function TimeBasedGreeting({ profile }: { profile: Profile }) {
  const [greeting, setGreeting] = useState({ message: '', icon: Sun, timeOfDay: '' })
  
  useEffect(() => {
    const hour = new Date().getHours()
    const firstName = profile.full_name?.split(' ')[0] || 'there'
    
    if (hour >= 5 && hour < 12) {
      setGreeting({
        message: `Good morning, ${firstName}!`,
        icon: Sunrise,
        timeOfDay: 'morning'
      })
    } else if (hour >= 12 && hour < 17) {
      setGreeting({
        message: `Good afternoon, ${firstName}!`,
        icon: Sun,
        timeOfDay: 'afternoon'
      })
    } else if (hour >= 17 && hour < 20) {
      setGreeting({
        message: `Good evening, ${firstName}!`,
        icon: Sunset,
        timeOfDay: 'evening'
      })
    } else {
      setGreeting({
        message: `Good night, ${firstName}!`,
        icon: Moon,
        timeOfDay: 'night'
      })
    }
  }, [profile.full_name])

  const getTimeBasedSuggestion = () => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return "Perfect time to check your dashboard and plan your day!"
    } else if (hour >= 12 && hour < 17) {
      return "How about exploring new features or updating your profile?"
    } else if (hour >= 17 && hour < 20) {
      return "Wind down with a quick review of your achievements."
    } else {
      return "Take a break and come back tomorrow for new challenges!"
    }
  }

  const GreetingIcon = greeting.icon

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium" interactive="none">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
          <GreetingIcon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {greeting.message}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {getTimeBasedSuggestion()}
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {greeting.timeOfDay}
        </Badge>
      </div>
    </GlassCard>
  )
}

function AdaptiveRecommendations({ subscriptions, userProgress }: { 
  subscriptions: Subscription[], 
  userProgress: unknown 
}) {
  if (!userProgress || typeof userProgress !== 'object') return null;
  const progress = userProgress as { progress: { profileCompletion: number; activityStreak: number }; userLevel: { level: number } };
  
  const getPersonalizedRecommendations = () => {
    const recommendations = []
    
    // Profile completion recommendations
    if (progress.progress.profileCompletion < 100) {
      recommendations.push({
        title: 'Complete Your Profile',
        description: `You're ${progress.progress.profileCompletion}% done! Add missing details to unlock achievements.`,
        action: 'Complete Profile',
        priority: 'high',
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      })
    }

    // Subscription recommendations
    const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active')
    if (!hasActiveSubscription) {
      recommendations.push({
        title: 'Upgrade to Premium',
        description: 'Unlock exclusive features and boost your XP earnings!',
        action: 'View Plans',
        priority: 'medium',
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      })
    }

    // Level-based recommendations
    if (progress.userLevel.level < 3) {
      recommendations.push({
        title: 'Explore Features',
        description: 'Discover all the amazing tools available to help you grow.',
        action: 'Take Tour',
        priority: 'medium',
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      })
    }

    // Activity recommendations
    if (progress.progress.activityStreak < 7) {
      recommendations.push({
        title: 'Build Your Streak',
        description: 'Visit daily to build momentum and earn streak bonuses!',
        action: 'Set Reminder',
        priority: 'low',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      })
    }

    return recommendations.slice(0, 3) // Limit to 3 recommendations
  }

  const recommendations = getPersonalizedRecommendations()

  if (recommendations.length === 0) {
    return (
      <GlassCard variant="secondary" size="lg" depth="low" glow="subtle">
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            You&apos;re all set!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No recommendations right now. Keep up the great work!
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Recommended for You
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon
          return (
            <GlassCard key={index} variant="secondary" size="md" depth="low" glow="subtle" interactive="hover">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${rec.bgColor} dark:bg-slate-800`}>
                  <Icon className={`h-5 w-5 ${rec.color} dark:text-slate-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {rec.description}
                      </p>
                    </div>
                    <Badge variant={rec.priority === 'high' ? 'default' : 'outline'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto">
                    {rec.action} →
                  </Button>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}

function PersonalizationSettings() {
  const [preferences, setPreferences] = useState({
    enableAnimations: true,
    enableNotifications: true,
    enableSounds: false,
    autoTheme: true,
    compactMode: false,
    highContrast: false
  })

  const settingsItems = [
    {
      id: 'enableAnimations',
      title: 'Animations',
      description: 'Enable smooth animations and transitions',
      icon: Zap
    },
    {
      id: 'enableNotifications',
      title: 'Notifications',
      description: 'Receive updates about achievements and progress',
      icon: Bell
    },
    {
      id: 'enableSounds',
      title: 'Sound Effects',
      description: 'Play sounds for interactions and achievements',
      icon: Volume2
    },
    {
      id: 'autoTheme',
      title: 'Auto Theme',
      description: 'Automatically switch between light and dark themes',
      icon: Palette
    },
    {
      id: 'compactMode',
      title: 'Compact Mode',
      description: 'Use a more condensed layout to fit more content',
      icon: Eye
    },
    {
      id: 'highContrast',
      title: 'High Contrast',
      description: 'Increase contrast for better accessibility',
      icon: Eye
    }
  ]

  const handlePreferenceChange = (id: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [id]: value }))
    
    // Apply preferences to document
    if (id === 'enableAnimations') {
      document.body.classList.toggle('theme-no-animations', !value)
    }
    if (id === 'highContrast') {
      document.body.classList.toggle('theme-high-contrast', value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Personalization
        </h3>
      </div>
      
      <GlassCard variant="secondary" size="lg" depth="medium" glow="subtle">
        <div className="space-y-6">
          {settingsItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[item.id as keyof typeof preferences]}
                    onCheckedChange={(value) => handlePreferenceChange(item.id, value)}
                  />
                </div>
                {index < settingsItems.length - 1 && <Separator className="mt-6" />}
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}

export function PersonalizedContent({ profile, subscriptions }: PersonalizedContentProps) {
  const userProgress = useUserProgress(profile, subscriptions)

  return (
    <div className="space-y-6">
      {/* Time-based greeting */}
      <TimeBasedGreeting profile={profile} />

      {/* Adaptive recommendations */}
      <AdaptiveRecommendations 
        subscriptions={subscriptions} 
        userProgress={userProgress} 
      />

      {/* Personalization settings */}
      <PersonalizationSettings />
    </div>
  )
} 