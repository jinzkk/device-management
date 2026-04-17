export default function EquipmentLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
      </div>

      {/* 필터바 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-9 w-full sm:w-64 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-4">
          {[140, 80, 120, 70, 100, 80].map((w, i) => (
            <div key={i} className={`h-4 animate-pulse rounded bg-muted`} style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex gap-4 items-center">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
