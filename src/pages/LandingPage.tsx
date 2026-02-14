import { useState } from "react";
import { Globe, Palette, Cpu, Code, Sparkles, Send } from "lucide-react";
import BarqLogo from "@/components/BarqLogo";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Cpu, title: "ذكاء اصطناعي سعودي", desc: "يحاورك بلهجتك ويفهم احتياجك بالضبط" },
  { icon: Globe, title: "مواقع جاهزة بثوانٍ", desc: "من الفكرة للموقع الكامل بأسرع وقت" },
  { icon: Palette, title: "تصميم احترافي", desc: "قوالب متجاوبة مع جميع الأجهزة" },
  { icon: Code, title: "ملفات متعددة", desc: "يولد Header, Hero, Footer, Styles كلها منفصلة" },
  { icon: Sparkles, title: "تفكير ذكي", desc: "يعرض لك خطوات تفكيره أثناء البناء" },
];

const templates = [
  { label: "موقع مطعم 🍕", prompt: "أبي موقع لمطعم سعودي فخم" },
  { label: "متجر إلكتروني 🛒", prompt: "أبي متجر إلكتروني لبيع الملابس" },
  { label: "محفظة أعمال 💼", prompt: "أبي محفظة أعمال شخصية احترافية" },
  { label: "شركة تقنية 💻", prompt: "أبي موقع لشركة تقنية ناشئة" },
  { label: "عيادة طبية 🏥", prompt: "أبي موقع لعيادة أسنان" },
  { label: "مكتب محاماة ⚖️", prompt: "أبي موقع لمكتب محاماة واستشارات" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [heroInput, setHeroInput] = useState("");

  const handleHeroSubmit = () => {
    if (!heroInput.trim()) return;
    // Navigate to builder with the prompt as a query param
    navigate(`/builder?prompt=${encodeURIComponent(heroInput.trim())}`);
  };

  const handleTemplateClick = (prompt: string) => {
    navigate(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <BarqLogo size={36} />
            <span className="font-bold text-lg text-foreground">برق Ai</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => navigate("/pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              الأسعار
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              دخول
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="text-sm px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              ابدأ مجاناً
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 sm:pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
            <BarqLogo size={20} />
            أول منشئ مواقع ذكي بالعربي
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            ابنِ موقعك بسرعة
            <span className="text-primary"> البرق </span>
            <span className="text-accent">⚡</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            كلّم برق عن مشروعك وهو يبني لك موقع احترافي متجاوب بثوانٍ
          </p>

          {/* Big centered input - like Lovable */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-3 shadow-lg shadow-primary/5 focus-within:border-primary/50 transition-all">
              <div className="flex items-end gap-2">
                <textarea
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleHeroSubmit();
                    }
                  }}
                  placeholder="وش تبي تبني؟ اكتب فكرتك هنا..."
                  rows={2}
                  className="flex-1 bg-transparent resize-none text-base text-foreground placeholder:text-muted-foreground focus:outline-none py-2 px-3 min-h-[60px]"
                />
                <button
                  onClick={handleHeroSubmit}
                  disabled={!heroInput.trim()}
                  className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0 mb-0.5"
                >
                  <Send className="h-5 w-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => handleTemplateClick(t.prompt)}
                className="text-sm px-4 py-2 rounded-xl border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            ليش تختار <span className="text-primary">برق</span>؟
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">كل اللي تحتاجه لبناء موقعك في مكان واحد</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-3xl p-12">
          <div className="mx-auto mb-5"><BarqLogo size={48} /></div>
          <h2 className="text-3xl font-bold text-foreground mb-4">جاهز تبدأ؟</h2>
          <p className="text-muted-foreground mb-8 text-lg">سجّل الآن وابنِ أول موقع لك بالمجان</p>
          <button
            onClick={() => navigate("/auth")}
            className="px-10 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-opacity"
          >
            ابدأ الآن ⚡
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026{" "}
            <a href="https://barqai.site" className="text-primary hover:underline">Barq Ai</a>
            {" "}- جميع الحقوق محفوظة ⚡
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/privacy")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              سياسة الخصوصية
            </button>
            <button onClick={() => navigate("/terms")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              شروط الاستخدام
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
