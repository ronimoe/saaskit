'use client'

import { useEffect, useRef, useCallback } from 'react'

interface MagneticOptions {
  strength?: number
  disabled?: boolean
  respectReducedMotion?: boolean
}

interface Position {
  x: number
  y: number
}

/**
 * Hook for magnetic hover effects that make elements follow the cursor
 * Integrates with CSS custom properties for smooth animations
 */
export function useMagneticEffect(options: MagneticOptions = {}) {
  const {
    strength = 0.3,
    disabled = false,
    respectReducedMotion = true
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!elementRef.current || disabled) return

    // Check for reduced motion preference
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = event.clientX
    const mouseY = event.clientY
    
    // Calculate relative position as percentage
    const relativeX = ((mouseX - centerX) / (rect.width / 2)) * 100
    const relativeY = ((mouseY - centerY) / (rect.height / 2)) * 100
    
    // Smooth interpolation using RAF
    const updatePosition = () => {
      if (!elementRef.current) return
      
      elementRef.current.style.setProperty('--mouse-x', `${50 + relativeX * strength}%`)
      elementRef.current.style.setProperty('--mouse-y', `${50 + relativeY * strength}%`)
      elementRef.current.style.setProperty('--magnetic-strength', strength.toString())
    }
    
    // Cancel previous animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    
    animationFrameId.current = requestAnimationFrame(updatePosition)
  }, [strength, disabled, respectReducedMotion])

  const handleMouseLeave = useCallback((_event: MouseEvent) => {
    if (!elementRef.current || disabled) return
    
    // Reset to center position
    elementRef.current.style.setProperty('--mouse-x', '50%')
    elementRef.current.style.setProperty('--mouse-y', '50%')
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [disabled])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave])

  return elementRef
}

interface MagneticGlowOptions extends MagneticOptions {
  glowSize?: number
  glowIntensity?: number
}

/**
 * Enhanced magnetic effect with expanding glow based on cursor proximity
 */
export function useMagneticGlow(options: MagneticGlowOptions = {}) {
  const {
    strength = 0.3,
    glowSize = 300,
    glowIntensity = 0.1,
    disabled = false,
    respectReducedMotion = true
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!elementRef.current || disabled) return

    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = event.clientX
    const mouseY = event.clientY
    
    // Calculate distance from center for glow effect
    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    )
    const maxDistance = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2)) / 2
    const proximity = Math.max(0, 1 - distance / maxDistance)
    
    // Calculate relative position as percentage
    const relativeX = ((mouseX - centerX) / (rect.width / 2)) * 100
    const relativeY = ((mouseY - centerY) / (rect.height / 2)) * 100
    
    const updateEffect = () => {
      if (!elementRef.current) return
      
      // Magnetic position
      elementRef.current.style.setProperty('--mouse-x', `${50 + relativeX * strength}%`)
      elementRef.current.style.setProperty('--mouse-y', `${50 + relativeY * strength}%`)
      elementRef.current.style.setProperty('--magnetic-strength', strength.toString())
      
      // Glow effect based on proximity
      const currentGlowSize = glowSize * proximity
      const currentGlowIntensity = glowIntensity * proximity
      
      elementRef.current.style.setProperty('--glow-size', `${currentGlowSize}px`)
      elementRef.current.style.setProperty('--glow-intensity', currentGlowIntensity.toString())
    }
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    
    animationFrameId.current = requestAnimationFrame(updateEffect)
  }, [strength, glowSize, glowIntensity, disabled, respectReducedMotion])

  const handleMouseLeave = useCallback((_event: MouseEvent) => {
    if (!elementRef.current || disabled) return
    
    // Reset all properties
    elementRef.current.style.setProperty('--mouse-x', '50%')
    elementRef.current.style.setProperty('--mouse-y', '50%')
    elementRef.current.style.setProperty('--glow-size', '0px')
    elementRef.current.style.setProperty('--glow-intensity', '0')
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [disabled])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave])

  return elementRef
}

interface TiltOptions {
  strength?: number
  perspective?: number
  disabled?: boolean
  respectReducedMotion?: boolean
}

/**
 * 3D tilt effect based on mouse position
 */
export function useTiltEffect(options: TiltOptions = {}) {
  const {
    strength = 0.1,
    perspective = 1000,
    disabled = false,
    respectReducedMotion = true
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const animationFrameId = useRef<number | undefined>(undefined)

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!elementRef.current || disabled) return

    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = event.clientX
    const mouseY = event.clientY
    
    // Calculate rotation values
    const rotateX = ((mouseY - centerY) / (rect.height / 2)) * strength * -1
    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * strength
    
    const updateTilt = () => {
      if (!elementRef.current) return
      
      elementRef.current.style.setProperty('--mouse-x', `${((mouseX - rect.left) / rect.width) * 100}%`)
      elementRef.current.style.setProperty('--mouse-y', `${((mouseY - rect.top) / rect.height) * 100}%`)
      elementRef.current.style.setProperty('--tilt-x', `${rotateX}deg`)
      elementRef.current.style.setProperty('--tilt-y', `${rotateY}deg`)
      elementRef.current.style.setProperty('--perspective', `${perspective}px`)
    }
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    
    animationFrameId.current = requestAnimationFrame(updateTilt)
  }, [strength, perspective, disabled, respectReducedMotion])

  const handleMouseLeave = useCallback((_event: MouseEvent) => {
    if (!elementRef.current || disabled) return
    
    // Reset tilt
    elementRef.current.style.setProperty('--mouse-x', '50%')
    elementRef.current.style.setProperty('--mouse-y', '50%')
    elementRef.current.style.setProperty('--tilt-x', '0deg')
    elementRef.current.style.setProperty('--tilt-y', '0deg')
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [disabled])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set up perspective container
    element.style.setProperty('--perspective', `${perspective}px`)

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave, perspective])

  return elementRef
} 