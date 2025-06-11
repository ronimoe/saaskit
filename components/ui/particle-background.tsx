'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ParticleBackgroundProps {
  /** Number of particles to render */
  particleCount?: number
  /** Speed of particle movement */
  speed?: number
  /** Size range for particles */
  size?: { min: number; max: number }
  /** Opacity range for particles */
  opacity?: { min: number; max: number }
  /** Enable cursor interaction */
  interactive?: boolean
  /** Particle colors */
  colors?: string[]
  /** CSS class name */
  className?: string
}

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  velocity: { x: number; y: number }
  color: string
  originalVelocity: { x: number; y: number }
}

export function ParticleBackground({
  particleCount = 50,
  speed = 1,
  size = { min: 2, max: 4 },
  opacity = { min: 0.1, max: 0.6 },
  interactive = true,
  colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
  className
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)
  const particles = useRef<Particle[]>([])
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particles.current = []
      for (let i = 0; i < particleCount; i++) {
        const particleSize = Math.random() * (size.max - size.min) + size.min
        const particleOpacity = Math.random() * (opacity.max - opacity.min) + opacity.min
        const velocity = {
          x: (Math.random() - 0.5) * speed,
          y: (Math.random() - 0.5) * speed
        }

        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: particleSize,
          opacity: particleOpacity,
          velocity,
          originalVelocity: { ...velocity },
          color: colors[Math.floor(Math.random() * colors.length)] || '#8B5CF6'
        })
      }
    }

    initParticles()

    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return
      
      const rect = canvas.getBoundingClientRect()
      mouse.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle) => {
        // Apply cursor interaction
        if (interactive) {
          const dx = mouse.current.x - particle.x
          const dy = mouse.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 100

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance
            particle.velocity.x = particle.originalVelocity.x - (dx / distance) * force * 2
            particle.velocity.y = particle.originalVelocity.y - (dy / distance) * force * 2
          } else {
            // Return to original velocity
            particle.velocity.x += (particle.originalVelocity.x - particle.velocity.x) * 0.02
            particle.velocity.y += (particle.originalVelocity.y - particle.velocity.y) * 0.02
          }
        }

        // Update position
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      animate()
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [particleCount, speed, size, opacity, interactive, colors])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 pointer-events-none z-0',
        className
      )}
      style={{ 
        background: 'transparent'
      }}
    />
  )
} 