import { Zap, Globe, Palette, Cpu, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Cpu, title: "ذكاء اصطناعي سعودي", desc: "يحاورك بلهجتك ويفهم احتياجك" },
  { icon: Globe, title: "مواقع جاهزة بثوانٍ", desc: "من الفكرة للموقع بأسرع وقت" },
  { icon: Palette, title: "تصميم احترافي", desc: "قوالب متجاوبة مع جميع الأجهزة" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <span className="font-bold text-foreground">برق Ai</span>
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
              className="text-sm px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
            >
              ابدأ مجاناً
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold mb-6">
            <Zap className="h-3.5 w-3.5" />
            أول منشئ مواقع ذكي بالعربي
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            ابنِ موقعك باللهجة
            <span className="text-primary"> السعودية </span>
            بسرعة
            <span className="text-accent"> البرق ⚡</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10">
            كلّم برق عن مشروعك وهو يبني لك موقع احترافي متجاوب بثوانٍ. بدون خبرة برمجية!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              ابدأ البناء مجاناً
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary text-foreground font-bold text-base border border-border hover:border-primary/40 transition-colors"
            >
              شوف الأسعار
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            ليش تختار <span className="text-primary">برق</span>؟ ⚡
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-10">
          <Zap className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">جاهز تبدأ؟</h2>
          <p className="text-sm text-muted-foreground mb-6">سجّل الآن وابنِ أول موقع لك بالمجان</p>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity"
          >
            ابدأ الآن ⚡
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">© 2026 برق Ai - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
