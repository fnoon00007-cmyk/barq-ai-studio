import { VFSFile } from "@/hooks/v2/useVFS";

/**
 * Medical Clinic Template — عيادة طبية
 * Full professional pre-built code for instant template customization.
 * Each component is 200-400+ lines of production-ready JSX.
 */

const STYLES_CSS = `:root {
  --primary: #0891B2;
  --primary-dark: #0E7490;
  --primary-light: #22D3EE;
  --secondary: #064E3B;
  --accent: #10B981;
  --accent-light: #34D399;
  --bg-dark: #0F172A;
  --bg-light: #F0FDFA;
  --bg-card: #FFFFFF;
  --text-dark: #0F172A;
  --text-light: #F0FDFA;
  --text-muted: #64748B;
  --border: #E2E8F0;
  --success: #10B981;
  --warning: #F59E0B;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

body {
  font-family: 'Tajawal', 'Segoe UI', sans-serif;
  direction: rtl;
  text-align: right;
  background: var(--bg-light);
  color: var(--text-dark);
  line-height: 1.8;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.section-subtitle {
  font-size: 1.1rem;
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(8, 145, 178, 0.35);
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-light);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 28px;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-light); }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
`;

const APP_TSX = `import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Services from "./Services";
import Doctors from "./Doctors";
import Stats from "./Stats";
import Appointments from "./Appointments";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Footer from "./Footer";

export default function App() {
  return (
    <div className="app" style={{ direction: "rtl" }}>
      <Header />
      <main>
        <Hero />
        <Services />
        <Stats />
        <Doctors />
        <Appointments />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}`;

const HEADER_TSX = `import React, { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "خدماتنا", href: "#services" },
    { label: "أطباؤنا", href: "#doctors" },
    { label: "المواعيد", href: "#appointments" },
    { label: "آراء المرضى", href: "#testimonials" },
    { label: "تواصل معنا", href: "#contact" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? "12px 0" : "18px 0",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", color: "white",
          }}>🏥</div>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: scrolled ? "var(--text-dark)" : "var(--text-dark)", lineHeight: 1.2 }}>
              عيادات الشفاء
            </h1>
            <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600, letterSpacing: "1px" }}>
              AL-SHIFA CLINICS
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "28px", alignItems: "center" }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: scrolled ? "var(--text-dark)" : "var(--text-dark)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "color 0.3s",
                position: "relative",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = scrolled ? "var(--text-dark)" : "var(--text-dark)"}
            >
              {link.label}
            </a>
          ))}
          <a href="#appointments" className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>
            احجز موعدك 📅
          </a>
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none", background: "none", border: "none",
            fontSize: "1.6rem", cursor: "pointer", color: "var(--text-dark)",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)",
          padding: "24px", borderBottom: "1px solid var(--border)",
          animation: "fadeInUp 0.3s ease",
        }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "14px 0", color: "var(--text-dark)",
                textDecoration: "none", fontWeight: 600, fontSize: "1.05rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {link.label}
            </a>
          ))}
          <a href="#appointments" className="btn-primary" style={{ marginTop: "16px", textAlign: "center", width: "100%", justifyContent: "center", textDecoration: "none" }}>
            احجز موعدك الآن
          </a>
        </div>
      )}
    </header>
  );
}`;

