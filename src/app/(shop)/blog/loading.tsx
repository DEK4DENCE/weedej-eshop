export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="h-10 w-24 bg-[#DEE2E6] rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-[#F8F9FA] rounded animate-pulse mb-10" />

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#DEE2E6] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="h-48 bg-[#F8F9FA] animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-[#DEE2E6] rounded animate-pulse w-3/4" />
              <div className="h-3 bg-[#F8F9FA] rounded animate-pulse" />
              <div className="h-3 bg-[#F8F9FA] rounded animate-pulse w-4/5" />
              <div className="flex justify-between pt-3 border-t border-[#DEE2E6] mt-2">
                <div className="h-3 w-24 bg-[#F8F9FA] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F8F9FA] rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
