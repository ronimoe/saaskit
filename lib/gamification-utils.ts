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

// XP calculation based on various user activities
export function calculateUserXP(profile: Profile, subscriptions: Subscription[]): number {
  let totalXp = 0
  
  // Base XP for account creation
  totalXp += 100
  
  // XP for account age (1 XP per day)
  const accountAge = profile.created_at 
    ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  totalXp += accountAge
  
  // XP for profile completion
  const completion = calculateProfileCompletion(profile)
  totalXp += Math.floor(completion * 5) // Up to 500 XP for 100% completion
  
  // XP for subscription activity
  const activeSubscriptions = subscriptions.filter(sub => 
    sub.status === 'active' || sub.status === 'trialing'
  )
  totalXp += activeSubscriptions.length * 200
  
  // XP for subscription duration
  subscriptions.forEach(sub => {
    if (sub.status === 'active' || sub.status === 'canceled') {
      const startDate = sub.created_at ? new Date(sub.created_at) : new Date()
      const endDate = sub.canceled_at ? new Date(sub.canceled_at) : new Date()
      const months = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      totalXp += months * 50
    }
  })
  
  return totalXp
}

// Level system with exponential scaling
export function calculateUserLevel(totalXp: number): UserLevel {
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
  
  let currentLevel = levels[0]!
  let nextLevel = levels[1] || levels[0]!
  
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i]
    if (!level) continue
    
    if (totalXp >= level.xpRequired) {
      currentLevel = level
      nextLevel = levels[i + 1] || level
    } else {
      break
    }
  }
  
  const xpInCurrentLevel = totalXp - currentLevel.xpRequired
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired
  const progress = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100)
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xp: xpInCurrentLevel,
    xpToNext: nextLevel.xpRequired - totalXp,
    totalXp,
    progress
  }
}

// Profile completion calculation
export function calculateProfileCompletion(profile: Profile): number {
  const fields = [
    profile.full_name,
    profile.company_name,
    profile.website_url,
    profile.avatar_url,
    profile.phone,
    profile.timezone,
  ]
  
  const completedFields = fields.filter(field => field && field.trim() !== '').length
  return Math.round((completedFields / fields.length) * 100)
}

// Achievement definitions and checking
export function getAvailableAchievements(): Omit<Achievement, 'earned' | 'earnedAt'>[] {
  return [
    {
      id: 'first_login',
      title: 'Welcome Aboard',
      description: 'Created your account',
      icon: '👋',
      category: 'engagement',
      rarity: 'common'
    },
    {
      id: 'profile_complete',
      title: 'All Set Up',
      description: 'Completed your profile 100%',
      icon: '✅',
      category: 'profile',
      rarity: 'common'
    },
    {
      id: 'week_old',
      title: 'Settling In',
      description: 'Account is 1 week old',
      icon: '📅',
      category: 'time',
      rarity: 'common'
    },
    {
      id: 'month_old',
      title: 'Regular Member',
      description: 'Account is 1 month old',
      icon: '🗓️',
      category: 'time',
      rarity: 'common'
    },
    {
      id: 'year_old',
      title: 'Veteran',
      description: 'Account is 1 year old',
      icon: '🏆',
      category: 'time',
      rarity: 'rare'
    },
    {
      id: 'first_subscription',
      title: 'Premium Member',
      description: 'Subscribed to a premium plan',
      icon: '💎',
      category: 'subscription',
      rarity: 'rare'
    },
    {
      id: 'long_subscriber',
      title: 'Loyal Customer',
      description: 'Subscribed for 6+ months',
      icon: '🌟',
      category: 'subscription',
      rarity: 'epic'
    },
    {
      id: 'level_5',
      title: 'Rising Star',
      description: 'Reached level 5',
      icon: '⭐',
      category: 'engagement',
      rarity: 'rare'
    },
    {
      id: 'level_10',
      title: 'Champion',
      description: 'Reached maximum level 10',
      icon: '👑',
      category: 'engagement',
      rarity: 'legendary'
    },
  ]
}

// Check which achievements user has earned
export function checkAchievements(
  profile: Profile, 
  subscriptions: Subscription[], 
  userLevel: UserLevel
): Achievement[] {
  const availableAchievements = getAvailableAchievements()
  const accountAge = profile.created_at 
    ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  
  const profileCompletion = calculateProfileCompletion(profile)
  
  // Calculate subscription duration
  const subscriptionMonths = subscriptions.reduce((total, sub) => {
    if ((sub.status === 'active' || sub.status === 'canceled') && sub.created_at) {
      const startDate = new Date(sub.created_at)
      const endDate = sub.canceled_at ? new Date(sub.canceled_at) : new Date()
      const months = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      return total + months
    }
    return total
  }, 0)
  
  return availableAchievements.map(achievement => {
    let earned = false
    let earnedAt: string | undefined
    
    switch (achievement.id) {
      case 'first_login':
        earned = true
        earnedAt = profile.created_at || new Date().toISOString()
        break
      case 'profile_complete':
        earned = profileCompletion >= 100
        earnedAt = earned ? profile.updated_at || profile.created_at || new Date().toISOString() : undefined
        break
      case 'week_old':
        earned = accountAge >= 7
        earnedAt = earned ? profile.created_at || new Date().toISOString() : undefined
        break
      case 'month_old':
        earned = accountAge >= 30
        earnedAt = earned ? profile.created_at || new Date().toISOString() : undefined
        break
      case 'year_old':
        earned = accountAge >= 365
        earnedAt = earned ? profile.created_at || new Date().toISOString() : undefined
        break
      case 'first_subscription':
        earned = subscriptions.length > 0
        earnedAt = earned ? subscriptions[0]?.created_at || undefined : undefined
        break
      case 'long_subscriber':
        earned = subscriptionMonths >= 6
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
}

// Get rarity color and styling
export function getAchievementRarityStyles(rarity: Achievement['rarity']) {
  switch (rarity) {
    case 'common':
      return {
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        borderColor: 'border-slate-300 dark:border-slate-600',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-800/50'
      }
    case 'rare':
      return {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-300 dark:border-blue-600',
        glowColor: 'shadow-blue-200/50 dark:shadow-blue-800/50'
      }
    case 'epic':
      return {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        borderColor: 'border-purple-300 dark:border-purple-600',
        glowColor: 'shadow-purple-200/50 dark:shadow-purple-800/50'
      }
    case 'legendary':
      return {
        bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-400 dark:border-yellow-500',
        glowColor: 'shadow-yellow-300/50 dark:shadow-yellow-700/50'
      }
  }
}

// Calculate user progress metrics
export function calculateUserProgress(profile: Profile, subscriptions: Subscription[]): UserProgress {
  const accountAge = profile.created_at 
    ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  
  const profileCompletion = calculateProfileCompletion(profile)
  
  // Calculate subscription months
  const subscriptionMonths = subscriptions.reduce((total, sub) => {
    if ((sub.status === 'active' || sub.status === 'canceled') && sub.created_at) {
      const startDate = new Date(sub.created_at)
      const endDate = sub.canceled_at ? new Date(sub.canceled_at) : new Date()
      const months = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      return total + months
    }
    return total
  }, 0)
  
  // Mock activity streak and login data (in a real app, this would come from user activity tracking)
  const mockActivityStreak = Math.min(Math.floor(accountAge / 7), 30) // Mock streak based on account age
  const mockTotalLogins = Math.floor(accountAge * 0.8) // Mock login frequency
  
  return {
    profileCompletion,
    accountAge,
    activityStreak: mockActivityStreak,
    totalLogins: mockTotalLogins,
    subscriptionMonths
  }
} 