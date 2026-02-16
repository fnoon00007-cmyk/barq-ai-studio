import { VFSFile } from "@/hooks/v2/useVFS";

/**
 * E-commerce Store Template — متجر إلكتروني
 * Full professional pre-built code for instant template customization.
 */

const STYLES_CSS = `:root {
  --primary: #7C3AED;
  --primary-dark: #6D28D9;
  --primary-light: #A78BFA;
  --secondary: #1E1B4B;
  --accent: #F59E0B;
  --accent-light: #FBBF24;
  --bg-dark: #0F0A1A;
  --bg-light: #FAF5FF;
  --bg-card: #FFFFFF;
  --text-dark: #1E1B4B;
  --text-light: #F5F3FF;
  --text-muted: #6B7280;
  --border: #E5E7EB;
  --success: #10B981;
  --danger: #EF4444;
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
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes bounce-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.35);
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
  padding: 24px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-light); }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
`;

const APP_TSX = `import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Categories from "./Categories";
import FeaturedProducts from "./FeaturedProducts";
import Deals from "./Deals";
import Features from "./Features";
import Testimonials from "./Testimonials";
import Newsletter from "./Newsletter";
import Footer from "./Footer";

export default function App() {
  return (
    <div className="app" style={{ direction: "rtl" }}>
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Deals />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}`;

const HEADER_TSX = `import React, { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "الأقسام", href: "#categories" },
    { label: "المنتجات", href: "#products" },
    { label: "العروض", href: "#deals" },
    { label: "تواصل معنا", href: "#footer" },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: scrolled ? "10px 0" : "16px 0",
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem", color: "white",
          }}>🛍️</div>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.2 }}>
              متجر سوق
            </h1>
            <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 600, letterSpacing: "2px" }}>
              SOUQ STORE
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} style={{
              color: "var(--text-dark)", textDecoration: "none", fontWeight: 600,
              fontSize: "0.95rem", transition: "color 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dark)"}
            >
              {link.label}
            </a>
          ))}

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "var(--bg-light)", padding: "8px 16px", borderRadius: "10px",
            border: "1px solid var(--border)", minWidth: "180px",
          }}>
            <span style={{ color: "var(--text-muted)" }}>🔍</span>
            <input placeholder="ابحث عن منتج..." style={{
              border: "none", background: "transparent", outline: "none",
              fontFamily: "inherit", fontSize: "0.85rem", width: "100%",
            }} />
          </div>

          {/* Cart */}
          <button style={{
            position: "relative", background: "none", border: "none",
            cursor: "pointer", fontSize: "1.4rem", padding: "6px",
          }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: "-2px", right: "-6px",
                background: "var(--danger)", color: "white",
                width: "20px", height: "20px", borderRadius: "50%",
                fontSize: "0.7rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User */}
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "1.3rem", padding: "6px",
          }}>
            👤
          </button>
        </nav>
      </div>
    </header>
  );
}`;

