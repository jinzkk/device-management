export default function EquipmentDetailLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded bg-muted flex-1" />
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-16 animate-pulse rounded bg-muted" />
      </div>

      {/* 카드 */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="border-t pt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <>
              <div key={`l-${i}`} className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div key={`v-${i}`} className="h-4 w-32 animate-pulse rounded bg-muted" />
            </>
          ))}
        </div>
      </div>

      {/* 이력 탭 */}
      <div className="h-px bg-muted" />
      <div className="space-y-3">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
