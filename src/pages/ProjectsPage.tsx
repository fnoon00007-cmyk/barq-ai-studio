import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Globe, Calendar, Loader2, Trash2, Zap, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, status, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل المشاريع");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const createNewProject = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({ title: "مشروع جديد", user_id: user.user.id, status: "draft" })
      .select("id")
      .single();

    if (error) {
      toast.error("خطأ في إنشاء المشروع");
    } else if (data) {
      navigate(`/builder/${data.id}`);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في حذف المشروع");
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("تم حذف المشروع");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">برق Ai</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">مشاريعي</h1>
            <p className="text-sm text-muted-foreground mt-1">جميع المواقع التي قمت ببنائها</p>
          </div>
          <button
            onClick={createNewProject}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            مشروع جديد
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="h-16 w-16 text-muted-foreground/20 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-foreground mb-2">ما عندك مشاريع بعد</h3>
            <p className="text-muted-foreground mb-8">ابدأ ببناء أول موقع لك مع برق ⚡</p>
            <button
              onClick={createNewProject}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              ابدأ البناء
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/builder/${project.id}`)}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
              >
                <div className="aspect-video bg-secondary flex items-center justify-center relative">
                  <Globe className="h-10 w-10 text-muted-foreground/15" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      project.status === "published" 
                        ? "bg-green-500/15 text-green-400" 
                        : "bg-accent/15 text-accent"
                    }`}>
                      {project.status === "published" ? "منشور" : "مسودة"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1 truncate">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(project.updated_at), "d MMM yyyy", { locale: ar })}
                    </span>
                    <button
                      onClick={(e) => deleteProject(project.id, e)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