const HERO_TSX = `import React, { useState, useEffect } from "react";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "تسوّق بذكاء",
      subtitle: "أحدث المنتجات بأفضل الأسعار مع توصيل سريع لباب بيتك في جميع أنحاء المملكة",
      badge: "🔥 خصم حتى 50%",
      cta: "تسوّق الآن",
      icon: "🛍️",
      gradient: "linear-gradient(165deg, #FAF5FF 0%, #F3E8FF 40%, #EDE9FE 100%)",
    },
    {
      title: "عروض حصرية",
      subtitle: "لا تفوّت عروضنا الأسبوعية على أفضل الماركات العالمية والمحلية",
      badge: "⚡ عرض محدود",
      cta: "اكتشف العروض",
      icon: "🏷️",
      gradient: "linear-gradient(165deg, #FFFBEB 0%, #FEF3C7 40%, #FDE68A40 100%)",
    },
    {
      title: "جودة مضمونة",
      subtitle: "منتجات أصلية 100% مع ضمان الاسترجاع خلال 30 يوماً وخدمة عملاء مميزة",
      badge: "✅ ضمان الجودة",
      cta: "تصفح المنتجات",
      icon: "🏆",
      gradient: "linear-gradient(165deg, #ECFDF5 0%, #D1FAE5 40%, #A7F3D0 100%)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[currentSlide];

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
      background: current.gradient, paddingTop: "90px",
      transition: "background 0.6s ease",
    }}>
      <div style={{
        position: "absolute", width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
        top: "-100px", left: "-100px", animation: "pulse-slow 6s infinite",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div style={{ animation: "fadeInUp 0.8s ease" }}>
            <span className="badge" style={{
              background: "rgba(124,58,237,0.1)", color: "var(--primary)",
              fontSize: "0.9rem", marginBottom: "20px",
            }}>
              {current.badge}
            </span>

            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1.2, marginTop: "16px", marginBottom: "20px" }}>
              <span className="gradient-text">{current.title}</span>
              <br />
              <span style={{ fontSize: "2rem", color: "var(--text-dark)" }}>مع متجر سوق</span>
            </h1>

            <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "36px", maxWidth: "480px" }}>
              {current.subtitle}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              <a href="#products" className="btn-primary" style={{ textDecoration: "none" }}>
                {current.cta} 🛒
              </a>
              <a href="#categories" className="btn-secondary" style={{ textDecoration: "none" }}>
                تصفح الأقسام
              </a>
            </div>

            <div style={{ display: "flex", gap: "32px" }}>
              {[
                { val: "+10,000", label: "منتج متنوع" },
                { val: "+50,000", label: "عميل سعيد" },
                { val: "مجاني", label: "توصيل سريع" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>{s.val}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", animation: "fadeInUp 1s ease 0.2s both" }}>
            <div style={{
              width: "100%", aspectRatio: "1", borderRadius: "30px",
              background: "rgba(124,58,237,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10rem", border: "1px solid rgba(124,58,237,0.1)",
            }}>
              <span style={{ animation: "bounce-soft 3s ease-in-out infinite" }}>{current.icon}</span>
            </div>

            <div style={{
              position: "absolute", bottom: "-20px", right: "20px",
              background: "white", borderRadius: "14px", padding: "14px 20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)", display: "flex", gap: "12px", alignItems: "center",
              animation: "fadeInUp 1.2s ease 0.5s both",
            }}>
              <span style={{ fontSize: "1.5rem" }}>📦</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>توصيل سريع</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>خلال 24 ساعة</div>
              </div>
            </div>

            <div style={{
              position: "absolute", top: "20px", left: "-20px",
              background: "white", borderRadius: "14px", padding: "14px 20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              animation: "fadeInUp 1.4s ease 0.7s both",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--success)" }}>✅ دفع آمن</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>حماية 100%</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{
              width: currentSlide === i ? "32px" : "10px", height: "10px", borderRadius: "5px",
              border: "none", cursor: "pointer",
              background: currentSlide === i ? "var(--primary)" : "var(--border)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}`;

const CATEGORIES_TSX = `import React from "react";

export default function Categories() {
  const categories = [
    { icon: "📱", name: "إلكترونيات", count: "2,500+ منتج", color: "#3B82F6" },
    { icon: "👗", name: "أزياء نسائية", count: "3,200+ منتج", color: "#EC4899" },
    { icon: "👔", name: "أزياء رجالية", count: "1,800+ منتج", color: "#6366F1" },
    { icon: "🏠", name: "المنزل والمطبخ", count: "1,500+ منتج", color: "#F59E0B" },
    { icon: "💄", name: "الجمال والعناية", count: "2,100+ منتج", color: "#EF4444" },
    { icon: "🎮", name: "الألعاب والترفيه", count: "800+ منتج", color: "#8B5CF6" },
    { icon: "👟", name: "الأحذية والحقائب", count: "1,200+ منتج", color: "#10B981" },
    { icon: "👶", name: "الأطفال والأمهات", count: "900+ منتج", color: "#F472B6" },
  ];

  return (
    <section id="categories" style={{ padding: "100px 0", background: "white" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="badge" style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)" }}>
            تسوّق حسب القسم
          </span>
        </div>
        <h2 className="section-title">تصفّح <span className="gradient-text">أقسامنا المتنوعة</span></h2>
        <p className="section-subtitle">اكتشف آلاف المنتجات المنظمة في أقسام تسهّل عليك التسوّق</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {categories.map((cat, i) => (
            <div key={i} className="card" style={{
              textAlign: "center", cursor: "pointer",
              animation: \`fadeInUp 0.5s ease \${i * 0.08}s both\`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "4px",
                background: cat.color, opacity: 0, transition: "opacity 0.3s",
              }} className="cat-bar" />
              <div style={{
                width: "70px", height: "70px", borderRadius: "20px",
                background: \`\${cat.color}12\`, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "2rem", margin: "0 auto 16px",
              }}>
                {cat.icon}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>{cat.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{cat.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const FEATURED_PRODUCTS_TSX = `import React, { useState } from "react";

