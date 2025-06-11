import { useMemo } from 'react'
import type { Profile, Subscription } from '@/types/database'

export interface UserLevel {
  level: number
  title: string
  xp: number
  xpToNext: number
  totalXp: number
  progress: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
  category: 'engagement' | 'subscription' | 'time' | 'profile'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserProgress {
  profileCompletion: number
  accountAge: number
  activityStreak: number
  totalLogins: number
  subscriptionMonths: number
}

export function useUserProgress(profile: Profile, subscriptions: Subscription[]) {
  const progress = useMemo(() => {
    // Calculate profile completion
    const fields = [
      profile.full_name,
      profile.company_name,
      profile.website_url,
      profile.avatar_url,
      profile.phone,
      profile.timezone,
    ]
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length
    const profileCompletion = Math.round((completedFields / fields.length) * 100)
    
    // Calculate account age
    const accountAge = profile.created_at 
      ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    // Calculate subscription months
    const subscriptionMonths = subscriptions.reduce((total, sub) => {
      if (sub.status === 'active' || sub.status === 'canceled') {
        const startDate = sub.created_at ? new Date(sub.created_at) : new Date()
        const endDate = sub.canceled_at ? new Date(sub.canceled_at) : new Date()
        const months = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        return total + months
      }
      return total
    }, 0)
    
    // Mock activity data (in real app would come from user activity tracking)
    const activityStreak = Math.min(Math.floor(accountAge / 7), 30)
    const totalLogins = Math.floor(accountAge * 0.8)
    
    return {
      profileCompletion,
      accountAge,
      activityStreak,
      totalLogins,
      subscriptionMonths
    }
  }, [profile, subscriptions])

  // Calculate XP
  const totalXp = useMemo(() => {
    let xp = 100 // Base XP for account creation
    
    // XP for account age (1 XP per day)
    xp += progress.accountAge
    
    // XP for profile completion (up to 500 XP)
    xp += Math.floor(progress.profileCompletion * 5)
    
    // XP for subscription activity
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    )
    xp += activeSubscriptions.length * 200
    
    // XP for subscription duration
    xp += progress.subscriptionMonths * 50
    
    return xp
  }, [progress, subscriptions])

  // Calculate level
  const userLevel = useMemo((): UserLevel => {
    const levels = [
      { level: 1, title: "Newcomer", xpRequired: 0 },
      { level: 2, title: "Explorer", xpRequired: 200 },
      { level: 3, title: "Member", xpRequired: 500 },
      { level: 4, title: "Regular", xpRequired: 1000 },
      { level: 5, title: "Contributor", xpRequired: 2000 },
      { level: 6, title: "Veteran", xpRequired: 4000 },
      { level: 7, title: "Expert", xpRequired: 7000 },
      { level: 8, title: "Master", xpRequired: 12000 },
      { level: 9, title: "Legend", xpRequired: 20000 },
      { level: 10, title: "Champion", xpRequired: 35000 },
    ]
    
    let currentLevel = levels[0]
    let nextLevel = levels[1] || levels[0]
    
    for (let i = 0; i < levels.length; i++) {
      if (totalXp >= levels[i].xpRequired) {
        currentLevel = levels[i]
        nextLevel = levels[i + 1] || levels[i]
      } else {
        break
      }
    }
    
    const xpInCurrentLevel = totalXp - currentLevel.xpRequired
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired
    const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100)
    
    return {
      level: currentLevel.level,
      title: currentLevel.title,
      xp: xpInCurrentLevel,
      xpToNext: nextLevel.xpRequired - totalXp,
      totalXp,
      progress: progressPercent
    }
  }, [totalXp])

  // Calculate achievements
  const achievements = useMemo((): Achievement[] => {
    const availableAchievements = [
      {
        id: 'first_login',
        title: 'Welcome Aboard',
        description: 'Created your account',
        icon: '👋',
        category: 'engagement' as const,
        rarity: 'common' as const
      },
      {
        id: 'profile_complete',
        title: 'All Set Up',
        description: 'Completed your profile 100%',
        icon: '✅',
        category: 'profile' as const,
        rarity: 'common' as const
      },
      {
        id: 'week_old',
        title: 'Settling In',
        description: 'Account is 1 week old',
        icon: '📅',
        category: 'time' as const,
        rarity: 'common' as const
      },
      {
        id: 'month_old',
        title: 'Regular Member',
        description: 'Account is 1 month old',
        icon: '🗓️',
        category: 'time' as const,
        rarity: 'common' as const
      },
      {
        id: 'year_old',
        title: 'Veteran',
        description: 'Account is 1 year old',
        icon: '🏆',
        category: 'time' as const,
        rarity: 'rare' as const
      },
      {
        id: 'first_subscription',
        title: 'Premium Member',
        description: 'Subscribed to a premium plan',
        icon: '💎',
        category: 'subscription' as const,
        rarity: 'rare' as const
      },
      {
        id: 'long_subscriber',
        title: 'Loyal Customer',
        description: 'Subscribed for 6+ months',
        icon: '🌟',
        category: 'subscription' as const,
        rarity: 'epic' as const
      },
      {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reached level 5',
        icon: '⭐',
        category: 'engagement' as const,
        rarity: 'rare' as const
      },
      {
        id: 'level_10',
        title: 'Champion',
        description: 'Reached maximum level 10',
        icon: '👑',
        category: 'engagement' as const,
        rarity: 'legendary' as const
      },
    ]
    
    return availableAchievements.map(achievement => {
      let earned = false
      let earnedAt: string | undefined
      
      switch (achievement.id) {
        case 'first_login':
          earned = true
          earnedAt = profile.created_at || new Date().toISOString()
          break
        case 'profile_complete':
          earned = progress.profileCompletion >= 100
          earnedAt = earned ? (profile.updated_at || profile.created_at || new Date().toISOString()) : undefined
          break
        case 'week_old':
          earned = progress.accountAge >= 7
          earnedAt = earned ? (profile.created_at || new Date().toISOString()) : undefined
          break
        case 'month_old':
          earned = progress.accountAge >= 30
          earnedAt = earned ? (profile.created_at || new Date().toISOString()) : undefined
          break
        case 'year_old':
          earned = progress.accountAge >= 365
          earnedAt = earned ? (profile.created_at || new Date().toISOString()) : undefined
          break
        case 'first_subscription':
          earned = subscriptions.length > 0
          earnedAt = earned ? subscriptions[0]?.created_at || undefined : undefined
          break
        case 'long_subscriber':
          earned = progress.subscriptionMonths >= 6
          earnedAt = earned ? subscriptions[0]?.created_at || undefined : undefined
          break
        case 'level_5':
          earned = userLevel.level >= 5
          earnedAt = earned ? new Date().toISOString() : undefined
          break
        case 'level_10':
          earned = userLevel.level >= 10
          earnedAt = earned ? new Date().toISOString() : undefined
          break
      }
      
      return {
        ...achievement,
        earned,
        earnedAt
      }
    })
  }, [progress, subscriptions, userLevel, profile])

  return {
    progress,
    totalXp,
    userLevel,
    achievements,
    earnedAchievements: achievements.filter(a => a.earned),
    unearnedAchievements: achievements.filter(a => !a.earned),
  }
} 