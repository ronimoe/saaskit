# Advanced Animations & Micro-Interactions System (Task 14.3)

The Advanced Animations System provides sophisticated animation capabilities including magnetic effects, particle backgrounds, scroll-driven animations, and micro-interactions. This system enhances user experience through physics-based interactions and smooth visual feedback.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Animation Categories](#animation-categories)
4. [Magnetic Effects](#magnetic-effects)
5. [Particle System](#particle-system)
6. [Micro-Interactions](#micro-interactions)
7. [Performance](#performance)
8. [Accessibility](#accessibility)
9. [Usage Examples](#usage-examples)

## Overview

The animation system brings life to the UI through carefully crafted motion design:

- **Magnetic Effects**: Physics-based hover interactions that attract elements to the cursor
- **Particle Backgrounds**: Interactive particle systems with mouse following and collision detection
- **Micro-Interactions**: Subtle feedback animations for buttons, forms, and UI elements
- **Scroll Animations**: Parallax and scroll-driven effects for enhanced storytelling
- **Performance Optimized**: Hardware-accelerated CSS with reduced motion support

### Key Features

✅ **Physics-Based Interactions**: Realistic magnetic and particle effects
✅ **Hardware Acceleration**: GPU-optimized animations for smooth performance
✅ **Accessibility First**: Respects reduced motion preferences
✅ **Memory Efficient**: Automatic cleanup of event listeners and animation frames
✅ **Mobile Optimized**: Touch-friendly interactions with proper fallbacks

## Components

### ParticleBackground

Interactive particle system component with customizable behavior.

**File**: `components/ui/particle-background.tsx`

```tsx
interface ParticleBackgroundProps {
  particleCount?: number
  particleColor?: string
  connectionDistance?: number
  mouseInteraction?: boolean
  speed?: number
  className?: string
}
```

### MagneticGlassCard

Glass card component with magnetic hover effects.

**File**: `components/ui/magnetic-glass-card.tsx`

```tsx
interface MagneticGlassCardProps extends GlassCardProps {
  magnetic?: boolean
  magneticStrength?: number
  magneticGlow?: boolean
  children: React.ReactNode
}
```

### useMagnetic Hook

Custom React hook for adding magnetic effects to any element.

**File**: `lib/hooks/use-magnetic.ts`

```tsx
interface MagneticOptions {
  strength?: number
  smoothing?: number
  maxDistance?: number
  resetDuration?: number
}

function useMagnetic(options?: MagneticOptions): React.RefObject<HTMLElement>
```

## Animation Categories

### 1. Magnetic Effects

Physics-based hover interactions that create an attraction between the cursor and UI elements.

#### CSS Implementation

```css
/* Magnetic element base styles */
.magnetic-element {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  will-change: transform;
}

/* Magnetic container for positioning */
.magnetic-container {
  position: relative;
  display: inline-block;
}

/* Smooth magnetic animations */
.magnetic-smooth {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Strong magnetic effect */
.magnetic-strong {
  transition: transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

#### JavaScript Hook Implementation

```typescript
// lib/hooks/use-magnetic.ts
import { useRef, useEffect, useCallback } from 'react'

interface MagneticOptions {
  strength?: number      // 0-1, how strong the magnetic effect is
  smoothing?: number     // 0-1, how smooth the animation is
  maxDistance?: number   // Maximum distance for magnetic effect
  resetDuration?: number // Duration to reset position when mouse leaves
}

export function useMagnetic(options: MagneticOptions = {}) {
  const elementRef = useRef<HTMLElement>(null)
  const {
    strength = 0.2,
    smoothing = 0.1,
    maxDistance = 100,
    resetDuration = 300
  } = options

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const element = elementRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance < maxDistance) {
      const moveX = deltaX * strength * (1 - distance / maxDistance)
      const moveY = deltaY * strength * (1 - distance / maxDistance)
      
      element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`
    }
  }, [strength, maxDistance])

  const handleMouseLeave = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    element.style.transition = `transform ${resetDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    element.style.transform = 'translate3d(0px, 0px, 0)'
    
    setTimeout(() => {
      element.style.transition = ''
    }, resetDuration)
  }, [resetDuration])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  return elementRef
}
```

### 2. Particle System

Interactive background particles with mouse following and connection lines.

#### Component Implementation

```tsx
// components/ui/particle-background.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

interface ParticleBackgroundProps {
  particleCount?: number
  particleColor?: string
  connectionDistance?: number
  mouseInteraction?: boolean
  speed?: number
  className?: string
}

export function ParticleBackground({
  particleCount = 50,
  particleColor = 'rgba(255, 255, 255, 0.5)',
  connectionDistance = 150,
  mouseInteraction = true,
  speed = 0.5,
  className = ''
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: particleColor
    }))
  }, [particleCount, speed, particleColor])

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      // Mouse interaction
      if (mouseInteraction) {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.vx += dx * force * 0.01
          particle.vy += dy * force * 0.01
        }
      }

      // Apply friction
      particle.vx *= 0.99
      particle.vy *= 0.99
    })
  }, [mouseInteraction])

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw connections
    particlesRef.current.forEach((particle, i) => {
      particlesRef.current.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.3
          ctx.globalAlpha = opacity
          ctx.strokeStyle = particleColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })

    ctx.globalAlpha = 1
  }, [connectionDistance, particleColor])

  const animate = useCallback(() => {
    updateParticles()
    drawParticles()
    animationRef.current = requestAnimationFrame(animate)
  }, [updateParticles, drawParticles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('mousemove', handleMouseMove)
    
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initParticles, animate])

  return (
    <canvas
      ref={canvasRef}
      className={`particle-canvas ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  )
}
```

### 3. Micro-Interactions

Subtle feedback animations for UI elements.

#### CSS Micro-Interaction Classes

```css
/* Button micro-interactions */
.micro-interaction {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  will-change: transform, box-shadow;
}

.micro-interaction:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.micro-interaction:active {
  transform: translateY(0px);
  transition-duration: 0.1s;
}

/* Button click ripple effect */
.ripple-effect {
  position: relative;
  overflow: hidden;
}

.ripple-effect::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.ripple-effect:active::before {
  width: 300px;
  height: 300px;
}

/* Form field focus animations */
.form-field {
  position: relative;
  transition: all 0.3s ease;
}

.form-field input:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field label {
  transition: all 0.2s ease;
  transform-origin: left top;
}

.form-field input:focus + label,
.form-field input:not(:placeholder-shown) + label {
  transform: translateY(-24px) scale(0.85);
  color: rgb(59, 130, 246);
}

/* Loading animations */
.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Stagger animations for lists */
.stagger-animation {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.stagger-animation:nth-child(1) { animation-delay: 0ms; }
.stagger-animation:nth-child(2) { animation-delay: 100ms; }
.stagger-animation:nth-child(3) { animation-delay: 200ms; }
.stagger-animation:nth-child(4) { animation-delay: 300ms; }
.stagger-animation:nth-child(5) { animation-delay: 400ms; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 4. Scroll-Driven Animations

Parallax and scroll-based effects for enhanced storytelling.

```css
/* Parallax backgrounds */
.parallax-element {
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.parallax-slow {
  transform: translateY(calc(var(--scroll-y) * 0.5px));
}

.parallax-medium {
  transform: translateY(calc(var(--scroll-y) * 0.3px));
}

.parallax-fast {
  transform: translateY(calc(var(--scroll-y) * 0.8px));
}

/* Scroll-triggered fade-ins */
.scroll-fade {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.scroll-fade.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* Progressive reveal animations */
.reveal-on-scroll {
  position: relative;
  overflow: hidden;
}

.reveal-on-scroll::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--background);
  transform: translateX(0%);
  transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}

.reveal-on-scroll.revealed::before {
  transform: translateX(100%);
}
```

## Performance

### Optimization Strategies

1. **Hardware Acceleration**: Use `transform3d` and `will-change` for GPU acceleration
2. **RequestAnimationFrame**: Smooth 60fps animations using RAF
3. **Event Throttling**: Throttle mouse events to prevent performance issues
4. **Memory Management**: Proper cleanup of event listeners and animation frames

### Performance Best Practices

```tsx
// ✅ Good: Use hardware acceleration
const MagneticButton = () => {
  const magneticRef = useMagnetic({ strength: 0.2 })
  
  return (
    <button 
      ref={magneticRef}
      className="transform-gpu will-change-transform"
    >
      Magnetic Button
    </button>
  )
}

// ✅ Good: Throttle expensive operations
const throttledMouseMove = useCallback(
  throttle((e: MouseEvent) => {
    // Expensive mouse move logic
  }, 16), // ~60fps
  []
)

// ❌ Avoid: Excessive DOM queries in animations
const BadAnimation = () => {
  useEffect(() => {
    const animate = () => {
      const element = document.querySelector('.element') // Bad: DOM query in animation loop
      element.style.transform = `translateX(${Math.random() * 100}px)`
      requestAnimationFrame(animate)
    }
    animate()
  }, [])
}
```

### Memory Management

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const element = elementRef.current
  if (!element) return

  let animationFrame: number

  const animate = () => {
    // Animation logic here
    animationFrame = requestAnimationFrame(animate)
  }

  const handleMouseMove = (e: MouseEvent) => {
    // Mouse move logic
  }

  element.addEventListener('mousemove', handleMouseMove)
  animationFrame = requestAnimationFrame(animate)

  return () => {
    element.removeEventListener('mousemove', handleMouseMove)
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
}, [])
```

## Accessibility

### Reduced Motion Support

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .magnetic-element,
  .micro-interaction,
  .particle-canvas,
  .parallax-element {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }

  .stagger-animation {
    animation: fadeInStatic 0.1s ease forwards !important;
    animation-delay: 0s !important;
  }

  @keyframes fadeInStatic {
    to {
      opacity: 1;
    }
  }
}
```

### Accessible Animation Controls

```tsx
// components/ui/animation-controls.tsx
import { useTheme } from '@/components/providers/theme-provider'
import { Switch } from '@/components/ui/switch'

export function AnimationControls() {
  const { config, updateConfig } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="animations-toggle">
          Enable Animations
        </label>
        <Switch
          id="animations-toggle"
          checked={config.performanceToggles?.animations ?? true}
          onCheckedChange={(checked) => {
            updateConfig({
              performanceToggles: {
                ...config.performanceToggles,
                animations: checked
              }
            })
          }}
          aria-describedby="animations-description"
        />
      </div>
      <p id="animations-description" className="text-sm text-muted-foreground">
        Disable animations for better performance or if you prefer reduced motion
      </p>
    </div>
  )
}
```

## Usage Examples

### Basic Magnetic Effect

```tsx
import { useMagnetic } from '@/lib/hooks/use-magnetic'

