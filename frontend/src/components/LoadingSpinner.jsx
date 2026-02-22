// LoadingSpinner.jsx
// A reusable loading spinner component that can be used anywhere in the app

import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - message: Optional text to show below spinner
 */
const LoadingSpinner = ({ size = 'md', message = '' }) => {
    // Define sizes for the spinner
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            {/* The spinning circle */}
            <div
                className={`
          ${sizeClasses[size]}
          border-purple-500 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
            />

            {/* Optional message below spinner */}
            {message && (
                <p className="text-sm text-gray-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
