interface ProductBadgeProps {
  stock: number
  className?: string
}

export function ProductBadge({ stock, className = '' }: ProductBadgeProps) {
  if (stock === 0) {
    return (
      <span
        className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#2D0E0E] text-[#E53E3E] font-mono ${className}`}
      >
        Out of Stock
      </span>
    )
  }

  if (stock <= 5) {
    return (
      <span
        className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#2E2200] text-[#F5B800] font-mono ${className}`}
      >
        Low Stock ({stock} left)
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#0D2000] border border-[#1A6B1D] text-[#22A829] font-mono ${className}`}
    >
      In Stock
    </span>
  )
}
