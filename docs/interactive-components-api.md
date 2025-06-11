# Interactive Components API Reference

## Overview

This document provides comprehensive API reference for all interactive components in the features system.

## UnfoldableFeatureCard

### Import
```typescript
import { UnfoldableFeatureCard } from '@/components/ui/unfoldable-feature-card'
```

### Props

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for DOM targeting and connections |
| `title` | `string` | Feature title displayed prominently |
| `description` | `string` | Brief feature description |
| `icon` | `React.ComponentType<{ className?: string }>` | Lucide React icon component |
| `color` | `string` | Tailwind gradient class (e.g., "from-blue-500 to-cyan-500") |
| `category` | `string` | Feature category for grouping |
| `highlights` | `string[]` | Array of key feature points |
| `status` | `string` | Availability status ("Available", "Coming Soon", etc.) |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `extendedDescription` | `string` | `undefined` | Detailed description shown when expanded |
| `featureHighlights` | `FeatureHighlight[]` | `[]` | Structured feature capabilities |
| `interactivePreview` | `InteractivePreview` | `undefined` | Interactive demo configuration |
| `codeExample` | `string` | `undefined` | Code snippet for the feature |
| `demoUrl` | `string` | `undefined` | External demo link |
| `className` | `string` | `undefined` | Additional CSS classes |
| `magnetic` | `boolean` | `true` | Enable magnetic hover effects |
| `magneticStrength` | `number` | `0.2` | Magnetic effect intensity (0-1) |
| `magneticGlow` | `boolean` | `false` | Enable magnetic glow effect |

### Interfaces

#### FeatureHighlight
```typescript
interface FeatureHighlight {
  title: string                        // Capability title
  description: string                  // Capability description
  icon?: React.ComponentType<{ className?: string }> // Optional icon
}
```

#### InteractivePreview
```typescript
interface InteractivePreview {
  type: 'dashboard' | 'auth' | 'payment' | 'api' | 'mobile'
  title: string                        // Preview title
  description: string                  // Preview description
}
```

### States

| State | Type | Description |
|-------|------|-------------|
| `isExpanded` | `boolean` | Whether the card is currently expanded |
| `showPreview` | `boolean` | Whether the interactive preview is visible |

### Methods

The component automatically handles all interactions through internal state management. No external methods are exposed.

### Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `onClick` (expand button) | User clicks chevron | Toggles card expansion |
| `onClick` (preview button) | User clicks "Show Demo" | Toggles interactive preview |

### Styling

#### CSS Classes Applied
- `group` - For group hover effects
- `relative` - For positioning context
- `transition-all duration-500` - For smooth animations
- `md:col-span-2 md:row-span-2` - When expanded (responsive)

#### Customizable Elements
- Background gradient (via `color` prop)
- Status badge appearance (based on `status`)
- Icon container styling
- Interactive preview content

### Examples

#### Basic Usage
```tsx
<UnfoldableFeatureCard
  id="feature-auth"
  title="Authentication"
  description="Secure user authentication"
  icon={Shield}
  color="from-blue-500 to-cyan-500"
  category="Security"
  highlights={['OAuth', 'Magic Links']}
  status="Available"
/>
```

#### Advanced Usage with All Props
```tsx
<UnfoldableFeatureCard
  id="feature-payments"
  title="Payment Processing"
  description="Complete payment solution"
  icon={CreditCard}
  color="from-green-500 to-emerald-500"
  category="Payments"
  highlights={['Stripe Integration', 'Subscriptions', 'Webhooks']}
  status="Available"
  extendedDescription="Full Stripe integration with subscription management and secure webhooks."
  featureHighlights={[
    {
      title: 'Subscription Management',
      description: 'Automatic billing and plan changes',
      icon: RefreshCw
    },
    {
      title: 'Secure Webhooks',
      description: 'Real-time payment notifications',
      icon: Shield
    }
  ]}
  interactivePreview={{
    type: 'payment',
    title: 'Payment Demo',
    description: 'See our checkout flow'
  }}
  codeExample={`
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'subscription',
  success_url: '/success'
})
  `}
  magneticGlow={true}
  className="custom-feature-card"
/>
```

