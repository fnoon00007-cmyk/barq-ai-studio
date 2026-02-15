import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, FlaskConical, FileCode2, BarChart3, Code2,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle,
  Sparkles, Lightbulb, Loader2
} from "lucide-react";
import BarqLogo from "@/components/BarqLogo";
import { validateCodeQuality, type CodeQualityReport, type VFSFile } from "@/lib/code-validator";
import { streamBarqPlanner, streamBarqBuilder } from "@/lib/barq-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// ─── Quick examples ───
const QUICK_EXAMPLES = [
  { id: "restaurant", icon: "🍽️", label: "مطعم", prompt: "ابني موقع مطعم سعودي فاخر مع قائمة طعام تفاعلية ونظام حجوزات ومعرض صور للأطباق وقسم عن الشيف" },
  { id: "clinic", icon: "🏥", label: "عيادة", prompt: "ابني موقع عيادة طبية مع نظام حجز مواعيد وقسم للأطباء والخدمات الطبية وشهادات المرضى" },
  { id: "realestate", icon: "🏢", label: "عقارات", prompt: "ابني موقع شركة عقارات مع معرض عقارات وخريطة تفاعلية ونموذج استفسار وإحصائيات" },
  { id: "tech", icon: "💻", label: "تقنية", prompt: "ابني موقع شركة برمجيات يعرض الخدمات والمشاريع السابقة والفريق التقني ونموذج تواصل" },
  { id: "ecommerce", icon: "🛒", label: "متجر", prompt: "ابني موقع متجر إلكتروني مع عرض منتجات وسلة شراء ونظام فلترة وصفحة تفاصيل المنتج" },
  { id: "education", icon: "🎓", label: "تعليم", prompt: "ابني موقع أكاديمية تعليمية مع عرض الدورات والمدرسين ونظام تسجيل وشهادات الطلاب" },
];

// ─── Fallback sample files for demo ───
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
        ".glass-effect { background:rgba(255,255,255,0.8); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.3); }",
        ".text-gradient { background:linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }",
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
        '  <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />',
        '  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">',
        '    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-bold border border-blue-200/50 mb-6">',
        '      <span>خدماتنا المميزة</span>',
        '    </div>',
        '    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">نقدم لك أفضل الحلول</h2>',
        '    <p className="text-base md:text-lg leading-relaxed text-gray-600 mb-12">نحن نؤمن بتقديم خدمات عالية الجودة تلبي احتياجاتك</p>',
        '    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">',
        '      <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-2xl border border-gray-100/80 hover:border-blue-200/60 transition-all duration-500 hover:-translate-y-2 group overflow-hidden">',
        '        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200/60 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">',
        '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-blue-600"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>',
        '        </div>',
        '        <h3 className="text-xl font-bold text-gray-900 mb-3">تطوير المواقع</h3>',
        '        <p className="text-gray-600 leading-relaxed mb-4">نبني لك مواقع احترافية متجاوبة بأحدث التقنيات</p>',
        '        <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 hover:gap-3 focus:ring-4 focus:ring-blue-500/20 focus:outline-none rounded-lg px-2 py-1">اقرأ المزيد</button>',
        '      </div>',
        '    </div>',
        '    <button className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-blue-500/30 mt-12">تواصل معنا</button>',
        '  </div>',
        '</div>',
      ];
      return lines[i % lines.length];
    }).join("\n"),
  })),
  {
    name: "App.tsx",
    content: [
      '<div dir="rtl" lang="ar" style={{fontFamily: "\'Cairo\', sans-serif", overflow: "hidden"}}>',
      "  <Header />", "  <Hero />", "  <Services />", "  <About />",
      "  <Stats />", "  <Testimonials />", "  <CTA />", "  <Contact />", "  <Footer />",
      "</div>",
    ].join("\n"),
  },
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

// ─── Main page ───