const HERO_TSX = `import React, { useState, useEffect } from "react";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: "صحتك أولويتنا", subtitle: "رعاية طبية متكاملة بأحدث التقنيات وأفضل الكفاءات الطبية", icon: "🫀" },
    { title: "أطباء متخصصون", subtitle: "نخبة من الأطباء المعتمدين في أكثر من 15 تخصصاً طبياً", icon: "👨‍⚕️" },
    { title: "تقنيات متطورة", subtitle: "أحدث الأجهزة الطبية والتقنيات العلاجية المتقدمة", icon: "🔬" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: "🕐", label: "متاحون 24/7", desc: "خدمة على مدار الساعة" },
    { icon: "👨‍⚕️", label: "+50 طبيب", desc: "أطباء متخصصون" },
    { icon: "🏆", label: "+15 سنة", desc: "خبرة في المجال" },
    { icon: "😊", label: "+100,000", desc: "مريض سعيد" },
  ];

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(165deg, #F0FDFA 0%, #ECFDF5 30%, #E0F2FE 70%, #F0F9FF 100%)",
        paddingTop: "100px",
      }}
    >
      {/* Decorative elements */}
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)",
        top: "-100px", left: "-150px", animation: "pulse-slow 6s infinite",
      }} />
      <div style={{
        position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        bottom: "-50px", right: "-100px", animation: "pulse-slow 8s infinite",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "10%",
        fontSize: "4rem", opacity: 0.1, animation: "float 6s ease-in-out infinite",
      }}>🩺</div>
      <div style={{
        position: "absolute", bottom: "20%", left: "8%",
        fontSize: "3.5rem", opacity: 0.1, animation: "float 7s ease-in-out infinite 1s",
      }}>💊</div>

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div style={{ animation: "fadeInUp 0.8s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(8,145,178,0.1)", padding: "8px 18px", borderRadius: "50px",
              fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", marginBottom: "24px",
            }}>
              <span>🌟</span>
              <span>مرحباً بكم في عيادات الشفاء</span>
            </div>

            <h1 style={{
              fontSize: "3.5rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "20px",
            }}>
              {slides[currentSlide].title.split(" ").map((word, i) => (
                <span key={i}>
                  {i === 0 ? (
                    <span className="gradient-text">{word} </span>
                  ) : (
                    <span>{word} </span>
                  )}
                </span>
              ))}
            </h1>

            <p style={{
              fontSize: "1.2rem", color: "var(--text-muted)", lineHeight: 1.8,
              marginBottom: "36px", maxWidth: "500px",
            }}>
              {slides[currentSlide].subtitle}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
              <a href="#appointments" className="btn-primary" style={{ textDecoration: "none" }}>
                احجز موعدك الآن 📅
              </a>
              <a href="#services" className="btn-secondary" style={{ textDecoration: "none" }}>
                تعرّف على خدماتنا
              </a>
            </div>

            {/* Slide indicators */}
            <div style={{ display: "flex", gap: "8px" }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: currentSlide === i ? "32px" : "10px", height: "10px",
                    borderRadius: "5px", border: "none", cursor: "pointer",
                    background: currentSlide === i ? "var(--primary)" : "var(--border)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ position: "relative", animation: "fadeInUp 1s ease 0.2s both" }}>
            <div style={{
              width: "100%", aspectRatio: "1", borderRadius: "30px",
              background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(16,185,129,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10rem", position: "relative", overflow: "hidden",
              border: "1px solid rgba(8,145,178,0.15)",
            }}>
              <span style={{ animation: "heartbeat 3s ease-in-out infinite", filter: "drop-shadow(0 10px 20px rgba(8,145,178,0.2))" }}>
                {slides[currentSlide].icon}
              </span>
              <div style={{
                position: "absolute", bottom: "20px", right: "20px", left: "20px",
                background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
                borderRadius: "14px", padding: "16px 20px",
                display: "flex", justifyContent: "space-around",
                border: "1px solid rgba(8,145,178,0.1)",
              }}>
                {features.map((f, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{f.icon}</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dark)" }}>{f.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`;

