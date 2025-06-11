"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Eye,
  Sparkles,
  Contrast,
  Zap,
  Settings2,
  Check
} from "lucide-react"
import { useThemeConfig } from "@/lib/hooks/use-theme-config"
import { cn } from "@/lib/utils"

interface ThemePreviewProps {
  colors: {
    primary: string
    secondary?: string
    accent?: string
  }
  name: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

function ThemePreview({ colors, name, isActive, onClick, className }: ThemePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
        "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring",
        isActive && "bg-muted/80 ring-2 ring-primary",
        className
      )}
    >
      {/* Color preview */}
      <div className="flex gap-1.5">
        <div 
          className="w-4 h-4 rounded-full border border-border/50"
          style={{ backgroundColor: colors.primary }}
        />
        {colors.secondary && (
          <div 
            className="w-4 h-4 rounded-full border border-border/50"
            style={{ backgroundColor: colors.secondary }}
          />
        )}
        {colors.accent && (
          <div 
            className="w-4 h-4 rounded-full border border-border/50"
            style={{ backgroundColor: colors.accent }}
          />
        )}
      </div>
      
      {/* Theme name */}
      <span className="text-sm font-medium">{name}</span>
      
      {/* Active indicator */}
      {isActive && (
        <Check className="w-4 h-4 ml-auto text-primary" />
      )}
    </button>
  )
}

export function EnhancedThemeToggle() {
  const {
    currentTheme,
    availableThemes,
    features,
    switchToPredefinedTheme,
    toggleFeature,
    theme,
    resolvedTheme
  } = useThemeConfig()
  
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getCurrentIcon = () => {
    if (theme === 'system') return Monitor
    if (resolvedTheme === 'dark') return Moon
    return Sun
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <CurrentIcon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200" />
          {currentTheme?.name !== 'light' && currentTheme?.name !== 'dark' && currentTheme?.name !== 'system' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
          )}
          <span className="sr-only">Open theme menu</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-2">
        {/* Basic theme modes */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Theme Settings
        </DropdownMenuLabel>
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => switchToPredefinedTheme('default-light')}>
            <Sun className="mr-2 h-4 w-4" />
            Light
            {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchToPredefinedTheme('default-dark')}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
            {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchToPredefinedTheme('default-light')}>
            <Monitor className="mr-2 h-4 w-4" />
            System
            {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Color themes */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Color Themes
        </DropdownMenuLabel>
        
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {availableThemes
            .filter(t => t.id.includes('light') && !t.id.includes('default') && !t.id.includes('high-contrast'))
            .map((themeConfig) => (
            <ThemePreview
              key={themeConfig.id}
              colors={themeConfig.colors}
              name={themeConfig.displayName}
              isActive={currentTheme?.id === themeConfig.id}
              onClick={() => switchToPredefinedTheme(themeConfig.id)}
            />
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Accessibility themes */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Accessibility
        </DropdownMenuLabel>
        
        <ThemePreview
          colors={{ primary: 'oklch(0.1 0 0)' }}
          name="High Contrast"
          isActive={currentTheme?.features?.highContrast}
          onClick={() => switchToPredefinedTheme('high-contrast-light')}
        />
        
        <DropdownMenuSeparator />
        
        {/* Feature toggles */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Features
        </DropdownMenuLabel>
        
        <div className="space-y-3 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Glassmorphism</span>
            </div>
            <Switch
              checked={features.glassmorphism}
              onCheckedChange={() => toggleFeature('glassmorphism')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Animations</span>
            </div>
            <Switch
              checked={features.animations}
              onCheckedChange={() => toggleFeature('animations')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">High Contrast</span>
            </div>
            <Switch
              checked={features.highContrast}
              onCheckedChange={() => toggleFeature('highContrast')}
            />
          </div>
        </div>
        
        {/* Current theme info */}
        {currentTheme && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">Current Theme</div>
              <Badge variant="outline" className="text-xs">
                {currentTheme.displayName}
              </Badge>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for smaller spaces
export function CompactThemeToggle() {
  const { switchToPredefinedTheme, theme, resolvedTheme } = useThemeConfig()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const handleToggle = () => {
    if (resolvedTheme === 'dark') {
      switchToPredefinedTheme('default-light')
    } else {
      switchToPredefinedTheme('default-dark')
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 