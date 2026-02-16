import { VFSFile } from "@/hooks/v2/useVFS";

export const BEAUTY_SALON_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Beauty Salon - Elegant Feminine Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #EC4899;
  --primary-dark: #DB2777;
  --primary-light: #F472B6;
  --secondary: #1F1F1F;
  --accent: #F9A8D4;
  --accent-light: #FBCFE8;
  --bg-light: #FFF5F9;
  --bg-white: #FFFFFF;
  --text-dark: #1F1F1F;
  --text-muted: #6B7280;
  --text-light: #9CA3AF;
  --border: #F3E8F0;
  --gold: #D4A574;
  --shadow-sm: 0 1px 2px rgba(236,72,153,0.05);
  --shadow-md: 0 4px 6px -1px rgba(236,72,153,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(236,72,153,0.1);
  --shadow-xl: 0 20px 25px -5px rgba(236,72,153,0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Cairo', sans-serif;
  background: var(--bg-white);
  color: var(--text-dark);
  direction: rtl;
  line-height: 1.7;
}

.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

/* HEADER */
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.logo-text { font-size: 22px; font-weight: 800; color: var(--secondary); }
.logo-text span { color: var(--primary); }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary); }
.header-cta { display: flex; gap: 12px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: 0 4px 14px rgba(236,72,153,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(236,72,153,0.5); }
.btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-white { background: white; color: var(--secondary); box-shadow: var(--shadow-md); }
.btn-white:hover { transform: translateY(-2px); }

/* HERO */
.hero { padding: 130px 0 80px; background: linear-gradient(135deg, #FFF0F5 0%, #FFE4F0 50%, #FFEEF5 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%); border-radius: 50%; }
.hero::after { content: ''; position: absolute; bottom: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(249,168,212,0.15) 0%, transparent 70%); border-radius: 50%; }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(236,72,153,0.1); color: var(--primary); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 600; margin-bottom: 20px; border: 1px solid rgba(236,72,153,0.2); }
.hero h1 { font-size: 46px; font-weight: 900; color: var(--secondary); line-height: 1.3; margin-bottom: 20px; }
.hero h1 span { color: var(--primary); }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 40px; }
.hero-features { display: flex; gap: 28px; }
.hero-feature { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--text-muted); }
.hero-feature-icon { width: 28px; height: 28px; background: rgba(236,72,153,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }

.hero-visual { position: relative; }
.hero-image { width: 100%; height: 450px; background: linear-gradient(135deg, var(--primary-light), var(--primary)); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; display: flex; align-items: center; justify-content: center; font-size: 120px; }
.hero-floating { position: absolute; background: white; border-radius: var(--radius); padding: 16px 20px; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 10px; }
.hero-floating-1 { top: 40px; left: -20px; }
.hero-floating-2 { bottom: 60px; left: -10px; }
.hero-floating-icon { font-size: 24px; }
.hero-floating-text { font-size: 14px; font-weight: 700; color: var(--secondary); }
.hero-floating-sub { font-size: 12px; color: var(--text-muted); }

/* SERVICES */
.services-section { padding: 80px 0; }
.section-header { text-align: center; margin-bottom: 48px; }
.section-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(236,72,153,0.08); color: var(--primary); padding: 6px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.section-header h2 { font-size: 36px; font-weight: 800; color: var(--secondary); margin-bottom: 12px; }
.section-header p { font-size: 16px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; transition: all 0.4s; position: relative; overflow: hidden; }
.service-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--primary), var(--accent)); transform: scaleX(0); transition: transform 0.4s; }
.service-card:hover::after { transform: scaleX(1); }
.service-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); }
.service-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.service-icon { width: 56px; height: 56px; background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(249,168,212,0.2)); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 26px; }
.service-price { font-size: 18px; font-weight: 800; color: var(--primary); }
.service-card h3 { font-size: 18px; font-weight: 700; color: var(--secondary); margin-bottom: 10px; }
.service-card p { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.service-time { font-size: 13px; color: var(--text-light); display: flex; align-items: center; gap: 6px; }

/* GALLERY */
.gallery-section { padding: 80px 0; background: var(--bg-light); }
.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.gallery-item { border-radius: var(--radius); overflow: hidden; cursor: pointer; transition: transform 0.4s; }
.gallery-item:hover { transform: scale(1.05); }
.gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
.gallery-img { width: 100%; height: 100%; min-height: 200px; display: flex; align-items: center; justify-content: center; font-size: 48px; }

/* BOOKING */
.booking-section { padding: 80px 0; }
.booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.booking-form { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; box-shadow: var(--shadow-md); }
.booking-form h3 { font-size: 24px; font-weight: 700; color: var(--secondary); margin-bottom: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
.form-group input, .form-group select { width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); font-family: 'Cairo', sans-serif; font-size: 14px; transition: border-color 0.3s; background: var(--bg-light); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); background: white; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.booking-info h2 { font-size: 36px; font-weight: 800; color: var(--secondary); margin-bottom: 16px; }
.booking-info p { font-size: 16px; color: var(--text-muted); line-height: 1.8; margin-bottom: 28px; }
.booking-perks { display: flex; flex-direction: column; gap: 16px; }
.booking-perk { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; color: var(--secondary); }
.booking-perk-icon { width: 36px; height: 36px; background: rgba(236,72,153,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }

/* OFFERS */
.offers-section { padding: 80px 0; background: linear-gradient(135deg, var(--secondary), #2D2D2D); color: white; }
.offers-section .section-header h2 { color: white; }
.offers-section .section-header p { color: var(--text-light); }
.offers-section .section-badge { background: rgba(236,72,153,0.2); }
.offers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.offer-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 32px; text-align: center; transition: all 0.4s; position: relative; overflow: hidden; }
.offer-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-6px); }
.offer-discount { display: inline-flex; background: var(--primary); color: white; padding: 6px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 800; margin-bottom: 16px; }
.offer-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.offer-card p { font-size: 14px; color: var(--text-light); line-height: 1.7; margin-bottom: 20px; }
.offer-prices { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; }
.offer-old-price { font-size: 18px; color: var(--text-light); text-decoration: line-through; }
.offer-new-price { font-size: 28px; font-weight: 900; color: var(--primary-light); }

/* TESTIMONIALS */
.testimonials-section { padding: 80px 0; }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.testimonial-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; transition: all 0.3s; }
.testimonial-card:hover { box-shadow: var(--shadow-lg); }
.testimonial-stars { color: #F59E0B; font-size: 16px; margin-bottom: 12px; letter-spacing: 2px; }
.testimonial-text { font-size: 15px; color: var(--text-muted); line-height: 1.8; margin-bottom: 20px; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary-light), var(--primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.testimonial-name { font-size: 15px; font-weight: 700; color: var(--secondary); }
.testimonial-service { font-size: 12px; color: var(--text-muted); }

/* FOOTER */
.footer { background: var(--secondary); color: white; padding: 60px 0 0; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.footer-about p { font-size: 14px; color: var(--text-light); line-height: 1.8; margin-top: 16px; }
.footer-col h4 { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: var(--primary-light); }
.footer-col ul { list-style: none; }
.footer-col ul li { margin-bottom: 10px; }
.footer-col ul li a { color: var(--text-light); text-decoration: none; font-size: 14px; transition: color 0.3s; }
.footer-col ul li a:hover { color: var(--primary-light); }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; }
.footer-bottom p { font-size: 13px; color: var(--text-light); }
.footer-social { display: flex; gap: 12px; }
.footer-social a { width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; text-decoration: none; transition: all 0.3s; }
.footer-social a:hover { background: var(--primary); transform: translateY(-3px); }

@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero h1 { font-size: 32px; }
  .hero-visual { display: none; }
  .hero-actions { justify-content: center; }
  .hero-features { justify-content: center; flex-wrap: wrap; }
  .services-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: 1fr 1fr; }
  .gallery-item:nth-child(1) { grid-column: span 1; grid-row: span 1; }
  .booking-grid { grid-template-columns: 1fr; }
  .offers-grid { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .nav-links { display: none; }
}
`
  },
  {
    name: "App.tsx",
    language: "tsx",
    content: `export default function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Services />
      <Gallery />
      <Booking />
      <Offers />
      <Testimonials />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <div className="logo-icon">✨</div>
          <div className="logo-text">صالون <span>الجمال</span></div>
        </a>
        <ul className="nav-links">
          <li><a href="#services">خدماتنا</a></li>
          <li><a href="#gallery">معرض الأعمال</a></li>
          <li><a href="#booking">حجز موعد</a></li>
          <li><a href="#offers">العروض</a></li>
        </ul>
        <div className="header-cta">
          <a href="#booking" className="btn btn-primary" style={{padding:'10px 24px',fontSize:'14px'}}>احجزي موعدك</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <div className="hero-badge">💎 صالون التجميل الأول في المملكة</div>
          <h1>اكتشفي <span>جمالك</span> الحقيقي معنا</h1>
          <p className="hero-desc">نقدم لكِ أرقى خدمات العناية والتجميل بأيدي خبيرات متخصصات باستخدام أفضل المنتجات العالمية في أجواء فاخرة ومريحة.</p>
          <div className="hero-actions">
            <a href="#booking" className="btn btn-primary">احجزي موعدك الآن</a>
            <a href="#services" className="btn btn-outline">تصفحي خدماتنا</a>
          </div>
          <div className="hero-features">
            <div className="hero-feature"><div className="hero-feature-icon">✓</div>منتجات عالمية</div>
            <div className="hero-feature"><div className="hero-feature-icon">✓</div>خبيرات محترفات</div>
            <div className="hero-feature"><div className="hero-feature-icon">✓</div>أجواء فاخرة</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">💇‍♀️</div>
          <div className="hero-floating hero-floating-1">
            <div className="hero-floating-icon">⭐</div>
            <div><div className="hero-floating-text">+5,000 عميلة</div><div className="hero-floating-sub">عميلات سعيدات</div></div>
          </div>
          <div className="hero-floating hero-floating-2">
            <div className="hero-floating-icon">🏆</div>
            <div><div className="hero-floating-text">أفضل صالون 2024</div><div className="hero-floating-sub">جائزة التميز</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { icon: "✂️", title: "قص وتصفيف الشعر", desc: "قصات عصرية وتصفيفات أنيقة تناسب شكل وجهك وأسلوب حياتك.", price: "من 150 ر.س", time: "⏱️ 45-60 دقيقة" },
    { icon: "🎨", title: "صبغة وتلوين", desc: "أحدث تقنيات الصبغ والتلوين مع ألوان عالمية تحافظ على صحة شعرك.", price: "من 300 ر.س", time: "⏱️ 90-120 دقيقة" },
    { icon: "💄", title: "مكياج احترافي", desc: "مكياج مناسبات، أعراس، وسهرات بأحدث صيحات الموضة والجمال.", price: "من 400 ر.س", time: "⏱️ 60-90 دقيقة" },
    { icon: "🧴", title: "عناية بالبشرة", desc: "جلسات تنظيف عميق، ترطيب، تقشير، وعلاجات متخصصة للبشرة.", price: "من 200 ر.س", time: "⏱️ 45-60 دقيقة" },
    { icon: "💅", title: "عناية بالأظافر", desc: "مانيكير وبديكير فاخر مع أحدث ألوان وتصاميم الأظافر.", price: "من 100 ر.س", time: "⏱️ 30-45 دقيقة" },
    { icon: "🌿", title: "حمام مغربي", desc: "تجربة استرخاء فاخرة مع حمام مغربي تقليدي بمنتجات طبيعية.", price: "من 350 ر.س", time: "⏱️ 60-90 دقيقة" },
  ];

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">💆‍♀️ خدماتنا</div>
          <h2>خدمات تجميل متكاملة</h2>
          <p>نقدم مجموعة واسعة من خدمات التجميل والعناية بأعلى المعايير</p>
        </div>
        <div className="services-grid">
          {services.map((s,i)=>(
            <div key={i} className="service-card">
              <div className="service-header">
                <div className="service-icon">{s.icon}</div>
                <div className="service-price">{s.price}</div>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="service-time">{s.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const items = [
    { emoji: "💇‍♀️", bg: "linear-gradient(135deg, #EC4899, #DB2777)" },
    { emoji: "💄", bg: "linear-gradient(135deg, #F472B6, #EC4899)" },
    { emoji: "💅", bg: "linear-gradient(135deg, #F9A8D4, #F472B6)" },
    { emoji: "🧴", bg: "linear-gradient(135deg, #FBCFE8, #F9A8D4)" },
    { emoji: "✨", bg: "linear-gradient(135deg, #DB2777, #BE185D)" },
    { emoji: "🌸", bg: "linear-gradient(135deg, #F472B6, #DB2777)" },
    { emoji: "💎", bg: "linear-gradient(135deg, #EC4899, #F472B6)" },
  ];

  return (
    <section className="gallery-section" id="gallery">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📸 معرض الأعمال</div>
          <h2>من أعمالنا المميزة</h2>
          <p>لمحة عن إبداعات فريقنا المتخصص</p>
        </div>
        <div className="gallery-grid">
          {items.map((item,i)=>(
            <div key={i} className="gallery-item">
              <div className="gallery-img" style={{background:item.bg}}>{item.emoji}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="booking-section" id="booking">
      <div className="container booking-grid">
        <div className="booking-info">
          <div className="section-badge">📅 حجز المواعيد</div>
          <h2>احجزي موعدك بسهولة</h2>
          <p>اختاري الخدمة المناسبة والوقت المفضل لديك وسنكون بانتظارك. نضمن لكِ تجربة مميزة في كل زيارة.</p>
          <div className="booking-perks">
            <div className="booking-perk"><div className="booking-perk-icon">🎁</div>خصم 10% على الزيارة الأولى</div>
            <div className="booking-perk"><div className="booking-perk-icon">⏰</div>مرونة في المواعيد</div>
            <div className="booking-perk"><div className="booking-perk-icon">💳</div>دفع نقدي أو إلكتروني</div>
            <div className="booking-perk"><div className="booking-perk-icon">🅿️</div>مواقف سيارات مجانية</div>
          </div>
        </div>
        <div className="booking-form">
          <h3>نموذج الحجز</h3>
          <div className="form-row">
            <div className="form-group"><label>الاسم</label><input type="text" placeholder="اسمك الكريم" /></div>
            <div className="form-group"><label>رقم الجوال</label><input type="tel" placeholder="05xxxxxxxx" /></div>
          </div>
          <div className="form-group"><label>الخدمة المطلوبة</label>
            <select><option>قص وتصفيف الشعر</option><option>صبغة وتلوين</option><option>مكياج احترافي</option><option>عناية بالبشرة</option><option>عناية بالأظافر</option><option>حمام مغربي</option></select>
          </div>
          <div className="form-row">
            <div className="form-group"><label>التاريخ</label><input type="date" /></div>
            <div className="form-group"><label>الوقت</label>
              <select><option>10:00 صباحاً</option><option>11:00 صباحاً</option><option>12:00 ظهراً</option><option>1:00 مساءً</option><option>2:00 مساءً</option><option>3:00 مساءً</option><option>4:00 مساءً</option><option>5:00 مساءً</option><option>6:00 مساءً</option><option>7:00 مساءً</option><option>8:00 مساءً</option></select>
            </div>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}}>تأكيد الحجز</button>
        </div>
      </div>
    </section>
  );
}

function Offers() {
  const offers = [
    { discount: "خصم 30%", title: "باقة العروس الملكية", desc: "مكياج + تصفيف شعر + عناية بالبشرة + مانيكير وبديكير", oldPrice: "2,000 ر.س", newPrice: "1,400 ر.س" },
    { discount: "خصم 25%", title: "باقة التجديد الشامل", desc: "قص شعر + صبغة + عناية بالبشرة + حمام مغربي", oldPrice: "1,200 ر.س", newPrice: "900 ر.س" },
    { discount: "خصم 20%", title: "باقة العناية الأسبوعية", desc: "تنظيف بشرة + مانيكير + بديكير + تصفيف شعر", oldPrice: "600 ر.س", newPrice: "480 ر.س" },
  ];

  return (
    <section className="offers-section" id="offers">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🎉 عروض خاصة</div>
          <h2>عروض موسمية لا تفوتيها</h2>
          <p>استفيدي من عروضنا المميزة على أفضل خدمات التجميل</p>
        </div>
        <div className="offers-grid">
          {offers.map((o,i)=>(
            <div key={i} className="offer-card">
              <div className="offer-discount">{o.discount}</div>
              <h3>{o.title}</h3>
              <p>{o.desc}</p>
              <div className="offer-prices">
                <span className="offer-old-price">{o.oldPrice}</span>
                <span className="offer-new-price">{o.newPrice}</span>
              </div>
              <a href="#booking" className="btn btn-primary">احجزي الآن</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "نورة السالم", service: "مكياج عروس", text: "تجربة رائعة! المكياج كان مثالياً وطبيعياً في نفس الوقت. أنصح الجميع بزيارة الصالون.", stars: "⭐⭐⭐⭐⭐" },
    { name: "سارة الحربي", service: "قص وصبغة", text: "الفريق محترف جداً والنتيجة فاقت توقعاتي. صالون ممتاز وأسعار معقولة.", stars: "⭐⭐⭐⭐⭐" },
    { name: "ريم العتيبي", service: "عناية بالبشرة", text: "بشرتي تحسنت كثيراً بعد الجلسات. المنتجات المستخدمة ممتازة والخبيرات محترفات.", stars: "⭐⭐⭐⭐⭐" },
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">💬 آراء عميلاتنا</div>
          <h2>ماذا تقول عميلاتنا</h2>
          <p>نفخر بثقة عميلاتنا وآرائهن الإيجابية</p>
        </div>
        <div className="testimonials-grid">
          {reviews.map((r,i)=>(
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">{r.stars}</div>
              <p className="testimonial-text">"{r.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">👩</div>
                <div><div className="testimonial-name">{r.name}</div><div className="testimonial-service">{r.service}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="logo"><div className="logo-icon">✨</div><div className="logo-text" style={{color:'white'}}>صالون <span>الجمال</span></div></div>
            <p>وجهتك الأولى للجمال والعناية. نقدم أرقى خدمات التجميل بأيدي خبيرات محترفات في أجواء فاخرة.</p>
          </div>
          <div className="footer-col"><h4>خدماتنا</h4><ul><li><a href="#">قص وتصفيف</a></li><li><a href="#">صبغة وتلوين</a></li><li><a href="#">مكياج</a></li><li><a href="#">عناية بالبشرة</a></li></ul></div>
          <div className="footer-col"><h4>روابط سريعة</h4><ul><li><a href="#gallery">معرض الأعمال</a></li><li><a href="#offers">العروض</a></li><li><a href="#booking">حجز موعد</a></li><li><a href="#">سياسة الخصوصية</a></li></ul></div>
          <div className="footer-col"><h4>تواصلي معنا</h4><ul><li><a href="#">📍 الرياض، حي الملقا</a></li><li><a href="#">📞 +966 50 000 0000</a></li><li><a href="#">✉️ info@beauty-salon.sa</a></li><li><a href="#">⏰ يومياً 10ص - 10م</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 صالون الجمال. جميع الحقوق محفوظة.</p>
          <div className="footer-social"><a href="#">📸</a><a href="#">🐦</a><a href="#">📘</a><a href="#">💬</a></div>
        </div>
      </div>
    </footer>
  );
}
`
  }
];
