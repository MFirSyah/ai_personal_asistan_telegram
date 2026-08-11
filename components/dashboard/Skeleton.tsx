'use client';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse p-4 md:p-8 max-w-[1440px] mx-auto w-full">
      {/* Header Skeleton */}
      <div className="h-20 bg-black/10 brutalist-border w-full"></div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 h-64 bg-black/10 brutalist-border"></div>
        <div className="md:col-span-5 h-64 bg-black/10 brutalist-border"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 bg-black/10 brutalist-border p-4 flex flex-col justify-between">
            <div className="h-6 bg-black/20 w-3/4"></div>
            <div className="h-24 bg-black/20 w-full mt-4"></div>
            <div className="h-8 bg-black/20 w-1/2 mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-black/10 border-2 border-black w-full flex items-center px-4 justify-between">
          <div className="h-4 bg-black/20 w-24"></div>
          <div className="h-4 bg-black/20 w-48"></div>
          <div className="h-4 bg-black/20 w-16"></div>
        </div>
      ))}
    </div>
  );
}
