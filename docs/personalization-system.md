# Personalization System

The SaaS Kit includes an intelligent personalization system that adapts to user behavior, preferences, and context to provide a tailored experience.

## Table of Contents

- [Overview](#overview)
- [Components](#components)
- [Time-Based Features](#time-based-features)
- [Adaptive Content](#adaptive-content)
- [User Preferences](#user-preferences)
- [Context Detection](#context-detection)
- [Usage](#usage)
- [Customization](#customization)
- [API Reference](#api-reference)

## Overview

The personalization system provides:

- **Time-Based Greetings**: Dynamic messages that change based on time of day
- **Adaptive Recommendations**: Smart suggestions based on user profile and behavior
- **Context-Aware Content**: Content that adapts to user's current state and needs
- **Customizable Preferences**: User-controlled personalization settings
- **Smart Notifications**: Intelligent recommendations for next actions

## Components

### PersonalizedContent

The main component that orchestrates all personalization features:

```tsx
import { PersonalizedContent } from '@/components/personalized-content'

function Dashboard() {
  return (
    <PersonalizedContent 
      profile={profile} 
      subscriptions={subscriptions} 
    />
  )
}
```

### Key Subcomponents

- **PersonalizedGreeting**: Time-sensitive welcome messages
- **SmartRecommendations**: Adaptive content suggestions
- **PersonalizationSettings**: User preference controls
- **ContextualInsights**: Behavior-based insights and tips

## Time-Based Features

### Dynamic Greetings

The system automatically adjusts greetings based on time of day:

| Time Range | Greeting Type | Icon | Message Style |
|------------|---------------|------|---------------|
| 5:00-11:59 | Morning | ☀️ | "Good morning" - Energetic, motivational |
| 12:00-16:59 | Afternoon | ☀️ | "Good afternoon" - Professional, focused |
| 17:00-20:59 | Evening | 🌅 | "Good evening" - Relaxed, reflective |
| 21:00-4:59 | Night | 🌙 | "Good evening" - Calm, concise |

### Context-Sensitive Messages

Messages adapt based on user data:

```typescript
// Examples of personalized greetings
"Good morning, Sarah! Ready to tackle today's goals?"
"Welcome back, John! You've made great progress on your profile."
"Good evening! Time to review your achievements from this week."
```

### Time-Based Recommendations

The system provides time-appropriate suggestions:

- **Morning**: Focus on planning and goal-setting
- **Afternoon**: Productivity tips and feature exploration
- **Evening**: Progress review and upcoming tasks
- **Weekend**: Relaxed exploration and account maintenance

## Adaptive Content

### Profile-Based Recommendations

The system analyzes user profile completion and provides relevant suggestions:

#### New User Recommendations
- Complete profile setup
- Explore key features
- Set up integrations
- Join community

#### Experienced User Recommendations
- Advanced feature tutorials
- Optimization tips
- Community contributions
- Feature requests

### Subscription-Based Content

Content adapts based on subscription status:

#### Free Tier Users
- Feature highlights
- Upgrade benefits
- Usage optimization
- Community features

#### Premium Users
- Advanced tutorials
- Exclusive features
- Priority support
- Beta access

### Level-Based Personalization

Content scales with user gamification level:

```typescript
interface LevelBasedContent {
  level: number
  recommendations: string[]
  features: string[]
  challenges: string[]
}

// Example for different levels
const levelContent = {
  beginner: ["Complete profile", "Take first action", "Explore dashboard"],
  intermediate: ["Try advanced features", "Optimize workflow", "Share feedback"],
  expert: ["Mentor others", "Beta test features", "Contribute ideas"]
}
```

## User Preferences

### Notification Preferences

Users can control various notification types:

```tsx
interface NotificationPreferences {
  achievements: boolean      // Achievement unlocks
  recommendations: boolean   // Smart suggestions
  weeklyDigest: boolean     // Weekly progress summaries
  featureUpdates: boolean   // New feature announcements
  communityUpdates: boolean // Community activity
}
```

### Display Preferences

Customizable UI elements:

```tsx
interface DisplayPreferences {
  compactMode: boolean       // Condensed layouts
  animationsEnabled: boolean // Reduce motion support
  colorScheme: 'auto' | 'light' | 'dark'
  language: string          // Localization preference
}
```

### Content Preferences

User-controlled content filtering:

```tsx
interface ContentPreferences {
  showAdvancedTips: boolean    // Technical recommendations
  focusAreas: string[]         // Areas of interest
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  industries: string[]         // Relevant industries
}
```

## Context Detection

### User State Analysis

The system detects various user states:

#### Activity Level
- **Highly Active**: Daily usage, feature exploration
- **Moderately Active**: Regular but focused usage
- **Occasional**: Sporadic usage patterns
- **Dormant**: Extended periods of inactivity

#### Engagement Patterns
- **Feature Explorer**: Tries new features regularly
- **Goal-Oriented**: Focused on specific outcomes
- **Social User**: Engages with community features
- **Power User**: Advanced feature usage

#### Progress Indicators
- **Profile Completion**: Percentage of setup completed
- **Feature Adoption**: Number of features actively used
- **Time Investment**: Duration and frequency of sessions
- **Achievement Progress**: Gamification advancement

### Contextual Triggers

The system responds to specific contexts:

```typescript
interface ContextTriggers {
  firstLogin: boolean           // New user experience
  returnVisit: boolean         // Returning after absence
  achievementUnlocked: boolean // Recent achievement
  profileUpdated: boolean      // Recent profile changes
  subscriptionChanged: boolean // Plan changes
  weekendAccess: boolean       // Weekend usage patterns
}
```

## Usage

### Basic Implementation

```tsx
import { PersonalizedContent } from '@/components/personalized-content'

function UserDashboard() {
  const { profile, subscriptions } = useUserData()
  
  return (
    <div className="space-y-6">
      <PersonalizedContent 
        profile={profile}
        subscriptions={subscriptions}
      />
      {/* Other dashboard content */}
    </div>
  )
}
```

### Custom Greeting Implementation

```tsx
import { getPersonalizedGreeting } from '@/lib/personalization-utils'

function CustomHeader() {
  const greeting = getPersonalizedGreeting(profile, new Date())
  
  return (
    <header>
      <h1>{greeting.message}</h1>
      <span>{greeting.icon}</span>
    </header>
  )
}
```

### Recommendation System

```tsx
import { getSmartRecommendations } from '@/lib/personalization-utils'

function RecommendationsList() {
  const recommendations = getSmartRecommendations(profile, subscriptions)
  
  return (
    <div className="recommendations">
      {recommendations.map(rec => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  )
}
```

### Preferences Management

```tsx
import { PersonalizationSettings } from '@/components/personalized-content'

function SettingsPage() {
  return (
    <div className="settings">
      <PersonalizationSettings 
        preferences={userPreferences}
        onUpdate={handlePreferencesUpdate}
      />
    </div>
  )
}
```

## Customization

### Adding Custom Greeting Types

Extend greeting logic in the personalization utilities:

```typescript
export function getPersonalizedGreeting(profile: Profile, currentTime: Date) {
  const hour = currentTime.getHours()
  const isWeekend = [0, 6].includes(currentTime.getDay())
  
  // Add custom greeting logic
  if (isWeekend && hour < 10) {
    return {
      message: `Enjoy your weekend, ${profile.full_name}!`,
      icon: '🏖️',
      type: 'weekend-relaxed'
    }
  }
  
  // ... existing logic
}
```

### Custom Recommendation Categories

Add new recommendation types:

```typescript
interface CustomRecommendation {
  id: string
  title: string
  description: string
  action: string
  category: 'onboarding' | 'optimization' | 'engagement' | 'custom'
  priority: number
  conditions: (profile: Profile, subscriptions: Subscription[]) => boolean
}

const customRecommendations: CustomRecommendation[] = [
  {
    id: 'api_setup',
    title: 'Set up API Access',
    description: 'Configure API keys for advanced integrations',
    action: 'Configure API',
    category: 'custom',
    priority: 5,
    conditions: (profile, subs) => 
      subs.some(s => s.status === 'active') && !profile.api_configured
  }
]
```

### Preference Schemas

Define custom preference categories:

```typescript
interface CustomPreferences {
  industryFocus: 'saas' | 'ecommerce' | 'consulting' | 'other'
  teamSize: 'solo' | 'small' | 'medium' | 'large'
  primaryGoals: string[]
  communicationStyle: 'formal' | 'casual' | 'technical'
}
```

### Styling Customization

Override personalization component styles:

```css
/* Custom greeting styles */
.personalized-greeting.morning {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
}

.personalized-greeting.evening {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
}

/* Custom recommendation cards */
.recommendation-card.high-priority {
  border-left: 4px solid var(--color-primary);
  animation: pulse 2s infinite;
}
```

## API Reference

### Personalization Utilities

```typescript
// Get personalized greeting based on time and user data
function getPersonalizedGreeting(
  profile: Profile, 
  currentTime: Date
): PersonalizedGreeting

// Generate smart recommendations for user
function getSmartRecommendations(
  profile: Profile, 
  subscriptions: Subscription[]
): Recommendation[]

// Determine user's engagement level
function getUserEngagementLevel(
  profile: Profile, 
  activityData: UserActivity
): 'low' | 'medium' | 'high'

// Get contextual insights based on user behavior
function getContextualInsights(
  profile: Profile, 
  subscriptions: Subscription[]
): Insight[]
```

### Types

```typescript
interface PersonalizedGreeting {
  message: string          // Personalized message text
  icon: string            // Emoji or icon
  type: GreetingType      // Type of greeting
  timeContext: string     // Time-based context
}

interface Recommendation {
  id: string                    // Unique identifier
  title: string                // Recommendation title
  description: string          // Detailed description
  action: string              // Call-to-action text
  priority: number            // Priority level (1-10)
  category: RecommendationCategory
  icon: string               // Visual icon
  conditions: RecommendationCondition[]
}

interface Insight {
  id: string                 // Unique identifier
  type: 'tip' | 'achievement' | 'opportunity'
  title: string             // Insight headline
  description: string       // Detailed explanation
  actionable: boolean       // Whether user can act on it
  dismissible: boolean      // Whether user can dismiss it
}

interface UserPreferences {
  notifications: NotificationPreferences
  display: DisplayPreferences
  content: ContentPreferences
  privacy: PrivacyPreferences
}
```

### Hook APIs

```typescript
// Main personalization hook
function usePersonalization(
  profile: Profile, 
  subscriptions: Subscription[]
): {
  greeting: PersonalizedGreeting
  recommendations: Recommendation[]
  insights: Insight[]
  preferences: UserPreferences
}

// Greeting-specific hook
function usePersonalizedGreeting(profile: Profile): PersonalizedGreeting

// Recommendation-specific hook
function useRecommendations(
  profile: Profile, 
  subscriptions: Subscription[]
): Recommendation[]
```

## Performance Considerations

- **Memoization**: Uses `useMemo` for expensive calculations
- **Lazy Loading**: Recommendations loaded on demand
- **Caching**: Time-based greetings cached for session duration
- **Batch Updates**: Preference changes batched to reduce API calls
- **Debouncing**: User input changes debounced for performance

## Privacy & Consent

The personalization system respects user privacy:

- **Opt-in Model**: Users explicitly enable personalization features
- **Data Minimization**: Only collect necessary data for personalization
- **Transparency**: Clear explanations of what data is used
- **Control**: Users can disable any personalization feature
- **Deletion**: Users can delete personalization data

## Analytics Integration

Track personalization effectiveness:

```typescript
// Track recommendation interactions
function trackRecommendationClick(recommendationId: string, userId: string)

// Track greeting engagement
function trackGreetingViewed(greetingType: string, userId: string)

// Track preference changes
function trackPreferenceUpdate(
  preference: string, 
  oldValue: any, 
  newValue: any, 
  userId: string
)
```

## A/B Testing Support

The system supports experimentation:

```typescript
interface PersonalizationVariant {
  name: string
  weight: number
  config: PersonalizationConfig
}

// Example A/B test configuration
const greetingTest: PersonalizationVariant[] = [
  {
    name: 'formal',
    weight: 0.5,
    config: { greetingStyle: 'formal', showTime: true }
  },
  {
    name: 'casual',
    weight: 0.5,
    config: { greetingStyle: 'casual', showTime: false }
  }
]
```

## Future Enhancements

Planned features for future releases:

- **Machine Learning**: Behavioral pattern recognition
- **Predictive Recommendations**: AI-powered suggestions
- **Cross-Platform Sync**: Preferences sync across devices
- **Advanced Segmentation**: User cohort-based personalization
- **Real-time Adaptation**: Dynamic content based on current session
- **Integration APIs**: Third-party personalization data sources

## Troubleshooting

### Common Issues

**Greetings not updating:**
- Check system time and timezone settings
- Verify the greeting calculation logic

**Recommendations not appearing:**
- Ensure profile data is complete
- Check recommendation condition logic
- Verify subscription data is current

**Preferences not saving:**
- Check API endpoint connectivity
- Verify user authentication status
- Review preference validation logic

### Debug Mode

Enable debug logging for personalization:

```tsx
const PersonalizationDebug = () => {
  const debugInfo = {
    currentTime: new Date().toISOString(),
    profileCompletion: calculateProfileCompletion(profile),
    subscriptionStatus: subscriptions.map(s => s.status),
    recommendationCount: recommendations.length
  }
  
  console.log('Personalization Debug:', debugInfo)
  return null
}
``` 