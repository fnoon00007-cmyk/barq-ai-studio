import { Skeleton } from "@/components/ui/skeleton";

/** Chat message skeleton loader */
export function ChatSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-[60%]" : "w-[75%]"}`} />
        </div>
      ))}
    </div>
  );
}

/** Projects grid skeleton loader */
export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Builder panel skeleton */
export function BuilderSkeleton() {
  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="flex-1 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}

/** Inline loading indicator with text */
export function InlineLoader({ text = "جارٍ التحميل..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground font-medium">{text}</span>
    </div>
  );
}
