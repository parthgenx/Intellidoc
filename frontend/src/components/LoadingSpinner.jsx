import React from 'react'

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-[2.5px]',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-[color:var(--color-accent)] border-r-transparent shadow-[0_0_0_1px_rgba(231,111,81,0.12)]`}
      />
      {message && (
        <p className="text-sm leading-6 text-[color:var(--color-text-muted)]">
          {message}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
