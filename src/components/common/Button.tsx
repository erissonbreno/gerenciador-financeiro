import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent'
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer'
  const variants: Record<string, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400',
    secondary: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50 focus:ring-primary-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400',
  }

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