---

## FeatureConnections

### Import
```typescript
import { FeatureConnections } from '@/components/ui/feature-connections'
```

### Props

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `connections` | `Connection[]` | Array of feature connection definitions |
| `features` | `{ id: string; title: string }[]` | Reference list of features |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `animated` | `boolean` | `true` | Enable connection animations |
| `triggerAnimation` | `boolean` | `false` | Manually trigger animation restart |

### Interfaces

#### Connection
```typescript
interface Connection {
  from: string                         // Source feature ID
  to: string                          // Target feature ID
  type: 'flow' | 'dependency' | 'integration' // Visual connection type
  color?: string                      // Custom connection color
  delay?: number                      // Animation delay in seconds
}
```

#### Position (Internal)
```typescript
interface Position {
  x: number                           // Center X coordinate
  y: number                           // Center Y coordinate
  width: number                       // Element width
  height: number                      // Element height
}
```

### Connection Types

#### Flow Connections
- **Appearance**: Curved blue lines with smooth bezier curves
- **Use Case**: Data flow between components (e.g., auth → database)
- **Color**: `#3B82F6` (blue-500)
- **Path Style**: Quadratic curve with control offset

#### Dependency Connections
- **Appearance**: L-shaped purple lines with right angles
- **Use Case**: Component dependencies (e.g., database → API)
- **Color**: `#8B5CF6` (purple-500)
- **Path Style**: Multi-segment lines with 90-degree turns

#### Integration Connections
- **Appearance**: Gentle green arcs
- **Use Case**: Service integrations (e.g., auth → payments)
- **Color**: `#10B981` (green-500)
- **Path Style**: High arc with midpoint control

### Animation Sequence

1. **Line Drawing** (2s duration)
   - Animated stroke-dashoffset from full length to 0
   - Easing: `ease-out`
   - Custom delay per connection

2. **Fade In** (0.5s duration)
   - Opacity transition from 0 to 0.6
   - Simultaneous with line drawing

3. **Pulse Dots** (infinite, starts after 2s)
   - Pulsing circles at connection midpoints
   - 2s cycle with scale and opacity changes
   - Color matches connection type

### Methods

#### Internal Methods
- `updatePositions()` - Recalculates feature positions
- `getConnectionPath()` - Generates SVG path based on type
- `getConnectionColor()` - Returns color for connection type
- `getPathLength()` - Estimates path length for animation

### Events

#### Triggers
- **Intersection Observer** - Animations start when component enters viewport
- **Resize Events** - Connections update on window/container resize
- **External Trigger** - Manual animation restart via `triggerAnimation` prop

### Styling

#### SVG Structure
```xml
<svg>
  <defs>
    <!-- Arrow markers for each connection type -->
  </defs>
  <g> <!-- Connection group -->
    <path class="connection-path" />
    <circle class="connection-pulse" />
  </g>
</svg>
```

#### CSS Classes
- `connection-path` - Main line styling
- `connection-pulse` - Pulse dot styling
- `animate` - Applied when animation is active

### Examples

#### Basic Connections
```tsx
const connections = [
  { from: 'auth', to: 'database', type: 'integration' },
  { from: 'database', to: 'api', type: 'flow' },
  { from: 'api', to: 'ui', type: 'dependency' }
]

<FeatureConnections 
  connections={connections}
  features={[
    { id: 'auth', title: 'Authentication' },
    { id: 'database', title: 'Database' },
    { id: 'api', title: 'API' },
    { id: 'ui', title: 'UI Components' }
  ]}
/>
```

