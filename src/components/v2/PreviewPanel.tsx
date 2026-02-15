import { VFSFile } from "@/hooks/v2/useVFS";
import { Globe, RefreshCw, Loader2 } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { buildPreviewHTML } from "@/lib/preview-builder";

interface PreviewPanelProps {
  files: VFSFile[];
  device: "desktop" | "tablet" | "mobile";
}

export function PreviewPanel({ files, device }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const previewHTML = useMemo(() => {
    if (files.length === 0) return null;
    return buildPreviewHTML(files as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, refreshKey]);

  // Show loading briefly when files change
  useEffect(() => {
    if (files.length > 0) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [files, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const deviceWidth = useMemo(() => {
    switch (device) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      case "desktop": return "100%";
      default: return "100%";
    }
  }, [device]);

  const deviceHeight = useMemo(() => {
    switch (device) {
      case "mobile": return "667px";
      case "tablet": return "1024px";
      case "desktop": return "100%";
      default: return "100%";
    }
  }, [device]);

  if (!previewHTML) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Globe className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">معاينة الموقع</h2>
        <p className="text-base text-muted-foreground max-w-sm">
          ابدأ محادثة مع برق وسيظهر الموقع هنا مباشرة ⚡
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
        <span className="text-xs text-muted-foreground font-medium">المعاينة المباشرة</span>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto bg-muted/30">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">جارٍ التحديث...</span>
            </div>
          </div>
        )}
        <iframe
          key={refreshKey}
          srcDoc={previewHTML}
          className="border-0 shadow-lg rounded-lg bg-white transition-all duration-300 ease-in-out"
          style={{ width: deviceWidth, height: deviceHeight }}
          sandbox="allow-scripts"
          title="معاينة الموقع"
        />
      </div>
    </div>
  );
}