export default function FeaturedProducts() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "الأكثر مبيعاً" },
    { id: "new", label: "وصل حديثاً" },
    { id: "sale", label: "عروض خاصة" },
  ];

  const products = [
    { name: "سماعات بلوتوث لاسلكية", price: 299, oldPrice: 499, rating: 4.8, reviews: 234, badge: "خصم 40%", badgeColor: "var(--danger)", icon: "🎧", filter: "sale" },
    { name: "ساعة ذكية رياضية", price: 599, oldPrice: null, rating: 4.9, reviews: 189, badge: "جديد", badgeColor: "var(--primary)", icon: "⌚", filter: "new" },
    { name: "حقيبة جلد طبيعي", price: 450, oldPrice: 650, rating: 4.7, reviews: 156, badge: "الأكثر مبيعاً", badgeColor: "var(--accent)", icon: "👜", filter: "all" },
    { name: "عطر فاخر للرجال", price: 350, oldPrice: null, rating: 4.6, reviews: 312, badge: "مميز", badgeColor: "var(--success)", icon: "🧴", filter: "all" },
    { name: "نظارة شمسية ماركة", price: 199, oldPrice: 350, rating: 4.5, reviews: 98, badge: "خصم 43%", badgeColor: "var(--danger)", icon: "🕶️", filter: "sale" },
    { name: "جهاز لوحي متطور", price: 1299, oldPrice: null, rating: 4.9, reviews: 445, badge: "جديد", badgeColor: "var(--primary)", icon: "📱", filter: "new" },
    { name: "حذاء رياضي أصلي", price: 399, oldPrice: 550, rating: 4.8, reviews: 278, badge: "خصم 27%", badgeColor: "var(--danger)", icon: "👟", filter: "sale" },
    { name: "طقم عناية بالبشرة", price: 249, oldPrice: null, rating: 4.7, reviews: 167, badge: "الأكثر طلباً", badgeColor: "var(--accent)", icon: "✨", filter: "all" },
  ];

  const filtered = activeFilter === "all" ? products : products.filter(p => p.filter === activeFilter || activeFilter === "all");

  return (
    <section id="products" style={{ padding: "100px 0", background: "var(--bg-light)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="badge" style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)" }}>
            منتجاتنا المميزة
          </span>
        </div>
        <h2 className="section-title">اكتشف <span className="gradient-text">أفضل المنتجات</span></h2>
        <p className="section-subtitle">منتجات مختارة بعناية من أفضل الماركات العالمية والمحلية</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "48px" }}>
          {filters.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              padding: "10px 24px", borderRadius: "50px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.9rem",
              background: activeFilter === f.id ? "linear-gradient(135deg, var(--primary), var(--accent))" : "white",
              color: activeFilter === f.id ? "white" : "var(--text-muted)",
              boxShadow: activeFilter === f.id ? "0 4px 15px rgba(124,58,237,0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
          {filtered.map((product, i) => (
            <div key={i} className="card" style={{
              padding: "0", overflow: "hidden",
              animation: \`fadeInUp 0.5s ease \${i * 0.08}s both\`,
            }}>
              <div style={{
                height: "200px", background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(245,158,11,0.05))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "4rem", position: "relative",
              }}>
                <span>{product.icon}</span>
                <span style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: product.badgeColor, color: "white",
                  padding: "4px 12px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 700,
                }}>
                  {product.badge}
                </span>
                <button style={{
                  position: "absolute", top: "12px", left: "12px",
                  background: "white", border: "none", borderRadius: "50%",
                  width: "36px", height: "36px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "1rem",
                }}>
                  🤍
                </button>
              </div>
              <div style={{ padding: "18px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>
                  {product.name}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ color: "#F59E0B", fontSize: "0.85rem" }}>⭐ {product.rating}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({product.reviews} تقييم)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
                    {product.price} ر.س
                  </span>
                  {product.oldPrice && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                      {product.oldPrice} ر.س
                    </span>
                  )}
                </div>
                <button className="btn-primary" style={{
                  width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.9rem",
                }}>
                  أضف للسلة 🛒
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a href="#" className="btn-secondary" style={{ textDecoration: "none" }}>
            عرض جميع المنتجات ←
          </a>
        </div>
      </div>
    </section>
  );
}`;

const DEALS_TSX = `import React, { useState, useEffect } from "react";

export default function Deals() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deals = [
    { name: "لابتوب احترافي", oldPrice: 4999, newPrice: 2999, discount: "40%", icon: "💻" },
    { name: "كاميرا رقمية متطورة", oldPrice: 3500, newPrice: 1999, discount: "43%", icon: "📷" },
    { name: "سماعة رأس احترافية", oldPrice: 899, newPrice: 449, discount: "50%", icon: "🎧" },
  ];

  return (
    <section id="deals" style={{
      padding: "80px 0",
      background: "linear-gradient(135deg, var(--bg-dark) 0%, #1E1B4B 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        top: "-100px", right: "-100px",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span className="badge" style={{ background: "rgba(245,158,11,0.2)", color: "var(--accent-light)" }}>
            ⚡ عروض لفترة محدودة
          </span>
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", color: "white", marginBottom: "12px" }}>
          عروض اليوم <span style={{ color: "var(--accent)" }}>الحصرية</span>
        </h2>

        {/* Countdown */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
          {[
            { val: timeLeft.hours, label: "ساعة" },
            { val: timeLeft.minutes, label: "دقيقة" },
            { val: timeLeft.seconds, label: "ثانية" },
          ].map((t, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.08)", borderRadius: "14px",
              padding: "14px 22px", textAlign: "center", minWidth: "80px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent)" }}>
                {String(t.val).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {deals.map((deal, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.06)", borderRadius: "20px",
              padding: "32px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)",
              animation: \`fadeInUp 0.5s ease \${i * 0.15}s both\`,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{deal.icon}</div>
              <span className="badge" style={{ background: "var(--danger)", color: "white", marginBottom: "12px" }}>
                خصم {deal.discount}
              </span>
              <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700, margin: "12px 0 8px" }}>
                {deal.name}
              </h3>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)" }}>
                  {deal.newPrice} ر.س
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", textDecoration: "line-through", fontSize: "0.95rem" }}>
                  {deal.oldPrice} ر.س
                </span>
              </div>
              <button className="btn-primary" style={{
                width: "100%", justifyContent: "center", marginTop: "18px",
                background: "linear-gradient(135deg, var(--accent), #D97706)",
              }}>
                اطلب الآن 🛒
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

const FEATURES_TSX = `import React from "react";

export default function Features() {
  const features = [
    {
      icon: "🚚",
      title: "توصيل مجاني وسريع",
      desc: "توصيل مجاني لجميع الطلبات فوق 200 ر.س في جميع أنحاء المملكة خلال 24-48 ساعة",
    },
    {
      icon: "🔒",
      title: "دفع آمن 100%",
      desc: "جميع عمليات الدفع مشفرة ومحمية بأعلى معايير الأمان العالمية وبوابات دفع معتمدة",
    },
    {
      icon: "🔄",
      title: "استرجاع مجاني",
      desc: "إمكانية استرجاع أو استبدال المنتج خلال 30 يوماً من الشراء بدون أي رسوم إضافية",
    },
    {
      icon: "🎧",
      title: "دعم فني متواصل",
      desc: "فريق خدمة العملاء متاح على مدار الساعة للإجابة على استفساراتكم ومساعدتكم",
    },
    {
      icon: "✅",
      title: "منتجات أصلية",
      desc: "نضمن أصالة جميع المنتجات المعروضة في متجرنا مع شهادات ضمان من الشركات المصنعة",
    },
    {
      icon: "💳",
      title: "تقسيط مريح",
      desc: "إمكانية تقسيط مشترياتكم حتى 12 شهراً بدون فوائد مع أبرز البنوك وشركات التقسيط",
    },
  ];

  return (
    <section style={{ padding: "100px 0", background: "white" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="badge" style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)" }}>
            لماذا متجر سوق؟
          </span>
        </div>
        <h2 className="section-title">مميزات <span className="gradient-text">تسوّق بثقة</span></h2>
        <p className="section-subtitle">نوفر لكم تجربة تسوق استثنائية مع ضمانات شاملة</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{
              textAlign: "center", animation: \`fadeInUp 0.5s ease \${i * 0.1}s both\`,
            }}>
              <div style={{
                width: "70px", height: "70px", borderRadius: "20px",
                background: "rgba(124,58,237,0.08)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "2rem", margin: "0 auto 18px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "10px" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "0.9rem" }}>{f.desc}</p>
            </div>
          ))}
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
      name: "سارة الأحمدي", role: "عميلة منذ 2022", rating: 5,
      text: "تجربة تسوق ممتازة! المنتجات أصلية والتوصيل سريع جداً. طلبت ساعة ذكية ووصلتني في نفس اليوم. أنصح الجميع بمتجر سوق.",
      icon: "👩",
    },
    {
      name: "محمد العمري", role: "عميل منذ 2021", rating: 5,
      text: "أفضل متجر إلكتروني تعاملت معه. الأسعار منافسة والعروض دائماً مغرية. خدمة العملاء ممتازة ويردون بسرعة.",
      icon: "👨",
    },
    {
      name: "نورة الشهري", role: "عميلة منذ 2023", rating: 5,
      text: "جربت الاسترجاع مرة وكانت العملية سهلة جداً. استرجعت المبلغ خلال يومين. هذا يعطيني ثقة كبيرة في التسوق من عندهم.",
      icon: "👩",
    },
    {
      name: "عبدالرحمن القرني", role: "عميل منذ 2022", rating: 5,
      text: "المنتجات مختارة بعناية وكلها أصلية. اشتريت لابتوب وكان بالضبط مثل الوصف. التغليف ممتاز والتوصيل محترف.",
      icon: "👨",
    },
  ];

  return (
    <section style={{ padding: "100px 0", background: "var(--bg-light)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="badge" style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)" }}>
            آراء عملائنا
          </span>
        </div>
        <h2 className="section-title">ماذا يقول <span className="gradient-text">عملاؤنا</span></h2>
        <p className="section-subtitle">أكثر من 50,000 عميل يثقون بنا</p>

        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "18px" }}>
              {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                <span key={i} style={{ color: "#F59E0B", fontSize: "1.3rem" }}>⭐</span>
              ))}
            </div>
            <p style={{ fontSize: "1.15rem", lineHeight: 2, fontStyle: "italic", marginBottom: "24px", color: "var(--text-dark)" }}>
              "{testimonials[activeIndex].text}"
            </p>
            <div style={{
              width: "55px", height: "55px", borderRadius: "50%", margin: "0 auto 10px",
              background: "rgba(124,58,237,0.1)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
            }}>
              {testimonials[activeIndex].icon}
            </div>
            <h4 style={{ fontWeight: 700 }}>{testimonials[activeIndex].name}</h4>
            <p style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600 }}>
              {testimonials[activeIndex].role}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)} style={{
                width: activeIndex === i ? "32px" : "10px", height: "10px",
                borderRadius: "5px", border: "none", cursor: "pointer",
                background: activeIndex === i ? "var(--primary)" : "var(--border)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}`;

const NEWSLETTER_TSX = `import React, { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section style={{
      padding: "80px 0",
      background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, #4C1D95 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        bottom: "-80px", left: "-80px",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📬</div>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "12px" }}>
          اشترك في نشرتنا البريدية
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          احصل على أحدث العروض والخصومات الحصرية مباشرة في بريدك الإلكتروني
        </p>

        {subscribed ? (
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: "16px",
            padding: "24px", maxWidth: "500px", margin: "0 auto",
            animation: "fadeIn 0.5s ease",
          }}>
            <span style={{ fontSize: "2rem" }}>✅</span>
            <p style={{ color: "white", fontWeight: 600, marginTop: "8px" }}>تم الاشتراك بنجاح!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: "flex", gap: "12px", maxWidth: "500px", margin: "0 auto",
          }}>
            <input
              type="email" required placeholder="أدخل بريدك الإلكتروني"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1, padding: "16px 20px", borderRadius: "12px",
                border: "none", fontSize: "1rem", fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button type="submit" style={{
              background: "var(--accent)", color: "var(--text-dark)",
              border: "none", padding: "16px 32px", borderRadius: "12px",
              fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              transition: "all 0.3s",
            }}>
              اشترك الآن
            </button>
          </form>
        )}
      </div>
    </section>
  );
}`;

const FOOTER_TSX = `import React from "react";

export default function Footer() {
  const quickLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "الأقسام", href: "#categories" },
    { label: "المنتجات", href: "#products" },
    { label: "العروض", href: "#deals" },
  ];

  const helpLinks = [
    "سياسة الإرجاع", "الشحن والتوصيل", "طرق الدفع",
    "الأسئلة الشائعة", "سياسة الخصوصية",
  ];

  const categories = ["إلكترونيات", "أزياء", "المنزل", "الجمال", "الألعاب"];

  const payments = ["💳", "🏦", "📱", "🍎"];

  return (
    <footer id="footer" style={{
      background: "linear-gradient(180deg, var(--bg-dark) 0%, #0D0A1A 100%)",
      color: "var(--text-light)", padding: "80px 0 0",
    }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "48px", marginBottom: "48px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
              }}>🛍️</div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>متجر سوق</h3>
                <span style={{ fontSize: "0.65rem", color: "var(--primary-light)", letterSpacing: "2px" }}>SOUQ STORE</span>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.9, fontSize: "0.9rem", maxWidth: "300px" }}>
              وجهتك الأولى للتسوق الإلكتروني في المملكة. منتجات أصلية، أسعار منافسة، وتوصيل سريع لباب بيتك.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {["𝕏", "📘", "📸", "▶️"].map((s, i) => (
                <a key={i} href="#" style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "1rem",
                }}>{s}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>روابط سريعة</h4>
            {quickLinks.map((link) => (
              <a key={link.href} href={link.href} style={{
                display: "block", color: "rgba(255,255,255,0.5)", textDecoration: "none",
                padding: "6px 0", fontSize: "0.9rem",
              }}>{link.label}</a>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>المساعدة</h4>
            {helpLinks.map((link) => (
              <p key={link} style={{ color: "rgba(255,255,255,0.5)", padding: "6px 0", fontSize: "0.9rem" }}>
                {link}
              </p>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px", color: "white" }}>تواصل معنا</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span>📍</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>الرياض، المملكة العربية السعودية</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span>📞</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>920-XXX-XXXX</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span>📧</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>support@souq-store.sa</span>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "10px" }}>وسائل الدفع المعتمدة</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {payments.map((p, i) => (
                  <div key={i} style={{
                    width: "40px", height: "28px", borderRadius: "6px",
                    background: "rgba(255,255,255,0.08)", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
                  }}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
            © 2024 متجر سوق. جميع الحقوق محفوظة
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

export const ECOMMERCE_STORE_TEMPLATE_FILES: VFSFile[] = [
  { name: "styles.css", content: STYLES_CSS, language: "css" },
  { name: "App.tsx", content: APP_TSX, language: "tsx" },
  { name: "Header.tsx", content: HEADER_TSX, language: "tsx" },
  { name: "Hero.tsx", content: HERO_TSX, language: "tsx" },
  { name: "Categories.tsx", content: CATEGORIES_TSX, language: "tsx" },
  { name: "FeaturedProducts.tsx", content: FEATURED_PRODUCTS_TSX, language: "tsx" },
  { name: "Deals.tsx", content: DEALS_TSX, language: "tsx" },
  { name: "Features.tsx", content: FEATURES_TSX, language: "tsx" },
  { name: "Testimonials.tsx", content: TESTIMONIALS_TSX, language: "tsx" },
  { name: "Newsletter.tsx", content: NEWSLETTER_TSX, language: "tsx" },
  { name: "Footer.tsx", content: FOOTER_TSX, language: "tsx" },
];
