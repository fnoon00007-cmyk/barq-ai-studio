import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TEMPLATES,
  CATEGORY_LABELS,
  type Template,
  type TemplateCategory,
} from "@/lib/templates-data";
import { Search, ArrowRight, Layers, Palette, Loader2 } from "lucide-react";
import BarqLogo from "@/components/BarqLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.includes(q) || t.description.includes(q) || CATEGORY_LABELS[t.category].label.includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  const handleUseTemplate = async (template: Template) => {
    setLoadingId(template.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate("/auth");
        return;
      }
      // Navigate to builder with the template prompt
      navigate(`/builder?prompt=${encodeURIComponent(template.prompt)}`);
      toast.success(`جارٍ بناء: ${template.title} ⚡`);
    } catch {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoadingId(null);
    }
  };

  const categories = Object.entries(CATEGORY_LABELS) as [TemplateCategory, { label: string; icon: string }][];

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient bg */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <BarqLogo size={36} />
            <span className="font-bold text-lg text-foreground">برق Ai</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/projects")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              مشاريعي
            </button>
            <button onClick={() => navigate("/auth")} className="text-sm px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
              ابدأ مجاناً
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <Layers className="h-4 w-4" />
            مكتبة القوالب الجاهزة
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            اختر قالبك و<span className="text-primary">ابدأ البناء</span> فوراً ⚡
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            12 قالب احترافي جاهز للتخصيص — اختر واحد وبرق يبنيه لك بثوانٍ
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن قالب..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === "all"
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              الكل ({TEMPLATES.length})
            </button>
            {categories.map(([key, { label, icon }]) => {
              const count = TEMPLATES.filter((t) => t.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === key
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {icon} {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg text-muted-foreground">لم يتم العثور على قوالب مطابقة</p>
              <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="mt-4 text-sm text-primary hover:underline">
                مسح البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isLoading={loadingId === template.id}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2026 Barq Ai — جميع الحقوق محفوظة ⚡</p>
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </button>
        </div>
      </footer>
    </div>
  );
}

function TemplateCard({ template, isLoading, onUse }: { template: Template; isLoading: boolean; onUse: () => void }) {
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Thumbnail */}
      <div
        className="h-44 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${template.colors.primary}22, ${template.colors.secondary}33)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{template.icon}</span>
        </div>
        {template.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-accent/90 text-accent-foreground text-[10px] font-bold">
            ⭐ مميز
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur text-foreground text-[10px] font-bold">
          {CATEGORY_LABELS[template.category].icon} {CATEGORY_LABELS[template.category].label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-lg mb-1.5">{template.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{template.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {template.pageCount} مكونات
          </span>
          <span className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span className="flex gap-1">
              {[template.colors.primary, template.colors.secondary, template.colors.accent].map((c) => (
                <span key={c} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
              ))}
            </span>
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onUse}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ الإنشاء...
            </>
          ) : (
            "استخدم هذا القالب ⚡"
          )}
        </button>
      </div>
    </div>
  );
}
