import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Copy, Check, Globe, GlobeLock } from "lucide-react";
import { toast } from "sonner";

interface ShareProjectDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function ShareProjectDialog({ projectId, open, onClose }: ShareProjectDialogProps) {
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("projects")
      .select("share_enabled, share_id")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setShareEnabled(data.share_enabled ?? false);
          setShareId(data.share_id ?? null);
        }
        setLoading(false);
      });
  }, [projectId, open]);

  const toggleShare = async () => {
    const newVal = !shareEnabled;
    await supabase.from("projects").update({ share_enabled: newVal }).eq("id", projectId);
    setShareEnabled(newVal);
    toast.success(newVal ? "تم تفعيل المشاركة" : "تم إيقاف المشاركة");
  };

  const shareUrl = shareId ? `${window.location.origin}/preview/${shareId}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("تم نسخ الرابط");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">مشاركة المشروع</h2>
            <p className="text-xs text-muted-foreground">شارك رابط المعاينة مع الآخرين</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">جاري التحميل...</div>
        ) : (
          <>
            {/* Toggle */}
            <button
              onClick={toggleShare}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${shareEnabled ? "border-primary/30 bg-primary/5" : "border-border bg-secondary"}`}
            >
              <div className="flex items-center gap-3">
                {shareEnabled ? <Globe className="h-5 w-5 text-primary" /> : <GlobeLock className="h-5 w-5 text-muted-foreground" />}
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{shareEnabled ? "المشاركة مفعّلة" : "المشاركة معطّلة"}</p>
                  <p className="text-xs text-muted-foreground">{shareEnabled ? "أي شخص لديه الرابط يمكنه المعاينة" : "فقط أنت يمكنك رؤية المشروع"}</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${shareEnabled ? "bg-primary" : "bg-muted"} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${shareEnabled ? "right-0.5" : "right-[22px]"}`} />
              </div>
            </button>

            {/* Share URL */}
            {shareEnabled && shareId && (
              <div className="mt-4">
                <label className="text-xs text-muted-foreground font-bold mb-1.5 block">رابط المعاينة</label>
                <div className="flex items-center gap-2">
                  <input
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground font-mono text-left dir-ltr focus:outline-none"
                    dir="ltr"
                  />
                  <button onClick={handleCopy} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              إغلاق
            </button>
          </>
        )}
      </div>
    </div>
  );
}
