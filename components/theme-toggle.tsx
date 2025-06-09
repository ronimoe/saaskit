"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Monitor, Palette } from "lucide-react"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ]

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Palette className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme:</span>
        <div className="flex space-x-1">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            return (
              <Button
                key={themeOption.value}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Icon className="h-3 w-3 mr-1" />
                {themeOption.name}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Palette className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme:</span>
      <div className="flex space-x-1">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          return (
            <Button
              key={themeOption.value}
              variant={theme === themeOption.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(themeOption.value)}
              className="h-8 px-3"
            >
              <Icon className="h-3 w-3 mr-1" />
              {themeOption.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
} 