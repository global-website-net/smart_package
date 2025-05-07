import React from 'react'

interface BalanceDisplayProps {
  amount: number
  className?: string
}

export default function BalanceDisplay({ amount, className = '' }: BalanceDisplayProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="font-bold text-4xl">{amount.toFixed(2)}</span>
      <span className="mr-2 font-bold text-4xl">₪</span>
    </div>
  )
} 