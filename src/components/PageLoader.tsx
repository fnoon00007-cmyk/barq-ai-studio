import { Zap } from "lucide-react";

/**
 * Full-page loading fallback for React.lazy() Suspense.
 * Used as the fallback while lazy-loaded page chunks are downloading.
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-glow">
        <Zap className="h-7 w-7 text-primary" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-1" />
        <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-2" />
        <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-3" />
      </div>
    </div>
  );
}
