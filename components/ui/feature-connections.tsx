'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Connection {
  from: string // feature id
  to: string // feature id
  type: 'flow' | 'dependency' | 'integration'
  color?: string
  delay?: number
}

interface FeatureConnectionsProps {
  connections: Connection[]
  features: { id: string; title: string }[]
  className?: string
  animated?: boolean
  triggerAnimation?: boolean
}

interface Position {
  x: number
  y: number
  width: number
  height: number
}

export function FeatureConnections({
  connections,
  features,
  className,
  animated = true,
  triggerAnimation = false
}: FeatureConnectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, Position>>({})
  const [isVisible, setIsVisible] = useState(false)
  const [animationStarted, setAnimationStarted] = useState(false)

  // Calculate positions of feature cards
  useEffect(() => {
    if (!containerRef.current) return

    const updatePositions = () => {
      const container = containerRef.current
      if (!container) return

      const newPositions: Record<string, Position> = {}
      
      features.forEach(feature => {
        const element = document.getElementById(`feature-${feature.id}`)
        if (element && container) {
          const containerRect = container.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()
          
          newPositions[feature.id] = {
            x: elementRect.left - containerRect.left + elementRect.width / 2,
            y: elementRect.top - containerRect.top + elementRect.height / 2,
            width: elementRect.width,
            height: elementRect.height
          }
        }
      })
      
      setPositions(newPositions)
    }

    // Initial calculation with delay to ensure DOM is ready
    const timer = setTimeout(updatePositions, 100)

    // Update on window resize
    window.addEventListener('resize', updatePositions)
    
    // Use ResizeObserver for more precise tracking
    const resizeObserver = new ResizeObserver(updatePositions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePositions)
      resizeObserver.disconnect()
    }
  }, [features])

  // Trigger animation when component becomes visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting && !animationStarted) {
          setIsVisible(true)
          setAnimationStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [animationStarted])

  // Trigger animation on external trigger
  useEffect(() => {
    if (triggerAnimation) {
      setIsVisible(false)
      setAnimationStarted(false)
      setTimeout(() => {
        setIsVisible(true)
        setAnimationStarted(true)
      }, 100)
    }
  }, [triggerAnimation])

  const getConnectionPath = (from: Position, to: Position, type: Connection['type']) => {
    const startX = from.x
    const startY = from.y
    const endX = to.x
    const endY = to.y

    // Add some offset to avoid overlapping with card edges
    const offsetX = Math.sign(endX - startX) * 30
    const offsetY = Math.sign(endY - startY) * 30

    switch (type) {
      case 'flow':
        // Smooth curved path for flow connections
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const controlOffset = Math.min(Math.abs(endX - startX) * 0.3, 100)
        
        return `M ${startX + offsetX} ${startY + offsetY} Q ${midX + controlOffset} ${midY - controlOffset} ${endX - offsetX} ${endY - offsetY}`
      
      case 'dependency':
        // L-shaped path for dependencies
        const stepX = startX + (endX - startX) * 0.6
        return `M ${startX + offsetX} ${startY + offsetY} L ${stepX} ${startY + offsetY} L ${stepX} ${endY - offsetY} L ${endX - offsetX} ${endY - offsetY}`
      
      case 'integration':
        // Gentle arc for integrations
        const controlX = startX + (endX - startX) * 0.5
        const controlY = Math.min(startY, endY) - 50
        return `M ${startX + offsetX} ${startY + offsetY} Q ${controlX} ${controlY} ${endX - offsetX} ${endY - offsetY}`
      
      default:
        return `M ${startX + offsetX} ${startY + offsetY} L ${endX - offsetX} ${endY - offsetY}`
    }
  }

  const getConnectionColor = (type: Connection['type']) => {
    switch (type) {
      case 'flow':
        return '#3B82F6' // blue-500
      case 'dependency':
        return '#8B5CF6' // purple-500
      case 'integration':
        return '#10B981' // green-500
      default:
        return '#64748B' // slate-500
    }
  }

  const getPathLength = (path: string) => {
    // Approximate path length for animation timing
    const commands = path.split(/[MLQ]/)
    return commands.length * 100 // Rough estimate
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes drawPath {
          from {
            stroke-dashoffset: var(--path-length);
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.6;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            r: 3;
          }
          50% {
            opacity: 0.4;
            r: 5;
          }
        }

        .connection-path {
          opacity: 0;
          stroke-dasharray: var(--path-length);
          stroke-dashoffset: var(--path-length);
        }

        .connection-path.animate {
          animation: drawPath 2s ease-out forwards, fadeIn 0.5s ease-out forwards;
        }

        .connection-pulse {
          opacity: 0;
        }

        .connection-pulse.animate {
          animation: pulse 2s ease-in-out infinite;
          animation-delay: 2s;
          opacity: 0.8;
        }
      `}</style>

      <div 
        ref={containerRef}
        className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
        style={{ zIndex: 5 }}
      >
        {Object.keys(positions).length > 0 && (
          <svg 
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 5 }}
          >
            {/* Define arrow markers */}
            <defs>
              <marker
                id="arrowhead-blue"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill="#3B82F6"
                />
              </marker>
              <marker
                id="arrowhead-purple"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill="#8B5CF6"
                />
              </marker>
              <marker
                id="arrowhead-green"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill="#10B981"
                />
              </marker>
            </defs>

            {connections.map((connection, index) => {
              const fromPos = positions[connection.from]
              const toPos = positions[connection.to]
              
              if (!fromPos || !toPos) return null

              const path = getConnectionPath(fromPos, toPos, connection.type)
              const color = getConnectionColor(connection.type)
              const pathLength = getPathLength(path)
              const delay = (connection.delay || index * 0.3) * 1000 // Convert to ms

              const markerId = `arrowhead-${connection.type === 'flow' ? 'blue' : connection.type === 'dependency' ? 'purple' : 'green'}`

              return (
                <g key={`${connection.from}-${connection.to}`}>
                  {/* Connection line */}
                  <path
                    d={path}
                    className={cn(
                      "connection-path fill-none stroke-2",
                      animated && isVisible ? "animate" : ""
                    )}
                    stroke={color}
                    strokeWidth="2"
                    markerEnd={`url(#${markerId})`}
                    style={{
                      '--path-length': `${pathLength}px`,
                      animationDelay: `${delay}ms`
                    } as React.CSSProperties}
                  />

                  {/* Pulse dot */}
                  {animated && (
                    <circle
                      cx={(fromPos.x + toPos.x) / 2}
                      cy={(fromPos.y + toPos.y) / 2}
                      r="3"
                      fill={color}
                      className={cn(
                        "connection-pulse",
                        isVisible ? "animate" : ""
                      )}
                      style={{
                        animationDelay: `${delay + 2000}ms`
                      }}
                    />
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>
    </>
  )
}

FeatureConnections.displayName = 'FeatureConnections' 