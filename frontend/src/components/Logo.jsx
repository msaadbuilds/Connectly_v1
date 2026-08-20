import React, { useId } from 'react'

const SIZES = {
  sm: { icon: 34, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 42, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 58, text: 'text-3xl', gap: 'gap-3' },
  xl: { icon: 84, text: 'text-4xl sm:text-5xl', gap: 'gap-4' },
}

export const LogoMark = ({ size = 42, className = '' }) => {
  const gradId = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_10px_rgba(155,92,255,0.45)] ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6E5BFA" />
          <stop offset="55%" stopColor="#9B5CFF" />
          <stop offset="100%" stopColor="#D054E8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="26" fill={`url(#${gradId})`} />
      <g stroke="white" strokeWidth="8.5" strokeLinecap="round" fill="none">
        <rect x="-22" y="-10" width="44" height="20" rx="10" transform="translate(41 41) rotate(-45)" />
        <rect x="-22" y="-10" width="44" height="20" rx="10" transform="translate(59 59) rotate(-45)" />
      </g>
    </svg>
  )
}

/**
 * Connectly brand logo.
 * variant: "mark" (icon only) | "full" (icon + wordmark)
 * size: "sm" | "md" | "lg" | "xl"
 * stacked: lay icon above wordmark instead of side-by-side
 * withTagline: show the "Chat Anytime, Anywhere" tagline under the wordmark
 */
const Logo = ({ variant = 'full', size = 'md', stacked = false, withTagline = false, className = '' }) => {
  const s = SIZES[size] || SIZES.md

  if (variant === 'mark') {
    return <LogoMark size={s.icon} className={className} />
  }

  return (
    <div className={`flex flex-col ${stacked ? 'items-center' : ''} ${className}`}>
      <div className={`flex ${stacked ? 'flex-col' : 'flex-row'} items-center ${s.gap}`}>
        <LogoMark size={s.icon} />
        <span
          className={`${s.text} font-bold tracking-tight bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent`}
        >
          Connectly
        </span>
      </div>
      {withTagline && (
        <p className="text-sm text-gray-400 mt-3 tracking-wide text-center">
          Chat Anytime, Anywhere
        </p>
      )}
    </div>
  )
}

export default Logo
