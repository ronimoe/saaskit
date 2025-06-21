# Gamification System

The SaaS Kit includes a comprehensive gamification system that enhances user engagement through levels, achievements, experience points (XP), and progress tracking.

## Table of Contents

- [Overview](#overview)
- [Components](#components)
- [Level System](#level-system)
- [Achievement System](#achievement-system)
- [XP Calculation](#xp-calculation)
- [Progress Tracking](#progress-tracking)
- [Usage](#usage)
- [Customization](#customization)
- [API Reference](#api-reference)

## Overview

The gamification system provides:

- **Level Progression**: 10-level system from "Newcomer" to "Champion"
- **Achievement Badges**: 9 achievements with rarity-based visual effects
- **XP System**: Points earned through profile completion, activity, and subscriptions
- **Progress Tracking**: Real-time monitoring of user engagement metrics
- **Visual Rewards**: Animated progress bars, unlock effects, and rarity-based glows

## Components

### GamificationDashboard

The main component that displays all gamification features:

```tsx
import { GamificationDashboard } from '@/components/gamification-dashboard'

function ProfilePage() {
  return (
    <GamificationDashboard 
      profile={profile} 
      subscriptions={subscriptions} 
    />
  )
}
```

### Key Subcomponents

- **LevelDisplay**: Shows current level, title, and progress to next level
- **AchievementCard**: Individual achievement with rarity styling
- **ProgressStats**: Profile completion, account age, and activity metrics

## Level System

### Level Progression

| Level | Title        | XP Required | Accumulated XP |
|-------|-------------|-------------|----------------|
| 1     | Newcomer    | 0           | 0              |
| 2     | Explorer    | 200         | 200            |
| 3     | Member      | 300         | 500            |
| 4     | Regular     | 500         | 1,000          |
| 5     | Contributor | 1,000       | 2,000          |
| 6     | Veteran     | 2,000       | 4,000          |
| 7     | Expert      | 3,000       | 7,000          |
| 8     | Master      | 5,000       | 12,000         |
| 9     | Legend      | 8,000       | 20,000         |
| 10    | Champion    | 15,000      | 35,000         |

### Level Icons

The system automatically assigns icons based on level:

- **Levels 1-2**: Star ⭐
- **Levels 3-4**: Award 🏆
- **Levels 5-6**: Medal 🏅
- **Levels 7-8**: Trophy 🏆
- **Levels 9-10**: Crown 👑

## Achievement System

### Achievement Types

#### Engagement Achievements
- **Welcome Aboard** (Common): Created your account
- **Rising Star** (Rare): Reached level 5
- **Champion** (Legendary): Reached maximum level 10

#### Profile Achievements
- **All Set Up** (Common): Completed your profile 100%

#### Time-based Achievements
- **Settling In** (Common): Account is 1 week old
- **Regular Member** (Common): Account is 1 month old
- **Veteran** (Rare): Account is 1 year old

#### Subscription Achievements
- **Premium Member** (Rare): Subscribed to a premium plan
- **Loyal Customer** (Epic): Subscribed for 6+ months

### Rarity System

Each achievement has a rarity level that affects its visual appearance:

| Rarity    | Color Scheme | Glow Effect | Badge Style |
|-----------|--------------|-------------|-------------|
| Common    | Gray         | None        | Standard    |
| Rare      | Blue         | Subtle      | Blue accent |
| Epic      | Purple       | Animated    | Purple gradient |
| Legendary | Pink/Purple  | Strong      | Gradient with animation |

### Rarity CSS Classes

```css
.rarity-common { box-shadow: 0 0 10px rgba(107, 114, 128, 0.3); }
.rarity-rare { box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
.rarity-epic { animation: epicGlow 2s infinite alternate; }
.rarity-legendary { animation: legendaryGlow 1.5s infinite alternate; }
```

## XP Calculation

### XP Sources

1. **Account Creation**: 100 XP (one-time bonus)
2. **Account Age**: 1 XP per day since account creation
3. **Profile Completion**: Up to 500 XP (completion % × 5)
4. **Active Subscriptions**: 200 XP per active subscription
5. **Subscription Duration**: 50 XP per month of subscription history

### Example Calculation

```typescript
// User with:
// - 30-day-old account
// - 80% profile completion
// - 1 active subscription
// - 3 months subscription history

const totalXP = 
  100 +           // Account creation
  30 +            // Account age (30 days)
  400 +           // Profile completion (80% × 5)
  200 +           // Active subscription
  150;            // Subscription duration (3 months × 50)

// Total: 880 XP (Level 4: Regular)
```

## Progress Tracking

### Tracked Metrics

The system tracks several user engagement metrics:

#### Profile Completion ✅ FULLY IMPLEMENTED
- Tracks completion of: name, company, website, avatar, phone, timezone
- Each field contributes 16.67% to total completion (6 fields total)
- Displayed as percentage with progress bar
- **Avatar Upload**: Fully functional with Supabase Storage integration
- **Profile Editing**: Complete form with real-time validation
- **Completion Tracking**: Automatic calculation and display
- **XP Rewards**: Users earn XP for completing profile sections

#### Account Age
- Days since account creation
- Converted to weeks/years for display
- Contributes to XP calculation

#### Activity Streak
- Simulated based on account age (real implementation would track daily visits)
- Encourages regular platform usage
- Visual feedback with streak counter

#### Subscription Metrics
- Active subscription count
- Total subscription months
- Subscription status tracking

## Usage

### Basic Implementation

```tsx
import { useUserProgress } from '@/hooks/useUserProgress'
import { GamificationDashboard } from '@/components/gamification-dashboard'

function UserProfile() {
  const { profile, subscriptions } = useUserData()
  
  return (
    <div>
      <GamificationDashboard 
        profile={profile}
        subscriptions={subscriptions}
      />
    </div>
  )
}
```

### Using the Hook Directly

```tsx
import { useUserProgress } from '@/hooks/useUserProgress'

function CustomGamificationView() {
  const { progress, userLevel, achievements } = useUserProgress(profile, subscriptions)
  
  return (
    <div>
      <h2>Level {userLevel.level}: {userLevel.title}</h2>
      <p>Progress: {userLevel.progress}%</p>
      <p>Achievements: {achievements.filter(a => a.earned).length}</p>
    </div>
  )
}
```

### Individual Components

```tsx
import { LevelDisplay, AchievementCard, ProgressStats } from '@/components/gamification-dashboard'

// Use individual components for custom layouts
function CustomLayout() {
  return (
    <div className="grid gap-4">
      <LevelDisplay {...userLevel} />
      <ProgressStats progress={progress} />
      {achievements.map(achievement => 
        <AchievementCard key={achievement.id} achievement={achievement} />
      )}
    </div>
  )
}
```

## Customization

### Adding New Achievements

Extend the achievements list in `lib/gamification-utils.ts`:

```typescript
export function getAvailableAchievements(): Omit<Achievement, 'earned' | 'earnedAt'>[] {
  return [
    // ... existing achievements
    {
      id: 'power_user',
      title: 'Power User',
      description: 'Used the platform for 100 consecutive days',
      icon: '⚡',
      category: 'engagement',
      rarity: 'epic'
    }
  ]
}
```

### Modifying XP Calculation

Update the XP calculation in `lib/gamification-utils.ts`:

```typescript
export function calculateUserXP(profile: Profile, subscriptions: Subscription[]): number {
  let totalXp = 100 // Base XP
  
  // Add custom XP sources
  totalXp += customActivityXP(profile)
  totalXp += featureUsageXP(profile)
  
  return totalXp
}
```

### Custom Level Titles

Modify the level system in `lib/gamification-utils.ts`:

```typescript
const levels = [
  { level: 1, title: "Starter", xpRequired: 0 },
  { level: 2, title: "Apprentice", xpRequired: 200 },
  // ... customize titles and XP requirements
]
```

### Styling Customization

Override CSS classes for custom styling:

```css
/* Custom achievement styling */
.achievement-card.custom-theme {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #764ba2;
}

/* Custom level display */
.level-display.custom-theme .level-icon {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
}
```

## API Reference

### useUserProgress Hook

```typescript
interface UseUserProgressReturn {
  progress: UserProgress      // Profile completion, age, streaks
  userLevel: UserLevel       // Current level information
  achievements: Achievement[] // All achievements with earned status
}

function useUserProgress(
  profile: Profile, 
  subscriptions: Subscription[]
): UseUserProgressReturn
```

### Types

```typescript
interface UserLevel {
  level: number          // Current level (1-10)
  title: string         // Level title (e.g., "Veteran")
  xp: number           // XP in current level
  xpToNext: number     // XP needed for next level
  totalXp: number      // Total accumulated XP
  progress: number     // Progress to next level (0-100%)
}

interface Achievement {
  id: string                    // Unique identifier
  title: string                // Display name
  description: string          // Achievement description
  icon: string                // Emoji or icon
  earned: boolean             // Whether user has earned it
  earnedAt?: string          // When it was earned
  category: 'engagement' | 'subscription' | 'time' | 'profile'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface UserProgress {
  profileCompletion: number    // Percentage (0-100)
  accountAge: number          // Days since account creation
  activityStreak: number      // Current activity streak
  totalLogins: number         // Total login count
  subscriptionMonths: number  // Total subscription duration
}
```

### Utility Functions

```typescript
// Calculate user's total XP
function calculateUserXP(profile: Profile, subscriptions: Subscription[]): number

// Determine current level from XP
function calculateUserLevel(totalXP: number): UserLevel

// Calculate profile completion percentage
function calculateProfileCompletion(profile: Profile): number

// Check which achievements user has earned
function checkAchievements(
  profile: Profile, 
  subscriptions: Subscription[], 
  userLevel: UserLevel
): Achievement[]

// Get rarity-specific styling
function getAchievementRarityStyles(rarity: Achievement['rarity']): string
```

## Performance Considerations

- Uses `useMemo` hooks to prevent unnecessary recalculations
- Achievement checking is optimized for minimal database queries
- Progress animations use CSS for hardware acceleration
- Lazy loading for achievement icons and graphics

## Accessibility Features

- Keyboard navigation support for all interactive elements
- Screen reader friendly with proper ARIA labels
- Respects `prefers-reduced-motion` for animations
- High contrast mode support
- Focus management for achievement cards

## Future Enhancements

Planned features for future releases:

- **Real-time Activity Tracking**: Replace simulated streaks with actual usage data
- **Leaderboards**: Compare progress with other users
- **Custom Badges**: Allow users to create custom achievement sets
- **Integration Achievements**: Unlock achievements for using specific features
- **Social Sharing**: Share achievements on social platforms
- **Progress Export**: Export gamification data for analytics

## Troubleshooting

### Common Issues

**Achievement not unlocking:**
- Check if the criteria function in `checkAchievements` is correctly implemented
- Verify profile/subscription data is properly passed to the component

**XP calculation seems incorrect:**
- Review the XP sources in `calculateUserXP`
- Check for null/undefined values in profile data

**Animations not working:**
- Ensure `styles/gamification.css` is imported in `app/globals.css`
- Check if `prefers-reduced-motion` is disabled by user preference

### Debug Information

Enable debug mode by adding to your component:

```tsx
const debugInfo = {
  totalXP: userLevel.totalXP,
  earnedAchievements: achievements.filter(a => a.earned).length,
  profileCompletion: progress.profileCompletion
}

console.log('Gamification Debug:', debugInfo)
``` 