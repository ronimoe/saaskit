# Modern CSS Enhancements

The SaaS Kit leverages cutting-edge CSS features to provide a modern, responsive, and engaging user experience with advanced animations and layouts.

## Table of Contents

- [Overview](#overview)
- [Container Queries](#container-queries)
- [Scroll-Driven Animations](#scroll-driven-animations)
- [View Transitions](#view-transitions)
- [CSS Nesting](#css-nesting)
- [Advanced Animations](#advanced-animations)
- [Performance Optimizations](#performance-optimizations)
- [Browser Support](#browser-support)
- [Usage Examples](#usage-examples)
- [Customization](#customization)

## Overview

The modern CSS enhancement system includes:

- **Container Queries**: Responsive design based on container size, not viewport
- **Scroll-Driven Animations**: Animations triggered by scroll position
- **View Transitions API**: Smooth page transitions with native CSS
- **CSS Nesting**: Cleaner, more maintainable stylesheets
- **Advanced Animations**: Performance-optimized complex animations
- **Modern Layout**: CSS Grid, Flexbox, and Subgrid implementations

## Container Queries

### Responsive Components

Container queries enable components to adapt based on their container size rather than viewport size:

```css
/* Gamification components responsive to container width */
@container (min-width: 400px) {
  .achievement-card {
    flex-direction: row;
    align-items: center;
  }
  
  .achievement-card .achievement-content {
    text-align: left;
  }
}

@container (min-width: 600px) {
  .gamification-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@container (min-width: 800px) {
  .level-display {
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
  }
}
```

### Container Types

Different container types for various use cases:

```css
/* Size-based containers */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Style-based containers */
.theme-container {
  container-type: style;
  container-name: theme;
}

/* Combined containers */
.responsive-container {
  container: layout / inline-size;
}
```

### Adaptive Layout Patterns

```css
/* Sidebar that collapses based on container width */
@container sidebar (max-width: 300px) {
  .sidebar-nav {
    flex-direction: column;
  }
  
  .sidebar-nav .nav-text {
    display: none;
  }
}

/* Card grid that adapts to container space */
@container cards (min-width: 800px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container cards (max-width: 799px) and (min-width: 500px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Scroll-Driven Animations

### Progress Indicators

Animations that respond to scroll position:

```css
/* Progress bar that fills based on scroll */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  transform-origin: left;
  animation: scroll-progress linear;
  animation-timeline: scroll(root);
}

@keyframes scroll-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
```

### Reveal Animations

Elements that animate into view while scrolling:

```css
/* Cards that slide in from different directions */
.scroll-reveal {
  opacity: 0;
  transform: translateY(50px);
  animation: reveal-up linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animations for lists */
.stagger-item:nth-child(1) {
  animation-delay: 0s;
}

.stagger-item:nth-child(2) {
  animation-delay: 0.1s;
}

.stagger-item:nth-child(3) {
  animation-delay: 0.2s;
}
```

### Parallax Effects

Subtle parallax scrolling for depth:

```css
/* Background elements with different scroll speeds */
.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll(root);
}

@keyframes parallax {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}

/* Text that moves at different speed than container */
.parallax-text {
  animation: parallax-text linear;
  animation-timeline: scroll(nearest);
}

@keyframes parallax-text {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(20px);
  }
}
```

## View Transitions

### Page Transitions

Smooth transitions between pages and views:

```css
/* Enable view transitions */
html {
  view-transition-name: root;
}

/* Customize the transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-easing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Slide transition effect */
::view-transition-old(root) {
  animation-name: slide-out;
}

::view-transition-new(root) {
  animation-name: slide-in;
}

@keyframes slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### Element Transitions

Smooth transitions for specific elements:

```css
/* Achievement cards with unique transition names */
.achievement-card {
  view-transition-name: var(--achievement-id);
}

/* Level display transitions */
.level-display {
  view-transition-name: level-display;
}

/* Custom transition for achievement unlocks */
::view-transition-old(achievement),
::view-transition-new(achievement) {
  animation-duration: 0.8s;
}

::view-transition-new(achievement) {
  animation-name: achievement-unlock;
}

@keyframes achievement-unlock {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```

## CSS Nesting

### Component Organization

Cleaner, more maintainable component styles:

```css
/* Gamification dashboard with nested styles */
.gamification-dashboard {
  container-type: inline-size;
  container-name: dashboard;
  
  & .dashboard-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    
    & .header-icon {
      font-size: 2rem;
      opacity: 0.8;
    }
    
    & .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-foreground);
    }
  }
  
  & .dashboard-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    
    @container dashboard (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
  
  & .achievement-section {
    & .achievement-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      
      & .achievement-card {
        position: relative;
        padding: 1rem;
        border-radius: 0.75rem;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        
        &.earned {
          background: var(--glass-bg-success);
          border-color: var(--color-success);
          
          &::after {
            content: '✓';
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            color: var(--color-success);
            font-weight: bold;
          }
        }
        
        &.rarity-legendary {
          animation: legendary-glow 2s infinite alternate;
          
          @keyframes legendary-glow {
            from {
              box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
            }
            to {
              box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
            }
          }
        }
      }
    }
  }
}
```

### State Management

Nested styles for different states:

```css
.interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    
    & .element-content {
      opacity: 0.9;
    }
    
    & .element-action {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &:active {
    transform: translateY(0);
    
    & .element-content {
      opacity: 0.8;
    }
  }
  
  &[data-state="loading"] {
    pointer-events: none;
    
    & .element-content {
      opacity: 0.5;
    }
    
    & .loading-spinner {
      opacity: 1;
    }
  }
}
```

## Advanced Animations

### Level Progress Animations

```css
/* Animated progress bars with shimmer effect */
.level-progress {
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);
  border-radius: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.4), 
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  & .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg, 
      var(--color-primary), 
      var(--color-secondary)
    );
    border-radius: inherit;
    transform-origin: left;
    animation: fill-progress 1s ease-out;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes fill-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(var(--progress-value));
  }
}
```

### Achievement Unlock Effects

```css
/* Epic achievement unlock animation */
.achievement-unlock {
  animation: achievement-sequence 3s ease-out;
  
  &.rarity-epic {
    animation: epic-unlock 2s ease-out;
  }
  
  &.rarity-legendary {
    animation: legendary-unlock 3s ease-out;
  }
}

@keyframes epic-unlock {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-180deg);
    filter: blur(10px);
  }
  25% {
    opacity: 1;
    transform: scale(1.2) rotate(-90deg);
    filter: blur(5px);
  }
  50% {
    transform: scale(0.9) rotate(0deg);
    filter: blur(0px);
  }
  75% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes legendary-unlock {
  0% {
    opacity: 0;
    transform: scale(0.3) rotateY(180deg);
    filter: brightness(0) saturate(0);
  }
  20% {
    opacity: 1;
    transform: scale(1.3) rotateY(90deg);
    filter: brightness(1.5) saturate(1.5);
  }
  40% {
    transform: scale(0.8) rotateY(0deg);
    filter: brightness(1.2) saturate(1.2);
  }
  60% {
    transform: scale(1.1);
    filter: brightness(1) saturate(1);
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
}
```

### Micro-interactions

```css
/* Button hover effects */
.button-enhanced {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    transition: all 0.5s ease-out;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

/* Card tilt effect */
.card-interactive {
  transition: transform 0.3s ease-out;
  transform-style: preserve-3d;
  
  &:hover {
    transform: rotateX(5deg) rotateY(5deg) translateZ(10px);
  }
}
```

## Performance Optimizations

### Hardware Acceleration

```css
/* GPU-accelerated animations */
.gpu-optimized {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Composite layers for smooth animations */
.animation-layer {
  isolation: isolate;
  contain: layout style paint;
}
```

### Efficient Animations

```css
/* Use transform and opacity for smooth animations */
.efficient-animation {
  /* Avoid animating layout properties */
  /* animation: bad-animation 1s ease; */
  
  /* Prefer transform and opacity */
  animation: good-animation 1s ease;
}

/* Bad: causes layout thrashing */
@keyframes bad-animation {
  from { width: 100px; height: 100px; }
  to { width: 200px; height: 200px; }
}

/* Good: uses composited properties */
@keyframes good-animation {
  from { transform: scale(1); opacity: 0; }
  to { transform: scale(2); opacity: 1; }
}
```

### Motion Preferences

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Provide alternative feedback for reduced motion */
  .achievement-unlock {
    animation: none;
    
    &::after {
      content: '✨';
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 1.5rem;
    }
  }
}
```

## Browser Support

### Feature Detection

```css
/* Container queries fallback */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

@supports (container-type: inline-size) {
  .responsive-grid {
    container-type: inline-size;
    container-name: grid;
  }
  
  @container grid (min-width: 600px) {
    .responsive-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

/* View transitions fallback */
@supports (view-transition-name: auto) {
  .transition-enabled {
    view-transition-name: var(--element-name);
  }
}

@supports not (view-transition-name: auto) {
  .transition-enabled {
    transition: all 0.3s ease;
  }
}
```

### Progressive Enhancement

```css
/* Base styles work everywhere */
.enhanced-card {
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--card-bg);
  transition: transform 0.3s ease;
}

/* Enhanced styles for supporting browsers */
@supports (backdrop-filter: blur(10px)) {
  .enhanced-card {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
  }
}

@supports (animation-timeline: scroll()) {
  .enhanced-card {
    animation: card-reveal linear;
    animation-timeline: view();
  }
}
```

## Usage Examples

### Implementing Container Queries

```tsx
// React component with container query support
function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="card-container"
      style={{ containerType: 'inline-size' }}
    >
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}
```

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
}
```

### Scroll-Driven Progress

```tsx
function ScrollProgressIndicator() {
  return (
    <div className="scroll-progress-container">
      <div className="scroll-progress-bar" />
    </div>
  )
}
```

```css
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--color-primary);
  transform-origin: left;
  animation: scroll-progress linear;
  animation-timeline: scroll(root);
}
```

### View Transitions

```tsx
function PageTransition({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('startViewTransition' in document) {
      // Enable view transitions
      document.documentElement.style.viewTransitionName = 'root'
    }
  }, [])
  
  return <div className="page-content">{children}</div>
}
```

## Customization

### Custom Container Queries

```css
/* Define custom container names */
.sidebar-container {
  container: sidebar / inline-size;
}

.main-content-container {
  container: main / inline-size;
}

/* Use specific containers in queries */
@container sidebar (max-width: 250px) {
  .nav-item .label {
    display: none;
  }
}

@container main (min-width: 800px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
  }
}
```

### Custom Animation Timelines

```css
/* Create custom scroll timelines */
.custom-timeline {
  animation-timeline: scroll(nearest horizontal);
  animation-range: entry 25% exit 75%;
}

/* Multiple animations on same timeline */
.element-1 {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% entry 50%;
}

.element-2 {
  animation: slide-in linear;
  animation-timeline: view();
  animation-range: entry 25% entry 75%;
}
```

### Custom View Transitions

```css
/* Named transitions for specific elements */
.modal {
  view-transition-name: modal;
}

.modal-backdrop {
  view-transition-name: modal-backdrop;
}

/* Custom transition animations */
::view-transition-old(modal) {
  animation: modal-out 0.3s ease-in;
}

::view-transition-new(modal) {
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-out {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(1.1);
  }
}
```

## Future CSS Features

Experimental features to consider:

```css
/* CSS Anchor positioning (experimental) */
.tooltip {
  position: absolute;
  position-anchor: --button;
  top: anchor(bottom);
  left: anchor(center);
}

/* CSS Scroll-driven animations enhancements */
.advanced-scroll {
  animation-timeline: scroll(root block);
  animation-range: contain 0% contain 100%;
}

/* CSS Color Module Level 5 */
.modern-colors {
  background: oklch(70% 0.15 180);
  color: color-mix(in oklch, var(--primary) 70%, var(--secondary));
}
```

## Troubleshooting

### Common Issues

**Container queries not working:**
- Check browser support
- Ensure `container-type` is set
- Verify container context hierarchy

**Scroll animations jumpy:**
- Add `transform: translateZ(0)` for hardware acceleration
- Check for competing animations
- Verify animation timeline syntax

**View transitions not smooth:**
- Ensure proper `view-transition-name` values
- Check for layout shifts during transition
- Optimize element positioning

### Debug Tips

```css
/* Debug container queries */
.debug-container {
  outline: 2px solid red;
  position: relative;
}

.debug-container::after {
  content: attr(data-container-width);
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  padding: 0.25rem;
  font-size: 0.75rem;
}
``` 