import { ActivityLogEntry, getTypeLabel } from "@/hooks/useVFS";
import { Zap } from "lucide-react";

interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

const typeColors: Record<ActivityLogEntry["type"], string> = {
  read: "text-barq-electric",
  update: "text-barq-gold",
  complete: "text-green-400",
  create: "text-purple-400",
};

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <div className="border-b border-border bg-barq-surface/50 px-4 py-2 max-h-32 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-3 w-3 text-barq-gold" />
        <span className="text-xs font-semibold text-muted-foreground">
          سجل النشاط
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          في انتظار أوامرك... ⚡
        </p>
      ) : (
        <div className="space-y-1">
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 text-xs animate-slide-up"
            >
              <span className={`font-mono font-bold ${typeColors[entry.type]}`}>
                [{getTypeLabel(entry.type)}]
              </span>
              <span className="text-secondary-foreground">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
