
export function PosterSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="aspect-[2/3] bg-zinc-800 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-700 rounded animate-pulse" />
        <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  )
}

export function LibraryItemSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4">
      <div className="w-16 h-24 bg-zinc-800 rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-zinc-700 rounded animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
      </div>
      <div className="w-24 h-6 bg-zinc-800 rounded animate-pulse" />
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      <div className="space-y-4">
        <div className="aspect-[2/3] bg-zinc-800 rounded-2xl animate-pulse" />
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="h-4 bg-zinc-700 rounded animate-pulse" />
          <div className="h-8 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-10 bg-zinc-700 rounded animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-1/3 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
