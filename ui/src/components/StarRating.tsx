import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

type Props = {
  rating: number | null
  onChange: (rating: number | null) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export default function StarRating({ rating, onChange, size = 'md', readonly = false }: Props) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6'
  }

  const displayRating = hoverRating ?? rating ?? 0

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const isHalf = (e.clientX - rect.left) < rect.width / 2
    const next = starIndex + (isHalf ? 0.5 : 1)
    setHoverRating(next)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const isHalf = (e.clientX - rect.left) < rect.width / 2
    const next = starIndex + (isHalf ? 0.5 : 1)
    onChange(next === rating ? null : next)
  }

  const handleLeaveAll = () => {
    if (readonly) return
    setHoverRating(null)
  }

  return (
    <div className="flex items-center gap-1 select-none" onMouseLeave={handleLeaveAll}>
      {Array.from({ length: 10 }, (_, i) => {
        const starIndex = i
        const fill = Math.max(0, Math.min(1, displayRating - starIndex))

        return (
          <div
            key={i}
            className="relative cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onClick={(e) => handleClick(e, starIndex)}
          >
            {/* Background star */}
            <StarIcon className={`${sizeClasses[size]} text-zinc-600`} />
            {/* Filled star (fractional via width clip) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarSolidIcon className={`${sizeClasses[size]} text-amber-400`} />
            </div>
          </div>
        )
      })}

      {displayRating > 0 && (
        <span className="ml-2 text-sm text-zinc-400 min-w-[2rem]">
          {displayRating.toFixed(1)}
        </span>
      )}

      {!readonly && rating !== null && (
        <button
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
