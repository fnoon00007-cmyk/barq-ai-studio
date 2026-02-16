import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Sparkles, Monitor, Smartphone, X } from "lucide-react";
import { hasFullTemplate, loadTemplateFiles } from "@/lib/template-registry";
import { buildPreviewHTML } from "@/lib/preview-builder";
import type { Template } from "@/lib/templates-data";
import type { VFSFile } from "@/hooks/v2/useVFS";
import JSZip from "jszip";
import { toast } from "sonner";

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (template: Template) => void;
  isUsing: boolean;
}

export default function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onUseTemplate,
  isUsing,
}: TemplatePreviewModalProps) {
  const [files, setFiles] = useState<VFSFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (!template || !open) return;
    if (!hasFullTemplate(template.id)) {
      setFiles([]);
      return;
    }
    setLoading(true);
    loadTemplateFiles(template.id)
      .then(setFiles)
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [template?.id, open]);

  const previewHTML = useMemo(() => {
    if (files.length === 0) return null;
    try {
      return buildPreviewHTML(files as any);
    } catch {
      return null;
    }
  }, [files]);

  const handleDownload = async () => {
    if (!template || files.length === 0) return;
    try {
      const zip = new JSZip();
      files.forEach((f) => zip.file(f.name, f.content));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تحميل القالب بنجاح ⚡");
    } catch {
      toast.error("حدث خطأ في التحميل");
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{template.icon}</span>
              <div>
                <DialogTitle className="text-lg font-bold">{template.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Viewport toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
                <button
                  onClick={() => setViewport("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${viewport === "desktop" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${viewport === "mobile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              {/* Actions */}
              {files.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  تحميل ZIP
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onUseTemplate(template)}
                disabled={isUsing}
              >
                {isUsing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                استخدم القالب ⚡
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">جارٍ تحميل المعاينة...</p>
            </div>
          ) : previewHTML ? (
            <div
              className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden transition-all duration-300"
              style={{
                width: viewport === "mobile" ? "390px" : "100%",
                height: "100%",
                maxWidth: "100%",
              }}
            >
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title={`معاينة ${template.title}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <span className="text-6xl">{template.icon}</span>
              <p className="text-sm">المعاينة غير متاحة — استخدم القالب لبنائه فوراً</p>
            </div>
          )}
        </div>

        {/* Color palette footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>الألوان:</span>
            {[template.colors.primary, template.colors.secondary, template.colors.accent].map((c) => (
              <span
                key={c}
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {files.length > 0 ? `${files.length} ملف جاهز` : `${template.pageCount} مكونات`}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
