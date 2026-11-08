/**
 * LoadingPlaceholder — grey rounded blocks for card, row and block shapes.
 * T-C-7
 */
import React from 'react'

export type PlaceholderShape = 'card' | 'row' | 'block'

export interface LoadingPlaceholderProps {
  shape: PlaceholderShape
  count?: number
}

function shimmerClass() {
  return 'animate-pulse bg-[#E5E7EB] rounded'
}

function CardPlaceholder() {
  return (
    <div className={`${shimmerClass()} rounded-card h-24 w-full`} />
  )
}

function RowPlaceholder() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`${shimmerClass()} h-10 w-10 rounded-full flex-shrink-0`} />
      <div className="flex-1 flex flex-col gap-2">
        <div className={`${shimmerClass()} h-4 w-3/4`} />
        <div className={`${shimmerClass()} h-3 w-1/2`} />
      </div>
    </div>
  )
}

function BlockPlaceholder() {
  return (
    <div className={`${shimmerClass()} h-16 w-full rounded-card`} />
  )
}

const shapeMap: Record<PlaceholderShape, React.FC> = {
  card:  CardPlaceholder,
  row:   RowPlaceholder,
  block: BlockPlaceholder,
}

export function LoadingPlaceholder({ shape, count = 1 }: LoadingPlaceholderProps) {
  const Component = shapeMap[shape]
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading…">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

