'use client'

import { useEffect, useRef } from 'react'
import { GlassCard, GlassCardProps } from './glass-card'
import { cn } from '@/lib/utils'

interface MagneticGlassCardProps extends GlassCardProps {
  /** Enable magnetic hover effect */
  magnetic?: boolean
  /** Strength of the magnetic effect (0-1) */
  magneticStrength?: number
  /** Enable magnetic glow effect */
  magneticGlow?: boolean
}

export function MagneticGlassCard({ 
  magnetic = true,
  magneticStrength = 0.3,
  magneticGlow = false,
  className,
  children,
  ...props 
}: MagneticGlassCardProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!magnetic || !elementRef.current) return

    const element = elementRef.current
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!element) return
      
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const rect = element.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      
      const moveX = (x / rect.width) * magneticStrength * 50
      const moveY = (y / rect.height) * magneticStrength * 50
      
      element.style.setProperty('--mouse-x', `${x}px`)
      element.style.setProperty('--mouse-y', `${y}px`)
      element.style.transform = `translate(${moveX}px, ${moveY}px)`
    }

    const handleMouseLeave = () => {
      if (!element) return
      element.style.transform = 'translate(0px, 0px)'
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [magnetic, magneticStrength])

  return (
    <GlassCard
      ref={elementRef}
      className={cn(
        magnetic && 'magnetic-hover',
        magneticGlow && 'magnetic-glow',
        'transition-transform duration-300 ease-out',
        className
      )}
      {...props}
    >
      {children}
    </GlassCard>
  )
}

MagneticGlassCard.displayName = 'MagneticGlassCard' 