import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap, Code2, Github, Eye, Settings, ArrowRight,
  FolderOpen, Palette, BarChart3, FileCode, Globe,
  ArrowLeft, Loader2, Share2, Copy as CopyIcon, MessageSquare, History,
} from "lucide-react";
import { toast } from "sonner";
import { ShareProjectDialog } from "@/components/ShareProjectDialog";
import { ProjectComments } from "@/components/ProjectComments";
import { VersionHistory } from "@/components/VersionHistory";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectDashboardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [sidePanel, setSidePanel] = useState<"comments" | "history" | null>(null);
  const [cloning, setCloning] = useState(false);
  const [vfsHistory, setVfsHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    supabase
      .from("projects")
      .select("id, title, description, status, created_at, updated_at")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) setProject(data);
        setLoading(false);
      });
    // Load VFS history
    supabase.from("projects").select("vfs_data").eq("id", projectId).single().then(({ data }) => {
      if (data?.vfs_data && Array.isArray(data.vfs_data)) {
        const vfs = data.vfs_data as any[];
        if (vfs[0]?.files) setVfsHistory(vfs);
      }
    });
  }, [projectId]);

  const handleClone = useCallback(async () => {
    if (!projectId || !userId || cloning) return;
    setCloning(true);
    try {
      const { data: orig } = await supabase.from("projects").select("title, vfs_data, description").eq("id", projectId).single();
      if (!orig) throw new Error("المشروع غير موجود");
      const { data: newProj, error } = await supabase.from("projects").insert({
        title: `${orig.title} (نسخة)`,
        user_id: userId,
        status: "draft",
        vfs_data: orig.vfs_data,
        description: orig.description,
      }).select("id").single();
      if (error) throw error;
      toast.success("تم نسخ المشروع بنجاح");
      navigate(`/builder/${newProj!.id}`);
    } catch (e: any) {
      toast.error(`فشل النسخ: ${e.message}`);
    } finally {
      setCloning(false);
    }
  }, [projectId, userId, cloning, navigate]);

  const handleRestoreVersion = useCallback((index: number) => {
    if (!projectId) return;
    const snap = vfsHistory[index];
    if (!snap) return;
    // We restore by navigating to builder which will load that version
    supabase.from("projects").update({ vfs_data: vfsHistory.slice(0, index + 1) as any }).eq("id", projectId).then(() => {
      toast.success("تم استعادة الإصدار");
    });
  }, [projectId, vfsHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">المشروع غير موجود</p>
        <button onClick={() => navigate("/projects")} className="text-primary hover:underline text-sm">العودة للمشاريع</button>
      </div>
    );
  }

  const services = [
    { id: "builder", title: "بناء الموقع", description: "تحدث مع برق لبناء وتعديل موقعك", icon: <Zap className="h-6 w-6" />, color: "bg-primary/10 text-primary border-primary/20", action: () => navigate(`/builder/${projectId}`) },
    { id: "preview", title: "معاينة الموقع", description: "شاهد الموقع مباشرة قبل النشر", icon: <Eye className="h-6 w-6" />, color: "bg-accent/10 text-accent border-accent/20", action: () => navigate(`/builder/${projectId}`) },
    { id: "share", title: "مشاركة المشروع", description: "شارك رابط معاينة عام", icon: <Share2 className="h-6 w-6" />, color: "bg-green-500/10 text-green-400 border-green-500/20", action: () => setShowShare(true) },
    { id: "clone", title: "نسخ المشروع", description: "انشئ نسخة كاملة من المشروع", icon: <CopyIcon className="h-6 w-6" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/20", action: handleClone },
    { id: "comments", title: "التعليقات", description: "أضف ملاحظات وتعليقات على المشروع", icon: <MessageSquare className="h-6 w-6" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/20", action: () => setSidePanel(sidePanel === "comments" ? null : "comments") },
    { id: "history", title: "تاريخ الإصدارات", description: "استعرض وقارن الإصدارات السابقة", icon: <History className="h-6 w-6" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/20", action: () => setSidePanel(sidePanel === "history" ? null : "history") },
    { id: "github", title: "تصدير لـ GitHub", description: "صدّر المشروع كاملاً لمستودع GitHub", icon: <Github className="h-6 w-6" />, color: "bg-foreground/10 text-foreground border-foreground/20", action: () => navigate(`/builder/${projectId}`) },
    { id: "brand", title: "إعدادات البراند", description: "خصص الألوان والشعار والهوية البصرية", icon: <Palette className="h-6 w-6" />, color: "bg-pink-500/10 text-pink-400 border-pink-500/20", action: () => navigate("/settings") },
    { id: "domain", title: "النشر والدومين", description: "انشر موقعك واربطه بدومين خاص", icon: <Globe className="h-6 w-6" />, color: "bg-green-500/10 text-green-400 border-green-500/20", action: () => {} },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/projects")} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">{project.title}</h1>
                <p className="text-xs text-muted-foreground">آخر تحديث: {timeAgo(project.updated_at)}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${project.status === "published" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
              {project.status === "published" ? "منشور" : "مسودة"}
            </span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
          <button
            onClick={() => navigate(`/builder/${projectId}`)}
            className="w-full mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-l from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-between group hover:border-primary/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"><Zap className="h-6 w-6 text-primary" /></div>
              <div className="text-right">
                <p className="font-bold text-foreground text-base sm:text-lg">متابعة البناء</p>
                <p className="text-xs sm:text-sm text-muted-foreground">افتح المحادثة مع برق وأكمل بناء موقعك</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-[-4px] transition-transform" />
          </button>

          <h2 className="text-base font-bold text-foreground mb-4">خدمات المشروع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={s.action}
                disabled={s.id === "clone" && cloning}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-right group flex flex-col gap-3 disabled:opacity-50"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-1">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-card border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />معلومات المشروع</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-foreground">—</p><p className="text-xs text-muted-foreground">الملفات</p></div>
              <div><p className="text-2xl font-bold text-foreground">—</p><p className="text-xs text-muted-foreground">المكونات</p></div>
              <div><p className="text-2xl font-bold text-foreground">{timeAgo(project.created_at)}</p><p className="text-xs text-muted-foreground">تاريخ الإنشاء</p></div>
              <div><p className="text-2xl font-bold text-foreground">{timeAgo(project.updated_at)}</p><p className="text-xs text-muted-foreground">آخر تحديث</p></div>
            </div>
          </div>
        </main>
      </div>

      {/* Side Panel */}
      {sidePanel && (
        <div className="w-80 border-r border-border bg-card shrink-0 h-screen sticky top-0">
          {sidePanel === "comments" && projectId && (
            <ProjectComments projectId={projectId} userId={userId} />
          )}
          {sidePanel === "history" && (
            <VersionHistory history={vfsHistory} currentVersion={vfsHistory[vfsHistory.length - 1] || null} onRestore={handleRestoreVersion} />
          )}
        </div>
      )}

      {/* Share Dialog */}
      {projectId && <ShareProjectDialog projectId={projectId} open={showShare} onClose={() => setShowShare(false)} />}
    </div>
  );
}