const SERVICES_TSX = `import React, { useState } from "react";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "جميع التخصصات" },
    { id: "general", label: "طب عام" },
    { id: "specialist", label: "تخصصات دقيقة" },
    { id: "dental", label: "أسنان" },
    { id: "cosmetic", label: "تجميل" },
  ];

  const services = [
    { icon: "🫀", title: "طب القلب والأوعية", desc: "تشخيص وعلاج أمراض القلب والشرايين بأحدث التقنيات وأجهزة القسطرة المتطورة", category: "specialist", color: "#EF4444" },
    { icon: "🦴", title: "جراحة العظام", desc: "علاج إصابات العظام والمفاصل وتركيب المفاصل الصناعية والعلاج الطبيعي المتقدم", category: "specialist", color: "#8B5CF6" },
    { icon: "👁️", title: "طب العيون", desc: "فحص شامل للنظر وعمليات الليزك والماء الأبيض بأحدث أجهزة التصحيح البصري", category: "specialist", color: "#3B82F6" },
    { icon: "🦷", title: "طب الأسنان", desc: "تجميل وعلاج الأسنان وزراعتها وتقويمها مع أحدث تقنيات التبييض والحشوات", category: "dental", color: "#06B6D4" },
    { icon: "🧠", title: "طب الأعصاب", desc: "تشخيص وعلاج أمراض الجهاز العصبي والدماغ بإشراف أطباء متخصصين", category: "specialist", color: "#EC4899" },
    { icon: "👶", title: "طب الأطفال", desc: "رعاية صحية شاملة لأطفالكم مع برنامج تطعيمات كامل ومتابعة النمو والتطور", category: "general", color: "#F59E0B" },
    { icon: "🏥", title: "الطب الباطني", desc: "تشخيص وعلاج أمراض الجهاز الهضمي والكبد والسكري والغدد الصماء", category: "general", color: "#10B981" },
    { icon: "💉", title: "التجميل والليزر", desc: "أحدث تقنيات التجميل غير الجراحي والبوتكس والفيلر وعلاج البشرة بالليزر", category: "cosmetic", color: "#F472B6" },
    { icon: "🩻", title: "الأشعة والتصوير", desc: "أجهزة أشعة رقمية متطورة وأشعة مقطعية ورنين مغناطيسي للتشخيص الدقيق", category: "general", color: "#6366F1" },
  ];

  const filtered = activeCategory === "all" ? services : services.filter((s) => s.category === activeCategory);

  return (
    <section id="services" style={{ padding: "100px 0", background: "white" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            تخصصاتنا الطبية
          </span>
        </div>
        <h2 className="section-title">خدمات طبية <span className="gradient-text">شاملة ومتكاملة</span></h2>
        <p className="section-subtitle">نقدم أكثر من 15 تخصصاً طبياً تحت سقف واحد بإشراف نخبة من الأطباء المعتمدين</p>

        {/* Category filter */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "48px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "10px 22px", borderRadius: "50px", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                background: activeCategory === cat.id ? "linear-gradient(135deg, var(--primary), var(--accent))" : "var(--bg-light)",
                color: activeCategory === cat.id ? "white" : "var(--text-muted)",
                transition: "all 0.3s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "24px",
        }}>
          {filtered.map((service, index) => (
            <div
              key={index}
              className="card"
              style={{
                animation: \`fadeInUp 0.5s ease \${index * 0.1}s both\`,
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, width: "100px", height: "100px",
                background: \`radial-gradient(circle at top right, \${service.color}15, transparent 70%)\`,
              }} />
              <div style={{
                width: "60px", height: "60px", borderRadius: "16px",
                background: \`\${service.color}15\`, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem", marginBottom: "18px",
              }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "10px", color: "var(--text-dark)" }}>
                {service.title}
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: "18px" }}>
                {service.desc}
              </p>
              <a href="#appointments" style={{
                color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px",
              }}>
                احجز موعد ←
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const STATS_TSX = `import React, { useState, useEffect, useRef } from "react";