#### Advanced with Custom Delays
```tsx
const connections = [
  { 
    from: 'auth', 
    to: 'database', 
    type: 'integration',
    delay: 0,
    color: '#custom-color' 
  },
  { 
    from: 'database', 
    to: 'api', 
    type: 'flow',
    delay: 0.5 
  },
  { 
    from: 'api', 
    to: 'ui', 
    type: 'dependency',
    delay: 1.0 
  }
]

<FeatureConnections 
  connections={connections}
  features={features}
  animated={true}
  className="custom-connections"
/>
```

---

## AnimatedProductMockup

### Import
```typescript
import { AnimatedProductMockup } from '@/components/ui/animated-product-mockup'
```

### Props

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `autoPlay` | `boolean` | `true` | Auto-rotate content states |
| `interval` | `number` | `4000` | Rotation interval in milliseconds |
| `showControls` | `boolean` | `true` | Display manual navigation controls |

### Content States

#### Available States
1. **Dashboard Analytics** (index 0)
   - Charts and metrics visualization
   - Real-time data indicators
   - KPI dashboard layout

2. **Authentication** (index 1)
   - Login/signup interface
   - Social auth options
   - Security indicators

3. **Payment Processing** (index 2)
   - Checkout interface
   - Payment methods
   - Security badges

4. **Team Collaboration** (index 3)
   - User management
   - Team workspace
   - Collaboration tools

### States

| State | Type | Default | Description |
|-------|------|---------|-------------|
| `currentState` | `number` | `0` | Current content state index |
| `isPlaying` | `boolean` | `true` | Whether auto-play is active |

### Methods

#### Internal Methods
- `nextState()` - Advance to next content state
- `prevState()` - Go to previous content state
- `goToState(index)` - Jump to specific state
- `togglePlayback()` - Start/stop auto-play

### Events

#### User Interactions
- **Next/Previous Buttons** - Manual navigation
- **Progress Indicators** - Direct state selection
- **Play/Pause Button** - Toggle auto-play

#### Auto-play
- **Interval Timer** - Automatic state advancement
- **Hover Pause** - Auto-play pauses on hover
- **Visibility** - Pauses when not in viewport

### Styling

#### Device Frames
- **Desktop**: Browser window with realistic chrome
- **Mobile**: iPhone-style device frame
- **Scaling**: Responsive sizing based on container

#### Animation Effects
- **Fade Transitions** - Smooth content changes
- **Floating Elements** - Background decorative elements
- **Glow Effects** - Dynamic background lighting

### Examples

#### Basic Usage
```tsx
<AnimatedProductMockup />
```

#### Customized Configuration
```tsx
<AnimatedProductMockup
  autoPlay={false}
  interval={6000}
  showControls={true}
  className="hero-mockup"
/>
```

#### Manual Control
```tsx
function CustomMockup() {
  return (
    <div>
      <AnimatedProductMockup
        autoPlay={false}
        showControls={false}
      />
      {/* Custom controls would go here */}
    </div>
  )
}
```

## Performance Notes

### Optimization Strategies

1. **Lazy Loading**
   - Interactive previews load on demand
   - Heavy animations start only when visible

2. **Memory Management**
   - Event listeners cleaned up on unmount
   - Animation timers properly cleared
   - Observer instances disconnected

3. **Rendering Optimization**
   - CSS transforms for hardware acceleration
   - Minimal DOM updates during animations
   - Debounced resize calculations

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Animations | 88+ | 85+ | 14+ | 88+ |
| Intersection Observer | 58+ | 55+ | 12.1+ | 79+ |
| ResizeObserver | 64+ | 69+ | 13.1+ | 79+ |
| SVG Animations | All | All | All | All |

### Accessibility Features

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order maintained
   - Enter/Space key activation

2. **Screen Readers**
   - ARIA labels for complex components
   - Alternative text for visual elements
   - Semantic HTML structure

3. **Motion Preferences**
   - Respects `prefers-reduced-motion`
   - Alternative static presentations
   - Configurable animation levels 