function MagneticCard() {
  const magneticRef = useMagnetic({
    strength: 0.3,
    maxDistance: 120
  })

  return (
    <div 
      ref={magneticRef}
      className="magnetic-element p-6 bg-white rounded-lg shadow-lg cursor-pointer"
    >
      <h3>Hover to see magnetic effect</h3>
      <p>This card follows your mouse cursor</p>
    </div>
  )
}
```

### Particle Background

```tsx
import { ParticleBackground } from '@/components/ui/particle-background'

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <ParticleBackground
        particleCount={80}
        particleColor="rgba(59, 130, 246, 0.6)"
        connectionDistance={120}
        mouseInteraction={true}
        speed={0.3}
      />
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold mb-4">Interactive Hero</h1>
        <p className="text-xl">With particle background effects</p>
      </div>
    </section>
  )
}
```

### Micro-Interactions Grid

```tsx
function InteractiveGrid() {
  const items = Array.from({ length: 6 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <div
          key={item}
          className="micro-interaction stagger-animation p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-2xl font-bold mb-2">Item {item}</div>
          <p className="text-gray-600">Interactive card with micro-interactions</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded ripple-effect">
            Click Me
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Combined Effects

```tsx
import { MagneticGlassCard } from '@/components/ui/magnetic-glass-card'
import { ParticleBackground } from '@/components/ui/particle-background'

function CombinedEffectsDemo() {
  return (
    <section className="relative min-h-screen p-8">
      <ParticleBackground 
        particleCount={60}
        mouseInteraction={true}
      />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Combined Animation Effects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item, index) => (
            <MagneticGlassCard
              key={item}
              variant="floating"
              magnetic={true}
              magneticStrength={0.2}
              magneticGlow={true}
              className="stagger-animation"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {item}
                </div>
                <h3 className="text-xl font-semibold mb-2">Feature {item}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Magnetic glass card with particle background
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded micro-interaction ripple-effect">
                  Learn More
                </button>
              </div>
            </MagneticGlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

**Related Documentation:**
- [UI System Overview](./ui-system-overview.md)
- [Glass Components](./glass-components.md)
- [Theme System](./theme-system.md)
- [Non-Traditional Layouts](./non-traditional-layouts.md)

*Last Updated: June 11, 2025* 