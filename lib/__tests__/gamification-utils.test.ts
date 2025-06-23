import {
  calculateUserXP,
  calculateUserLevel,
  calculateProfileCompletion,
  getAvailableAchievements,
  checkAchievements,
  getAchievementRarityStyles,
  calculateUserProgress,
  type UserLevel,
  type Achievement,
  type UserProgress,
} from '@/lib/gamification-utils'
import type { Profile, Subscription } from '@/types/database'

describe('Gamification Utils', () => {
  // Mock data
  const mockProfile: Profile = {
    id: 'test-profile-id',
    user_id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    company_name: 'Test Company',
    website_url: 'https://test.com',
    avatar_url: 'https://test.com/avatar.jpg',
    phone: '+1234567890',
    timezone: 'America/New_York',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    billing_address: null,
    email_notifications: true,
    marketing_emails: false,
    stripe_customer_id: null,
  }

  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub1',
      user_id: 'test-user-id',
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      stripe_price_id: 'price_123',
      status: 'active',
      created_at: '2023-01-01T00:00:00.000Z',
      current_period_start: '2023-01-01T00:00:00.000Z',
      current_period_end: '2023-02-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    } as Subscription,
  ]

  beforeAll(() => {
    // Mock Date.now() to return a consistent date
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-07-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('calculateUserXP', () => {
    it('should calculate base XP correctly', () => {
      const xp = calculateUserXP(mockProfile, [])
      
      // Base XP (100) + account age in days + profile completion (6 fields * 5 XP each)
      const expectedAccountAge = Math.floor((new Date('2023-07-01').getTime() - new Date('2023-01-01').getTime()) / (1000 * 60 * 60 * 24))
      const expectedXp = 100 + expectedAccountAge + (6 * 5) // 100% profile completion
      
      expect(xp).toBe(expectedXp)
    })

    it('should add XP for active subscriptions', () => {
      const xpWithSub = calculateUserXP(mockProfile, mockSubscriptions)
      const xpWithoutSub = calculateUserXP(mockProfile, [])
      
      expect(xpWithSub).toBe(xpWithoutSub + 200) // 200 XP per active subscription
    })

    it('should add XP for trialing subscriptions', () => {
      const trialingSub = { ...mockSubscriptions[0], status: 'trialing' } as Subscription
      const xp = calculateUserXP(mockProfile, [trialingSub])
      const baseXp = calculateUserXP(mockProfile, [])
      
      expect(xp).toBe(baseXp + 200) // Same as active subscription
    })

    it('should add XP for subscription duration', () => {
      const longSub = {
        ...mockSubscriptions[0],
        created_at: '2022-01-01T00:00:00.000Z', // 1 year ago
        canceled_at: '2023-01-01T00:00:00.000Z',
        status: 'canceled'
      } as Subscription
      
      const xp = calculateUserXP(mockProfile, [longSub])
      const baseXp = calculateUserXP(mockProfile, [])
      
      // 12 months * 50 XP per month = 600 XP
      expect(xp).toBe(baseXp + 600)
    })

    it('should handle profiles with missing created_at', () => {
      const profileWithoutDate = { ...mockProfile, created_at: null }
      const xp = calculateUserXP(profileWithoutDate, [])
      
      // Should still calculate XP without crashing
      expect(xp).toBeGreaterThan(0)
      expect(xp).toBe(100 + 30) // Base + profile completion only
    })

    it('should handle incomplete profiles', () => {
      const incompleteProfile = {
        ...mockProfile,
        full_name: '',
        company_name: null,
        website_url: null,
      }
      
      const xp = calculateUserXP(incompleteProfile, [])
      const accountAge = Math.floor((new Date('2023-07-01').getTime() - new Date('2023-01-01').getTime()) / (1000 * 60 * 60 * 24))
      
      // Only 3 completed fields (avatar_url, phone, timezone) = 15 XP
      expect(xp).toBe(100 + accountAge + 15)
    })
  })

  describe('calculateUserLevel', () => {
    it('should return level 1 for new users', () => {
      const level = calculateUserLevel(150)
      
      expect(level).toEqual({
        level: 1,
        title: 'Newcomer',
        xp: 150,
        xpToNext: 50, // 200 - 150
        totalXp: 150,
        progress: 75 // 150 / 200 * 100
      })
    })

    it('should return level 2 for users with 200+ XP', () => {
      const level = calculateUserLevel(350)
      
      expect(level).toEqual({
        level: 2,
        title: 'Explorer',
        xp: 150, // 350 - 200 (current level start)
        xpToNext: 150, // 500 - 350
        totalXp: 350,
        progress: 50 // 150 / 300 * 100 (300 = 500 - 200)
      })
    })

    it('should return max level for users with highest XP', () => {
      const level = calculateUserLevel(50000)
      
      expect(level.level).toBe(10)
      expect(level.title).toBe('Champion')
      expect(level.totalXp).toBe(50000)
    })

    it('should handle edge case of exactly level threshold', () => {
      const level = calculateUserLevel(500) // Exactly level 3
      
      expect(level.level).toBe(3)
      expect(level.title).toBe('Member')
      expect(level.xp).toBe(0) // 500 - 500
      expect(level.progress).toBe(0)
    })

    it('should handle zero XP', () => {
      const level = calculateUserLevel(0)
      
      expect(level.level).toBe(1)
      expect(level.title).toBe('Newcomer')
      expect(level.xp).toBe(0)
      expect(level.progress).toBe(0)
    })

    it('should calculate progress correctly for mid-level users', () => {
      const level = calculateUserLevel(1500) // Level 4 (1000-2000 range)
      
      expect(level.level).toBe(4)
      expect(level.title).toBe('Regular')
      expect(level.xp).toBe(500) // 1500 - 1000
      expect(level.xpToNext).toBe(500) // 2000 - 1500
      expect(level.progress).toBe(50) // 500 / 1000 * 100
    })
  })

  describe('calculateProfileCompletion', () => {
    it('should return 100% for complete profile', () => {
      const completion = calculateProfileCompletion(mockProfile)
      expect(completion).toBe(100)
    })

    it('should return 0% for empty profile', () => {
      const emptyProfile = {
        ...mockProfile,
        full_name: '',
        company_name: '',
        website_url: '',
        avatar_url: '',
        phone: '',
        timezone: '',
      }
      
      const completion = calculateProfileCompletion(emptyProfile)
      expect(completion).toBe(0)
    })

    it('should return 50% for half-complete profile', () => {
      const halfProfile = {
        ...mockProfile,
        full_name: 'Test User',
        company_name: 'Test Company',
        website_url: 'https://test.com',
        avatar_url: '',
        phone: '',
        timezone: '',
      }
      
      const completion = calculateProfileCompletion(halfProfile)
      expect(completion).toBe(50) // 3 out of 6 fields
    })

    it('should handle null and undefined values', () => {
      const partialProfile = {
        ...mockProfile,
        full_name: 'Test User',
        company_name: null,
        website_url: undefined,
        avatar_url: '',
        phone: '123456789',
        timezone: null,
      }
      
      const completion = calculateProfileCompletion(partialProfile)
      expect(completion).toBe(33) // 2 out of 6 fields (rounded)
    })

    it('should handle whitespace-only values', () => {
      const whitespaceProfile = {
        ...mockProfile,
        full_name: '  ',
        company_name: '\t\n',
        website_url: 'https://test.com',
        avatar_url: '',
        phone: '',
        timezone: '',
      }
      
      const completion = calculateProfileCompletion(whitespaceProfile)
      expect(completion).toBe(17) // 1 out of 6 fields (rounded)
    })
  })

  describe('getAvailableAchievements', () => {
    it('should return array of achievements', () => {
      const achievements = getAvailableAchievements()
      
      expect(Array.isArray(achievements)).toBe(true)
      expect(achievements.length).toBeGreaterThan(0)
    })

    it('should have proper achievement structure', () => {
      const achievements = getAvailableAchievements()
      
      achievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id')
        expect(achievement).toHaveProperty('title')
        expect(achievement).toHaveProperty('description')
        expect(achievement).toHaveProperty('icon')
        expect(achievement).toHaveProperty('category')
        expect(achievement).toHaveProperty('rarity')
        expect(['engagement', 'subscription', 'time', 'profile']).toContain(achievement.category)
        expect(['common', 'rare', 'epic', 'legendary']).toContain(achievement.rarity)
      })
    })

    it('should include expected achievements', () => {
      const achievements = getAvailableAchievements()
      const achievementIds = achievements.map(a => a.id)
      
      expect(achievementIds).toContain('first_login')
      expect(achievementIds).toContain('profile_complete')
      expect(achievementIds).toContain('first_subscription')
      expect(achievementIds).toContain('level_10')
    })
  })

  describe('checkAchievements', () => {
    const highLevelUser: UserLevel = {
      level: 10,
      title: 'Champion',
      xp: 500,
      xpToNext: 0,
      totalXp: 50000,
      progress: 100
    }

    it('should return first_login achievement for any user', () => {
      const achievements = checkAchievements(mockProfile, [], highLevelUser)
      const firstLogin = achievements.find(a => a.id === 'first_login')
      
      expect(firstLogin).toBeDefined()
      expect(firstLogin?.earned).toBe(true)
      expect(firstLogin?.earnedAt).toBeDefined()
    })

    it('should return profile_complete for 100% complete profile', () => {
      const achievements = checkAchievements(mockProfile, [], highLevelUser)
      const profileComplete = achievements.find(a => a.id === 'profile_complete')
      
      expect(profileComplete?.earned).toBe(true)
    })

    it('should not return profile_complete for incomplete profile', () => {
      const incompleteProfile = { ...mockProfile, full_name: '' }
      const achievements = checkAchievements(incompleteProfile, [], highLevelUser)
      const profileComplete = achievements.find(a => a.id === 'profile_complete')
      
      expect(profileComplete?.earned).toBe(false)
    })

    it('should return first_subscription for users with subscriptions', () => {
      const achievements = checkAchievements(mockProfile, mockSubscriptions, highLevelUser)
      const firstSub = achievements.find(a => a.id === 'first_subscription')
      
      expect(firstSub?.earned).toBe(true)
    })

    it('should return time-based achievements for old accounts', () => {
      const oldProfile = { ...mockProfile, created_at: '2022-01-01T00:00:00.000Z' }
      const achievements = checkAchievements(oldProfile, [], highLevelUser)
      
      const weekOld = achievements.find(a => a.id === 'week_old')
      const monthOld = achievements.find(a => a.id === 'month_old')
      const yearOld = achievements.find(a => a.id === 'year_old')
      
      expect(weekOld?.earned).toBe(true)
      expect(monthOld?.earned).toBe(true)
      expect(yearOld?.earned).toBe(true)
    })

    it('should return level-based achievements', () => {
      const achievements = checkAchievements(mockProfile, [], highLevelUser)
      
      const level5 = achievements.find(a => a.id === 'level_5')
      const level10 = achievements.find(a => a.id === 'level_10')
      
      expect(level5?.earned).toBe(true)
      expect(level10?.earned).toBe(true)
    })

    it('should return long subscription achievement for long-term subscribers', () => {
      const longSub = {
        ...mockSubscriptions[0],
        created_at: '2022-01-01T00:00:00.000Z', // 18 months ago
      } as Subscription
      
      const achievements = checkAchievements(mockProfile, [longSub], highLevelUser)
      const longSubscriber = achievements.find(a => a.id === 'long_subscriber')
      
      expect(longSubscriber?.earned).toBe(true)
    })

    it('should handle accounts without created_at', () => {
      const profileWithoutDate = { ...mockProfile, created_at: undefined }
      const achievements = checkAchievements(profileWithoutDate, [], highLevelUser)
      
      // Should not crash and should still return some achievements
      expect(achievements.length).toBeGreaterThan(0)
      const timeAchievements = achievements.filter(a => a.category === 'time')
      timeAchievements.forEach(a => expect(a.earned).toBe(false))
    })
  })

  describe('getAchievementRarityStyles', () => {
    it('should return different styles for each rarity', () => {
      const rarities = ['common', 'rare', 'epic', 'legendary'] as const
      const styles = rarities.map(rarity => getAchievementRarityStyles(rarity))
      
      // Each rarity should return a unique style object
      expect(styles[0]).not.toEqual(styles[1])
      expect(styles[1]).not.toEqual(styles[2])
      expect(styles[2]).not.toEqual(styles[3])
    })

    it('should return consistent styles for same rarity', () => {
      const style1 = getAchievementRarityStyles('epic')
      const style2 = getAchievementRarityStyles('epic')
      
      expect(style1).toEqual(style2)
    })

    it('should include required CSS properties', () => {
      const style = getAchievementRarityStyles('legendary')
      
      expect(style).toHaveProperty('bgColor')
      expect(style).toHaveProperty('borderColor')
      expect(style).toHaveProperty('textColor')
      expect(style).toHaveProperty('glowColor')
    })

    it('should handle all rarity levels', () => {
      expect(() => getAchievementRarityStyles('common')).not.toThrow()
      expect(() => getAchievementRarityStyles('rare')).not.toThrow()
      expect(() => getAchievementRarityStyles('epic')).not.toThrow()
      expect(() => getAchievementRarityStyles('legendary')).not.toThrow()
    })
  })

  describe('calculateUserProgress', () => {
    it('should calculate all progress metrics', () => {
      const progress = calculateUserProgress(mockProfile, mockSubscriptions)
      
      expect(progress).toHaveProperty('profileCompletion')
      expect(progress).toHaveProperty('accountAge')
      expect(progress).toHaveProperty('activityStreak')
      expect(progress).toHaveProperty('totalLogins')
      expect(progress).toHaveProperty('subscriptionMonths')
      
      expect(typeof progress.profileCompletion).toBe('number')
      expect(typeof progress.accountAge).toBe('number')
      expect(typeof progress.activityStreak).toBe('number')
      expect(typeof progress.totalLogins).toBe('number')
      expect(typeof progress.subscriptionMonths).toBe('number')
    })

    it('should calculate profile completion correctly', () => {
      const progress = calculateUserProgress(mockProfile, [])
      expect(progress.profileCompletion).toBe(100)
    })

    it('should calculate account age in days', () => {
      const progress = calculateUserProgress(mockProfile, [])
      const expectedAge = Math.floor((new Date('2023-07-01').getTime() - new Date('2023-01-01').getTime()) / (1000 * 60 * 60 * 24))
      
      expect(progress.accountAge).toBe(expectedAge)
    })

    it('should handle profiles without created_at', () => {
      const profileWithoutDate = { ...mockProfile, created_at: undefined }
      const progress = calculateUserProgress(profileWithoutDate, [])
      
      expect(progress.accountAge).toBe(0)
    })

    it('should calculate subscription months', () => {
      const longSub = {
        ...mockSubscriptions[0],
        created_at: '2022-01-01T00:00:00.000Z',
      } as Subscription
      
      const progress = calculateUserProgress(mockProfile, [longSub])
      expect(progress.subscriptionMonths).toBeGreaterThan(0)
    })

    it('should handle empty subscriptions', () => {
      const progress = calculateUserProgress(mockProfile, [])
      expect(progress.subscriptionMonths).toBe(0)
    })
  })

  describe('Integration tests', () => {
    it('should work together to provide complete gamification data', () => {
      // Calculate XP
      const xp = calculateUserXP(mockProfile, mockSubscriptions)
      expect(xp).toBeGreaterThan(0)
      
      // Calculate level from XP
      const level = calculateUserLevel(xp)
      expect(level.totalXp).toBe(xp)
      expect(level.level).toBeGreaterThanOrEqual(1)
      
      // Check achievements
      const achievements = checkAchievements(mockProfile, mockSubscriptions, level)
      expect(achievements.length).toBeGreaterThan(0)
      
      // Calculate progress
      const progress = calculateUserProgress(mockProfile, mockSubscriptions)
      expect(progress.profileCompletion).toBeGreaterThan(0)
      
      // Verify consistency
      expect(progress.profileCompletion).toBe(calculateProfileCompletion(mockProfile))
      
      // Verify achievement styles work
      achievements.forEach(achievement => {
        expect(() => getAchievementRarityStyles(achievement.rarity)).not.toThrow()
      })
    })

    it('should handle new user with no data gracefully', () => {
      const newProfile: Profile = {
        id: 'new-id',
        user_id: 'new-user',
        full_name: '',
        company_name: '',
        website_url: '',
        avatar_url: '',
        phone: '',
        timezone: '',
        created_at: '2023-07-01T00:00:00.000Z',
        updated_at: '2023-07-01T00:00:00.000Z',
      }
      
      const xp = calculateUserXP(newProfile, [])
      const level = calculateUserLevel(xp)
      const achievements = checkAchievements(newProfile, [], level)
      const progress = calculateUserProgress(newProfile, [])
      
      expect(xp).toBe(100) // Just base XP
      expect(level.level).toBe(1)
      expect(level.title).toBe('Newcomer')
      expect(achievements.some(a => a.id === 'first_login' && a.earned)).toBe(true)
      expect(progress.profileCompletion).toBe(0)
    })

    it('should handle power user with full data correctly', () => {
      const powerUserProfile: Profile = {
        ...mockProfile,
        created_at: '2020-01-01T00:00:00.000Z', // 3+ years old
      }
      
      const longSubscriptions = [
        {
          ...mockSubscriptions[0],
          created_at: '2020-01-01T00:00:00.000Z',
          status: 'active'
        },
        {
          ...mockSubscriptions[0],
          id: 'sub2',
          stripe_subscription_id: 'sub_456',
          created_at: '2021-01-01T00:00:00.000Z',
          status: 'canceled',
          canceled_at: '2023-01-01T00:00:00.000Z',
        }
      ] as Subscription[]
      
      const xp = calculateUserXP(powerUserProfile, longSubscriptions)
      const level = calculateUserLevel(xp)
      const achievements = checkAchievements(powerUserProfile, longSubscriptions, level)
      const progress = calculateUserProgress(powerUserProfile, longSubscriptions)
      
      expect(xp).toBeGreaterThan(2000) // High XP
      expect(level.level).toBeGreaterThan(3) // High level
      expect(achievements.filter(a => a.earned).length).toBeGreaterThan(5) // Many achievements
      expect(progress.profileCompletion).toBe(100)
      expect(progress.accountAge).toBeGreaterThan(1000) // 3+ years in days
    })
  })
}) 