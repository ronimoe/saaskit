import { cn } from "@/lib/utils"

function Skeleton({
  className,
  role = "presentation",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      role={role}
      {...props}
    />
  )
}

export { Skeleton } 