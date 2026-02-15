import { VFSFile } from "@/hooks/v2/useVFS";
import { Globe, RefreshCw, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePreviewWorker } from "@/hooks/usePreviewWorker";

interface PreviewPanelProps {
  files: VFSFile[];
  device: "desktop" | "tablet" | "mobile";
  onIframeError?: (errorMessage: string, componentStack: string) => void;
}

export function PreviewPanel({ files, device, onIframeError }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Use Web Worker for preview building (non-blocking)
  const { html: previewHTML, isBuilding } = usePreviewWorker(files, refreshKey);

  useEffect(() => {
    if (files.length > 0) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [files, refreshKey]);

  // Listen for errors from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "preview-error" && onIframeError) {
        onIframeError(event.data.message || "Unknown error", event.data.stack || "");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onIframeError]);

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

  // Inject error catching script into the preview HTML
  const enhancedHTML = useMemo(() => {
    if (!previewHTML) return null;
    const errorScript = `<script>
      window.onerror = function(msg, url, line, col, error) {
        window.parent.postMessage({ type: 'preview-error', message: msg, stack: error?.stack || '' }, '*');
      };
      window.addEventListener('unhandledrejection', function(e) {
        window.parent.postMessage({ type: 'preview-error', message: e.reason?.message || String(e.reason), stack: e.reason?.stack || '' }, '*');
      });
    <\/script>`;
    return previewHTML.replace("</head>", `${errorScript}\n</head>`);
  }, [previewHTML]);

  const showLoading = isLoading || isBuilding;

  if (!enhancedHTML) {
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
          disabled={showLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${showLoading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto bg-muted/30">
        {showLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">جارٍ التحديث...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={refreshKey}
          srcDoc={enhancedHTML}
          className="border-0 shadow-lg rounded-lg bg-white transition-all duration-300 ease-in-out"
          style={{ width: deviceWidth, height: deviceHeight }}
          sandbox="allow-scripts"
          title="معاينة الموقع"
          loading="lazy"
        />
      </div>
    </div>
  );
}
