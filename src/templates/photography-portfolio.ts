import { VFSFile } from "@/hooks/v2/useVFS";

export const PHOTOGRAPHY_PORTFOLIO_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Photography Portfolio - Artistic Dark Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #F59E0B;
  --primary-dark: #D97706;
  --primary-light: #FBBF24;
  --secondary: #18181B;
  --accent: #FBBF24;
  --bg-dark: #18181B;
  --bg-darker: #09090B;
  --bg-card: #27272A;
  --text-white: #FFFFFF;
  --text-light: #D4D4D8;
  --text-muted: #A1A1AA;
  --border: #3F3F46;
  --gradient-gold: linear-gradient(135deg, #F59E0B, #FBBF24);
  --shadow-lg: 0 10px 15px -3px rgba(245,158,11,0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Cairo', sans-serif; background: var(--bg-dark); color: var(--text-white); direction: rtl; line-height: 1.7; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(24,24,27,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-gold); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.logo-text { font-size: 22px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-gold); color: var(--secondary); box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.5); }
.btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: var(--secondary); }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }

.hero { padding: 140px 0 80px; background: var(--bg-darker); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 60%); }
.hero-inner { text-align: center; position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.1); color: var(--primary); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(245,158,11,0.2); }
.hero h1 { font-size: 52px; font-weight: 900; line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; }

