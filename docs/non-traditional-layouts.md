# Non-Traditional Layouts System (Task 14.4)

The Non-Traditional Layouts System breaks away from conventional grid patterns to create visually striking and memorable user interfaces. This system provides asymmetrical grids, diagonal sections, 3D effects, and floating elements that enhance visual hierarchy and user engagement.

## Table of Contents

1. [Overview](#overview)
2. [Layout Systems](#layout-systems)
3. [Asymmetrical Grid System](#asymmetrical-grid-system)
4. [Diagonal Sections](#diagonal-sections)
5. [3D Transforms](#3d-transforms)
6. [Floating Elements](#floating-elements)
7. [Implementation Guide](#implementation-guide)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)

## Overview

Traditional web layouts often rely on predictable grid systems and rectangular patterns. The Non-Traditional Layouts System introduces:

- **Asymmetrical Grids**: Dynamic masonry-style layouts with varying cell sizes
- **Diagonal Sections**: Skewed borders and angled content flows
- **3D Transforms**: Depth and perspective effects for enhanced visual interest
- **Floating Elements**: Absolutely positioned decorative elements with animations
- **Organic Layouts**: Curved and flowing content arrangements

### Key Features

✅ **Visual Impact**: Break away from traditional rectangular grids
✅ **Dynamic Hierarchy**: Variable cell sizes create natural content prioritization
✅ **Responsive Design**: Adapts gracefully from complex layouts to mobile-friendly linear flows
✅ **Performance Optimized**: Hardware-accelerated CSS transforms
✅ **Accessibility First**: Maintains logical reading order and screen reader compatibility

## Layout Systems

### File Structure

```
styles/
└── non-traditional-layouts.css    # Complete layout system

components/
├── ui/
│   ├── glass-card.tsx           # Works with all layout systems
│   └── magnetic-glass-card.tsx  # Enhanced for 3D layouts
└── layout/
    └── asymmetric-grid.tsx      # Grid wrapper component
```

### CSS Architecture

The layout system is built with modular CSS classes that can be combined for complex effects:

```css
/* Core layout utilities */
.asymmetric-grid        /* 12-column responsive masonry grid */
.diagonal-section       /* Skewed section container */
.perspective-container  /* 3D perspective wrapper */
.floating-element       /* Absolutely positioned animated decorations */
.curved-grid           /* Organic curved layout system */
```

## Asymmetrical Grid System

### Grid Structure

The asymmetrical grid uses a 12-column system with 9 predefined cell types for maximum flexibility:

```css
/* Base asymmetric grid container */
.asymmetric-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  padding: 2rem;
  position: relative;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .asymmetric-grid {
    grid-template-columns: repeat(8, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .asymmetric-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
```

### Grid Cell Types

Nine distinct cell types provide varied layouts:

```css
/* Cell Type 1: Standard wide cell */
.grid-cell-1 {
  grid-column: span 4;
  grid-row: span 2;
  min-height: 300px;
}

/* Cell Type 2: Tall narrow cell */
.grid-cell-2 {
  grid-column: span 2;
  grid-row: span 3;
  min-height: 400px;
}

/* Cell Type 3: Wide short cell */
.grid-cell-3 {
  grid-column: span 6;
  grid-row: span 1;
  min-height: 200px;
}

/* Cell Type 4: Square cell */
.grid-cell-4 {
  grid-column: span 3;
  grid-row: span 2;
  min-height: 250px;
}

/* Cell Type 5: Large feature cell */
.grid-cell-5 {
  grid-column: span 5;
  grid-row: span 3;
  min-height: 450px;
}

/* Cell Type 6: Small accent cell */
.grid-cell-6 {
  grid-column: span 2;
  grid-row: span 1;
  min-height: 150px;
}

/* Cell Type 7: Medium rectangle */
.grid-cell-7 {
  grid-column: span 3;
  grid-row: span 1;
  min-height: 180px;
}

/* Cell Type 8: Vertical column */
.grid-cell-8 {
  grid-column: span 2;
  grid-row: span 4;
  min-height: 500px;
}

/* Cell Type 9: Hero cell */
.grid-cell-9 {
  grid-column: span 7;
  grid-row: span 2;
  min-height: 350px;
}

/* Responsive adaptations */
@media (max-width: 1024px) {
  .grid-cell-1 { grid-column: span 4; grid-row: span 2; }
  .grid-cell-2 { grid-column: span 2; grid-row: span 2; }
  .grid-cell-3 { grid-column: span 6; grid-row: span 1; }
  .grid-cell-4 { grid-column: span 3; grid-row: span 2; }
  .grid-cell-5 { grid-column: span 5; grid-row: span 2; }
  .grid-cell-6 { grid-column: span 2; grid-row: span 1; }
  .grid-cell-7 { grid-column: span 3; grid-row: span 1; }
  .grid-cell-8 { grid-column: span 2; grid-row: span 3; }
  .grid-cell-9 { grid-column: span 6; grid-row: span 2; }
}

@media (max-width: 768px) {
  .grid-cell-1,
  .grid-cell-2,
  .grid-cell-3,
  .grid-cell-4,
  .grid-cell-5,
  .grid-cell-6,
  .grid-cell-7,
  .grid-cell-8,
  .grid-cell-9 {
    grid-column: 1;
    grid-row: auto;
    min-height: 200px;
  }
}
```

### Usage Example

```tsx
// components/layout/feature-grid.tsx
export function AsymmetricFeatureGrid() {
  const features = [
    { type: 'grid-cell-5', title: 'Hero Feature', priority: 'high' },
    { type: 'grid-cell-2', title: 'Tall Feature', priority: 'medium' },
    { type: 'grid-cell-3', title: 'Wide Feature', priority: 'medium' },
    { type: 'grid-cell-6', title: 'Accent 1', priority: 'low' },
    { type: 'grid-cell-6', title: 'Accent 2', priority: 'low' },
    { type: 'grid-cell-4', title: 'Square Feature', priority: 'medium' },
  ]

  return (
    <div className="asymmetric-grid">
      {features.map((feature, index) => (
        <GlassCard
          key={feature.title}
          variant={feature.priority === 'high' ? 'primary' : 'secondary'}
          className={`${feature.type} animate-in fade-in slide-in-from-bottom-4`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
          <p>Content for {feature.title}</p>
        </GlassCard>
      ))}
    </div>
  )
}
```

## Diagonal Sections

### Diagonal Section Styling

Create angled content flows with skewed pseudo-elements:

```css
/* Diagonal section container */
.diagonal-section {
  position: relative;
  padding: 4rem 0;
  overflow: hidden;
}

/* Top diagonal border */
.diagonal-section.diagonal-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: inherit;
  transform: skewY(-2deg);
  transform-origin: top left;
  z-index: -1;
}

/* Bottom diagonal border */
.diagonal-section.diagonal-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: inherit;
  transform: skewY(-2deg);
  transform-origin: bottom right;
  z-index: -1;
}

/* Diagonal content wrapper */
.diagonal-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Angled grid layout */
.diagonal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  transform: rotate(-2deg);
  margin: 2rem 0;
}

.diagonal-grid > * {
  transform: rotate(2deg);
}
```

### Implementation Example

```tsx
function DiagonalSection() {
  return (
    <section className="diagonal-section diagonal-top diagonal-bottom bg-gradient-to-br from-slate-100/50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/30">
      <div className="diagonal-content">
        <h2 className="text-4xl font-bold text-center mb-12">
          Diagonal Section Layout
        </h2>
        
        <div className="diagonal-grid">
          {[1, 2, 3].map((item) => (
            <GlassCard key={item} variant="floating">
              <h3>Angled Card {item}</h3>
              <p>Content in diagonal flow</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## 3D Transforms

### 3D Transform Utilities

Create depth and perspective effects:

```css
/* 3D perspective container */
.perspective-container {
  perspective: 1200px;
  perspective-origin: center center;
}

/* 3D transform base */
.transform-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* Tilt effects */
.tilt-left {
  transform: rotateY(-15deg) rotateX(5deg);
}

.tilt-right {
  transform: rotateY(15deg) rotateX(5deg);
}

.tilt-up {
  transform: rotateX(-10deg) rotateY(5deg);
}

.tilt-down {
  transform: rotateX(10deg) rotateY(-5deg);
}

/* Interactive 3D hover effects */
.card-3d {
  transition: transform 0.3s ease;
}

.card-3d:hover {
  transform: translateY(-10px) rotateX(10deg) rotateY(5deg);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

/* Layered 3D effect */
.layer-3d {
  position: relative;
}

.layer-3d::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: -10px;
  bottom: -10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: inherit;
  z-index: -1;
  transform: translateZ(-20px);
}

/* Floating 3D cards */
.floating-3d {
  animation: float3D 6s ease-in-out infinite;
}

@keyframes float3D {
  0%, 100% {
    transform: translateY(0px) rotateX(0deg) rotateY(0deg);
  }
  33% {
    transform: translateY(-10px) rotateX(5deg) rotateY(2deg);
  }
  66% {
    transform: translateY(-5px) rotateX(-2deg) rotateY(-5deg);
  }
}
```

### 3D Layout Example

```tsx
function ThreeDShowcase() {
  return (
    <div className="perspective-container py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          3D Transform Showcase
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="transform-3d tilt-left">
            <GlassCard variant="primary" className="card-3d">
              <h3>Left Tilt Card</h3>
              <p>3D rotated to the left</p>
            </GlassCard>
          </div>
          
          <div className="transform-3d">
            <GlassCard variant="floating" className="floating-3d layer-3d">
              <h3>Floating 3D Card</h3>
              <p>Animated floating effect</p>
            </GlassCard>
          </div>
          
          <div className="transform-3d tilt-right">
            <GlassCard variant="accent" className="card-3d">
              <h3>Right Tilt Card</h3>
              <p>3D rotated to the right</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Floating Elements

### Floating Animation System

Decorative elements that enhance visual appeal:

```css
/* Base floating element */
.floating-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.7;
  z-index: -1;
}

/* Float animation variants */
.float-animation {
  animation: float 8s ease-in-out infinite;
}

.float-slow {
  animation: floatSlow 12s ease-in-out infinite;
}

.float-fast {
  animation: floatFast 4s ease-in-out infinite;
}

/* Animation keyframes */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
  }
  50% {
    transform: translateY(-40px) translateX(-5px) rotate(180deg);
  }
  75% {
    transform: translateY(-20px) translateX(-15px) rotate(270deg);
  }
}

@keyframes floatSlow {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }
  33% {
    transform: translateY(-30px) translateX(15px) scale(1.1);
  }
  66% {
    transform: translateY(-10px) translateX(-20px) scale(0.9);
  }
}

@keyframes floatFast {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

/* Interactive floating elements */
.floating-interactive {
  transition: transform 0.3s ease;
  cursor: pointer;
  pointer-events: auto;
}

.floating-interactive:hover {
  transform: scale(1.2) !important;
  opacity: 1;
}

/* Parallax floating elements */
.floating-parallax {
  transform: translateY(calc(var(--scroll-y) * 0.5px));
}
```

### Floating Elements Implementation

```tsx
function FloatingElementsDemo() {
  const floatingElements = [
    {
      size: 'w-20 h-20',
      color: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
      position: 'top-20 left-10',
      animation: 'float-animation'
    },
    {
      size: 'w-16 h-16',
      color: 'bg-gradient-to-br from-pink-500/20 to-orange-500/20',
      position: 'top-40 right-20',
      animation: 'float-slow'
    },
    {
      size: 'w-24 h-24',
      color: 'bg-gradient-to-br from-green-500/20 to-teal-500/20',
      position: 'bottom-32 left-20',
      animation: 'float-fast'
    },
    {
      size: 'w-12 h-12',
      color: 'bg-gradient-to-br from-yellow-500/20 to-red-500/20',
      position: 'bottom-20 right-32',
      animation: 'float-animation'
    }
  ]

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Floating decorative elements */}
      {floatingElements.map((element, index) => (
        <div
          key={index}
          className={`
            floating-element
            ${element.size}
            ${element.color}
            ${element.position}
            ${element.animation}
            blur-xl
          `}
        />
      ))}
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Content with Floating Elements
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="floating" size="xl">
            <h3 className="text-2xl font-semibold mb-4">
              Enhanced with floating decorations
            </h3>
            <p className="text-lg">
              The floating elements create depth and visual interest
              without interfering with the main content.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
```

## Organic Layouts

### Curved Grid System

```css
/* Curved/organic layout system */
.curved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.curved-grid > * {
  border-radius: 2rem 0.5rem 2rem 0.5rem;
  position: relative;
}

.curved-grid > *:nth-child(even) {
  border-radius: 0.5rem 2rem 0.5rem 2rem;
  transform: translateY(20px);
}

.curved-grid > *:nth-child(3n) {
  border-radius: 2rem;
  transform: translateY(-10px) translateX(10px);
}

/* Organic flow layout */
.organic-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.organic-flow > * {
  flex: 1 1 300px;
  margin: 0 1rem 2rem 0;
}

.organic-flow > *:nth-child(odd) {
  margin-top: 2rem;
  border-radius: 2rem 0.5rem;
}

.organic-flow > *:nth-child(even) {
  margin-top: -1rem;
  border-radius: 0.5rem 2rem;
}

/* Offset positioning for organic feel */
.organic-offset > *:nth-child(1) { transform: translateY(0px) translateX(20px); }
.organic-offset > *:nth-child(2) { transform: translateY(30px) translateX(-10px); }
.organic-offset > *:nth-child(3) { transform: translateY(-20px) translateX(15px); }
.organic-offset > *:nth-child(4) { transform: translateY(40px) translateX(-25px); }
.organic-offset > *:nth-child(5) { transform: translateY(-10px) translateX(30px); }
```

## Implementation Guide

### Complete Layout Example

```tsx
// app/features/page.tsx (Updated with non-traditional layouts)
export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Floating Elements */}
      <section className="relative overflow-hidden">
        {/* Floating Elements */}
        <div className="floating-element top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl float-animation" />
        <div className="floating-element top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-lg float-slow" />
        <div className="floating-element bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-xl float-fast" />
        
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-6xl font-bold text-center mb-16">
            Next-Generation UI
          </h1>
        </div>
      </section>

      {/* Asymmetrical Grid Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="asymmetric-grid">
          {features.map((feature, index) => {
            const cellTypes = ['grid-cell-1', 'grid-cell-2', 'grid-cell-3', 'grid-cell-4', 'grid-cell-5']
            const cellType = cellTypes[index % cellTypes.length]
            
            return (
              <MagneticGlassCard
                key={feature.id}
                variant={index % 3 === 0 ? "primary" : "secondary"}
                magnetic={true}
                magneticStrength={0.2}
                className={`${cellType} animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </MagneticGlassCard>
            )
          })}
        </div>
      </section>

      {/* Diagonal Section */}
      <section className="diagonal-section diagonal-top diagonal-bottom bg-gradient-to-br from-slate-100/50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/30">
        <div className="diagonal-content">
          <h2 className="text-4xl font-bold text-center mb-12">
            Interactive Data Visualization
          </h2>
          
          {/* Curved grid with 3D perspective */}
          <div className="curved-grid max-w-6xl mx-auto">
            <div className="perspective-container">
              <div className="transform-3d tilt-left">
                <GlassCard variant="primary" size="xl" depth="floating" glow="strong">
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold mb-2">
                        Interactive Charts
                      </h3>
                      <p>Advanced data visualization with real-time updates</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <section className="perspective-container py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="transform-3d tilt-left">
              <GlassCard variant="accent" className="card-3d floating-3d">
                <h3>3D Effect 1</h3>
                <p>Left-tilted card with hover effects</p>
              </GlassCard>
            </div>
            
            <div className="transform-3d">
              <GlassCard variant="primary" className="layer-3d">
                <h3>Layered 3D</h3>
                <p>Multiple depth layers</p>
              </GlassCard>
            </div>
            
            <div className="transform-3d tilt-right">
              <GlassCard variant="floating" className="card-3d">
                <h3>3D Effect 3</h3>
                <p>Right-tilted interactive card</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
```

## Responsive Design

### Mobile Adaptations

The non-traditional layouts gracefully degrade on smaller screens:

```css
/* Mobile-first responsive approach */
@media (max-width: 768px) {
  /* Simplify asymmetric grid to linear layout */
  .asymmetric-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .asymmetric-grid > * {
    grid-column: unset !important;
    grid-row: unset !important;
    min-height: 200px !important;
  }
  
  /* Reduce 3D effects on mobile */
  .transform-3d {
    transform: none !important;
  }
  
  .perspective-container {
    perspective: none;
  }
  
  /* Simplify diagonal sections */
  .diagonal-section::before,
  .diagonal-section::after {
    height: 50px;
    transform: skewY(-1deg);
  }
  
  /* Reduce floating element animations */
  .floating-element {
    animation-duration: 6s;
    opacity: 0.3;
  }
}

/* Tablet adaptations */
@media (max-width: 1024px) and (min-width: 769px) {
  .asymmetric-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  /* Scale down cell spans */
  .grid-cell-5 { grid-column: span 4; }
  .grid-cell-9 { grid-column: span 5; }
  
  /* Reduce perspective effects */
  .perspective-container {
    perspective: 800px;
  }
}
```

## Accessibility

### Screen Reader Support

```css
/* Ensure logical reading order */
.asymmetric-grid {
  /* Visual order differs from DOM order, but screen readers follow DOM */
  counter-reset: grid-item;
}

.asymmetric-grid > * {
  counter-increment: grid-item;
}

/* Add visual indicators for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .floating-element,
  .float-animation,
  .float-slow,
  .float-fast,
  .floating-3d {
    animation: none !important;
    transform: none !important;
  }
  
  .transform-3d,
  .card-3d {
    transform: none !important;
    transition: none !important;
  }
  
  .diagonal-section::before,
  .diagonal-section::after {
    transform: none !important;
  }
}
```

### Semantic HTML Structure

```tsx
// Proper semantic structure for non-traditional layouts
function AccessibleAsymmetricGrid() {
  return (
    <section 
      aria-labelledby="features-heading"
      className="asymmetric-grid"
    >
      <h2 id="features-heading" className="sr-only">
        Product Features
      </h2>
      
      {features.map((feature, index) => (
        <article
          key={feature.id}
          className={`grid-cell-${(index % 5) + 1}`}
          aria-labelledby={`feature-${feature.id}-title`}
        >
          <GlassCard variant="primary">
            <h3 id={`feature-${feature.id}-title`}>
              {feature.title}
            </h3>
            <p>{feature.description}</p>
            <span className="sr-only">
              Feature {index + 1} of {features.length}
            </span>
          </GlassCard>
        </article>
      ))}
    </section>
  )
}
```

## Performance Considerations

### Optimization Strategies

```css
/* Use hardware acceleration for transforms */
.transform-3d,
.floating-element,
.card-3d {
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Optimize animations with composite layers */
.float-animation,
.floating-3d {
  will-change: transform, opacity;
}

/* Remove will-change after animations complete */
.animation-complete {
  will-change: auto;
}
```

### Performance Monitoring

```typescript
// Monitor layout performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('layout-shift')) {
      console.log(`Layout shift detected: ${entry.value}`)
    }
  }
})

observer.observe({ entryTypes: ['layout-shift'] })
```

---

**Related Documentation:**
- [UI System Overview](./ui-system-overview.md)
- [Glass Components](./glass-components.md)
- [Theme System](./theme-system.md)
- [Animation System](./animations-system.md)

*Last Updated: June 11, 2025* 