export default function TestQualityPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [report, setReport] = useState<CodeQualityReport | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [buildPhase, setBuildPhase] = useState<string>("");
  const [builtFiles, setBuiltFiles] = useState<VFSFile[]>([]);

  // Real build + analyze
  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error("الرجاء كتابة طلب البناء");
      return;
    }

    setIsBuilding(true);
    setReport(null);
    setShowCode(false);
    setBuiltFiles([]);
    setBuildPhase("📋 برق يخطط المشروع...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("يرجى تسجيل الدخول أولاً");
        setIsBuilding(false);
        return;
      }

      // Phase 1: Planning
      let buildPrompt = "";
      let dependencyGraph: any = null;

      await streamBarqPlanner(
        { conversationHistory: [{ role: "user", content: prompt }], projectId: null, vfsContext: [] },
        {
          onThinkingStep: (step) => setBuildPhase("🧠 " + step),
          onBuildReady: (bp, _summary, _name, dg) => {
            buildPrompt = bp;
            dependencyGraph = dg;
            setBuildPhase("⚡ المبرمج ينفّذ...");
          },
          onMessageDelta: () => {},
          onDone: () => {},
          onError: (err) => { throw new Error(err); },
        }
      );

      if (!buildPrompt) {
        // Planner didn't produce a build prompt — may still be in conversation mode
        toast.info("المخطط يحتاج مزيد من التفاصيل — حاول وصفاً أطول");
        setIsBuilding(false);
        return;
      }

      // Phase 2: Building
      const collectedFiles: VFSFile[] = [];

      await streamBarqBuilder(
        { buildPrompt, projectId: null, dependencyGraph, existingFiles: [] },
        {
          onFileStart: (path) => setBuildPhase(`📄 ${path}`),
          onFileDone: (path, content) => {
            collectedFiles.push({ name: path.split("/").pop() || path, content });
          },
          onDone: () => {},
          onError: (err) => { throw new Error(err); },
        }
      );

      // Phase 3: Analyze
      setIsBuilding(false);
      setIsAnalyzing(true);
      setBuildPhase("🔍 جاري تحليل الجودة...");
      setBuiltFiles(collectedFiles);

      setTimeout(() => {
        const result = validateCodeQuality(collectedFiles);
        setReport(result);
        setIsAnalyzing(false);
        setBuildPhase("");
        if (result.passed) toast.success(`✅ جودة ممتازة: ${result.score}/100`);
        else toast.warning(`⚠️ الجودة: ${result.score}/100`);
      }, 600);
    } catch (error: any) {
      console.error("[test-quality]", error);
      toast.error(error?.message || "فشل البناء — حاول مرة أخرى");
      setIsBuilding(false);
      setIsAnalyzing(false);
      setBuildPhase("");
    }
  };

  // Quick demo with sample files (no auth needed)
  const handleDemoTest = () => {
    setIsAnalyzing(true);
    setReport(null);
    setBuiltFiles(SAMPLE_FILES);
    setBuildPhase("🔍 تحليل النموذج...");
    setTimeout(() => {
      setReport(validateCodeQuality(SAMPLE_FILES));
      setIsAnalyzing(false);
      setBuildPhase("");
    }, 800);
  };

  const largestFile = useMemo(() => {
    if (!builtFiles.length) return null;
    return [...builtFiles].sort((a, b) => b.content.split("\n").length - a.content.split("\n").length)[0] || null;
  }, [builtFiles]);

  const activeFiles = report ? report.files : [];

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
            ابنِ موقعاً فعلياً باستخدام محرك برق، ثم حلّل جودة الكود — 5 محاور × 20 نقطة
          </p>
        </div>

        {/* ─── Build & Test Section ─── */}
        <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            ابنِ واختبر الجودة
          </h2>

          {/* Quick Examples */}
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-2.5 block">أمثلة سريعة:</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setPrompt(ex.prompt)}
                  disabled={isBuilding || isAnalyzing}
                  className="text-xs px-3 py-2 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {ex.icon} {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="mb-3">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">طلب البناء:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`اكتب وصف تفصيلي للموقع الذي تريد بناءه...\n\nمثال: ابني موقع مطعم سعودي فاخر يتخصص في المأكولات التقليدية، مع قائمة طعام تفاعلية، نظام حجوزات، معرض صور، وقسم تواصل`}
              rows={5}
              dir="rtl"
              disabled={isBuilding || isAnalyzing}
              className="resize-none text-base"
            />
            <div className="text-xs text-muted-foreground mt-1.5 text-left">{prompt.length} حرف</div>
          </div>

          {/* Build phase indicator */}
          {buildPhase && (
            <div className="mb-4 flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              {buildPhase}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTest}
              disabled={!prompt.trim() || isBuilding || isAnalyzing}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100"
            >
              {isBuilding ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري البناء...</>
              ) : isAnalyzing ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري التحليل...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> ⚡ ابنِ واختبر</>
              )}
            </button>

            <button
              onClick={handleDemoTest}
              disabled={isBuilding || isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-4 border border-border rounded-2xl font-bold text-foreground hover:bg-muted transition-all disabled:opacity-50"
            >
              <FlaskConical className="h-4 w-4" />
              🧪 اختبار نموذجي
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            ⚡ "ابنِ واختبر" يستدعي محرك برق الفعلي (يتطلب تسجيل دخول) — "اختبار نموذجي" يستخدم بيانات ثابتة للتجربة السريعة
          </p>
        </section>

        {/* ─── Results ─── */}
        {report && (
          <div className="space-y-8 animate-fade-in">
            {/* Score Overview */}
            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreCircle score={report.score} size={140} />
                <div className="flex-1 text-center sm:text-right">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {report.passed ? "✅ الجودة مقبولة" : "❌ الجودة دون المعيار"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeFiles.length} ملف مولّد — متوسط {Math.round(activeFiles.reduce((s, f) => s + f.lines, 0) / (activeFiles.length || 1))} سطر
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

            {/* Breakdown */}
            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
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
                  <h4 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />مشاكل مكتشفة
                  </h4>
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

            {/* File Analysis Table */}
            <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileCode2 className="h-5 w-5 text-primary" />
                </div>
                تحليل تفصيلي للملفات
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">الملف</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">الحجم</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Tailwind</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">عربي %</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">التقييم</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFiles.map((file) => (
                      <tr key={file.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-foreground font-medium">{file.name}</td>
                        <td className="text-center py-3 px-2">
                          <span className="text-foreground font-semibold">{file.lines}</span>
                          <span className="text-muted-foreground text-xs mr-1">سطر</span>
                        </td>
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

            {/* Code Example */}
            {largestFile && (
              <section className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-accent-foreground" />
                    </div>
                    أمثلة الكود
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg">
                    {largestFile.name} ({largestFile.content.split("\n").length} سطر)
                  </span>
                </div>
                <div className="bg-foreground/95 rounded-2xl p-6 overflow-x-auto">
                  <pre className="text-sm text-background/80 font-mono leading-relaxed whitespace-pre-wrap" dir="ltr">
                    {showCode
                      ? largestFile.content
                      : largestFile.content.split("\n").slice(0, 50).join("\n") + "\n\n// ... (" + (largestFile.content.split("\n").length - 50) + " سطر إضافي)"}
                  </pre>
                </div>
                <button onClick={() => setShowCode(!showCode)} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
                  {showCode ? <><ChevronUp className="h-4 w-4" /> اقرأ أقل</> : <><ChevronDown className="h-4 w-4" /> عرض الكود الكامل</>}
                </button>
              </section>
            )}

            {/* Download */}
            <div className="text-center">
              <button
                onClick={() => {
                  const lines = [
                    `── تقرير جودة الكود ──`,
                    `التاريخ: ${new Date().toLocaleDateString("ar-SA")}`,
                    `النتيجة: ${report.score}/100 (${report.passed ? "مقبول ✅" : "مرفوض ❌"})`,
                    ``, `── تفصيل النقاط ──`,
                    `حجم الكود: ${report.breakdown.codeSize}/20`,
                    `ثراء Tailwind: ${report.breakdown.tailwindRichness}/20`,
                    `محتوى عربي: ${report.breakdown.arabicContent}/20`,
                    `التفاعلية: ${report.breakdown.interactivity}/20`,
                    `الاكتمال: ${report.breakdown.completeness}/20`,
                    ``, `── الملفات (${activeFiles.length}) ──`,
                    ...activeFiles.map(f => `${f.grade} | ${f.name} | ${f.lines} سطر | عربي ${Math.round(f.arabicRatio * 100)}%`),
                    ...(report.issues.length ? [``, `── مشاكل ──`, ...report.issues] : []),
                    ...(report.suggestions.length ? [``, `── اقتراحات ──`, ...report.suggestions] : []),
                  ];
                  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `quality-report-${report.score}.txt`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-card border border-border rounded-2xl font-bold text-foreground hover:bg-muted transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                <ArrowRight className="h-5 w-5 rotate-90" />
                📥 تحميل التقرير
              </button>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowRight className="h-4 w-4" />العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
