'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  CheckCircle, 
  CreditCard, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

interface MockupState {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  screens: {
    desktop: string
    mobile: string
    tablet?: string
  }
  color: string
}

const mockupStates: MockupState[] = [
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    description: 'Real-time insights and beautiful visualizations',
    icon: BarChart3,
    screens: {
      desktop: 'dashboard-desktop',
      mobile: 'dashboard-mobile'
    },
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'auth',
    title: 'Secure Authentication',
    description: 'Multi-factor auth with social login options',
    icon: Shield,
    screens: {
      desktop: 'auth-desktop',
      mobile: 'auth-mobile'
    },
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'payments',
    title: 'Payment Processing',
    description: 'Stripe integration with subscription management',
    icon: CreditCard,
    screens: {
      desktop: 'payments-desktop',
      mobile: 'payments-mobile'
    },
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Built-in tools for team management',
    icon: Users,
    screens: {
      desktop: 'team-desktop',
      mobile: 'team-mobile'
    },
    color: 'from-orange-500 to-red-600'
  }
]

interface AnimatedProductMockupProps {
  className?: string
  autoPlay?: boolean
  interval?: number
}

const MockupScreen = ({ 
  state, 
  device, 
  isActive 
}: { 
  state: MockupState
  device: 'desktop' | 'mobile' | 'tablet'
  isActive: boolean 
}) => {
  const DeviceIcon = device === 'desktop' ? Monitor : device === 'mobile' ? Smartphone : Tablet
  const StateIcon = state.icon

  const renderContent = () => {
    switch (state.id) {
      case 'dashboard':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-white">Analytics Overview</div>
              <div className="text-xs text-green-400">●︎ Live</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded opacity-90 animate-pulse"></div>
              <div className="h-10 bg-gradient-to-t from-purple-500 to-pink-400 rounded opacity-90 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-6 bg-gradient-to-t from-green-500 to-emerald-400 rounded opacity-90 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="h-9 bg-gradient-to-t from-orange-500 to-yellow-400 rounded opacity-90 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Revenue</span>
                <span className="text-green-400">+12.5%</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        )
      
      case 'auth':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-white">Secure Login</span>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-slate-700 rounded border border-slate-600"></div>
              <div className="h-6 bg-slate-700 rounded border border-slate-600"></div>
              <div className="h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                Sign In Securely
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>2FA Enabled</span>
            </div>
          </div>
        )
      
      case 'payments':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-white">Payment Portal</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Pro Plan</span>
                <span className="text-white font-medium">$29/mo</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <div className="text-xs text-purple-400">Payment processing...</div>
            </div>
          </div>
        )
      
      case 'collaboration':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-white">Team Dashboard</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <div className="text-xs text-slate-300">Alice Johnson</div>
                <div className="text-xs text-green-400">Online</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="text-xs text-slate-300">Bob Smith</div>
                <div className="text-xs text-yellow-400">Away</div>
              </div>
              <div className="text-xs text-orange-400">3 team members active</div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (device === 'desktop') {
    return (
      <div className={cn(
        "relative bg-slate-900 rounded-lg shadow-2xl transition-all duration-700 transform",
        isActive ? "scale-100 opacity-100 z-10" : "scale-95 opacity-60 z-0"
      )}>
        {/* Desktop Frame */}
        <div className="bg-slate-800 px-4 py-2 rounded-t-lg border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-slate-400 ml-2">saaskit-demo.com</div>
          </div>
        </div>
        
        {/* Desktop Content */}
        <div className="p-6 h-32">
          {renderContent()}
        </div>
      </div>
    )
  }

  if (device === 'mobile') {
    return (
      <div className={cn(
        "relative bg-slate-900 rounded-2xl shadow-xl transition-all duration-700 transform border-4 border-slate-700",
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-60"
      )}>
        {/* Mobile Frame */}
        <div className="bg-slate-800 h-6 rounded-t-2xl flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>
        
        {/* Mobile Content */}
        <div className="p-3 h-24">
          {renderContent()}
        </div>
        
        {/* Mobile Home Indicator */}
        <div className="h-4 flex items-center justify-center">
          <div className="w-8 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return null
}

export function AnimatedProductMockup({
  className,
  autoPlay = true,
  interval = 4000
}: AnimatedProductMockupProps) {
  const [currentState, setCurrentState] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentState((prev) => (prev + 1) % mockupStates.length)
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, interval])

  const currentMockup = mockupStates[currentState] || mockupStates[0]

  if (!currentMockup) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      {/* Feature Indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-700">
          <currentMockup.icon className="w-5 h-5 text-white" />
          <div>
            <div className="text-sm font-medium text-white">{currentMockup.title}</div>
            <div className="text-xs text-slate-400">{currentMockup.description}</div>
          </div>
        </div>
      </div>

      {/* Device Mockups */}
      <div className="relative flex items-start justify-center gap-8">
        {/* Desktop Mockup */}
        <div className="relative">
          <MockupScreen 
            state={currentMockup}
            device="desktop"
            isActive={true}
          />
          
          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Mobile Mockup */}
        <div className="relative">
          <MockupScreen 
            state={currentMockup}
            device="mobile"
            isActive={true}
          />
          
          {/* Connection Line */}
          <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-gradient-to-r from-slate-600 to-transparent"></div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {mockupStates.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentState(index)
              setIsPlaying(false)
              setTimeout(() => setIsPlaying(autoPlay), 1000)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentState === index 
                ? "bg-blue-500 w-8" 
                : "bg-slate-600 hover:bg-slate-500"
            )}
          />
        ))}
      </div>

      {/* Feature Icons Floating */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 opacity-20">
          <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        <div className="absolute top-20 right-16 opacity-20">
          <Globe className="w-6 h-6 text-blue-400 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-16 left-16 opacity-20">
          <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 -z-10 blur-3xl opacity-30 transition-all duration-1000",
        `bg-gradient-to-br ${currentMockup.color}`
      )}></div>
    </div>
  )
}

AnimatedProductMockup.displayName = 'AnimatedProductMockup' 