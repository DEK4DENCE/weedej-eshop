export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#DEE2E6] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-52 bg-[#DEE2E6]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#DEE2E6] rounded w-3/4" />
        <div className="h-3 bg-[#DEE2E6] rounded w-1/2" />
        <div className="h-8 bg-[#DEE2E6] rounded w-full mt-2" />
      </div>
    </div>
  )
}
