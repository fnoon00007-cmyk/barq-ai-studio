import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, Clock, FileCode2,
  Filter, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle2, Zap, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

interface AnalyticsEntry {
  id: string;
  user_id: string;
  prompt: string;
  build_time_seconds: number;
  created_at: string;
  quality_score: number;
  code_size_score: number;
  tailwind_score: number;
  arabic_score: number;
  interactivity_score: number;
  completeness_score: number;
  files_count: number;
  total_lines: number;
  avg_lines_per_file: number;
  files_summary: Array<{ name: string; lines: number; grade: string }>;
  phase_times: Record<string, number> | null;
  model_used: string | null;
  validation_retries: number | null;
  issues: string[] | null;
  suggestions: string[] | null;
}

export default function AdminQualityLabPage() {
  const [entries, setEntries] = useState<AnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "passed" | "failed">("all");
  const [sortBy, setSortBy] = useState<"date" | "score" | "time">("date");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!data) {
        toast.error("غير مصرح لك بالوصول");
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };
    checkAccess();
  }, [navigate]);

  const fetchAnalytics = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);

    let query = supabase
      .from("build_analytics")
      .select("*");

    if (filter === "passed") query = query.gte("quality_score", 80);
    if (filter === "failed") query = query.lt("quality_score", 80);

    if (sortBy === "date") query = query.order("created_at", { ascending: false });
    if (sortBy === "score") query = query.order("quality_score", { ascending: false });
    if (sortBy === "time") query = query.order("build_time_seconds", { ascending: true });

    const { data, error } = await query.limit(100);

    if (!error && data) {
      setEntries(data as unknown as AnalyticsEntry[]);
    }
    setLoading(false);
  }, [isAdmin, filter, sortBy]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const stats = {
    total: entries.length,
    avgScore: entries.length ? Math.round(entries.reduce((s, e) => s + e.quality_score, 0) / entries.length) : 0,
    avgTime: entries.length ? Math.round(entries.reduce((s, e) => s + e.build_time_seconds, 0) / entries.length) : 0,
    passRate: entries.length ? Math.round((entries.filter(e => e.quality_score >= 80).length / entries.length) * 100) : 0,
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-emerald-500 text-white">A+ ({score})</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500 text-white">A ({score})</Badge>;
    if (score >= 70) return <Badge className="bg-amber-500 text-white">B ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-orange-500 text-white">C ({score})</Badge>;
    return <Badge className="bg-red-500 text-white">F ({score})</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Quality Lab - Admin Dashboard</h1>
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            العودة للمشاريع
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي البناءات</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <FileCode2 className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الجودة</p>
                  <p className="text-3xl font-bold text-foreground">{stats.avgScore}<span className="text-lg text-muted-foreground">/100</span></p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الوقت</p>
                  <p className="text-3xl font-bold text-foreground">{Math.floor(stats.avgTime / 60)}<span className="text-lg text-muted-foreground">د</span></p>
                </div>
                <Clock className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نسبة النجاح</p>
                  <p className="text-3xl font-bold text-foreground">{stats.passRate}<span className="text-lg text-muted-foreground">%</span></p>
                </div>
                <Zap className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">فلترة:</span>
                <div className="flex gap-2">
                  {(["all", "passed", "failed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        filter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted text-foreground"
                      }`}
                    >
                      {f === "all" ? "الكل" : f === "passed" ? "ناجح (≥80)" : "ضعيف (<80)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">ترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "score" | "time")}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="date">التاريخ (الأحدث)</option>
                  <option value="score">الجودة (الأعلى)</option>
                  <option value="time">الوقت (الأسرع)</option>
                </select>
              </div>

              <button
                onClick={fetchAnalytics}
                className="mr-auto px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                تحديث
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileCode2 className="h-5 w-5" />
              سجل البناءات ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> جاري التحميل...
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد بيانات</div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    {/* Summary Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {getScoreBadge(entry.quality_score)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.created_at), "dd MMM yyyy, HH:mm", { locale: ar })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ⏱️ {Math.floor(entry.build_time_seconds / 60)}د {entry.build_time_seconds % 60}ث
                          </span>
                          <span className="text-sm text-muted-foreground">
                            📄 {entry.files_count} ملفات
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">{entry.prompt}</p>
                      </div>

                      <button
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {expandedId === entry.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === entry.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {/* Scores Breakdown */}
                        <div className="grid grid-cols-5 gap-3">
                          {[
                            { label: "حجم الكود", value: entry.code_size_score },
                            { label: "Tailwind", value: entry.tailwind_score },
                            { label: "عربي", value: entry.arabic_score },
                            { label: "تفاعلية", value: entry.interactivity_score },
                            { label: "اكتمال", value: entry.completeness_score },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">{label}</p>
                              <p className="text-lg font-bold text-foreground">{value}/20</p>
                            </div>
                          ))}
                        </div>

                        {/* Files Summary */}
                        {Array.isArray(entry.files_summary) && entry.files_summary.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">الملفات:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {entry.files_summary.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs text-foreground">
                                  <span>{file.name}</span>
                                  <span className="text-muted-foreground">{file.lines} سطر - {file.grade}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Issues */}
                        {Array.isArray(entry.issues) && entry.issues.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              مشاكل:
                            </p>
                            <ul className="space-y-1">
                              {entry.issues.map((issue, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {Array.isArray(entry.suggestions) && entry.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              اقتراحات:
                            </p>
                            <ul className="space-y-1">
                              {entry.suggestions.map((sug, i) => (
                                <li key={i} className="text-xs text-muted-foreground">• {sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
