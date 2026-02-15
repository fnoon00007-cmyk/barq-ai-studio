import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, FlaskConical, FileCode2, BarChart3, Code2,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle,
  Sparkles, Lightbulb, Loader2, Bug, Timer, RotateCcw, Play, Wifi,
  Trash2, Eye, GitCompare, X, ArrowLeftRight
} from "lucide-react";
import BarqLogo from "@/components/BarqLogo";
import { validateCodeQuality, type CodeQualityReport, type VFSFile } from "@/lib/code-validator";
import { streamBarqPlanner, BUILD_PHASES } from "@/lib/barq-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ───
interface SavedTestResult {
  id: string;
  prompt: string;
  score: number;
  passed: boolean;
  fileCount: number;
  totalLines: number;
  buildTime: number | null;
  timestamp: Date;
  report: CodeQualityReport;
  status: "passed" | "failed" | "error";
  jobId?: string;
}

// ─── Quick examples ───
const QUICK_EXAMPLES = [
  { id: "restaurant", icon: "🍽️", label: "مطعم", prompt: "ابني موقع مطعم سعودي فاخر مع قائمة طعام تفاعلية ونظام حجوزات ومعرض صور للأطباق وقسم عن الشيف" },
  { id: "clinic", icon: "🏥", label: "عيادة", prompt: "ابني موقع عيادة طبية مع نظام حجز مواعيد وقسم للأطباء والخدمات الطبية وشهادات المرضى" },
  { id: "realestate", icon: "🏢", label: "عقارات", prompt: "ابني موقع شركة عقارات مع معرض عقارات وخريطة تفاعلية ونموذج استفسار وإحصائيات" },
  { id: "tech", icon: "💻", label: "تقنية", prompt: "ابني موقع شركة برمجيات يعرض الخدمات والمشاريع السابقة والفريق التقني ونموذج تواصل" },
  { id: "ecommerce", icon: "🛒", label: "متجر", prompt: "ابني موقع متجر إلكتروني مع عرض منتجات وسلة شراء ونظام فلترة وصفحة تفاصيل المنتج" },
  { id: "education", icon: "🎓", label: "تعليم", prompt: "ابني موقع أكاديمية تعليمية مع عرض الدورات والمدرسين ونظام تسجيل وشهادات الطلاب" },
];

// ─── Sample files for demo ───
const SAMPLE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    content: Array.from({ length: 80 }, (_, i) => {
      const lines = [
        ":root { --primary: #2563eb; --secondary: #1e293b; --accent: #06b6d4; }",
        "@keyframes fadeInUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }",
        "@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }",
        "@keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-20px) } }",
        "@keyframes pulse-slow { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }",
        "@keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }",
        ".glass-effect { background:rgba(255,255,255,0.8); backdrop-filter:blur(20px); }",
        ".text-gradient { background:linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip:text; }",
        ".animate-float { animation: float 6s ease-in-out infinite; }",
        ".animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }",
      ];
      return lines[i % lines.length];
    }).join("\n"),
  },
  ...["Header", "Hero", "Services", "About", "Stats", "Testimonials", "CTA", "Contact", "Footer"].map(name => ({
    name: name + ".tsx",
    content: Array.from({ length: 200 + Math.floor(Math.random() * 200) }, (_, i) => {
      const lines = [
        '<div className="relative overflow-hidden py-24 md:py-32 lg:py-40">',
        '  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />',
        '  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">',
        '    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">نقدم لك أفضل الحلول</h2>',
        '    <p className="text-base md:text-lg text-gray-600 mb-12">نحن نؤمن بتقديم خدمات عالية الجودة</p>',
        '    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">',
        '      <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">',
        '        <h3 className="text-xl font-bold text-gray-900 mb-3">تطوير المواقع</h3>',
        '        <p className="text-gray-600">نبني مواقع احترافية بأحدث التقنيات</p>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>',
      ];
      return lines[i % lines.length];
    }).join("\n"),
  })),
  { name: "App.tsx", content: '<div dir="rtl" lang="ar">\n  <Header />\n  <Hero />\n  <Services />\n  <About />\n  <Stats />\n  <Testimonials />\n  <CTA />\n  <Contact />\n  <Footer />\n</div>' },
];

// ─── Sub-components ───
function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = score >= 90 ? "text-primary" : score >= 80 ? "text-accent" : score >= 60 ? "text-muted-foreground" : "text-destructive";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className={colorClass} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={"text-2xl font-black " + colorClass}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, score, max = 20, icon }: { label: string; score: number; max?: number; icon: string }) {
  const pct = (score / max) * 100;
  const color = pct >= 85 ? "bg-primary" : pct >= 60 ? "bg-accent" : pct >= 40 ? "bg-muted-foreground" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium flex items-center gap-2"><span>{icon}</span> {label}</span>
        <span className="font-bold text-foreground">{score}/{max}</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-1000 " + color} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: "bg-primary/10 text-primary border-primary/20",
    B: "bg-accent/10 text-accent-foreground border-accent/20",
    C: "bg-muted text-muted-foreground border-border",
    D: "bg-muted text-muted-foreground border-border",
    F: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={"inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black border " + (styles[grade] || styles.F)}>
      {grade}
    </span>
  );
}

function StatusIcon({ lines }: { lines: number }) {
  if (lines > 200) return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (lines >= 100) return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
}

