export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6 h-8 w-48 bg-[#DEE2E6] rounded-lg animate-pulse" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white border border-[#DEE2E6] rounded-2xl p-4 space-y-3">
            <div className="h-4 w-24 bg-[#DEE2E6] rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-[#F8F9FA] rounded-lg animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#DEE2E6] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-square bg-[#F8F9FA] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#DEE2E6] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[#F8F9FA] rounded animate-pulse w-1/2" />
                  <div className="h-5 bg-[#DEE2E6] rounded animate-pulse w-1/3 mt-2" />
                  <div className="h-9 bg-[#F8F9FA] rounded-xl animate-pulse mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