.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.1); color: var(--primary); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(245,158,11,0.2); }
.section-title { font-size: 38px; font-weight: 900; margin-bottom: 16px; }
.section-title span { background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.gallery-tabs { display: flex; gap: 12px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
.gallery-tab { padding: 10px 24px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); transition: all 0.3s; }
.gallery-tab.active { background: var(--gradient-gold); color: var(--secondary); border-color: transparent; }
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.gallery-item { border-radius: var(--radius); overflow: hidden; position: relative; height: 300px; background: linear-gradient(135deg, var(--bg-card), rgba(245,158,11,0.05)); display: flex; align-items: center; justify-content: center; font-size: 60px; border: 1px solid var(--border); transition: all 0.4s; cursor: pointer; }
.gallery-item:hover { border-color: var(--primary); transform: scale(1.02); }
.gallery-item.tall { grid-row: span 2; height: 100%; }

.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.service-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
.service-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.service-icon { font-size: 40px; margin-bottom: 16px; }
.service-name { font-size: 20px; font-weight: 800; margin-bottom: 12px; }
.service-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.service-price { font-size: 22px; font-weight: 900; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.about-image { width: 100%; height: 400px; background: linear-gradient(135deg, var(--bg-card), rgba(245,158,11,0.1)); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; border: 1px solid var(--border); }
.about-content h2 { font-size: 36px; font-weight: 900; margin-bottom: 16px; }
.about-content h2 span { background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-content p { font-size: 16px; color: var(--text-muted); line-height: 1.8; margin-bottom: 24px; }
.about-stats { display: flex; gap: 32px; }
.about-stat-value { font-size: 32px; font-weight: 900; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.about-stat-label { font-size: 14px; color: var(--text-muted); }

.booking { padding: 100px 0; background: linear-gradient(135deg, var(--bg-darker), rgba(245,158,11,0.05)); }
.booking-inner { max-width: 600px; margin: 0 auto; background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; border: 1px solid var(--border); }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 16px; background: var(--bg-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-white); font-family: 'Cairo', sans-serif; font-size: 15px; direction: rtl; transition: border-color 0.3s; }
.form-input:focus { outline: none; border-color: var(--primary); }
textarea.form-input { min-height: 100px; resize: vertical; }

.footer { padding: 60px 0 30px; background: var(--bg-darker); border-top: 1px solid var(--border); }
.footer-inner { display: flex; justify-content: space-between; align-items: center; }
.footer-logo { display: flex; align-items: center; gap: 10px; }
.footer-logo-icon { width: 36px; height: 36px; background: var(--gradient-gold); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.footer-logo-text { font-size: 18px; font-weight: 900; }
.footer-social { display: flex; gap: 12px; }
.footer-social a { width: 40px; height: 40px; background: var(--bg-card); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: all 0.3s; border: 1px solid var(--border); }
.footer-social a:hover { background: var(--primary); color: var(--secondary); border-color: var(--primary); }
.footer-bottom { text-align: center; margin-top: 30px; padding-top: 24px; border-top: 1px solid var(--border); }
.footer-bottom p { font-size: 13px; color: var(--text-muted); }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .services-grid { grid-template-columns: 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  .hero h1 { font-size: 32px; }
  .section-title { font-size: 28px; }
  .nav-links { display: none; }
  .footer-inner { flex-direction: column; gap: 20px; }
}
`
  },
  {
    name: "App.tsx",
    language: "tsx",
    content: `export default function App() {
  return (
    <div>
      <Header />
      <Hero />
      <Gallery />
      <Services />
      <About />
      <Booking />
      <Footer />
    </div>
  );
}`
  },
  {
    name: "Header.tsx",
    language: "tsx",
    content: `export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <a href="#" className="logo">
            <div className="logo-icon">📸</div>
            <div className="logo-text">عدسة <span>الإبداع</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#gallery">معرض الأعمال</a></li>
              <li><a href="#services">الخدمات</a></li>
              <li><a href="#about">عن المصور</a></li>
              <li><a href="#booking">احجز جلسة</a></li>
            </ul>
          </nav>
          <a href="#booking" className="btn btn-primary">احجز الآن</a>
        </div>
      </div>
    </header>
  );
}`
  },
  {
    name: "Hero.tsx",
    language: "tsx",
    content: `export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-badge">📸 مصور فوتوغرافي محترف</div>
          <h1>أوثّق لحظاتك<br /><span>بعدسة الإبداع</span></h1>
          <p className="hero-desc">مصور فوتوغرافي سعودي متخصص في تصوير حفلات الزفاف والمناسبات والبورتريه والمنتجات التجارية. أكثر من ١٠ سنوات من الخبرة في صناعة صور لا تُنسى.</p>
          <div className="hero-actions">
            <a href="#gallery" className="btn btn-primary">شاهد أعمالي 📸</a>
            <a href="#booking" className="btn btn-outline">احجز جلسة تصوير</a>
          </div>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Gallery.tsx",
    language: "tsx",
    content: `export default function Gallery() {
  const categories = ["الكل", "حفلات زفاف", "بورتريه", "منتجات", "مناظر طبيعية"];
  const items = [
    { icon: "💍", label: "حفل زفاف" },
    { icon: "👤", label: "بورتريه" },
    { icon: "📦", label: "تصوير منتج" },
    { icon: "🌅", label: "مناظر طبيعية" },
    { icon: "💒", label: "حفل زفاف" },
    { icon: "🎭", label: "بورتريه فني" },
    { icon: "⌚", label: "تصوير ساعات" },
    { icon: "🏜️", label: "صحراء" },
    { icon: "👰", label: "عروس" },
  ];
  return (
    <section className="section section-dark" id="gallery">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🖼️ معرض الأعمال</div>
          <h2 className="section-title">لقطات <span>لا تُنسى</span></h2>
          <p className="section-desc">مجموعة مختارة من أفضل أعمالي في مختلف تخصصات التصوير</p>
        </div>
        <div className="gallery-tabs">
          {categories.map((cat, i) => (
            <button key={i} className={"gallery-tab" + (i === 0 ? " active" : "")}>{cat}</button>
          ))}
        </div>
        <div className="gallery-grid">
          {items.map((item, i) => (
            <div key={i} className="gallery-item">
              <span>{item.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Services.tsx",
    language: "tsx",
    content: `export default function Services() {
  const services = [
    { icon: "💍", name: "تصوير حفلات الزفاف", desc: "توثيق كامل ليومك المميز مع ألبوم فاخر مطبوع وملفات رقمية عالية الجودة.", price: "من ٥,٠٠٠ ر.س" },
    { icon: "👤", name: "تصوير بورتريه", desc: "جلسات تصوير شخصية واحترافية في الاستوديو أو في الموقع المفضل لديك.", price: "من ١,٥٠٠ ر.س" },
    { icon: "📦", name: "تصوير المنتجات", desc: "صور احترافية لمنتجاتك التجارية للمتاجر الإلكترونية ومنصات التواصل.", price: "من ٢,٠٠٠ ر.س" },
    { icon: "🎉", name: "تصوير المناسبات", desc: "تغطية شاملة للمناسبات والمؤتمرات والفعاليات الخاصة والعامة.", price: "من ٣,٠٠٠ ر.س" },
    { icon: "🏢", name: "تصوير معماري", desc: "تصوير احترافي للمباني والتصميمات الداخلية والمشاريع العقارية.", price: "من ٢,٥٠٠ ر.س" },
    { icon: "🎬", name: "تصوير فيديو", desc: "إنتاج فيديوهات احترافية للشركات والمناسبات مع المونتاج والإخراج.", price: "من ٤,٠٠٠ ر.س" },
  ];
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📋 الخدمات والأسعار</div>
          <h2 className="section-title">خدمات <span>التصوير</span></h2>
          <p className="section-desc">أقدم مجموعة متنوعة من خدمات التصوير الاحترافي لتلبية جميع احتياجاتك</p>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <div className="service-desc">{s.desc}</div>
              <div className="service-price">{s.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "About.tsx",
    language: "tsx",
    content: `export default function About() {
  const stats = [
    { value: "١٠+", label: "سنوات خبرة" },
    { value: "٢,٠٠٠+", label: "جلسة تصوير" },
    { value: "٥٠٠+", label: "حفل زفاف" },
    { value: "٩٨٪", label: "رضا العملاء" },
  ];
  return (
    <section className="section section-dark" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">📸</div>
          <div className="about-content">
            <h2>عن <span>المصور</span></h2>
            <p>أنا سعد الراشد، مصور فوتوغرافي سعودي شغوف بتوثيق اللحظات الجميلة. بدأت مسيرتي في عالم التصوير منذ أكثر من ١٠ سنوات، وخلال هذه الرحلة تشرفت بتوثيق أكثر من ٥٠٠ حفل زفاف وآلاف الجلسات التصويرية.</p>
            <p>حاصل على جائزة أفضل مصور في المملكة لعام ٢٠٢٣ وعضو في الجمعية السعودية للتصوير الضوئي. أستخدم أحدث المعدات والتقنيات لضمان أعلى جودة ممكنة.</p>
            <div className="about-stats">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="about-stat-value">{s.value}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Booking.tsx",
    language: "tsx",
    content: `export default function Booking() {
  return (
    <section className="booking" id="booking">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📅 حجز جلسة</div>
          <h2 className="section-title">احجز <span>جلستك</span> الآن</h2>
          <p className="section-desc">املأ النموذج التالي وسأتواصل معك خلال ٢٤ ساعة لتأكيد الحجز</p>
        </div>
        <div className="booking-inner">
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <input className="form-input" placeholder="أدخل اسمك" />
          </div>
          <div className="form-group">
            <label className="form-label">رقم الجوال</label>
            <input className="form-input" placeholder="٠٥XXXXXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">نوع التصوير</label>
            <input className="form-input" placeholder="زفاف، بورتريه، منتجات..." />
          </div>
          <div className="form-group">
            <label className="form-label">التاريخ المفضل</label>
            <input className="form-input" type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">تفاصيل إضافية</label>
            <textarea className="form-input" placeholder="اكتب أي تفاصيل إضافية عن الجلسة..."></textarea>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }}>إرسال طلب الحجز 📸</button>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Footer.tsx",
    language: "tsx",
    content: `export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-icon">📸</div>
            <div className="footer-logo-text">عدسة الإبداع</div>
          </div>
          <div className="footer-social">
            <a href="#">📸</a>
            <a href="#">𝕏</a>
            <a href="#">▶️</a>
            <a href="#">📘</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ٢٠٢٥ عدسة الإبداع - سعد الراشد. جميع الحقوق محفوظة | صنع بـ ❤️ في السعودية</p>
        </div>
      </div>
    </footer>
  );
}`
  },
];
