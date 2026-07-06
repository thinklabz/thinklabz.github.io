export default function Skeleton() {
  return (
    <div className="bg-secondary/30 border border-border/20 rounded-xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 w-full bg-muted" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded w-3/4" />
        
        {/* Category and month badges */}
        <div className="flex items-center gap-2">
          <div className="h-6 bg-muted rounded-full w-16" />
          <div className="h-6 bg-muted rounded-full w-16" />
        </div>
        
        {/* Date skeleton */}
        <div className="h-4 bg-muted rounded w-1/2" />
        
        {/* Buttons skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-10 bg-muted rounded flex-1" />
          <div className="h-10 bg-muted rounded flex-1" />
        </div>
      </div>
    </div>
  )
}
