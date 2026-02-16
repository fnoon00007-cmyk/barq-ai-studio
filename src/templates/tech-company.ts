import { VFSFile } from "@/hooks/v2/useVFS";

export const TECH_COMPANY_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Tech Company - Modern Digital Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #3B82F6;
  --primary-dark: #2563EB;
  --primary-light: #60A5FA;
  --secondary: #0F172A;
  --accent: #06B6D4;
  --accent-light: #22D3EE;
  --bg-dark: #0F172A;
  --bg-darker: #020617;
  --bg-card: #1E293B;
  --text-white: #FFFFFF;
  --text-light: #CBD5E1;
  --text-muted: #94A3B8;
  --border: #334155;
  --gradient-tech: linear-gradient(135deg, #3B82F6, #06B6D4);
  --shadow-sm: 0 1px 2px rgba(59,130,246,0.05);
  --shadow-md: 0 4px 6px -1px rgba(59,130,246,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(59,130,246,0.15);
  --shadow-xl: 0 20px 25px -5px rgba(59,130,246,0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Cairo', sans-serif;
  background: var(--bg-dark);
  color: var(--text-white);
  direction: rtl;
  line-height: 1.7;
}

.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

/* HEADER */
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(15,23,42,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-tech); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
.logo-text { font-size: 22px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-tech); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary); }
.header-cta { display: flex; gap: 12px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-tech); color: white; box-shadow: 0 4px 14px rgba(59,130,246,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.5); }
.btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }
.btn-dark:hover { border-color: var(--primary); }

/* HERO */
.hero { padding: 140px 0 80px; background: linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-dark) 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%); }
.hero::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.06) 0%, transparent 60%); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.1); color: var(--primary); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(59,130,246,0.2); }
.hero h1 { font-size: 48px; font-weight: 900; color: var(--text-white); line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-tech); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 40px; }
.hero-clients { display: flex; align-items: center; gap: 16px; }
.hero-clients-label { font-size: 14px; color: var(--text-muted); }
.hero-clients-logos { display: flex; gap: 12px; }
.hero-client-logo { width: 44px; height: 44px; background: var(--bg-card); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid var(--border); }
.hero-visual { position: relative; display: flex; justify-content: center; }
.hero-image-placeholder { width: 100%; max-width: 500px; height: 400px; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.1) 100%); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; border: 1px solid var(--border); }

