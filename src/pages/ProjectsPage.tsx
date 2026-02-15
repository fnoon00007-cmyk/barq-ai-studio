import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Globe, Calendar, Trash2, Zap, LogOut, MoreVertical, Pencil,
  FolderOpen, TrendingUp, Clock, Search, LayoutGrid, List,
  Share2, Copy as CopyIcon, Eye, ChevronDown, SortAsc,
  Activity, Edit3, FileCode,
} from "lucide-react";
import { ProjectsSkeleton } from "@/components/BarqSkeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, formatDistanceToNow, subDays, isAfter, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { ar } from "date-fns/locale";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  preview_html: string | null;
  share_enabled?: boolean;
}

interface UsageData {
  usage_date: string;
  builder_calls: number;
  planner_calls: number;
  reviewer_calls: number;
}

type FilterPeriod = "all" | "today" | "week" | "month";
type SortMode = "newest" | "oldest" | "title";
type ViewMode = "grid" | "list";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [todayUsage, setTodayUsage] = useState<UsageData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const navigate = useNavigate();

  const LIMITS = { builder: 30, planner: 50, reviewer: 30 };

  useEffect(() => {
    fetchProjects();
    fetchUsage();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, status, created_at, updated_at, thumbnail_url, preview_html, share_enabled")
      .order("updated_at", { ascending: false });
    if (error) toast.error("خطأ في تحميل المشاريع");
    else setProjects(data || []);
    setLoading(false);
  };

  const fetchUsage = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const { data } = await supabase
      .from("user_usage")
      .select("usage_date, builder_calls, planner_calls, reviewer_calls")
      .eq("user_id", user.user.id)
      .gte("usage_date", sevenDaysAgo)
      .order("usage_date", { ascending: true });
    if (data) {
      setUsage(data);
      const today = format(new Date(), "yyyy-MM-dd");
      setTodayUsage(data.find(d => d.usage_date === today) || { usage_date: today, builder_calls: 0, planner_calls: 0, reviewer_calls: 0 });
    }
  };

  const createNewProject = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ title: "مشروع جديد", user_id: user.user.id, status: "draft" })
      .select("id")
      .single();
    if (error) toast.error("خطأ في إنشاء المشروع");
    else if (data) navigate(`/builder/${data.id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteTarget.id);
    if (error) toast.error("خطأ في حذف المشروع");
    else { setProjects(prev => prev.filter(p => p.id !== deleteTarget.id)); toast.success("تم حذف المشروع"); }
    setDeleteTarget(null);
  };

  const confirmRename = async () => {
    if (!renameTarget || !newTitle.trim()) return;
    const { error } = await supabase.from("projects").update({ title: newTitle.trim() }).eq("id", renameTarget.id);
    if (error) toast.error("خطأ في تعديل الاسم");
    else { setProjects(prev => prev.map(p => p.id === renameTarget.id ? { ...p, title: newTitle.trim() } : p)); toast.success("تم تعديل اسم المشروع"); }
    setRenameTarget(null);
    setNewTitle("");
  };

  const handleClone = useCallback(async (project: Project) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: orig } = await supabase.from("projects").select("title, vfs_data, description").eq("id", project.id).single();
    if (!orig) return;
    const { data: newProj, error } = await supabase.from("projects").insert({
      title: `${orig.title} (نسخة)`, user_id: user.user.id, status: "draft", vfs_data: orig.vfs_data, description: orig.description,
    }).select("id").single();
    if (error) toast.error("فشل النسخ");
    else { toast.success("تم نسخ المشروع"); navigate(`/builder/${newProj!.id}`); }
  }, [navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filterPeriod !== "all") {
      const cutoff = filterPeriod === "today" ? startOfDay(new Date()) : filterPeriod === "week" ? startOfWeek(new Date()) : startOfMonth(new Date());
      result = result.filter(p => isAfter(new Date(p.updated_at), cutoff));
    }
    result.sort((a, b) => {
      if (sortMode === "newest") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortMode === "oldest") return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return a.title.localeCompare(b.title, "ar");
    });
    return result;
  }, [projects, searchQuery, filterPeriod, sortMode]);

  // Active this week
  const activeThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    return projects.filter(p => isAfter(new Date(p.updated_at), weekStart)).length;
  }, [projects]);

  // Last update
  const lastUpdate = projects.length > 0 ? formatDistanceToNow(new Date(projects[0].updated_at), { locale: ar, addSuffix: true }) : "—";

  // Chart data
  const chartDays = useMemo(() => {
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const label = format(d, "EEE", { locale: ar });
      const dateStr = format(d, "yyyy-MM-dd");
      days.push({ day: label, count: projects.filter(p => format(new Date(p.created_at), "yyyy-MM-dd") === dateStr).length });
    }
    return days;
  }, [projects]);

  const usageChartData = useMemo(() => {
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const label = format(d, "EEE", { locale: ar });
      const dateStr = format(d, "yyyy-MM-dd");
      const u = usage.find(x => x.usage_date === dateStr);
      days.push({ day: label, builder: u?.builder_calls || 0, planner: u?.planner_calls || 0, reviewer: u?.reviewer_calls || 0 });
    }
    return days;
  }, [usage]);

  // Quota helpers
  const quotaBar = (label: string, used: number, max: number) => {
    const pct = Math.min((used / max) * 100, 100);
    const isWarning = pct >= 80;
    return (
      <div key={label} className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-bold">{label}</span>
          <span className={isWarning ? "text-destructive font-bold" : "text-muted-foreground"}>
            {used} / {max}
          </span>
        </div>
        <Progress value={pct} className={`h-2 ${isWarning ? "[&>div]:bg-destructive" : ""}`} />
      </div>
    );
  };

  // Activity feed from projects
  const activities = useMemo(() => {
    return projects.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      time: formatDistanceToNow(new Date(p.updated_at), { locale: ar, addSuffix: true }),
      type: "edit" as const,
    }));
  }, [projects]);

  // Stats cards data
  const stats = [
    { label: "إجمالي المشاريع", value: projects.length, icon: FolderOpen, color: "text-primary bg-primary/10" },
    { label: "نشط هذا الأسبوع", value: activeThisWeek, icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
    { label: "استخدام Builder", value: `${todayUsage?.builder_calls || 0}/${LIMITS.builder}`, icon: Zap, color: "text-accent bg-accent/10" },
    { label: "آخر تحديث", value: lastUpdate, icon: Clock, color: "text-purple-500 bg-purple-500/10" },
  ];

  const filterLabels: Record<FilterPeriod, string> = { all: "الكل", today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر" };
  const sortLabels: Record<SortMode, string> = { newest: "الأحدث", oldest: "الأقدم", title: "العنوان (أ-ي)" };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">برق Ai</span>
          </div>
          <button onClick={handleLogout} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground mt-1">نظرة عامة على مشاريعك واستخدامك</p>
          </div>
          <button onClick={createNewProject} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> مشروع جديد
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts + Quota Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar Chart */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">مشاريع جديدة (آخر 7 أيام)</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDays}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="مشاريع" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">الاستخدام اليومي</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Line type="monotone" dataKey="builder" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Builder" />
                  <Line type="monotone" dataKey="planner" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Planner" />
                  <Line type="monotone" dataKey="reviewer" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Reviewer" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quota */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">الحصة اليومية</h3>
            <div className="space-y-4">
              {quotaBar("Builder", todayUsage?.builder_calls || 0, LIMITS.builder)}
              {quotaBar("Planner", todayUsage?.planner_calls || 0, LIMITS.planner)}
              {quotaBar("Reviewer", todayUsage?.reviewer_calls || 0, LIMITS.reviewer)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">تُعاد الحصة يومياً عند منتصف الليل</p>
          </div>
        </div>

        {/* Activity Timeline + Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> آخر النشاطات
            </h3>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">لا توجد نشاطات بعد</p>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5 group cursor-pointer" onClick={() => navigate(`/project/${a.id}`)}>
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Edit3 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث في مشاريعك..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Period filter */}
                <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                  {(Object.keys(filterLabels) as FilterPeriod[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterPeriod(f)}
                      className={`px-3 py-2 text-xs font-bold transition-colors ${filterPeriod === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {filterLabels[f]}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:text-foreground">
                      <SortAsc className="h-3.5 w-3.5" /> {sortLabels[sortMode]}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.keys(sortLabels) as SortMode[]).map(s => (
                      <DropdownMenuItem key={s} onClick={() => setSortMode(s)}>{sortLabels[s]}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">{filteredProjects.length} مشروع</p>

            {/* Projects display */}
            {loading ? (
              <ProjectsSkeleton />
            ) : filteredProjects.length === 0 ? (
              projects.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">مرحباً بك في برق ⚡</h3>
                  <p className="text-muted-foreground mb-6 text-sm">ابدأ ببناء أول موقع لك</p>
                  <button onClick={createNewProject} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                    ابدأ مشروعك الأول
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                  <Search className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-foreground font-bold mb-1">لا توجد نتائج</p>
                  <p className="text-sm text-muted-foreground">جرب تغيير كلمة البحث أو الفلاتر</p>
                </div>
              )
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                  >
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt={project.title} loading="lazy" className="w-full h-full object-cover object-top" />
                      ) : project.preview_html ? (
                        <iframe srcDoc={project.preview_html} className="w-[200%] h-[200%] origin-top-left scale-50 pointer-events-none" sandbox="" tabIndex={-1} title={project.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Globe className="h-10 w-10 text-muted-foreground/15" /></div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${project.status === "published" ? "bg-green-500/15 text-green-400" : "bg-accent/15 text-accent"}`}>
                          {project.status === "published" ? "منشور" : "مسودة"}
                        </span>
                        {project.share_enabled && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 font-semibold flex items-center gap-1">
                            <Share2 className="h-3 w-3" /> مشارك
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-1 truncate">{project.title}</h3>
                      {project.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(project.updated_at), "d MMM yyyy", { locale: ar })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/builder/${project.id}`); }}>
                              <Eye className="h-4 w-4 ml-2" /> فتح في Builder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameTarget(project); setNewTitle(project.title); }}>
                              <Pencil className="h-4 w-4 ml-2" /> تعديل الاسم
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleClone(project); }}>
                              <CopyIcon className="h-4 w-4 ml-2" /> نسخ المشروع
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget(project); }}>
                              <Trash2 className="h-4 w-4 ml-2" /> حذف المشروع
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
                  >
                    <div className="w-16 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                      {project.thumbnail_url ? (
                        <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Globe className="h-5 w-5 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(project.updated_at), "d MMM yyyy", { locale: ar })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${project.status === "published" ? "bg-green-500/15 text-green-400" : "bg-accent/15 text-accent"}`}>
                        {project.status === "published" ? "منشور" : "مسودة"}
                      </span>
                      {project.share_enabled && <Share2 className="h-3.5 w-3.5 text-blue-400" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/builder/${project.id}`); }}><Eye className="h-4 w-4 ml-2" /> فتح</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setRenameTarget(project); setNewTitle(project.title); }}><Pencil className="h-4 w-4 ml-2" /> تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleClone(project); }}><CopyIcon className="h-4 w-4 ml-2" /> نسخ</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget(project); }}><Trash2 className="h-4 w-4 ml-2" /> حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المشروع؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف "{deleteTarget?.title}" نهائياً ولا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={o => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل اسم المشروع</DialogTitle></DialogHeader>
          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="اسم المشروع الجديد" className="text-right" onKeyDown={e => e.key === "Enter" && confirmRename()} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>إلغاء</Button>
            <Button onClick={confirmRename} disabled={!newTitle.trim()}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
