import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Globe, Calendar, Loader2, Trash2 } from "lucide-react";
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

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("خطأ في حذف المشروع");
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("تم حذف المشروع");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مشاريعي</h1>
          <p className="text-sm text-muted-foreground mt-1">
            جميع المواقع التي قمت ببنائها
          </p>
        </div>
        <button
          onClick={() => navigate("/builder")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
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
        <div className="text-center py-20">
          <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            ما عندك مشاريع بعد
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            ابدأ ببناء أول موقع لك مع برق ⚡
          </p>
          <button
            onClick={() => navigate("/builder")}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            ابدأ البناء
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all"
            >
              {/* Preview Placeholder */}
              <div className="aspect-video bg-secondary flex items-center justify-center relative">
                <Globe className="h-10 w-10 text-muted-foreground/20" />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                    {project.status === "published" ? "منشور" : "مسودة"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-foreground text-sm mb-1 truncate">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(project.updated_at), "d MMM yyyy", { locale: ar })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/builder?project=${project.id}`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