/* SECTION COMMON */
.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.1); color: var(--primary); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(59,130,246,0.2); }
.section-title { font-size: 38px; font-weight: 900; color: var(--text-white); margin-bottom: 16px; }
.section-title span { background: var(--gradient-tech); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

/* SERVICES */
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.service-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); transition: all 0.3s; }
.service-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.service-icon { width: 56px; height: 56px; background: rgba(59,130,246,0.1); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
.service-name { font-size: 20px; font-weight: 800; color: var(--text-white); margin-bottom: 12px; }
.service-desc { font-size: 15px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.service-techs { display: flex; flex-wrap: wrap; gap: 8px; }
.service-tech { background: rgba(59,130,246,0.08); color: var(--primary-light); padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }

/* PORTFOLIO */
.portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.portfolio-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; }
.portfolio-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.portfolio-image { width: 100%; height: 240px; background: linear-gradient(135deg, var(--bg-darker), rgba(59,130,246,0.1)); display: flex; align-items: center; justify-content: center; font-size: 60px; }
.portfolio-info { padding: 28px; }
.portfolio-category { font-size: 13px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
.portfolio-name { font-size: 20px; font-weight: 800; color: var(--text-white); margin-bottom: 8px; }
.portfolio-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.portfolio-techs { display: flex; flex-wrap: wrap; gap: 8px; }

/* STATS */
.stats { padding: 60px 0; background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(6,182,212,0.05) 100%); }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
.stat-value { font-size: 42px; font-weight: 900; background: var(--gradient-tech); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stat-label { font-size: 16px; color: var(--text-muted); font-weight: 500; }

/* TEAM */
.team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.team-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; text-align: center; }
.team-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.team-image { width: 100%; height: 220px; background: linear-gradient(135deg, var(--bg-darker), rgba(59,130,246,0.08)); display: flex; align-items: center; justify-content: center; font-size: 50px; }
.team-info { padding: 20px; }
.team-name { font-size: 17px; font-weight: 800; color: var(--text-white); margin-bottom: 4px; }
.team-role { font-size: 14px; color: var(--accent); font-weight: 600; }

/* CONTACT */
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.contact-form { background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 16px; background: var(--bg-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-white); font-family: 'Cairo', sans-serif; font-size: 15px; direction: rtl; transition: border-color 0.3s; }
.form-input:focus { outline: none; border-color: var(--primary); }
textarea.form-input { min-height: 120px; resize: vertical; }
.contact-info { display: flex; flex-direction: column; gap: 24px; }
.contact-info-card { background: var(--bg-card); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
.contact-info-icon { width: 48px; height: 48px; background: rgba(59,130,246,0.1); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 22px; }
.contact-info-text h4 { font-size: 16px; font-weight: 700; color: var(--text-white); margin-bottom: 4px; }
.contact-info-text p { font-size: 14px; color: var(--text-muted); }

/* FOOTER */
.footer { padding: 60px 0 30px; background: var(--bg-darker); border-top: 1px solid var(--border); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-brand { }
.footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-logo-icon { width: 40px; height: 40px; background: var(--gradient-tech); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.footer-logo-text { font-size: 20px; font-weight: 900; color: var(--text-white); }
.footer-desc { font-size: 14px; color: var(--text-muted); line-height: 1.8; margin-bottom: 20px; }
.footer-social { display: flex; gap: 12px; }
.footer-social a { width: 40px; height: 40px; background: var(--bg-card); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: all 0.3s; border: 1px solid var(--border); }
.footer-social a:hover { background: var(--primary); color: white; border-color: var(--primary); }
.footer-col h4 { font-size: 16px; font-weight: 700; color: var(--text-white); margin-bottom: 20px; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 10px; }
.footer-col a { text-decoration: none; color: var(--text-muted); font-size: 14px; transition: color 0.3s; }
.footer-col a:hover { color: var(--primary); }
.footer-bottom { padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.footer-bottom p { font-size: 13px; color: var(--text-muted); }

@media (max-width: 768px) {
  .hero-inner, .footer-grid, .contact-grid { grid-template-columns: 1fr; }
  .services-grid, .portfolio-grid { grid-template-columns: 1fr; }
  .team-grid, .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .hero h1 { font-size: 32px; }
  .section-title { font-size: 28px; }
  .nav-links { display: none; }
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
      <Services />
      <Portfolio />
      <Team />
      <Contact />
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
            <div className="logo-icon">💻</div>
            <div className="logo-text">تكنو <span>لاب</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#services">خدماتنا</a></li>
              <li><a href="#portfolio">مشاريعنا</a></li>
              <li><a href="#team">فريقنا</a></li>
              <li><a href="#contact">تواصل معنا</a></li>
            </ul>
          </nav>
          <div className="header-cta">
            <a href="#contact" className="btn btn-primary">اطلب عرض سعر</a>
          </div>
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
          <div>
            <div className="hero-badge">🚀 نبني المستقبل الرقمي</div>
            <h1>حلول تقنية <span>مبتكرة</span><br />لتحويل أعمالك</h1>
            <p className="hero-desc">
              شركة برمجيات سعودية متخصصة في تطوير التطبيقات والأنظمة المتكاملة. نساعد الشركات في التحول الرقمي باستخدام أحدث التقنيات وأفضل الممارسات العالمية.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">ابدأ مشروعك 🚀</a>
              <a href="#portfolio" className="btn btn-dark">مشاريعنا السابقة</a>
            </div>
            <div className="hero-clients">
              <div className="hero-clients-logos">
                <div className="hero-client-logo">🏦</div>
                <div className="hero-client-logo">🏥</div>
                <div className="hero-client-logo">🛒</div>
                <div className="hero-client-logo">🏭</div>
              </div>
              <span className="hero-clients-label">+١٢٠ عميل يثق بنا</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">💻</div>
          </div>
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
    { icon: "📱", name: "تطوير تطبيقات الجوال", desc: "تطبيقات iOS و Android بأحدث التقنيات مع تصميم UI/UX احترافي وأداء عالي.", techs: ["React Native", "Flutter", "Swift", "Kotlin"] },
    { icon: "🌐", name: "تطوير المواقع والمنصات", desc: "مواقع ومنصات ويب متجاوبة وسريعة باستخدام أحدث أطر العمل والتقنيات.", techs: ["React", "Next.js", "Node.js", "TypeScript"] },
    { icon: "🤖", name: "الذكاء الاصطناعي", desc: "حلول ذكاء اصطناعي متقدمة لأتمتة العمليات وتحليل البيانات واتخاذ القرارات.", techs: ["Python", "TensorFlow", "GPT", "Computer Vision"] },
    { icon: "☁️", name: "الحوسبة السحابية", desc: "بنية تحتية سحابية آمنة وقابلة للتوسع مع إدارة وصيانة مستمرة.", techs: ["AWS", "Azure", "GCP", "Docker"] },
    { icon: "🔐", name: "الأمن السيبراني", desc: "حماية شاملة للأنظمة والبيانات مع اختبار الاختراق والاستجابة للحوادث.", techs: ["Penetration Testing", "SOC", "ISO 27001"] },
    { icon: "📊", name: "أنظمة ERP متكاملة", desc: "أنظمة إدارة موارد المؤسسة المخصصة لتلبية احتياجات عملك.", techs: ["SAP", "Oracle", "Custom ERP", "API Integration"] },
  ];

  return (
    <section className="section section-dark" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">⚡ خدماتنا</div>
          <h2 className="section-title">حلول <span>تقنية</span> متكاملة</h2>
          <p className="section-desc">نقدم مجموعة شاملة من الخدمات التقنية لتلبية جميع احتياجات أعمالك الرقمية</p>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <div className="service-desc">{s.desc}</div>
              <div className="service-techs">
                {s.techs.map((t, j) => (<span key={j} className="service-tech">{t}</span>))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Portfolio.tsx",
    language: "tsx",
    content: `export default function Portfolio() {
  const projects = [
    { icon: "🏦", category: "تطبيق مالي", name: "تطبيق بنكي ذكي", desc: "تطبيق بنكي متكامل مع محفظة رقمية وتحويلات فورية ونظام مدفوعات آمن لبنك رائد في المملكة.", techs: ["React Native", "Node.js", "AWS"] },
    { icon: "🛒", category: "تجارة إلكترونية", name: "منصة سوق إلكتروني", desc: "منصة تجارة إلكترونية متعددة البائعين مع نظام دفع متكامل وإدارة مخزون ذكية.", techs: ["Next.js", "Stripe", "PostgreSQL"] },
    { icon: "🏥", category: "نظام صحي", name: "نظام إدارة المستشفيات", desc: "نظام متكامل لإدارة المستشفيات يشمل السجلات الطبية والمواعيد والفوترة والتقارير.", techs: ["React", "Python", "Docker"] },
    { icon: "🚚", category: "لوجستيات", name: "منصة إدارة الشحن", desc: "منصة ذكية لإدارة عمليات الشحن والتتبع مع تحسين المسارات باستخدام الذكاء الاصطناعي.", techs: ["Flutter", "AI/ML", "GCP"] },
  ];

  return (
    <section className="section" id="portfolio">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🏆 مشاريعنا</div>
          <h2 className="section-title">أعمال <span>نفتخر</span> بها</h2>
          <p className="section-desc">نماذج من المشاريع التي نفذناها لعملائنا في مختلف القطاعات</p>
        </div>
        <div className="stats">
          <div className="stats-grid">
            <div><div className="stat-value">+١٢٠</div><div className="stat-label">مشروع مكتمل</div></div>
            <div><div className="stat-value">+٨٠</div><div className="stat-label">عميل سعيد</div></div>
            <div><div className="stat-value">+٤٥</div><div className="stat-label">مطور محترف</div></div>
            <div><div className="stat-value">٨</div><div className="stat-label">سنوات خبرة</div></div>
          </div>
        </div>
        <div className="portfolio-grid" style={{ marginTop: 40 }}>
          {projects.map((p, i) => (
            <div key={i} className="portfolio-card">
              <div className="portfolio-image">{p.icon}</div>
              <div className="portfolio-info">
                <div className="portfolio-category">{p.category}</div>
                <div className="portfolio-name">{p.name}</div>
                <div className="portfolio-desc">{p.desc}</div>
                <div className="portfolio-techs">
                  {p.techs.map((t, j) => (<span key={j} className="service-tech">{t}</span>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Team.tsx",
    language: "tsx",
    content: `export default function Team() {
  const team = [
    { icon: "👨‍💼", name: "م. عبدالله الراشد", role: "المدير التنفيذي" },
    { icon: "👨‍💻", name: "م. سعود المالكي", role: "مدير التقنية" },
    { icon: "👩‍💻", name: "م. نورة العمري", role: "مديرة التصميم" },
    { icon: "👨‍🔬", name: "د. فيصل الحربي", role: "مدير الذكاء الاصطناعي" },
  ];

  return (
    <section className="section section-dark" id="team">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👥 فريقنا</div>
          <h2 className="section-title">فريق <span>متميز</span> ومتخصص</h2>
          <p className="section-desc">نخبة من المهندسين والمطورين ذوي الخبرة العالية في أحدث التقنيات</p>
        </div>
        <div className="team-grid">
          {team.map((m, i) => (
            <div key={i} className="team-card">
              <div className="team-image">{m.icon}</div>
              <div className="team-info">
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Contact.tsx",
    language: "tsx",
    content: `export default function Contact() {
  const info = [
    { icon: "📍", title: "العنوان", text: "الرياض، حي العليا، برج المملكة" },
    { icon: "📞", title: "الهاتف", text: "٠١١٤٥٦٧٨٩٠" },
    { icon: "✉️", title: "البريد", text: "info@technolab.sa" },
    { icon: "🕐", title: "ساعات العمل", text: "الأحد - الخميس: ٩ص - ٦م" },
  ];

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📩 تواصل معنا</div>
          <h2 className="section-title">ابدأ <span>مشروعك</span> الآن</h2>
          <p className="section-desc">تواصل معنا لمناقشة مشروعك والحصول على عرض سعر مجاني</p>
        </div>
        <div className="contact-grid">
          <div className="contact-form">
            <div className="form-group">
              <label className="form-label">الاسم الكامل</label>
              <input className="form-input" placeholder="أدخل اسمك" />
            </div>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input className="form-input" type="email" placeholder="example@domain.com" />
            </div>
            <div className="form-group">
              <label className="form-label">نوع المشروع</label>
              <input className="form-input" placeholder="تطبيق جوال، موقع، نظام..." />
            </div>
            <div className="form-group">
              <label className="form-label">تفاصيل المشروع</label>
              <textarea className="form-input" placeholder="اشرح لنا فكرة مشروعك..."></textarea>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}>إرسال الطلب 🚀</button>
          </div>
          <div className="contact-info">
            {info.map((item, i) => (
              <div key={i} className="contact-info-card">
                <div className="contact-info-icon">{item.icon}</div>
                <div className="contact-info-text">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
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
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">💻</div>
              <div className="footer-logo-text">تكنو لاب</div>
            </div>
            <p className="footer-desc">
              شركة برمجيات سعودية رائدة متخصصة في تطوير الحلول التقنية المبتكرة. نساعد الشركات في رحلة التحول الرقمي.
            </p>
            <div className="footer-social">
              <a href="#">𝕏</a>
              <a href="#">💼</a>
              <a href="#">📘</a>
              <a href="#">🐙</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>خدماتنا</h4>
            <ul>
              <li><a href="#">تطوير التطبيقات</a></li>
              <li><a href="#">تطوير المواقع</a></li>
              <li><a href="#">الذكاء الاصطناعي</a></li>
              <li><a href="#">الحوسبة السحابية</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>الشركة</h4>
            <ul>
              <li><a href="#">من نحن</a></li>
              <li><a href="#">فريقنا</a></li>
              <li><a href="#">المدونة</a></li>
              <li><a href="#">وظائف</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>تواصل</h4>
            <ul>
              <li><a href="#">📍 الرياض، حي العليا</a></li>
              <li><a href="#">📞 ٠١١٤٥٦٧٨٩٠</a></li>
              <li><a href="#">✉️ info@technolab.sa</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ٢٠٢٥ تكنو لاب. جميع الحقوق محفوظة</p>
          <p>صنع بـ ❤️ في السعودية</p>
        </div>
      </div>
    </footer>
  );
}`
  },
];
