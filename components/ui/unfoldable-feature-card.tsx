'use client'

import { useState } from 'react'
import { MagneticGlassCard } from './magnetic-glass-card'
import { Button } from './button'
import { Badge } from './badge'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  Check, 
  ExternalLink,
  Play,
  Code,
  Sparkles,
  Monitor,
  Smartphone,
  CreditCard,
  Shield,
  Database
} from 'lucide-react'

interface FeatureHighlight {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

interface InteractivePreview {
  type: 'dashboard' | 'auth' | 'payment' | 'api' | 'mobile'
  title: string
  description: string
}

interface UnfoldableFeatureCardProps {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: string
  highlights: string[]
  status: string
  extendedDescription?: string
  featureHighlights?: FeatureHighlight[]
  interactivePreview?: InteractivePreview
  codeExample?: string
  demoUrl?: string
  className?: string
  magnetic?: boolean
  magneticStrength?: number
  magneticGlow?: boolean
}

const getPreviewIcon = (type: InteractivePreview['type']) => {
  const icons = {
    dashboard: Monitor,
    auth: Shield,
    payment: CreditCard,
    api: Code,
    mobile: Smartphone
  }
  return icons[type] || Monitor
}

const renderInteractivePreview = (preview: InteractivePreview) => {
  const PreviewIcon = getPreviewIcon(preview.type)
  
  switch (preview.type) {
    case 'dashboard':
      return (
        <div className="relative bg-slate-900 dark:bg-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-slate-800 dark:bg-slate-700 border-b border-slate-700">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-slate-400 ml-2">Dashboard Preview</div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white">Analytics Overview</div>
              <div className="text-xs text-green-400">Live</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded opacity-80"></div>
              <div className="h-10 bg-gradient-to-r from-purple-500 to-pink-400 rounded opacity-80"></div>
              <div className="h-6 bg-gradient-to-r from-green-500 to-emerald-400 rounded opacity-80"></div>
            </div>
            <div className="text-xs text-slate-300">Real-time data visualization</div>
          </div>
        </div>
      )
    
    case 'auth':
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Secure Authentication</span>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded border"></div>
            <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded border"></div>
            <div className="h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
              Sign In Securely
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Check className="w-3 h-3 text-green-500" />
            <span>Multi-factor authentication enabled</span>
          </div>
        </div>
      )
    
    case 'payment':
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Payment Processing</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Subscription Plan</span>
              <span className="font-medium">$29/month</span>
            </div>
            <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Payment processed successfully</div>
          </div>
        </div>
      )
    
    case 'api':
      return (
        <div className="bg-slate-900 dark:bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-800 dark:bg-slate-700 border-b border-slate-700">
            <div className="text-xs text-slate-400">API Response</div>
          </div>
          <div className="p-3 text-xs font-mono text-green-400 space-y-1">
            <div>{"{"}</div>
            <div className="ml-2">"status": "success",</div>
            <div className="ml-2">"data": {"{"}</div>
            <div className="ml-4">"users": 1247,</div>
            <div className="ml-4">"active": 892</div>
            <div className="ml-2">{"}"}</div>
            <div>{"}"}</div>
          </div>
        </div>
      )
    
    case 'mobile':
      return (
        <div className="flex justify-center">
          <div className="w-20 h-36 bg-slate-900 dark:bg-slate-800 rounded-lg border-4 border-slate-700 overflow-hidden">
            <div className="h-6 bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-600 rounded-full"></div>
            </div>
            <div className="p-2 space-y-2">
              <div className="h-4 bg-blue-500 rounded"></div>
              <div className="space-y-1">
                <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
              </div>
              <div className="h-6 bg-green-500 rounded text-white text-[6px] flex items-center justify-center">
                Mobile Optimized
              </div>
            </div>
          </div>
        </div>
      )
    
    default:
      return null
  }
}

export function UnfoldableFeatureCard({
  id,
  title,
  description,
  icon: Icon,
  color,
  category,
  highlights,
  status,
  extendedDescription,
  featureHighlights = [],
  interactivePreview,
  codeExample,
  demoUrl,
  className,
  magnetic = true,
  magneticStrength = 0.2,
  magneticGlow = false,
  ...props
}: UnfoldableFeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <MagneticGlassCard
      id={id}
      variant="primary"
      size="md"
      depth="medium"
      glow="medium"
      interactive="hover"
      magnetic={magnetic}
      magneticStrength={magneticStrength}
      magneticGlow={magneticGlow}
      className={cn(
        'group relative transition-all duration-500 ease-out',
        isExpanded ? 'md:col-span-2 md:row-span-2' : '',
        className
      )}
      {...props}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge 
          variant={status === 'Available' ? 'default' : 'secondary'}
          className={`text-xs ${
            status === 'Available' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          }`}
        >
          {status}
        </Badge>
      </div>
      
      <div className="relative p-6">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Icon and Category */}
          <div className="flex items-start justify-between">
            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronDown 
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )} 
              />
            </Button>
          </div>
          
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {category}
          </div>
          
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {title}
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Basic Highlights */}
          <div className="space-y-2">
            {highlights.slice(0, 2).map((highlight, idx) => (
              <div key={idx} className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Check className="w-3 h-3 mr-2 text-green-500 shrink-0" />
                {highlight}
              </div>
            ))}
            {highlights.length > 2 && !isExpanded && (
              <div className="text-xs text-slate-400">
                +{highlights.length - 2} more features
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-[800px] opacity-100 mt-6" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-6">
            {/* Extended Description */}
            {extendedDescription && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {extendedDescription}
                </p>
              </div>
            )}

            {/* All Highlights */}
            {highlights.length > 2 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">All Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Check className="w-3 h-3 mr-2 text-green-500 shrink-0" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Highlights */}
            {featureHighlights.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Key Capabilities:</h4>
                <div className="space-y-3">
                  {featureHighlights.map((feature, idx) => {
                    const FeatureIcon = feature.icon || Sparkles
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <FeatureIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Interactive Preview */}
            {interactivePreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Interactive Preview:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-7 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {showPreview ? 'Hide' : 'Show'} Demo
                  </Button>
                </div>
                
                <div className={cn(
                  "transition-all duration-300 ease-out overflow-hidden",
                  showPreview ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {interactivePreview.title}
                    </div>
                    {renderInteractivePreview(interactivePreview)}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {interactivePreview.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Code Example */}
            {codeExample && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Code Example:</h4>
                <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {demoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Live Demo
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Code className="w-3 h-3 mr-1" />
                View Docs
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
    </MagneticGlassCard>
  )
}

UnfoldableFeatureCard.displayName = 'UnfoldableFeatureCard' 