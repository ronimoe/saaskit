"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { ThemeConfig, predefinedThemes, getThemeById, createBrandPalette, type BrandColors } from '@/lib/theme-config'

interface ThemeConfigState {
  currentTheme: ThemeConfig | null
  brandColors: BrandColors | null
  isCustomTheme: boolean
  isAnimated: boolean
  features: {
    glassmorphism: boolean
    animations: boolean
    highContrast: boolean
  }
}

export function useThemeConfig() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [themeConfig, setThemeConfig] = useState<ThemeConfigState>({
    currentTheme: null,
    brandColors: null,
    isCustomTheme: false,
    isAnimated: true,
    features: {
      glassmorphism: true,
      animations: true,
      highContrast: false,
    }
  })

  // Store custom theme configurations in localStorage
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([])

  // Load custom themes from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('saaskit-custom-themes')
        if (stored) {
          setCustomThemes(JSON.parse(stored))
        }
      } catch (error) {
        console.warn('Failed to load custom themes from localStorage:', error)
      }
    }
  }, [])

  // Update theme config when theme changes
  useEffect(() => {
    const currentThemeId = `${theme}-${resolvedTheme || 'light'}`
    
    // Check for custom themes first
    const customTheme = customThemes.find(t => t.name === theme)
    
    const activeTheme = customTheme || 
                       getThemeById(currentThemeId) || 
                       getThemeById(`default-${resolvedTheme || 'light'}`) ||
                       predefinedThemes[0]!

    const brandColors = createBrandPalette(activeTheme.colors.primary)

    setThemeConfig({
      currentTheme: activeTheme,
      brandColors,
      isCustomTheme: !!customTheme,
      isAnimated: activeTheme.features?.animations ?? true,
      features: {
        glassmorphism: activeTheme.features?.glassmorphism ?? true,
        animations: activeTheme.features?.animations ?? true,
        highContrast: activeTheme.features?.highContrast ?? false,
      }
    })
  }, [theme, resolvedTheme, customThemes])

  // Apply CSS variables for dynamic theming
  useEffect(() => {
    if (!themeConfig.currentTheme || typeof window === 'undefined') return

    const root = document.documentElement
    const theme = themeConfig.currentTheme
    const colors = themeConfig.brandColors

    if (colors) {
      // Apply dynamic brand colors
      root.style.setProperty('--brand-primary', colors.primary)
      root.style.setProperty('--brand-secondary', colors.secondary)
      root.style.setProperty('--brand-accent', colors.accent)
      root.style.setProperty('--brand-success', colors.success)
      root.style.setProperty('--brand-warning', colors.warning)
      root.style.setProperty('--brand-error', colors.error)
      root.style.setProperty('--brand-info', colors.info)
    }

    // Apply feature toggles
    root.style.setProperty('--glassmorphism-enabled', theme.features?.glassmorphism ? '1' : '0')
    root.style.setProperty('--animations-enabled', theme.features?.animations ? '1' : '0')
    root.style.setProperty('--high-contrast-enabled', theme.features?.highContrast ? '1' : '0')

    // Apply theme-specific CSS classes
    const body = document.body
    body.classList.toggle('theme-high-contrast', theme.features?.highContrast ?? false)
    body.classList.toggle('theme-no-animations', !(theme.features?.animations ?? true))
    body.classList.toggle('theme-no-glassmorphism', !(theme.features?.glassmorphism ?? true))
  }, [themeConfig])

  // Create a custom theme
  const createCustomTheme = useCallback((config: Omit<ThemeConfig, 'id'>) => {
    const customTheme: ThemeConfig = {
      ...config,
      id: `custom-${Date.now()}`,
    }

    const updatedCustomThemes = [...customThemes, customTheme]
    setCustomThemes(updatedCustomThemes)
    
    // Save to localStorage
    try {
      localStorage.setItem('saaskit-custom-themes', JSON.stringify(updatedCustomThemes))
    } catch (error) {
      console.warn('Failed to save custom theme to localStorage:', error)
    }

    return customTheme
  }, [customThemes])

  // Switch to a predefined theme
  const switchToPredefinedTheme = useCallback((themeId: string) => {
    const targetTheme = predefinedThemes.find(t => t.id === themeId)
    if (targetTheme) {
      setTheme(targetTheme.name)
    }
  }, [setTheme])

  // Switch to a custom theme
  const switchToCustomTheme = useCallback((themeConfig: ThemeConfig) => {
    setTheme(themeConfig.name)
  }, [setTheme])

  // Delete a custom theme
  const deleteCustomTheme = useCallback((themeId: string) => {
    const updatedCustomThemes = customThemes.filter(t => t.id !== themeId)
    setCustomThemes(updatedCustomThemes)
    
    try {
      localStorage.setItem('saaskit-custom-themes', JSON.stringify(updatedCustomThemes))
    } catch (error) {
      console.warn('Failed to update custom themes in localStorage:', error)
    }
  }, [customThemes])

  // Get available themes for the current mode
  const availableThemes = useMemo(() => {
    const mode = resolvedTheme === 'dark' ? 'dark' : 'light'
    const predefined = predefinedThemes.filter(t => t.mode === mode || t.mode === 'auto')
    const custom = customThemes.filter(t => t.mode === mode || t.mode === 'auto')
    return [...predefined, ...custom]
  }, [resolvedTheme, customThemes])

  // Toggle specific features
  const toggleFeature = useCallback((feature: keyof ThemeConfigState['features']) => {
    if (!themeConfig.currentTheme) return

    const updatedTheme: ThemeConfig = {
      ...themeConfig.currentTheme,
      features: {
        ...themeConfig.currentTheme.features,
        [feature]: !themeConfig.currentTheme.features?.[feature]
      }
    }

    if (themeConfig.isCustomTheme) {
      // Update custom theme
      const updatedCustomThemes = customThemes.map(t => 
        t.id === updatedTheme.id ? updatedTheme : t
      )
      setCustomThemes(updatedCustomThemes)
      
      try {
        localStorage.setItem('saaskit-custom-themes', JSON.stringify(updatedCustomThemes))
      } catch (error) {
        console.warn('Failed to update custom theme in localStorage:', error)
      }
    }
  }, [themeConfig, customThemes])

  return {
    // Current state
    ...themeConfig,
    resolvedTheme,
    theme,
    
    // Available options
    availableThemes,
    predefinedThemes,
    customThemes,
    
    // Actions
    setTheme,
    switchToPredefinedTheme,
    switchToCustomTheme,
    createCustomTheme,
    deleteCustomTheme,
    toggleFeature,
  }
} 