export default function Stats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: "👨‍⚕️", value: 50, suffix: "+", label: "طبيب متخصص", desc: "في أكثر من 15 تخصصاً" },
    { icon: "😊", value: 100, suffix: "K+", label: "مريض سعيد", desc: "وثقوا بنا منذ التأسيس" },
    { icon: "🏆", value: 15, suffix: "+", label: "سنة خبرة", desc: "في الرعاية الطبية" },
    { icon: "🏥", value: 25, suffix: "+", label: "عيادة متخصصة", desc: "مجهزة بأحدث التقنيات" },
  ];

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 0",
        background: "linear-gradient(135deg, var(--bg-dark) 0%, #1E293B 100%)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)",
        top: "-80px", right: "-80px",
      }} />
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center", animation: visible ? \`fadeInUp 0.6s ease \${i * 0.15}s both\` : "none",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{stat.icon}</div>
              <div style={{
                fontSize: "2.8rem", fontWeight: 900, color: "var(--primary-light)",
                lineHeight: 1,
              }}>
                {visible ? stat.value : 0}{stat.suffix}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginTop: "8px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const DOCTORS_TSX = `import React, { useState } from "react";

export default function Doctors() {
  const [hoveredDoctor, setHoveredDoctor] = useState<number | null>(null);

  const doctors = [
    {
      name: "د. عبدالله الشمري",
      title: "استشاري طب القلب والأوعية الدموية",
      exp: "20 سنة خبرة",
      icon: "👨‍⚕️",
      specialties: ["قسطرة القلب", "تخطيط القلب", "الشرايين"],
      color: "#EF4444",
    },
    {
      name: "د. نورة القحطاني",
      title: "استشارية طب الأطفال والمواليد",
      exp: "15 سنة خبرة",
      icon: "👩‍⚕️",
      specialties: ["حديثي الولادة", "التطعيمات", "النمو والتطور"],
      color: "#F59E0B",
    },
    {
      name: "د. فهد الدوسري",
      title: "استشاري جراحة العظام والمفاصل",
      exp: "18 سنة خبرة",
      icon: "👨‍⚕️",
      specialties: ["تركيب المفاصل", "إصابات الملاعب", "العمود الفقري"],
      color: "#8B5CF6",
    },
    {
      name: "د. سارة العتيبي",
      title: "استشارية الجلدية والتجميل",
      exp: "12 سنة خبرة",
      icon: "👩‍⚕️",
      specialties: ["البوتكس والفيلر", "الليزر", "علاج البشرة"],
      color: "#EC4899",
    },
    {
      name: "د. محمد الحربي",
      title: "استشاري طب العيون والليزك",
      exp: "16 سنة خبرة",
      icon: "👨‍⚕️",
      specialties: ["عمليات الليزك", "الماء الأبيض", "شبكية العين"],
      color: "#3B82F6",
    },
    {
      name: "د. ريم السبيعي",
      title: "استشارية طب الأسنان التجميلي",
      exp: "10 سنوات خبرة",
      icon: "👩‍⚕️",
      specialties: ["زراعة الأسنان", "التقويم", "ابتسامة هوليوود"],
      color: "#06B6D4",
    },
  ];

  return (
    <section id="doctors" style={{ padding: "100px 0", background: "var(--bg-light)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            فريقنا الطبي
          </span>
        </div>
        <h2 className="section-title">نخبة من <span className="gradient-text">الأطباء المتخصصين</span></h2>
        <p className="section-subtitle">أطباؤنا حاصلون على شهادات البورد من أرقى الجامعات العالمية</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
          {doctors.map((doc, i) => (
            <div
              key={i}
              className="card"
              onMouseEnter={() => setHoveredDoctor(i)}
              onMouseLeave={() => setHoveredDoctor(null)}
              style={{
                textAlign: "center", animation: \`fadeInUp 0.5s ease \${i * 0.1}s both\`,
                position: "relative", overflow: "hidden",
                border: hoveredDoctor === i ? \`1px solid \${doc.color}40\` : "1px solid var(--border)",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                background: \`linear-gradient(90deg, \${doc.color}, \${doc.color}80)\`,
                opacity: hoveredDoctor === i ? 1 : 0, transition: "opacity 0.3s",
              }} />
              <div style={{
                width: "90px", height: "90px", borderRadius: "50%", margin: "0 auto 18px",
                background: \`\${doc.color}15\`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
                border: \`3px solid \${doc.color}30\`,
              }}>
                {doc.icon}
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "6px" }}>
                {doc.name}
              </h3>
              <p style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>
                {doc.title}
              </p>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{doc.exp}</span>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "16px" }}>
                {doc.specialties.map((s, j) => (
                  <span key={j} style={{
                    background: \`\${doc.color}10\`, color: doc.color,
                    padding: "4px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              <a href="#appointments" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                marginTop: "18px", color: "var(--primary)", fontWeight: 600,
                fontSize: "0.9rem", textDecoration: "none",
              }}>
                احجز مع الطبيب ←
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const APPOINTMENTS_TSX = `import React, { useState } from "react";

export default function Appointments() {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", department: "", doctor: "", date: "", time: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const departments = [
    "طب القلب", "جراحة العظام", "طب العيون", "طب الأسنان",
    "طب الأطفال", "الجلدية والتجميل", "الطب الباطني", "طب الأعصاب",
  ];

  const timeSlots = [
    "09:00 ص", "09:30 ص", "10:00 ص", "10:30 ص", "11:00 ص",
    "11:30 ص", "02:00 م", "02:30 م", "03:00 م", "03:30 م",
    "04:00 م", "04:30 م", "05:00 م", "07:00 م", "07:30 م", "08:00 م",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px", borderRadius: "12px",
    border: "1px solid var(--border)", fontSize: "0.95rem",
    fontFamily: "inherit", background: "white",
    transition: "border-color 0.3s, box-shadow 0.3s",
    outline: "none",
  };

  return (
    <section id="appointments" style={{ padding: "100px 0", background: "white" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            حجز المواعيد
          </span>
        </div>
        <h2 className="section-title">احجز <span className="gradient-text">موعدك الآن</span></h2>
        <p className="section-subtitle">خطوات بسيطة لحجز موعدك مع أفضل الأطباء المتخصصين</p>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {submitted ? (
            <div style={{
              textAlign: "center", padding: "60px", animation: "fadeInUp 0.5s ease",
              background: "rgba(16,185,129,0.05)", borderRadius: "20px",
              border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", marginBottom: "8px" }}>
                تم حجز موعدك بنجاح!
              </h3>
              <p style={{ color: "var(--text-muted)" }}>سنتواصل معك قريباً لتأكيد الحجز</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card" style={{ padding: "40px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    الاسم الكامل *
                  </label>
                  <input
                    type="text" required placeholder="أدخل اسمك الكامل"
                    style={inputStyle}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    رقم الجوال *
                  </label>
                  <input
                    type="tel" required placeholder="05XXXXXXXX"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(8,145,178,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    القسم الطبي *
                  </label>
                  <select
                    required style={{ ...inputStyle, cursor: "pointer" }}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">اختر القسم</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    التاريخ المفضل *
                  </label>
                  <input
                    type="date" required style={inputStyle}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    الوقت المفضل *
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {timeSlots.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData({ ...formData, time: t })}
                        style={{
                          padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)",
                          background: formData.time === t ? "var(--primary)" : "white",
                          color: formData.time === t ? "white" : "var(--text-muted)",
                          cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-dark)" }}>
                    ملاحظات إضافية
                  </label>
                  <textarea
                    rows={3} placeholder="أي ملاحظات تود إضافتها..."
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "24px", padding: "16px" }}>
                تأكيد الحجز 📅
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}`;

const TESTIMONIALS_TSX = `import React, { useState } from "react";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: "أحمد الغامدي", role: "مريض - قسم القلب", rating: 5,
      text: "تجربة استثنائية مع د. عبدالله الشمري. من أول زيارة شعرت بالراحة والاطمئنان. التشخيص كان دقيقاً والعلاج فعّال. أنصح الجميع بعيادات الشفاء.",
      icon: "👨",
    },
    {
      name: "فاطمة المالكي", role: "والدة مريض - قسم الأطفال", rating: 5,
      text: "د. نورة القحطاني من أفضل أطباء الأطفال. تتعامل مع الأطفال بحب واهتمام كبير. ابني يحب زيارة العيادة وهذا شيء نادر! شكراً لكم.",
      icon: "👩",
    },
    {
      name: "خالد الزهراني", role: "مريض - قسم العظام", rating: 5,
      text: "بعد عملية تغيير المفصل مع د. فهد، حياتي تغيرت تماماً. رجعت أمشي بشكل طبيعي بعد سنوات من المعاناة. فريق التأهيل ممتاز أيضاً.",
      icon: "👨",
    },
    {
      name: "منيرة العنزي", role: "مريضة - قسم التجميل", rating: 5,
      text: "نتائج مذهلة مع د. سارة في علاج البشرة بالليزر. الفريق محترف والعيادة نظيفة ومجهزة. أصبحت بشرتي أفضل بكثير.",
      icon: "👩",
    },
    {
      name: "سلطان الحربي", role: "مريض - قسم العيون", rating: 5,
      text: "عملية الليزك مع د. محمد كانت سريعة وبدون أي ألم. النتيجة مبهرة - تخلصت من النظارة بعد 20 سنة! الحمد لله.",
      icon: "👨",
    },
  ];

  return (
    <section id="testimonials" style={{ padding: "100px 0", background: "var(--bg-light)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            آراء مرضانا
          </span>
        </div>
        <h2 className="section-title">ماذا يقول <span className="gradient-text">مرضانا عنّا</span></h2>
        <p className="section-subtitle">ثقة مرضانا هي أكبر شهادة على جودة خدماتنا</p>

        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "40px", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "18px" }}>
              {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                <span key={i} style={{ color: "#F59E0B", fontSize: "1.3rem" }}>⭐</span>
              ))}
            </div>
            <p style={{
              fontSize: "1.15rem", lineHeight: 2, color: "var(--text-dark)",
              fontStyle: "italic", marginBottom: "24px", position: "relative",
            }}>
              <span style={{ fontSize: "2rem", color: "var(--primary)", opacity: 0.3, position: "absolute", top: "-10px", right: "-5px" }}>"</span>
              {testimonials[activeIndex].text}
              <span style={{ fontSize: "2rem", color: "var(--primary)", opacity: 0.3 }}>"</span>
            </p>
            <div style={{
              width: "55px", height: "55px", borderRadius: "50%", margin: "0 auto 10px",
              background: "rgba(8,145,178,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
            }}>
              {testimonials[activeIndex].icon}
            </div>
            <h4 style={{ fontWeight: 700, color: "var(--text-dark)" }}>{testimonials[activeIndex].name}</h4>
            <p style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600 }}>
              {testimonials[activeIndex].role}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: activeIndex === i ? "32px" : "10px", height: "10px",
                  borderRadius: "5px", border: "none", cursor: "pointer",
                  background: activeIndex === i ? "var(--primary)" : "var(--border)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}`;

const FAQ_TSX = `import React, { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "ما هي ساعات عمل العيادة؟",
      a: "نعمل من السبت إلى الخميس، الفترة الصباحية من 9:00 ص إلى 12:00 م، والفترة المسائية من 4:00 م إلى 9:00 م. قسم الطوارئ متاح 24 ساعة.",
    },
    {
      q: "هل تقبلون التأمين الطبي؟",
      a: "نعم، نتعامل مع أكثر من 30 شركة تأمين طبي معتمدة في المملكة. يرجى الاتصال بنا للتأكد من تغطية شركة التأمين الخاصة بكم.",
    },
    {
      q: "كيف يمكنني حجز موعد؟",
      a: "يمكنكم حجز موعد من خلال الموقع الإلكتروني أو الاتصال على الرقم الموحد أو زيارة العيادة مباشرة. نوصي بالحجز المسبق لضمان الموعد المناسب.",
    },
    {
      q: "هل تتوفر خدمة الطوارئ؟",
      a: "نعم، لدينا قسم طوارئ مجهز بالكامل يعمل على مدار الساعة 24/7 مع فريق طبي متخصص جاهز لاستقبال الحالات الطارئة.",
    },
    {
      q: "هل يمكنني الحصول على استشارة عن بُعد؟",
      a: "نعم، نوفر خدمة الاستشارات الطبية عن بُعد عبر مكالمات الفيديو مع أطبائنا. يمكنكم حجز استشارة إلكترونية من خلال الموقع.",
    },
    {
      q: "ما هي التخصصات المتوفرة في العيادة؟",
      a: "نوفر أكثر من 15 تخصصاً طبياً تشمل: القلب، العظام، العيون، الأسنان، الأطفال، الجلدية، التجميل، الباطني، الأعصاب، النساء والولادة، والمزيد.",
    },
  ];

  return (
    <section style={{ padding: "100px 0", background: "white" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            الأسئلة الشائعة
          </span>
        </div>
        <h2 className="section-title">أسئلة <span className="gradient-text">يكثر طرحها</span></h2>
        <p className="section-subtitle">إجابات على أكثر الأسئلة شيوعاً من مرضانا</p>

        <div style={{ maxWidth: "750px", margin: "0 auto" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                marginBottom: "12px", borderRadius: "14px", overflow: "hidden",
                border: "1px solid var(--border)",
                background: openIndex === i ? "rgba(8,145,178,0.02)" : "white",
                transition: "all 0.3s ease",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%", padding: "20px 24px", border: "none",
                  background: "transparent", cursor: "pointer", textAlign: "right",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-dark)" }}>
                  {faq.q}
                </span>
                <span style={{
                  fontSize: "1.2rem", color: "var(--primary)",
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s ease",
                }}>
                  ▼
                </span>
              </button>
              {openIndex === i && (
                <div style={{
                  padding: "0 24px 20px", color: "var(--text-muted)",
                  lineHeight: 1.9, fontSize: "0.95rem", animation: "fadeIn 0.3s ease",
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const CONTACT_TSX = `import React from "react";

export default function Contact() {
  const contactInfo = [
    { icon: "📍", label: "العنوان", value: "حي العليا، شارع العروبة، الرياض", sub: "بجوار مركز المملكة" },
    { icon: "📞", label: "الهاتف", value: "920-XXX-XXXX", sub: "الرقم الموحد" },
    { icon: "📧", label: "البريد", value: "info@alshifa-clinics.sa", sub: "للاستفسارات العامة" },
    { icon: "🕐", label: "ساعات العمل", value: "السبت - الخميس", sub: "9ص - 12م | 4م - 9م" },
  ];

  return (
    <section id="contact" style={{ padding: "100px 0", background: "var(--bg-light)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{
            background: "rgba(8,145,178,0.1)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 600,
          }}>
            تواصل معنا
          </span>
        </div>
        <h2 className="section-title">نحن هنا <span className="gradient-text">لخدمتكم</span></h2>
        <p className="section-subtitle">لا تترددوا في التواصل معنا لأي استفسار أو حجز موعد</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "48px" }}>
          {contactInfo.map((info, i) => (
            <div key={i} className="card" style={{ textAlign: "center", animation: \`fadeInUp 0.5s ease \${i * 0.1}s both\` }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "16px",
                background: "rgba(8,145,178,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", margin: "0 auto 14px",
              }}>
                {info.icon}
              </div>
              <h4 style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {info.label}
              </h4>
              <p style={{ color: "var(--text-dark)", fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>
                {info.value}
              </p>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{info.sub}</span>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div style={{
          borderRadius: "20px", overflow: "hidden", height: "350px",
          background: "linear-gradient(135deg, rgba(8,145,178,0.05), rgba(16,185,129,0.05))",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border)",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📍</div>
            <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>موقعنا على الخريطة</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>حي العليا، شارع العروبة، الرياض</p>
          </div>
        </div>
      </div>
    </section>
  );
}`;

const FOOTER_TSX = `import React from "react";

export default function Footer() {
  const quickLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "خدماتنا", href: "#services" },
    { label: "أطباؤنا", href: "#doctors" },
    { label: "حجز موعد", href: "#appointments" },
    { label: "تواصل معنا", href: "#contact" },
  ];

  const services = [
    "طب القلب", "جراحة العظام", "طب العيون",
    "طب الأسنان", "طب الأطفال", "الجلدية والتجميل",
  ];

  return (
    <footer style={{
      background: "linear-gradient(180deg, var(--bg-dark) 0%, #0D1117 100%)",
      color: "var(--text-light)", padding: "80px 0 0",
    }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "48px", marginBottom: "48px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
              }}>🏥</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>عيادات الشفاء</h3>
                <span style={{ fontSize: "0.65rem", color: "var(--primary-light)", letterSpacing: "1px" }}>AL-SHIFA CLINICS</span>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.9, fontSize: "0.9rem", maxWidth: "300px" }}>
              نقدم رعاية طبية شاملة ومتكاملة بأعلى معايير الجودة العالمية، بإشراف نخبة من الأطباء المتخصصين وباستخدام أحدث التقنيات الطبية.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {["𝕏", "📘", "📸", "▶️"].map((s, i) => (
                <a key={i} href="#" style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.6)", textDecoration: "none",
                  fontSize: "1rem", transition: "all 0.3s",
                }}>{s}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>روابط سريعة</h4>
            {quickLinks.map((link) => (
              <a key={link.href} href={link.href} style={{
                display: "block", color: "rgba(255,255,255,0.5)", textDecoration: "none",
                padding: "6px 0", fontSize: "0.9rem", transition: "color 0.3s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-light)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>تخصصاتنا</h4>
            {services.map((s) => (
              <p key={s} style={{ color: "rgba(255,255,255,0.5)", padding: "6px 0", fontSize: "0.9rem" }}>
                {s}
              </p>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>تواصل معنا</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem" }}>📍</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>حي العليا، شارع العروبة، الرياض</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "1.1rem" }}>📞</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>920-XXX-XXXX</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "1.1rem" }}>📧</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>info@alshifa-clinics.sa</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "1.1rem" }}>🕐</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>السبت - الخميس | 9ص - 9م</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
            © 2024 عيادات الشفاء. جميع الحقوق محفوظة
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
            <span>صُنع بـ</span>
            <span style={{ color: "#EF4444" }}>❤️</span>
            <span>في الرياض 🇸🇦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}`;

export const MEDICAL_CLINIC_TEMPLATE_FILES: VFSFile[] = [
  { name: "styles.css", content: STYLES_CSS, language: "css" },
  { name: "App.tsx", content: APP_TSX, language: "tsx" },
  { name: "Header.tsx", content: HEADER_TSX, language: "tsx" },
  { name: "Hero.tsx", content: HERO_TSX, language: "tsx" },
  { name: "Services.tsx", content: SERVICES_TSX, language: "tsx" },
  { name: "Stats.tsx", content: STATS_TSX, language: "tsx" },
  { name: "Doctors.tsx", content: DOCTORS_TSX, language: "tsx" },
  { name: "Appointments.tsx", content: APPOINTMENTS_TSX, language: "tsx" },
  { name: "Testimonials.tsx", content: TESTIMONIALS_TSX, language: "tsx" },
  { name: "FAQ.tsx", content: FAQ_TSX, language: "tsx" },
  { name: "Contact.tsx", content: CONTACT_TSX, language: "tsx" },
  { name: "Footer.tsx", content: FOOTER_TSX, language: "tsx" },
];