function PhaseProgressBar({ currentPhase, completedPhases }: { currentPhase: number; completedPhases: number[] }) {
  return (
    <div className="mb-6 p-5 rounded-2xl bg-muted/50 border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-foreground">تقدم البناء المرحلي</span>
        <span className="text-xs text-muted-foreground font-mono">{completedPhases.length}/{BUILD_PHASES.length} مراحل</span>
      </div>
      <div className="flex gap-2 mb-3">
        {BUILD_PHASES.map((phase) => {
          const done = completedPhases.includes(phase.id);
          const current = currentPhase === phase.id;
          return (
            <div key={phase.id} className="flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${done ? "bg-primary" : current ? "bg-primary/50 animate-pulse" : "bg-border"}`} />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {BUILD_PHASES.map((phase) => {
          const done = completedPhases.includes(phase.id);
          const current = currentPhase === phase.id;
          return (
            <div key={phase.id} className={`text-xs rounded-xl px-3 py-2 text-center border transition-all duration-300 ${
              done ? "bg-primary/10 border-primary/30 text-primary font-bold"
                : current ? "bg-accent/10 border-accent/30 text-accent-foreground font-bold animate-pulse"
                : "bg-muted border-border text-muted-foreground"
            }`}>
              <div className="font-bold">{done ? "✅" : current ? "⚡" : "⏳"} {phase.label}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{phase.files.join("، ")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Comparison Component ───
function ComparisonView({ resultA, resultB, onClose }: { resultA: SavedTestResult; resultB: SavedTestResult; onClose: () => void }) {
  const axes = [
    { key: "codeSize", label: "حجم الكود", icon: "📏" },
    { key: "tailwindRichness", label: "ثراء Tailwind", icon: "🎨" },
    { key: "arabicContent", label: "محتوى عربي", icon: "🇸🇦" },
    { key: "interactivity", label: "التفاعلية", icon: "✨" },
    { key: "completeness", label: "الاكتمال", icon: "📁" },
  ] as const;

  return (
    <section className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>
          مقارنة النتائج
        </h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{resultA.prompt || "اختبار نموذجي"}</p>
          <ScoreCircle score={resultA.score} size={80} />
          <div className={`mt-2 text-xs font-bold ${resultA.passed ? "text-primary" : "text-destructive"}`}>
            {resultA.passed ? "✅ ناجح" : "❌ فاشل"}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-2xl font-black text-muted-foreground">VS</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{resultB.prompt || "اختبار نموذجي"}</p>
          <ScoreCircle score={resultB.score} size={80} />
          <div className={`mt-2 text-xs font-bold ${resultB.passed ? "text-primary" : "text-destructive"}`}>
            {resultB.passed ? "✅ ناجح" : "❌ فاشل"}
          </div>
        </div>
      </div>

      {/* Axis comparison */}
      <div className="space-y-4">
        {axes.map(({ key, label, icon }) => {
          const a = resultA.report.breakdown[key];
          const b = resultB.report.breakdown[key];
          const diff = a - b;
          return (
            <div key={key} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
                <span className="text-sm font-bold text-foreground">{a}/20</span>
                <div className="h-2 flex-1 mx-3 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(a / 20) * 100}%` }} />
                </div>
              </div>
              <div className="text-center min-w-[100px]">
                <span className="text-xs text-muted-foreground">{icon} {label}</span>
                {diff !== 0 && (
                  <div className={`text-xs font-bold mt-0.5 ${diff > 0 ? "text-primary" : "text-destructive"}`}>
                    {diff > 0 ? `+${diff} ←` : `${diff} →`}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
                <div className="h-2 flex-1 mx-3 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(b / 20) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-foreground">{b}/20</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="text-center p-3 rounded-xl bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-1">عدد الملفات</div>
          <div className="font-bold text-foreground">{resultA.fileCount} vs {resultB.fileCount}</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-1">إجمالي الأسطر</div>
          <div className="font-bold text-foreground">{resultA.totalLines.toLocaleString()} vs {resultB.totalLines.toLocaleString()}</div>
        </div>
      </div>
    </section>
  );
}

// ─── Detail Modal ───
function DetailView({ result, onClose }: { result: SavedTestResult; onClose: () => void }) {
  const report = result.report;
  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">تفاصيل الاختبار</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Score + status */}
        <div className="flex items-center gap-6 mb-6">
          <ScoreCircle score={report.score} size={100} />
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-2 ${
              result.status === "passed" ? "bg-primary/10 text-primary" 
              : result.status === "error" ? "bg-destructive/10 text-destructive" 
              : "bg-destructive/10 text-destructive"
            }`}>
              {result.status === "passed" ? "✅ ناجح" : result.status === "error" ? "⚠️ خطأ بناء" : "❌ فاشل"}
            </div>
            <p className="text-sm text-muted-foreground">{result.prompt || "اختبار نموذجي"}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span>{result.fileCount} ملف</span>
              <span>{result.totalLines.toLocaleString()} سطر</span>
              {result.buildTime && <span>⏱️ {Math.floor(result.buildTime / 60)}:{(result.buildTime % 60).toString().padStart(2, "0")}</span>}
              <span>{new Date(result.timestamp).toLocaleString("ar-SA")}</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4 mb-6">
          <BreakdownBar icon="📏" label="حجم الكود" score={report.breakdown.codeSize} />
          <BreakdownBar icon="🎨" label="ثراء Tailwind" score={report.breakdown.tailwindRichness} />
          <BreakdownBar icon="🇸🇦" label="محتوى عربي" score={report.breakdown.arabicContent} />
          <BreakdownBar icon="✨" label="التفاعلية" score={report.breakdown.interactivity} />
          <BreakdownBar icon="📁" label="الاكتمال" score={report.breakdown.completeness} />
        </div>

        {/* Files */}
        {report.files.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground text-xs">الملف</th>
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground text-xs">سطر</th>
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground text-xs">عربي</th>
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground text-xs">تقييم</th>
              </tr></thead>
              <tbody>
                {report.files.map((file) => (
                  <tr key={file.name} className="border-b border-border/50">
                    <td className="py-2 px-3 font-mono text-foreground text-xs">{file.name}</td>
                    <td className="text-center py-2 px-2 text-xs">{file.lines}</td>
                    <td className="text-center py-2 px-2 text-xs">{Math.round(file.arabicRatio * 100)}%</td>
                    <td className="text-center py-2 px-2"><GradeBadge grade={file.grade} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Issues */}
        {report.issues.length > 0 && (
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
            <h4 className="text-xs font-bold text-destructive mb-1.5">مشاكل</h4>
            <ul className="space-y-1">
              {report.issues.map((issue, i) => (
                <li key={i} className="text-xs text-destructive/80">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {report.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {report.suggestions.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                <Lightbulb className="h-3 w-3" />{s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: extract files from job ───
function extractFilesFromJob(job: any): VFSFile[] {
  const files: VFSFile[] = [];
  for (let i = 1; i <= 4; i++) {
    const pf = job[`phase_${i}_files`];
    if (Array.isArray(pf)) files.push(...pf);
  }
  return files;
}

function getCompletedPhases(job: any): number[] {
  const phases: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const pf = job[`phase_${i}_files`];
    if (Array.isArray(pf) && pf.length > 0) phases.push(i);
  }
  return phases;
}

function getCurrentPhaseFromStatus(status: string): number {
  const match = status.match(/building_phase_(\d)/);
  return match ? parseInt(match[1]) : 0;
}

// ─── Main page ───
export default function TestQualityPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [report, setReport] = useState<CodeQualityReport | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [buildPhase, setBuildPhase] = useState("");
  const [builtFiles, setBuiltFiles] = useState<VFSFile[]>([]);
  const [currentPhaseNum, setCurrentPhaseNum] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalBuildTime, setTotalBuildTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const buildStartRef = useRef<number>(0);

  // Resume state
  const [pendingJob, setPendingJob] = useState<any>(null);
  const [checkingResume, setCheckingResume] = useState(true);

  // Saved test results history
  const [savedResults, setSavedResults] = useState<SavedTestResult[]>(() => {
    try {
      const stored = localStorage.getItem("barq_test_results");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Comparison & detail view state
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [detailResult, setDetailResult] = useState<SavedTestResult | null>(null);
  const [resultsFilter, setResultsFilter] = useState<"all" | "passed" | "failed">("all");

  // Persist results to localStorage
  useEffect(() => {
    localStorage.setItem("barq_test_results", JSON.stringify(savedResults));
  }, [savedResults]);

  const saveTestResult = useCallback((testReport: CodeQualityReport, buildTimeSeconds: number | null, jobId?: string, promptText?: string) => {
    const resultPrompt = promptText || prompt;
    const newResult: SavedTestResult = {
      id: crypto.randomUUID(),
      prompt: resultPrompt.slice(0, 120),
      score: testReport.score,
      passed: testReport.passed,
      fileCount: testReport.files.length,
      totalLines: testReport.files.reduce((s, f) => s + f.lines, 0),
      buildTime: buildTimeSeconds,
      timestamp: new Date(),
      report: testReport,
      status: testReport.passed ? "passed" : "failed",
      jobId,
    };
    setSavedResults(prev => [newResult, ...prev]);
    return newResult;
  }, [prompt]);

  const saveFailedResult = useCallback((promptText: string, phaseNum: number, jobId?: string) => {
    const failedResult: SavedTestResult = {
      id: crypto.randomUUID(),
      prompt: promptText.slice(0, 120),
      score: 0,
      passed: false,
      fileCount: 0,
      totalLines: 0,
      buildTime: null,
      timestamp: new Date(),
      report: { score: 0, passed: false, breakdown: { codeSize: 0, tailwindRichness: 0, arabicContent: 0, interactivity: 0, completeness: 0 }, files: [], issues: [`فشل البناء في المرحلة ${phaseNum}`], suggestions: [] },
      status: "error",
      jobId,
    };
    setSavedResults(prev => [failedResult, ...prev]);
  }, []);

  const deleteTestResult = useCallback((id: string) => {
    setSavedResults(prev => prev.filter(r => r.id !== id));
    setCompareSelection(prev => prev.filter(s => s !== id));
    toast.success("تم حذف النتيجة");
  }, []);

  const toggleCompareSelect = useCallback((id: string) => {
    setCompareSelection(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 2) { toast.info("اختر نتيجتين فقط للمقارنة"); return prev; }
      return [...prev, id];
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (isBuilding || isAnalyzing) {
      timerRef.current = setInterval(() => {
        if (buildStartRef.current > 0) {
          setElapsedSeconds(Math.floor((Date.now() - buildStartRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (elapsedSeconds > 0) setTotalBuildTime(elapsedSeconds);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isBuilding, isAnalyzing]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec} ثانية`;
  };

  // ─── Realtime subscription to watch job progress ───
  const subscribeToJob = useCallback((jobId: string) => {
    const channel = supabase
      .channel(`build_job_${jobId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "build_jobs",
        filter: `id=eq.${jobId}`,
      }, (payload) => {
        const job = payload.new as any;
        console.log("[realtime] Job update:", job.status, "phase:", job.current_phase);

        const files = extractFilesFromJob(job);
        const phases = getCompletedPhases(job);
        const curPhase = getCurrentPhaseFromStatus(job.status);

        setBuiltFiles(files);
        setCompletedPhases(phases);
        setCurrentPhaseNum(curPhase);

        if (curPhase > 0) {
          const phaseInfo = BUILD_PHASES[curPhase - 1];
          setBuildPhase(`⚡ المرحلة ${curPhase}/4: ${phaseInfo?.label || ""}`);
        }

        // Build completed
        if (job.status === "completed") {
          setIsBuilding(false);
          setIsAnalyzing(true);
          setBuildPhase("🔍 جاري تحليل الجودة...");

          setTimeout(async () => {
            const result = validateCodeQuality(files);
            setReport(result);
            setIsAnalyzing(false);
            setBuildPhase("");
            setCurrentPhaseNum(0);
            const buildTime = buildStartRef.current > 0 ? Math.floor((Date.now() - buildStartRef.current) / 1000) : null;
            toast.success(`✅ البناء اكتمل: ${result.score}/100`);

            saveTestResult(result, buildTime, jobId, job.prompt);

            supabase.from("build_jobs").update({
              quality_score: result.score,
              quality_report: result as any,
            }).eq("id", jobId);

            // Save to build_analytics
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const totalLines = result.files.reduce((s, f) => s + f.lines, 0);
                await supabase.from("build_analytics" as any).insert({
                  user_id: user.id,
                  project_id: null,
                  prompt: (job.prompt || "").slice(0, 500),
                  build_time_seconds: buildTime || 0,
                  quality_score: result.score,
                  code_size_score: result.breakdown.codeSize,
                  tailwind_score: result.breakdown.tailwindRichness,
                  arabic_score: result.breakdown.arabicContent,
                  interactivity_score: result.breakdown.interactivity,
                  completeness_score: result.breakdown.completeness,
                  files_count: result.files.length,
                  total_lines: totalLines,
                  avg_lines_per_file: result.files.length > 0 ? Math.round(totalLines / result.files.length) : 0,
                  files_summary: result.files.map(f => ({ name: f.name, lines: f.lines, grade: f.grade })),
                  model_used: "gemini",
                  validation_retries: 0,
                  issues: result.issues,
                  suggestions: result.suggestions,
                });
                console.log("✅ Analytics saved");
              }
            } catch (err) {
              console.warn("Failed to save analytics:", err);
            }
          }, 600);

          supabase.removeChannel(channel);
        }

        // Build failed
        if (job.status.startsWith("failed")) {
          setIsBuilding(false);
          setBuildPhase("");
          const failPhase = job.current_phase || 0;
          toast.error("فشل البناء في المرحلة " + failPhase);
          saveFailedResult(job.prompt || prompt, failPhase, jobId);
          supabase.removeChannel(channel);
        }
      })
      .subscribe();

    return channel;
  }, [saveTestResult, saveFailedResult, prompt]);

  // ─── Stale build detection ───
  useEffect(() => {
    if (!isBuilding || !activeJobId) return;

    const staleCheckInterval = setInterval(async () => {
      try {
        const { data: job } = await supabase
          .from("build_jobs")
          .select("status, updated_at, prompt, current_phase")
          .eq("id", activeJobId)
          .single();

        if (!job) return;

        if (job.status === "completed" || job.status.startsWith("failed")) {
          setIsBuilding(false);
          setBuildPhase("");
          if (job.status.startsWith("failed")) {
            toast.error("فشل البناء — السيرفر لم يستجب");
          }
          clearInterval(staleCheckInterval);
          return;
        }

        const lastUpdate = new Date(job.updated_at).getTime();
        const staleMs = Date.now() - lastUpdate;
        if (staleMs > 5 * 60 * 1000) {
          console.warn("[stale] Build stuck for", Math.round(staleMs / 1000), "seconds");
          await supabase.from("build_jobs").update({ status: `failed_phase_${currentPhaseNum || 4}` }).eq("id", activeJobId);
          setIsBuilding(false);
          setBuildPhase("");
          saveFailedResult(job.prompt || prompt, currentPhaseNum || 4, activeJobId);
          toast.error("⏰ البناء تجاوز المدة المسموحة — حاول مرة ثانية");
          clearInterval(staleCheckInterval);
        }
      } catch (err) {
        console.warn("[stale-check] Error:", err);
      }
    }, 30_000);

    return () => clearInterval(staleCheckInterval);
  }, [isBuilding, activeJobId, currentPhaseNum, saveFailedResult, prompt]);

  // ─── Check for active/incomplete/completed builds on mount ───
  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setCheckingResume(false); return; }

        // Check active builds
        const { data: activeJobs } = await supabase
          .from("build_jobs")
          .select("*")
          .eq("user_id", session.user.id)
          .in("status", ["planning", "building_phase_1", "building_phase_2", "building_phase_3", "building_phase_4"])
          .order("started_at", { ascending: false })
          .limit(1);

        if (activeJobs && activeJobs.length > 0) {
          const job = activeJobs[0];
          setPendingJob(job);
          setPrompt(job.prompt);

          if (job.status.startsWith("building_phase_")) {
            setIsBuilding(true);
            setActiveJobId(job.id);
            buildStartRef.current = new Date(job.started_at).getTime();
            setElapsedSeconds(Math.floor((Date.now() - buildStartRef.current) / 1000));

            const files = extractFilesFromJob(job);
            const phases = getCompletedPhases(job);
            const curPhase = getCurrentPhaseFromStatus(job.status);
            setBuiltFiles(files);
            setCompletedPhases(phases);
            setCurrentPhaseNum(curPhase);
            setBuildPhase(`⚡ المرحلة ${curPhase}/4: ${BUILD_PHASES[curPhase - 1]?.label || ""}`);

            subscribeToJob(job.id);
            setPendingJob(null);
            toast.info("🔄 متصل ببناء جاري — السيرفر يعمل في الخلفية");
          }
          setCheckingResume(false);
          return;
        }

        // ─── Auto-analyze completed builds that finished while user was away ───
        const existingJobIds = savedResults.map(r => r.jobId).filter(Boolean);
        const { data: completedJobs } = await supabase
          .from("build_jobs")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "completed")
          .is("quality_score", null)
          .order("completed_at", { ascending: false })
          .limit(5);

        if (completedJobs && completedJobs.length > 0) {
          for (const job of completedJobs) {
            if (existingJobIds.includes(job.id)) continue;
            const files = extractFilesFromJob(job);
            if (files.length > 0) {
              const result = validateCodeQuality(files);
              const buildTime = job.completed_at && job.started_at
                ? Math.floor((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
                : null;
              saveTestResult(result, buildTime, job.id, job.prompt);
              await supabase.from("build_jobs").update({
                quality_score: result.score,
                quality_report: result as any,
              }).eq("id", job.id);
              toast.success(`📊 تم تحليل بناء مكتمل: ${result.score}/100`);
            }
          }
        }

        // Also check recently failed builds
        const { data: failedJobs } = await supabase
          .from("build_jobs")
          .select("id, prompt, current_phase, started_at, status")
          .eq("user_id", session.user.id)
          .like("status", "failed_%")
          .order("updated_at", { ascending: false })
          .limit(5);

        if (failedJobs && failedJobs.length > 0) {
          for (const job of failedJobs) {
            if (existingJobIds.includes(job.id)) continue;
            // Only auto-add recent failures (last 24h)
            const startedAt = new Date(job.started_at).getTime();
            if (Date.now() - startedAt < 24 * 60 * 60 * 1000) {
              saveFailedResult(job.prompt, job.current_phase || 0, job.id);
            }
          }
        }
      } catch (err) {
        console.error("Error checking builds:", err);
      } finally {
        setCheckingResume(false);
      }
    };
    check();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isBuilding) {
        check();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [subscribeToJob, isBuilding]);

  // ─── Start server-side build ───
  const handleTest = async () => {
    if (!prompt.trim()) { toast.error("الرجاء كتابة طلب البناء"); return; }

    setIsBuilding(true);
    setReport(null);
    setShowCode(false);
    setBuiltFiles([]);
    setCurrentPhaseNum(0);
    setCompletedPhases([]);
    setTotalBuildTime(null);
    buildStartRef.current = Date.now();
    setElapsedSeconds(0);
    setPendingJob(null);
    setBuildPhase("📋 برق يخطط المشروع...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("يرجى تسجيل الدخول أولاً");
        setIsBuilding(false);
        return;
      }

      let buildPromptResult = "";
      let dependencyGraph: any = null;

      await streamBarqPlanner(
        { conversationHistory: [{ role: "user", content: prompt }], projectId: null, vfsContext: [] },
        {
          onThinkingStep: (step) => setBuildPhase("🧠 " + step),
          onBuildReady: (bp, _s, _n, dg) => { buildPromptResult = bp; dependencyGraph = dg; },
          onMessageDelta: () => {},
          onDone: () => {},
          onError: (err) => { throw new Error(err); },
        }
      );

      if (!buildPromptResult) {
        toast.info("المخطط يحتاج مزيد من التفاصيل");
        setIsBuilding(false);
        return;
      }

      const { data: newJob, error: jobErr } = await supabase
        .from("build_jobs")
        .insert({
          user_id: session.user.id,
          prompt,
          build_prompt: buildPromptResult,
          dependency_graph: dependencyGraph,
          status: "building_phase_1",
          current_phase: 0,
        })
        .select("id")
        .single();

      if (jobErr || !newJob) throw new Error("فشل إنشاء عملية البناء");

      const jobId = newJob.id;
      setActiveJobId(jobId);
      setBuildPhase("⚡ المرحلة 1/4: الأساس");
      setCurrentPhaseNum(1);

      subscribeToJob(jobId);

      const workerUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-build-worker`;
      const resp = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ job_id: jobId, phase_number: 1 }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "فشل الاتصال" }));
        throw new Error(err.error || "Worker failed");
      }

      toast.success("🚀 بدأ البناء على السيرفر — يمكنك إغلاق المتصفح والعودة لاحقاً!");

    } catch (error: any) {
      console.error("[test-quality]", error);
      toast.error(error?.message || "فشل البناء");
      setIsBuilding(false);
      setBuildPhase("");
    }
  };

  const dismissPendingJob = async () => {
    if (pendingJob) {
      await supabase.from("build_jobs").update({ status: "cancelled" }).eq("id", pendingJob.id);
      setPendingJob(null);
      setBuiltFiles([]);
      setCompletedPhases([]);
    }
  };

  const handleDemoTest = () => {
    setIsAnalyzing(true);
    setReport(null);
    setBuiltFiles(SAMPLE_FILES);
    setBuildPhase("🔍 تحليل النموذج...");
    setTimeout(() => {
      const result = validateCodeQuality(SAMPLE_FILES);
      setReport(result);
      setIsAnalyzing(false);
      setBuildPhase("");
      saveTestResult(result, null);
    }, 800);
  };

  const largestFile = useMemo(() => {
    if (!builtFiles.length) return null;
    return [...builtFiles].sort((a, b) => b.content.split("\n").length - a.content.split("\n").length)[0] || null;
  }, [builtFiles]);

  const activeFiles = report ? report.files : [];

  // Filtered results
  const filteredResults = useMemo(() => {
    if (resultsFilter === "all") return savedResults;
    if (resultsFilter === "passed") return savedResults.filter(r => r.status === "passed");
    return savedResults.filter(r => r.status === "failed" || r.status === "error");
  }, [savedResults, resultsFilter]);

  // Comparison pair
  const comparisonPair = useMemo(() => {
    if (compareSelection.length !== 2) return null;
    const a = savedResults.find(r => r.id === compareSelection[0]);
    const b = savedResults.find(r => r.id === compareSelection[1]);
    return a && b ? [a, b] as const : null;
  }, [compareSelection, savedResults]);

  if (checkingResume) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>جاري التحقق من عمليات البناء...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <BarqLogo size={36} />
            <span className="font-bold text-lg text-foreground">برق Ai</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">الرئيسية</button>
            <button onClick={() => navigate("/templates")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">القوالب</button>
          </div>
          <button onClick={() => navigate("/auth")} className="text-sm px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">ابدأ مجاناً</button>
        </div>
      </nav>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <FlaskConical className="h-4 w-4" />
            نظام فحص الجودة
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            اختبر جودة <span className="text-primary">الكود</span> المولّد 🧪
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            ابنِ موقعاً على السيرفر — يكمل حتى لو أغلقت المتصفح ⚡
          </p>
        </div>

        {/* Resume Banner */}
        {pendingJob && !isBuilding && (
          <div className="mb-8 p-6 rounded-2xl bg-primary/5 border-2 border-primary/30 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">يوجد بناء غير مكتمل 🔄</h3>
                <p className="text-sm text-muted-foreground mb-1">"{pendingJob.prompt?.slice(0, 80)}..."</p>
                <p className="text-sm text-muted-foreground mb-4">
                  المرحلة: <span className="font-bold text-primary">{pendingJob.current_phase}/4</span>
                  {" — "}بدأ {new Date(pendingJob.started_at).toLocaleString("ar-SA")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsBuilding(true);
                      setActiveJobId(pendingJob.id);
                      buildStartRef.current = new Date(pendingJob.started_at).getTime();
                      setElapsedSeconds(Math.floor((Date.now() - buildStartRef.current) / 1000));
                      const files = extractFilesFromJob(pendingJob);
                      const phases = getCompletedPhases(pendingJob);
                      const cur = getCurrentPhaseFromStatus(pendingJob.status);
                      setBuiltFiles(files);
                      setCompletedPhases(phases);
                      setCurrentPhaseNum(cur);
                      setBuildPhase(`⚡ المرحلة ${cur}/4`);
                      subscribeToJob(pendingJob.id);
                      setPendingJob(null);
                      toast.info("🔄 متصل ببناء جاري");
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    <Wifi className="h-4 w-4" />
                    تابع البناء
                  </button>
                  <button onClick={dismissPendingJob} className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">
                    تجاهل
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Build & Test Section */}
        <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            ابنِ واختبر الجودة
          </h2>

          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-2.5 block">أمثلة سريعة:</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_EXAMPLES.map((ex) => (
                <button key={ex.id} onClick={() => setPrompt(ex.prompt)} disabled={isBuilding || isAnalyzing}
                  className="text-xs px-3 py-2 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  {ex.icon} {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">طلب البناء:</label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب وصف تفصيلي للموقع..." rows={5} dir="rtl" disabled={isBuilding || isAnalyzing} className="resize-none text-base" />
            <div className="text-xs text-muted-foreground mt-1.5 text-left">{prompt.length} حرف</div>
          </div>

          {isBuilding && currentPhaseNum > 0 && (
            <PhaseProgressBar currentPhase={currentPhaseNum} completedPhases={completedPhases} />
          )}

          {(isBuilding || isAnalyzing) && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                {buildPhase}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                <Timer className="h-3.5 w-3.5" />
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          )}

          {isBuilding && (
            <div className="mb-4 flex items-center gap-2 text-xs text-primary bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/20">
              <Wifi className="h-3.5 w-3.5" />
              البناء يعمل على السيرفر — يمكنك إغلاق المتصفح والعودة لاحقاً 💾
            </div>
          )}

          {totalBuildTime && !isBuilding && !isAnalyzing && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              مدة البناء: <span className="font-bold text-foreground font-mono">{formatTime(totalBuildTime)}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleTest} disabled={!prompt.trim() || isBuilding || isAnalyzing}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0">
              {isBuilding ? <><Loader2 className="h-5 w-5 animate-spin" /> جاري البناء...</>
                : isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> جاري التحليل...</>
                : <><Sparkles className="h-5 w-5" /> ⚡ ابنِ واختبر</>}
            </button>
            <button onClick={handleDemoTest} disabled={isBuilding || isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-4 border border-border rounded-2xl font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50">
              <FlaskConical className="h-4 w-4" /> 🧪 اختبار نموذجي
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">⚡ البناء يتم على السيرفر — لا يحتاج المتصفح مفتوح</p>
        </section>

        {/* Results */}
        {report && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreCircle score={report.score} size={140} />
                <div className="flex-1 text-center sm:text-right">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {report.passed ? "✅ الجودة مقبولة" : "❌ الجودة دون المعيار"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeFiles.length} ملف — متوسط {Math.round(activeFiles.reduce((s, f) => s + f.lines, 0) / (activeFiles.length || 1))} سطر
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {report.suggestions.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        <Lightbulb className="h-3 w-3" />{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-accent-foreground" /></div>
                تفصيل النقاط
              </h2>
              <div className="space-y-5">
                <BreakdownBar icon="📏" label="حجم الكود" score={report.breakdown.codeSize} />
                <BreakdownBar icon="🎨" label="ثراء Tailwind" score={report.breakdown.tailwindRichness} />
                <BreakdownBar icon="🇸🇦" label="محتوى عربي" score={report.breakdown.arabicContent} />
                <BreakdownBar icon="✨" label="التفاعلية" score={report.breakdown.interactivity} />
                <BreakdownBar icon="📁" label="الاكتمال" score={report.breakdown.completeness} />
              </div>
              {report.issues.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                  <h4 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />مشاكل</h4>
                  <ul className="space-y-1.5">
                    {report.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-destructive/80 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive/50 shrink-0" />{issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileCode2 className="h-5 w-5 text-primary" /></div>
                تحليل الملفات
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">الملف</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">الحجم</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Tailwind</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">عربي %</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">التقييم</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">الحالة</th>
                  </tr></thead>
                  <tbody>
                    {activeFiles.map((file) => (
                      <tr key={file.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground font-medium">{file.name}</td>
                        <td className="text-center py-3 px-2"><span className="text-foreground font-semibold">{file.lines}</span> <span className="text-muted-foreground text-xs">سطر</span></td>
                        <td className="text-center py-3 px-2 text-foreground">{file.tailwindClasses}</td>
                        <td className="text-center py-3 px-2 text-foreground">{Math.round(file.arabicRatio * 100)}%</td>
                        <td className="text-center py-3 px-2"><GradeBadge grade={file.grade} /></td>
                        <td className="text-center py-3 px-2"><StatusIcon lines={file.lines} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {largestFile && (
              <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Code2 className="h-5 w-5 text-accent-foreground" /></div>
                    أمثلة الكود
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg">{largestFile.name} ({largestFile.content.split("\n").length} سطر)</span>
                </div>
                <div className="bg-foreground/95 rounded-2xl p-6 overflow-x-auto">
                  <pre className="text-sm text-background/80 font-mono leading-relaxed whitespace-pre-wrap" dir="ltr">
                    {showCode ? largestFile.content : largestFile.content.split("\n").slice(0, 50).join("\n") + "\n\n// ... (" + (largestFile.content.split("\n").length - 50) + " سطر إضافي)"}
                  </pre>
                </div>
                <button onClick={() => setShowCode(!showCode)} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
                  {showCode ? <><ChevronUp className="h-4 w-4" /> اقرأ أقل</> : <><ChevronDown className="h-4 w-4" /> عرض الكود الكامل</>}
                </button>
              </section>
            )}

            {builtFiles.length > 0 && (
              <section className="bg-card border border-destructive/30 rounded-3xl p-8 sm:p-10 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Bug className="h-5 w-5 text-destructive" /></div>
                  🐛 Debug Info
                </h2>
                <div className="space-y-3 text-sm font-mono text-muted-foreground">
                  {totalBuildTime && <div>⏱️ مدة البناء: <span className="text-foreground font-bold">{formatTime(totalBuildTime)}</span></div>}
                  {activeJobId && <div>🆔 Job: <span className="text-foreground font-bold">{activeJobId.slice(0, 8)}...</span></div>}
                  <div>عدد الملفات: <span className="text-foreground font-bold">{builtFiles.length}</span></div>
                  <div>إجمالي الأسطر: <span className="text-foreground font-bold">{builtFiles.reduce((s, f) => s + f.content.split("\n").length, 0).toLocaleString()}</span></div>
                  <div>🏗️ النمط: <span className="text-primary font-bold">سيرفري (Server-Side Worker)</span></div>
                </div>
              </section>
            )}

            <div className="text-center">
              <button onClick={() => {
                const lines = [
                  `── تقرير جودة الكود ──`, `التاريخ: ${new Date().toLocaleDateString("ar-SA")}`,
                  `النتيجة: ${report.score}/100 (${report.passed ? "مقبول ✅" : "مرفوض ❌"})`,
                  ``, `── تفصيل النقاط ──`,
                  `حجم الكود: ${report.breakdown.codeSize}/20`, `ثراء Tailwind: ${report.breakdown.tailwindRichness}/20`,
                  `محتوى عربي: ${report.breakdown.arabicContent}/20`, `التفاعلية: ${report.breakdown.interactivity}/20`,
                  `الاكتمال: ${report.breakdown.completeness}/20`,
                  ``, `── الملفات (${activeFiles.length}) ──`,
                  ...activeFiles.map(f => `${f.grade} | ${f.name} | ${f.lines} سطر | عربي ${Math.round(f.arabicRatio * 100)}%`),
                  ...(report.issues.length ? [``, `── مشاكل ──`, ...report.issues] : []),
                  ...(report.suggestions.length ? [``, `── اقتراحات ──`, ...report.suggestions] : []),
                ];
                const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                a.download = `quality-report-${report.score}.txt`; a.click(); URL.revokeObjectURL(a.href);
              }} className="inline-flex items-center gap-3 px-8 py-4 bg-card border border-border rounded-2xl font-bold text-foreground hover:bg-muted transition-all hover:-translate-y-1 shadow-sm">
                <ArrowRight className="h-5 w-5 rotate-90" /> 📥 تحميل التقرير
              </button>
            </div>
          </div>
        )}

        {/* ─── Comparison View ─── */}
        {showComparison && comparisonPair && (
          <div className="mt-8">
            <ComparisonView
              resultA={comparisonPair[0]}
              resultB={comparisonPair[1]}
              onClose={() => { setShowComparison(false); setCompareSelection([]); }}
            />
          </div>
        )}

        {/* ─── Test Results History ─── */}
        {savedResults.length > 0 && (
          <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                سجل الاختبارات ({savedResults.length})
              </h2>
              <button
                onClick={() => { setSavedResults([]); setCompareSelection([]); toast.success("تم مسح جميع النتائج"); }}
                className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
              >
                مسح الكل
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-4">
              {(["all", "passed", "failed"] as const).map((filter) => {
                const counts = {
                  all: savedResults.length,
                  passed: savedResults.filter(r => r.status === "passed").length,
                  failed: savedResults.filter(r => r.status === "failed" || r.status === "error").length,
                };
                const labels = { all: "الكل", passed: "✅ ناجح", failed: "❌ فاشل" };
                return (
                  <button
                    key={filter}
                    onClick={() => setResultsFilter(filter)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      resultsFilter === filter
                        ? "bg-primary/10 border-primary/30 text-primary font-bold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {labels[filter]} ({counts[filter]})
                  </button>
                );
              })}

              {/* Compare button */}
              {compareSelection.length === 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="text-xs px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity mr-auto flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  قارن ({compareSelection.length})
                </button>
              )}
              {compareSelection.length > 0 && compareSelection.length < 2 && (
                <span className="text-xs text-muted-foreground mr-auto">اختر نتيجة ثانية للمقارنة...</span>
              )}
            </div>

            {/* Results list */}
            <div className="space-y-3">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group cursor-pointer ${
                    compareSelection.includes(result.id)
                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/30"
                  }`}
                  onClick={() => toggleCompareSelect(result.id)}
                >
                  {/* Status + Score */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                    result.status === "error" ? "bg-destructive/10" :
                    result.score >= 80 ? "bg-primary/10" : result.score >= 60 ? "bg-accent/10" : "bg-destructive/10"
                  }`}>
                    {result.status === "error" ? (
                      <XCircle className="h-6 w-6 text-destructive" />
                    ) : (
                      <>
                        <span className={`text-lg font-black ${
                          result.score >= 80 ? "text-primary" : result.score >= 60 ? "text-accent-foreground" : "text-destructive"
                        }`}>{result.score}</span>
                        <span className="text-[10px] text-muted-foreground">/100</span>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        result.status === "passed" ? "bg-primary/10 text-primary" :
                        result.status === "error" ? "bg-destructive/10 text-destructive" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {result.status === "passed" ? "✅ ناجح" : result.status === "error" ? "⚠️ خطأ" : "❌ فاشل"}
                      </span>
                      {compareSelection.includes(result.id) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">مختار للمقارنة</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{result.prompt || "اختبار نموذجي"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{result.fileCount} ملف</span>
                      <span>{result.totalLines.toLocaleString()} سطر</span>
                      {result.buildTime != null && <span>⏱️ {formatTime(result.buildTime)}</span>}
                      <span>{new Date(result.timestamp).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setDetailResult(result)}
                      className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="تفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {result.status !== "error" && (
                      <button
                        onClick={() => { setReport(result.report); setBuiltFiles([]); toast.info("تم تحميل النتيجة"); }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        عرض
                      </button>
                    )}
                    <button
                      onClick={() => deleteTestResult(result.id)}
                      className="p-2 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors text-destructive opacity-0 group-hover:opacity-100"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center mt-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowRight className="h-4 w-4" />العودة للرئيسية
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {detailResult && (
        <DetailView result={detailResult} onClose={() => setDetailResult(null)} />
      )}
    </div>
  );
}
