import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { buildPreviewHTML } from "@/lib/preview-builder";
import { Loader2, AlertCircle, Smartphone, Tablet, Monitor } from "lucide-react";
import BarqLogo from "@/components/BarqLogo";

export default function PublicPreviewPage() {
  const { shareId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    if (!shareId) return;
    supabase
      .from("projects")
      .select("title, vfs_data, share_enabled")
      .eq("share_id", shareId)
      .eq("share_enabled", true)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("المشروع غير متاح أو الرابط غير صحيح");
        } else {
          setProject(data);
        }
        setLoading(false);
      });
  }, [shareId]);

  const files = useMemo(() => {
    if (!project?.vfs_data) return [];
    const vfs = project.vfs_data as any;
    if (Array.isArray(vfs) && vfs[0]?.files) {
      return vfs[vfs.length - 1].files;
    }
    return Array.isArray(vfs) ? vfs.map((f: any) => ({ name: f.name || f.path, content: f.content || "", language: f.language || "tsx" })) : [];
  }, [project]);

  const previewHTML = useMemo(() => buildPreviewHTML(files), [files]);

  const deviceWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-foreground font-bold">{error}</p>
        <a href="/" className="text-primary hover:underline text-sm">العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-2.5 flex items-center justify-between shrink-0" dir="rtl">
        <div className="flex items-center gap-2">
          <BarqLogo size={28} />
          <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{project?.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">معاينة</span>
        </div>
        <div className="flex items-center gap-1">
          {([
            { key: "mobile", icon: Smartphone },
            { key: "tablet", icon: Tablet },
            { key: "desktop", icon: Monitor },
          ] as const).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${device === key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </header>

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center p-4 bg-muted/30 overflow-auto">
        <div style={{ width: deviceWidth, maxWidth: "100%" }} className="h-full min-h-[80vh] bg-background rounded-xl border border-border shadow-lg overflow-hidden transition-all duration-300">
          {previewHTML ? (
            <iframe srcDoc={previewHTML} className="w-full h-full min-h-[80vh] border-0" sandbox="allow-scripts" title="معاينة المشروع" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">لا يوجد محتوى</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-2 text-center shrink-0">
        <p className="text-xs text-muted-foreground">
          تم البناء بواسطة <a href="/" className="text-primary hover:underline font-bold">برق Ai ⚡</a>
        </p>
      </footer>
    </div>
  );
}
