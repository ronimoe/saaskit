"use client"

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GlassCard } from '@/components/ui/glass-card'
import { Separator } from '@/components/ui/separator'
import { Trophy, Star, Target, Zap, Award, Medal, Crown, Sparkles } from 'lucide-react'
import { useUserProgress } from '@/hooks/useUserProgress'
import type { Profile, Subscription } from '@/types/database'
import { cn } from '@/lib/utils'


interface GamificationDashboardProps {
  profile: Profile
  subscriptions: Subscription[]
}

function LevelDisplay({ level, title, progress, totalXp }: { level: number, title: string, progress: number, totalXp: number }) {
  const getLevelIcon = (level: number) => {
    if (level >= 9) return Crown
    if (level >= 7) return Trophy
    if (level >= 5) return Medal
    if (level >= 3) return Award
    return Star
  }

  const LevelIcon = getLevelIcon(level)

  return (
    <GlassCard variant="primary" size="lg" depth="medium" glow="medium" interactive="none">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <LevelIcon className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-slate-900">
                {level}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Level {level}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {title}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            {totalXp.toLocaleString()} XP
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Progress to next level</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{Math.round(progress)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function AchievementCard({ achievement }: { achievement: unknown }) {
  if (!achievement || typeof achievement !== 'object') return null;
  const ach = achievement as { rarity: string; earned: boolean; icon: string; title: string; description: string; earnedAt?: string };
  
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 dark:from-purple-900 dark:to-pink-900 dark:border-purple-600'
      case 'epic':
        return 'bg-gradient-to-br from-violet-100 to-blue-100 border-violet-300 dark:from-violet-900 dark:to-blue-900 dark:border-violet-600'
      case 'rare':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 dark:from-blue-900 dark:to-cyan-900 dark:border-blue-600'
      default:
        return 'bg-gradient-to-br from-gray-100 to-slate-100 border-gray-300 dark:from-gray-900 dark:to-slate-900 dark:border-gray-600'
    }
  }

  const getRarityBadge = (rarity: string) => {
    const styles = {
      legendary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      epic: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
      rare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      common: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }

    return (
      <Badge variant="secondary" className={cn(styles[rarity as keyof typeof styles])}>
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
      </Badge>
    )
  }

  return (
    <div className={cn(
      "relative p-4 rounded-lg border-2 transition-all duration-300",
      getRarityStyles(ach.rarity),
      ach.earned ? "opacity-100" : "opacity-60"
    )}>
      {ach.earned && (
        <div className="absolute -top-2 -right-2">
          <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="text-2xl">
            {ach.icon}
          </div>
          {getRarityBadge(ach.rarity)}
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            {ach.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {ach.description}
          </p>
        </div>

        {ach.earned && ach.earnedAt && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Earned {new Date(ach.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}

function ProgressStats({ progress }: { progress: unknown }) {
  if (!progress || typeof progress !== 'object') return null;
  const prog = progress as { profileCompletion: number; accountAge: number; activityStreak: number };
  
  const stats = [
    {
      title: 'Profile Completion',
      value: `${prog.profileCompletion}%`,
      max: 100,
      current: prog.profileCompletion,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progressColor: 'bg-green-500'
    },
    {
      title: 'Account Age',
      value: `${prog.accountAge} days`,
      subtitle: prog.accountAge > 365 ? `${Math.floor(prog.accountAge / 365)} years` : `${Math.floor(prog.accountAge / 7)} weeks`,
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Activity Streak',
      value: `${prog.activityStreak} days`,
      subtitle: prog.activityStreak > 7 ? 'Great momentum!' : 'Keep it up!',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <GlassCard key={index} variant="secondary" size="sm" depth="low" glow="subtle" interactive="hover">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.bgColor} dark:bg-slate-800`}>
                  <Icon className={`h-4 w-4 ${stat.color} dark:text-slate-400`} />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.title}
                </p>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {stat.subtitle}
                  </p>
                )}
              </div>

              {stat.max && (
                <div className="space-y-1">
                  <Progress value={stat.current} className="h-2" />
                </div>
              )}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

export function GamificationDashboard({ profile, subscriptions }: GamificationDashboardProps) {
  const { progress, userLevel, achievements } = useUserProgress(profile, subscriptions)

  const earnedAchievements = achievements.filter(a => a.earned)
  const unlockedAchievements = achievements.filter(a => !a.earned)



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Journey
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Track your progress and unlock achievements
        </p>
      </div>

      {/* Level Display */}
      <LevelDisplay 
        level={userLevel.level}
        title={userLevel.title}
        progress={userLevel.progress}
        totalXp={userLevel.totalXp}
      />

      {/* Progress Stats */}
      <ProgressStats progress={progress} />

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Achievements
          </h3>
          <Badge variant="outline">
            {earnedAchievements.length} / {achievements.length}
          </Badge>
        </div>

        {earnedAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Earned Achievements</span>
            </h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {earnedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {unlockedAchievements.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Target className="h-5 w-5 text-slate-500" />
                <span>Available Achievements</span>
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 