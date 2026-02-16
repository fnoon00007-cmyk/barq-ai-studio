import { VFSFile } from "@/hooks/v2/useVFS";

export const CONSULTING_FIRM_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Consulting Firm - Professional Teal Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #0D9488;
  --primary-dark: #0F766E;
  --primary-light: #2DD4BF;
  --secondary: #0F172A;
  --accent: #2DD4BF;
  --bg-dark: #0F172A;
  --bg-darker: #020617;
  --bg-card: #1E293B;
  --text-white: #FFFFFF;
  --text-light: #CBD5E1;
  --text-muted: #94A3B8;
  --border: #334155;
  --gradient-teal: linear-gradient(135deg, #0D9488, #2DD4BF);
  --shadow-lg: 0 10px 15px -3px rgba(13,148,136,0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Cairo', sans-serif; background: var(--bg-dark); color: var(--text-white); direction: rtl; line-height: 1.7; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(15,23,42,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-teal); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.logo-text { font-size: 22px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary-light); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-teal); color: white; box-shadow: 0 4px 14px rgba(13,148,136,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13,148,136,0.5); }
.btn-outline { background: transparent; color: var(--primary-light); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }

.hero { padding: 140px 0 80px; background: linear-gradient(180deg, var(--bg-darker), var(--bg-dark)); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 30% 50%, rgba(13,148,136,0.08) 0%, transparent 60%); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(13,148,136,0.1); color: var(--primary-light); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(13,148,136,0.2); }
.hero h1 { font-size: 48px; font-weight: 900; line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; }
.hero-visual { display: flex; justify-content: center; }
.hero-image-placeholder { width: 100%; max-width: 500px; height: 400px; background: linear-gradient(135deg, var(--bg-card), rgba(13,148,136,0.1)); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; border: 1px solid var(--border); }

.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(13,148,136,0.1); color: var(--primary-light); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(13,148,136,0.2); }
.section-title { font-size: 38px; font-weight: 900; margin-bottom: 16px; }
.section-title span { background: var(--gradient-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.expertise-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.expertise-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
.expertise-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.expertise-icon { font-size: 40px; margin-bottom: 16px; }
.expertise-name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.expertise-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

.team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.team-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
.team-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.team-image { width: 100%; height: 220px; background: linear-gradient(135deg, var(--bg-darker), rgba(13,148,136,0.08)); display: flex; align-items: center; justify-content: center; font-size: 50px; }
.team-info { padding: 20px; }
.team-name { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
.team-role { font-size: 14px; color: var(--accent); font-weight: 600; }

.cases-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.case-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; border: 1px solid var(--border); transition: all 0.3s; }
.case-card:hover { border-color: var(--primary); }
.case-icon { font-size: 36px; margin-bottom: 16px; }
.case-name { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.case-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.case-result { display: inline-flex; align-items: center; gap: 6px; background: rgba(13,148,136,0.1); color: var(--accent); padding: 6px 16px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; }

.process-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.process-step { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; border: 1px solid var(--border); text-align: center; position: relative; }
.process-number { width: 48px; height: 48px; background: var(--gradient-teal); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; margin: 0 auto 16px; }
.process-name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.process-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.contact-form { background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 16px; background: var(--bg-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-white); font-family: 'Cairo', sans-serif; font-size: 15px; direction: rtl; transition: border-color 0.3s; }
.form-input:focus { outline: none; border-color: var(--primary); }
textarea.form-input { min-height: 120px; resize: vertical; }
.contact-info { display: flex; flex-direction: column; gap: 24px; }
.contact-info-card { background: var(--bg-card); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
.contact-info-icon { width: 48px; height: 48px; background: rgba(13,148,136,0.1); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 22px; }
.contact-info-text h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.contact-info-text p { font-size: 14px; color: var(--text-muted); }

.footer { padding: 60px 0 30px; background: var(--bg-darker); border-top: 1px solid var(--border); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-brand .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-logo-icon { width: 40px; height: 40px; background: var(--gradient-teal); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.footer-logo-text { font-size: 20px; font-weight: 900; }
.footer-desc { font-size: 14px; color: var(--text-muted); line-height: 1.8; margin-bottom: 20px; }
.footer-social { display: flex; gap: 12px; }
.footer-social a { width: 40px; height: 40px; background: var(--bg-card); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: all 0.3s; border: 1px solid var(--border); }
.footer-social a:hover { background: var(--primary); color: white; border-color: var(--primary); }
.footer-col h4 { font-size: 16px; font-weight: 700; margin-bottom: 20px; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 10px; }
.footer-col a { text-decoration: none; color: var(--text-muted); font-size: 14px; transition: color 0.3s; }
.footer-col a:hover { color: var(--primary-light); }
.footer-bottom { padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
.footer-bottom p { font-size: 13px; color: var(--text-muted); }

@media (max-width: 768px) {
  .hero-inner, .footer-grid, .contact-grid { grid-template-columns: 1fr; }
  .expertise-grid, .process-grid, .team-grid { grid-template-columns: repeat(2, 1fr); }
  .cases-grid { grid-template-columns: 1fr; }
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
      <Expertise />
      <Team />
      <CaseStudies />
      <Process />
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
            <div className="logo-icon">💼</div>
            <div className="logo-text">رؤية <span>للاستشارات</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#expertise">خبراتنا</a></li>
              <li><a href="#team">فريقنا</a></li>
              <li><a href="#cases">دراسات حالة</a></li>
              <li><a href="#process">منهجيتنا</a></li>
              <li><a href="#contact">تواصل معنا</a></li>
            </ul>
          </nav>
          <a href="#contact" className="btn btn-primary">استشارة مجانية</a>
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
            <div className="hero-badge">🏆 شركة استشارات رائدة</div>
            <h1>نحوّل التحديات<br />إلى <span>فرص نمو</span></h1>
            <p className="hero-desc">شركة استشارات إدارية ومالية سعودية متخصصة في مساعدة المؤسسات على تحقيق التميز التشغيلي والنمو المستدام. خبرة تزيد عن ١٥ عاماً في خدمة كبرى الشركات السعودية.</p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">احجز استشارة مجانية 💼</a>
              <a href="#cases" className="btn btn-dark">دراسات حالة</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">💼</div>
          </div>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Expertise.tsx",
    language: "tsx",
    content: `export default function Expertise() {
  const areas = [
    { icon: "📊", name: "استشارات مالية", desc: "تحليل مالي شامل وإعداد دراسات الجدوى وتخطيط الميزانيات وإدارة المخاطر المالية." },
    { icon: "📋", name: "استشارات إدارية", desc: "تطوير الهياكل التنظيمية وتحسين العمليات وإعداد الخطط الاستراتيجية للمؤسسات." },
    { icon: "💻", name: "استشارات تقنية", desc: "استراتيجيات التحول الرقمي واختيار الحلول التقنية المناسبة وإدارة مشاريع IT." },
    { icon: "👥", name: "موارد بشرية", desc: "تطوير سياسات الموارد البشرية وإدارة المواهب وبرامج التدريب والتطوير المهني." },
  ];
  return (
    <section className="section section-dark" id="expertise">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">⚡ مجالات الخبرة</div>
          <h2 className="section-title">خبرات <span>متخصصة</span> ومتنوعة</h2>
          <p className="section-desc">نقدم استشارات احترافية في أربعة مجالات رئيسية لتلبية جميع احتياجات أعمالك</p>
        </div>
        <div className="expertise-grid">
          {areas.map((a, i) => (
            <div key={i} className="expertise-card">
              <div className="expertise-icon">{a.icon}</div>
              <div className="expertise-name">{a.name}</div>
              <div className="expertise-desc">{a.desc}</div>
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
    { icon: "👨‍💼", name: "د. عبدالله الراشد", role: "المدير التنفيذي" },
    { icon: "👩‍💼", name: "أ. نورة المالكي", role: "مديرة الاستشارات المالية" },
    { icon: "👨‍💻", name: "م. سعود الحربي", role: "مدير الاستشارات التقنية" },
    { icon: "👩‍🏫", name: "أ. ريم العتيبي", role: "مديرة الموارد البشرية" },
  ];
  return (
    <section className="section" id="team">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👥 فريقنا</div>
          <h2 className="section-title">مستشارون <span>متميزون</span></h2>
          <p className="section-desc">فريق من المستشارين ذوي الخبرات العالمية والمؤهلات المتميزة</p>
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
    name: "CaseStudies.tsx",
    language: "tsx",
    content: `export default function CaseStudies() {
  const cases = [
    { icon: "🏭", name: "إعادة هيكلة شركة صناعية", desc: "ساعدنا شركة صناعية كبرى في إعادة هيكلة عملياتها التشغيلية مما أدى لتحسين الكفاءة وتقليل التكاليف.", result: "خفض التكاليف ٣٥٪" },
    { icon: "🏦", name: "تحول رقمي لمؤسسة مالية", desc: "قدنا مشروع التحول الرقمي لمؤسسة مالية رائدة شمل أتمتة العمليات وتطوير البنية التحتية التقنية.", result: "زيادة الإنتاجية ٦٠٪" },
    { icon: "🛒", name: "استراتيجية نمو لسلسلة متاجر", desc: "وضعنا استراتيجية توسع لسلسلة متاجر تجزئة شملت فتح فروع جديدة ودخول أسواق جديدة.", result: "نمو المبيعات ٤٥٪" },
    { icon: "🏥", name: "تطوير منظومة مستشفيات", desc: "طورنا منظومة عمل متكاملة لمجموعة مستشفيات شملت تحسين تجربة المرضى وكفاءة العمليات.", result: "رضا المرضى ٩٢٪" },
  ];
  return (
    <section className="section section-dark" id="cases">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📈 دراسات حالة</div>
          <h2 className="section-title">قصص <span>نجاح</span> ملهمة</h2>
          <p className="section-desc">نماذج حقيقية من المشاريع التي أنجزناها لعملائنا في مختلف القطاعات</p>
        </div>
        <div className="cases-grid">
          {cases.map((c, i) => (
            <div key={i} className="case-card">
              <div className="case-icon">{c.icon}</div>
              <div className="case-name">{c.name}</div>
              <div className="case-desc">{c.desc}</div>
              <div className="case-result">📊 {c.result}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Process.tsx",
    language: "tsx",
    content: `export default function Process() {
  const steps = [
    { num: "١", name: "التشخيص", desc: "تحليل شامل للوضع الحالي وتحديد التحديات والفرص المتاحة." },
    { num: "٢", name: "التخطيط", desc: "وضع خطة عمل تفصيلية مع أهداف قابلة للقياس وجدول زمني واضح." },
    { num: "٣", name: "التنفيذ", desc: "تطبيق الحلول بالتعاون مع فريقكم مع متابعة مستمرة وتقارير دورية." },
    { num: "٤", name: "التقييم", desc: "قياس النتائج ومقارنتها بالأهداف مع تقديم توصيات للتحسين المستمر." },
  ];
  return (
    <section className="section" id="process">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🔄 منهجية العمل</div>
          <h2 className="section-title">أربع خطوات نحو <span>النجاح</span></h2>
          <p className="section-desc">منهجية عمل مثبتة تضمن تحقيق أفضل النتائج لعملائنا</p>
        </div>
        <div className="process-grid">
          {steps.map((s, i) => (
            <div key={i} className="process-step">
              <div className="process-number">{s.num}</div>
              <div className="process-name">{s.name}</div>
              <div className="process-desc">{s.desc}</div>
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
    { icon: "📍", title: "العنوان", text: "الرياض، حي الصحافة، برج الأعمال" },
    { icon: "📞", title: "الهاتف", text: "٠١١٤٥٦٧٨٩٠" },
    { icon: "✉️", title: "البريد", text: "info@roeya.sa" },
    { icon: "🕐", title: "ساعات العمل", text: "الأحد - الخميس: ٨ص - ٥م" },
  ];
  return (
    <section className="section section-dark" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📩 تواصل معنا</div>
          <h2 className="section-title">احجز <span>استشارتك</span> المجانية</h2>
          <p className="section-desc">تواصل معنا اليوم للحصول على استشارة أولية مجانية مع أحد خبرائنا</p>
        </div>
        <div className="contact-grid">
          <div className="contact-form">
            <div className="form-group"><label className="form-label">الاسم</label><input className="form-input" placeholder="اسمك الكامل" /></div>
            <div className="form-group"><label className="form-label">الشركة</label><input className="form-input" placeholder="اسم الشركة" /></div>
            <div className="form-group"><label className="form-label">البريد</label><input className="form-input" type="email" placeholder="email@company.sa" /></div>
            <div className="form-group"><label className="form-label">مجال الاستشارة</label><input className="form-input" placeholder="مالية، إدارية، تقنية..." /></div>
            <div className="form-group"><label className="form-label">التفاصيل</label><textarea className="form-input" placeholder="اشرح احتياجاتك..."></textarea></div>
            <button className="btn btn-primary" style={{ width: "100%" }}>إرسال الطلب 💼</button>
          </div>
          <div className="contact-info">
            {info.map((item, i) => (
              <div key={i} className="contact-info-card">
                <div className="contact-info-icon">{item.icon}</div>
                <div className="contact-info-text"><h4>{item.title}</h4><p>{item.text}</p></div>
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
            <div className="footer-logo"><div className="footer-logo-icon">💼</div><div className="footer-logo-text">رؤية للاستشارات</div></div>
            <p className="footer-desc">شركة استشارات إدارية ومالية سعودية رائدة. نساعد المؤسسات في تحقيق التميز والنمو المستدام.</p>
            <div className="footer-social"><a href="#">𝕏</a><a href="#">💼</a><a href="#">📘</a></div>
          </div>
          <div className="footer-col"><h4>خدماتنا</h4><ul><li><a href="#">استشارات مالية</a></li><li><a href="#">استشارات إدارية</a></li><li><a href="#">استشارات تقنية</a></li><li><a href="#">موارد بشرية</a></li></ul></div>
          <div className="footer-col"><h4>الشركة</h4><ul><li><a href="#">من نحن</a></li><li><a href="#">فريقنا</a></li><li><a href="#">دراسات حالة</a></li><li><a href="#">المدونة</a></li></ul></div>
          <div className="footer-col"><h4>تواصل</h4><ul><li><a href="#">📍 الرياض، حي الصحافة</a></li><li><a href="#">📞 ٠١١٤٥٦٧٨٩٠</a></li><li><a href="#">✉️ info@roeya.sa</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <p>© ٢٠٢٥ رؤية للاستشارات. جميع الحقوق محفوظة</p>
          <p>صنع بـ ❤️ في السعودية</p>
        </div>
      </div>
    </footer>
  );
}`
  },
];
