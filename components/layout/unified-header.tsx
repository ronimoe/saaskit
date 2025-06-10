"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuthContext } from '@/components/providers/auth-provider'
import { 
  Code2, 
  LogIn, 
  UserPlus, 
  Menu, 
  User, 
  Settings, 
  Bell, 
  Home, 
  BarChart3, 
  CreditCard,
  HelpCircle,
  LogOut,
  Search,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for header configuration
export type HeaderVariant = 'landing' | 'auth' | 'app'

export interface HeaderConfig {
  variant: HeaderVariant
  showNavigation?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
  className?: string
}

// UnifiedHeaderProps is just HeaderConfig
type UnifiedHeaderProps = HeaderConfig

// Navigation items for different states
const landingNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/features', label: 'Features', icon: Zap },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/docs', label: 'Docs', icon: HelpCircle },
]

const appNavItems = [
  { href: '/profile', label: 'Dashboard', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
]

// Logo component  
function Logo() {
  const linkClass = "flex items-center space-x-3 hover:opacity-80 transition-opacity"
  
  return (
    <Link href="/" className={linkClass}>
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
        <Code2 className="w-6 h-6 text-white" />
      </div>
      <div className="hidden sm:block">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          SaaS Kit
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 hidden md:block">
          Modern SaaS Platform
        </p>
      </div>
    </Link>
  )
}

// Pre-auth navigation (Landing/Marketing pages)
function PreAuthHeader({ showNavigation = true, className }: HeaderConfig) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { isAuthenticated, signOut } = useAuthContext()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
  
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo />
        
        {showNavigation && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {landingNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            
            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-6">
                  {landingNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  <Separator className="my-4" />
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsOpen(false)
                        }}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-red-600 dark:text-red-400 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up</span>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </>
        )}
        
        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                className="gap-2" 
                asChild
              >
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                className="gap-2" 
                asChild
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all" 
                asChild
              >
                <Link href="/signup">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

// Auth pages header (Login/Register)
function AuthHeader({ className }: HeaderConfig) {
  const pathname = usePathname()
  const { isAuthenticated, signOut } = useAuthContext()
  const router = useRouter()
  const currentPath = pathname || ''
  const isSignupFlow = currentPath.includes('signup')

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
  
  return (
    <header className={cn("w-full", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo />
        
        {/* Minimal navigation for auth pages */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Already signed in
              </span>
              <Button 
                size="sm" 
                variant="ghost"
                className="gap-2" 
                asChild
              >
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isSignupFlow ? 'Already have an account?' : 'Need an account?'}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={isSignupFlow ? '/login' : '/signup'}>
                  {isSignupFlow ? 'Sign In' : 'Sign Up'}
                </Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

// Post-auth header (Dashboard/App)
function AppHeader({ showSearch = true, showNotifications = true, className }: HeaderConfig) {
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const currentPath = pathname || ''
  
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
  
  // Get user initials for avatar fallback
  const getInitials = (email: string | undefined) => {
    if (!email) return 'U'
    return email.split('@')[0]?.substring(0, 2).toUpperCase() || 'U'
  }
  
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {appNavItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          {showSearch && (
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search...</span>
            </Button>
          )}
          
          {/* Notifications */}
          {showNotifications && (
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          )}
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-3 mt-6">
                {appNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <Separator className="my-4" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-red-600 dark:text-red-400 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

// Main UnifiedHeader component
export function UnifiedHeader(props: UnifiedHeaderProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthContext()
  const pathname = usePathname()
  
  // Don't render during loading
  if (!isInitialized || isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg animate-pulse" />
            <div className="hidden sm:block space-y-1">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }
  
  // Determine header variant based on auth state and current path
  let variant: HeaderVariant = props.variant || 'landing'
  const currentPath = pathname || ''
  
  if (!props.variant) {
    if (isAuthenticated) {
      // Check if we're on an auth page while authenticated
      if (currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes('/reset-password')) {
        variant = 'auth'
      } else {
        variant = 'app'
      }
    } else {
      // Check if we're on an auth page
      if (currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes('/reset-password')) {
        variant = 'auth'
      } else {
        variant = 'landing'
      }
    }
  }
  
  // Render appropriate header variant
  switch (variant) {
    case 'auth':
      return <AuthHeader {...props} variant={variant} />
    case 'app':
      return <AppHeader {...props} variant={variant} />
    case 'landing':
    default:
      return <PreAuthHeader {...props} variant={variant} />
  }
}

// Export individual header components for specific use cases
export { PreAuthHeader, AuthHeader, AppHeader } 