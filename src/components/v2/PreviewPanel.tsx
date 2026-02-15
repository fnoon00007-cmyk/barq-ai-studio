import { VFSFile } from "@/hooks/v2/useVFS";
import { Globe } from "lucide-react";
import { useMemo } from "react";
import { buildPreviewHTML } from "@/lib/preview-builder";

interface PreviewPanelProps {
  files: VFSFile[];
  device: "desktop" | "tablet" | "mobile";
}

export function PreviewPanel({ files, device }: PreviewPanelProps) {
  const previewHTML = useMemo(() => {
    if (files.length === 0) return null;
    return buildPreviewHTML(files as any);
  }, [files]);

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
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-muted/30">
      <iframe
        srcDoc={previewHTML}
        className="border-0 shadow-lg rounded-lg bg-white transition-all duration-300 ease-in-out"
        style={{ width: deviceWidth, height: deviceHeight }}
        sandbox="allow-scripts"
        title="معاينة الموقع"
      />
    </div>
  );
}
