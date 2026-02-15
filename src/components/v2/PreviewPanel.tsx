import { VFSFile } from "@/hooks/v2/useVFS";
import { Globe, RefreshCw, Loader2, ExternalLink, Grid3X3, Ruler, Moon, Sun, Camera, ChevronDown } from "lucide-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePreviewWorker } from "@/hooks/usePreviewWorker";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreviewPanelProps {
  files: VFSFile[];
  device: "desktop" | "tablet" | "mobile";
  onIframeError?: (errorMessage: string, componentStack: string) => void;
}

const DEVICE_PRESETS: Record<string, { label: string; width: string; height: string }> = {
  mobile: { label: "Mobile (375px)", width: "375px", height: "667px" },
  iphone14pro: { label: "iPhone 14 Pro (393×852)", width: "393px", height: "852px" },
  tablet: { label: "Tablet (768px)", width: "768px", height: "1024px" },
  ipadpro11: { label: "iPad Pro 11\" (834×1194)", width: "834px", height: "1194px" },
  desktop: { label: "Desktop (100%)", width: "100%", height: "100%" },
  macbook14: { label: "MacBook Pro 14\" (1512px)", width: "1512px", height: "982px" },
};

export function PreviewPanel({ files, device, onIframeError }: PreviewPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevFilesRef = useRef<string>("");

  // Feature toggles
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [previewDarkMode, setPreviewDarkMode] = useState(() => {
    try { return localStorage.getItem("barq-preview-dark") === "true"; } catch { return false; }
  });
  const [selectedPreset, setSelectedPreset] = useState<string>(device);

  // Use Web Worker for preview building (non-blocking)
  const { html: previewHTML, isBuilding } = usePreviewWorker(files, refreshKey);

  // Hot Reload: auto-refresh when files change
  useEffect(() => {
    const filesHash = files.map(f => f.name + f.content.length + (f.version || 0)).join("|");
    if (prevFilesRef.current && prevFilesRef.current !== filesHash && files.length > 0) {
      setRefreshKey(k => k + 1);
    }
    prevFilesRef.current = filesHash;
  }, [files]);

  // Sync device prop to preset
  useEffect(() => { setSelectedPreset(device); }, [device]);

  // Save dark mode pref
  useEffect(() => {
    try { localStorage.setItem("barq-preview-dark", String(previewDarkMode)); } catch {}
  }, [previewDarkMode]);

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

  const preset = DEVICE_PRESETS[selectedPreset] || DEVICE_PRESETS.desktop;

  // Inject error catching + dark mode + grid/ruler into the preview HTML
  const enhancedHTML = useMemo(() => {
    if (!previewHTML) return null;

    const darkModeScript = previewDarkMode
      ? `<script>document.documentElement.classList.add('dark');<\/script>`
      : `<script>document.documentElement.classList.remove('dark');<\/script>`;

    const gridCSS = showGrid
      ? `<style>.barq-grid-overlay{position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:9999;background-image:repeating-linear-gradient(0deg,transparent,transparent 7px,rgba(0,150,255,0.08) 7px,rgba(0,150,255,0.08) 8px),repeating-linear-gradient(90deg,transparent,transparent 7px,rgba(0,150,255,0.08) 7px,rgba(0,150,255,0.08) 8px);}</style><div class="barq-grid-overlay"></div>`
      : "";

    const rulerCSS = showRuler
      ? `<style>.barq-ruler-h,.barq-ruler-v{position:fixed;z-index:9998;background:hsl(205 100% 50%/0.12);pointer-events:none;}.barq-ruler-h{top:0;left:0;right:0;height:20px;background-image:repeating-linear-gradient(90deg,transparent,transparent 49px,hsl(205 100% 50%/0.3) 49px,hsl(205 100% 50%/0.3) 50px);}.barq-ruler-v{top:0;left:0;bottom:0;width:20px;background-image:repeating-linear-gradient(0deg,transparent,transparent 49px,hsl(205 100% 50%/0.3) 49px,hsl(205 100% 50%/0.3) 50px);}</style><div class="barq-ruler-h"></div><div class="barq-ruler-v"></div>`
      : "";

    const errorScript = `<script>
      window.onerror = function(msg, url, line, col, error) {
        window.parent.postMessage({ type: 'preview-error', message: msg, stack: error?.stack || '' }, '*');
      };
      window.addEventListener('unhandledrejection', function(e) {
        window.parent.postMessage({ type: 'preview-error', message: e.reason?.message || String(e.reason), stack: e.reason?.stack || '' }, '*');
      });
    <\/script>`;

    return previewHTML
      .replace("</head>", `${errorScript}\n${darkModeScript}\n</head>`)
      .replace("</body>", `${gridCSS}${rulerCSS}</body>`);
  }, [previewHTML, previewDarkMode, showGrid, showRuler]);

  // Open in new window
  const handleOpenNewWindow = useCallback(() => {
    if (!enhancedHTML) return;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(enhancedHTML);
      newWindow.document.close();
      toast.success("تم فتح المعاينة في نافذة جديدة");
    }
  }, [enhancedHTML]);

  // Screenshot / Export PNG
  const handleScreenshot = useCallback(async () => {
    if (!iframeRef.current) return;
    try {
      // Use canvas capture approach
      const iframe = iframeRef.current;
      const canvas = document.createElement("canvas");
      const rect = iframe.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Draw iframe content via foreignObject SVG
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${enhancedHTML}</div>
          </foreignObject>
        </svg>`;
      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (!b) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = `barq-preview-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
          toast.success("تم تحميل صورة المعاينة 📸");
        }, "image/png");
      };
      img.onerror = () => {
        // Fallback: download HTML
        const htmlBlob = new Blob([enhancedHTML || ""], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(htmlBlob);
        a.download = `barq-preview-${Date.now()}.html`;
        a.click();
        toast.info("تم تحميل المعاينة كملف HTML");
      };
      img.src = url;
    } catch {
      // Fallback: download as HTML
      const htmlBlob = new Blob([enhancedHTML || ""], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(htmlBlob);
      a.download = `barq-preview-${Date.now()}.html`;
      a.click();
      toast.info("تم تحميل المعاينة كملف HTML");
    }
  }, [enhancedHTML]);

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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">المعاينة</span>

          {/* Device Preset Selector */}
          <Select value={selectedPreset} onValueChange={(v) => setSelectedPreset(v as any)}>
            <SelectTrigger className="h-7 w-[160px] text-[11px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEVICE_PRESETS).map(([key, p]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          {/* Grid Overlay */}
          <button
            onClick={() => setShowGrid(g => !g)}
            className={`p-1.5 rounded-md text-xs transition-colors ${showGrid ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            title="شبكة توجيهية (Grid)"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>

          {/* Ruler */}
          <button
            onClick={() => setShowRuler(r => !r)}
            className={`p-1.5 rounded-md text-xs transition-colors ${showRuler ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            title="مسطرة (Ruler)"
          >
            <Ruler className="h-3.5 w-3.5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setPreviewDarkMode(d => !d)}
            className={`p-1.5 rounded-md text-xs transition-colors ${previewDarkMode ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            title="الوضع الداكن للمعاينة"
          >
            {previewDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Screenshot */}
          <button
            onClick={handleScreenshot}
            className="p-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="تحميل صورة (Screenshot)"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>

          {/* Open in new window */}
          <button
            onClick={handleOpenNewWindow}
            className="p-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="فتح في نافذة جديدة"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={showLoading}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${showLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
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
          style={{ width: preset.width, height: preset.height, maxWidth: "100%", maxHeight: "100%" }}
          sandbox="allow-scripts"
          title="معاينة الموقع"
          loading="lazy"
        />
      </div>
    </div>
  );
}
