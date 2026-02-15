import { useState } from "react";
import { History, ChevronDown, ChevronUp, RotateCcw, GitCompare } from "lucide-react";
import { VFSVersionSnapshot } from "@/hooks/v2/useVFS";
import { toast } from "sonner";

interface VersionHistoryProps {
  history: VFSVersionSnapshot[];
  currentVersion: VFSVersionSnapshot | null;
  onRestore: (index: number) => void;
}

export function VersionHistory({ history, currentVersion, onRestore }: VersionHistoryProps) {
  const [compareFrom, setCompareFrom] = useState<number | null>(null);
  const [compareTo, setCompareTo] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleRestore = (index: number) => {
    onRestore(index);
    toast.success(`تم استعادة الإصدار ${history[index].version}`);
  };

  const diffFiles = () => {
    if (compareFrom === null || compareTo === null) return [];
    const fromFiles = history[compareFrom].files;
    const toFiles = history[compareTo].files;
    const allNames = new Set([...fromFiles.map(f => f.name), ...toFiles.map(f => f.name)]);
    const diffs: { name: string; status: "added" | "removed" | "modified" | "unchanged" }[] = [];
    allNames.forEach(name => {
      const from = fromFiles.find(f => f.name === name);
      const to = toFiles.find(f => f.name === name);
      if (!from) diffs.push({ name, status: "added" });
      else if (!to) diffs.push({ name, status: "removed" });
      else if (from.content !== to.content) diffs.push({ name, status: "modified" });
      else diffs.push({ name, status: "unchanged" });
    });
    return diffs.filter(d => d.status !== "unchanged");
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} س`;
    return `${Math.floor(hrs / 24)} ي`;
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">تاريخ الإصدارات ({history.length})</h3>
      </div>

      {/* Compare toggle */}
      {compareFrom !== null && compareTo !== null && (
        <div className="px-4 py-2 border-b border-border">
          <button onClick={() => setShowDiff(!showDiff)} className="text-xs text-primary hover:underline flex items-center gap-1">
            <GitCompare className="h-3 w-3" />
            {showDiff ? "إخفاء المقارنة" : "عرض المقارنة"}
          </button>
          {showDiff && (
            <div className="mt-2 space-y-1">
              {diffFiles().length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد تغييرات</p>
              ) : (
                diffFiles().map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${d.status === "added" ? "bg-green-500" : d.status === "removed" ? "bg-destructive" : "bg-amber-500"}`} />
                    <span className="font-mono text-foreground">{d.name}</span>
                    <span className="text-muted-foreground">
                      {d.status === "added" ? "جديد" : d.status === "removed" ? "محذوف" : "معدّل"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">لا يوجد تاريخ بعد</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-4">
              {[...history].reverse().map((snap, ri) => {
                const i = history.length - 1 - ri;
                const isCurrent = currentVersion?.version === snap.version;
                return (
                  <div key={snap.version} className="relative flex gap-3 group">
                    {/* Dot */}
                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${isCurrent ? "border-primary bg-primary/20" : "border-border bg-card"}`}>
                      <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-primary" : "bg-muted-foreground/40"}`} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                          v{snap.version} {isCurrent && "← الحالي"}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(snap.timestamp)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{snap.message}</p>
                      <p className="text-[10px] text-muted-foreground">{snap.files.length} ملف</p>
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isCurrent && (
                          <button onClick={() => handleRestore(i)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                            <RotateCcw className="h-3 w-3" /> استعادة
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (compareFrom === null) setCompareFrom(i);
                            else if (compareTo === null) { setCompareTo(i); setShowDiff(true); }
                            else { setCompareFrom(i); setCompareTo(null); setShowDiff(false); }
                          }}
                          className="text-[10px] text-accent-foreground hover:underline flex items-center gap-0.5"
                        >
                          <GitCompare className="h-3 w-3" /> مقارنة
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
