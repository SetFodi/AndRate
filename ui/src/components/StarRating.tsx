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
  
  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (readonly) return
    const newRating = starIndex + (isHalf ? 0.5 : 1)
    onChange(newRating === rating ? null : newRating)
  }
  
  const handleMouseEnter = (starIndex: number, isHalf: boolean) => {
    if (readonly) return
    setHoverRating(starIndex + (isHalf ? 0.5 : 1))
  }
  
  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(null)
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => {
        const starIndex = i
        const starValue = starIndex + 1
        const halfValue = starIndex + 0.5
        
        const isFullFilled = displayRating >= starValue
        const isHalfFilled = displayRating >= halfValue && displayRating < starValue
        
        return (
          <div key={i} className="relative cursor-pointer" onMouseLeave={handleMouseLeave}>
            {/* Background star */}
            <StarIcon className={`${sizeClasses[size]} text-zinc-600`} />
            
            {/* Half star overlay */}
            <div
              className="absolute inset-0 w-1/2 overflow-hidden"
              onClick={() => handleClick(starIndex, true)}
              onMouseEnter={() => handleMouseEnter(starIndex, true)}
            >
              <StarSolidIcon 
                className={`${sizeClasses[size]} transition-colors ${
                  isHalfFilled || isFullFilled ? 'text-amber-400' : 'text-transparent'
                } ${!readonly && 'hover:text-amber-300'}`} 
              />
            </div>
            
            {/* Full star overlay */}
            <div
              className="absolute inset-0 w-1/2 left-1/2 overflow-hidden"
              onClick={() => handleClick(starIndex, false)}
              onMouseEnter={() => handleMouseEnter(starIndex, false)}
            >
              <StarSolidIcon 
                className={`${sizeClasses[size]} -translate-x-1/2 transition-colors ${
                  isFullFilled ? 'text-amber-400' : 'text-transparent'
                } ${!readonly && 'hover:text-amber-300'}`} 
              />
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
