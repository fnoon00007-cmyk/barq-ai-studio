import { VFSFile } from "@/hooks/v2/useVFS";

export const LAW_FIRM_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Law Firm - Professional Authority Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #1E3A5F;
  --primary-dark: #152C4A;
  --primary-light: #2A5280;
  --secondary: #0F172A;
  --accent: #C4A35A;
  --accent-light: #D4B76E;
  --bg-light: #F8F9FA;
  --bg-white: #FFFFFF;
  --text-dark: #0F172A;
  --text-muted: #64748B;
  --text-light: #94A3B8;
  --border: #E2E8F0;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
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
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(196, 163, 90, 0.2);
}

.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }

.logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 22px; }
.logo-text { font-size: 22px; font-weight: 800; color: white; }
.logo-text span { color: var(--accent); }

.nav-links { display: flex; gap: 32px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-light); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--accent); }

.header-cta { display: flex; gap: 12px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius); font-family: 'Cairo', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-accent { background: linear-gradient(135deg, var(--accent), var(--accent-light)); color: var(--secondary); box-shadow: 0 4px 14px rgba(196,163,90,0.4); }
.btn-accent:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(196,163,90,0.5); }
.btn-outline-light { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.3); }
.btn-outline-light:hover { background: white; color: var(--secondary); }
.btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; }
.btn-primary:hover { transform: translateY(-2px); }
.btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }

/* HERO */
.hero { padding: 140px 0 100px; background: linear-gradient(135deg, var(--secondary) 0%, #1a1a2e 50%, var(--primary-dark) 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C4A35A' fill-opacity='0.03'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E"); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(196,163,90,0.15); color: var(--accent); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(196,163,90,0.3); }
.hero h1 { font-size: 46px; font-weight: 900; color: white; line-height: 1.3; margin-bottom: 20px; }
.hero h1 span { color: var(--accent); }
.hero-desc { font-size: 18px; color: var(--text-light); line-height: 1.8; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 48px; }
.hero-trust { display: flex; gap: 40px; }
.hero-trust-item { text-align: center; }
.hero-trust-num { font-size: 32px; font-weight: 900; color: var(--accent); }
.hero-trust-label { font-size: 13px; color: var(--text-light); }

.hero-visual { position: relative; }
.hero-scales { width: 100%; height: 350px; background: rgba(196,163,90,0.1); border-radius: var(--radius-lg); border: 1px solid rgba(196,163,90,0.2); display: flex; align-items: center; justify-content: center; font-size: 120px; }

/* PRACTICE AREAS */
.practice-section { padding: 80px 0; }
.section-header { text-align: center; margin-bottom: 48px; }
.section-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(30,58,95,0.1); color: var(--primary); padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.section-header h2 { font-size: 36px; font-weight: 800; color: var(--secondary); margin-bottom: 12px; }
.section-header p { font-size: 16px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.practice-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.practice-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px 24px; text-align: center; transition: all 0.4s; position: relative; overflow: hidden; }
.practice-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--primary), var(--accent)); transform: scaleX(0); transition: transform 0.4s; }
.practice-card:hover::before { transform: scaleX(1); }
.practice-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); }
.practice-icon { width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
.practice-card h3 { font-size: 18px; font-weight: 700; color: var(--secondary); margin-bottom: 10px; }
.practice-card p { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

/* TEAM */
.team-section { padding: 80px 0; background: var(--bg-light); }
.team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.team-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: all 0.4s; }
.team-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); }
.team-photo { height: 280px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; font-size: 80px; }
.team-info { padding: 24px; text-align: center; }
.team-info h3 { font-size: 20px; font-weight: 700; color: var(--secondary); margin-bottom: 6px; }
.team-role { font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 12px; }
.team-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; }
.team-exp { display: inline-flex; align-items: center; gap: 6px; background: rgba(196,163,90,0.1); color: var(--accent); padding: 6px 14px; border-radius: 50px; font-size: 13px; font-weight: 600; margin-top: 12px; }

/* CASE STUDIES */
.cases-section { padding: 80px 0; }
.cases-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
.case-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; transition: all 0.3s; }
.case-card:hover { box-shadow: var(--shadow-lg); }
.case-tag { display: inline-flex; padding: 4px 12px; background: rgba(30,58,95,0.1); color: var(--primary); border-radius: 50px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.case-card h3 { font-size: 20px; font-weight: 700; color: var(--secondary); margin-bottom: 10px; }
.case-card p { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.case-result { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #10B981; }

/* CONSULTATION */
.consultation-section { padding: 80px 0; background: linear-gradient(135deg, var(--secondary), var(--primary-dark)); color: white; }
.consultation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.consultation-content h2 { font-size: 36px; font-weight: 800; margin-bottom: 20px; }
.consultation-content p { font-size: 16px; color: var(--text-light); line-height: 1.8; margin-bottom: 32px; }
.consultation-features { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.consultation-feature { display: flex; align-items: center; gap: 12px; font-size: 16px; }
.consultation-feature-icon { width: 32px; height: 32px; background: rgba(196,163,90,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }

.consultation-form { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 40px; }
.consultation-form h3 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-light); }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius-sm); font-family: 'Cairo', sans-serif; font-size: 14px; background: rgba(255,255,255,0.05); color: white; transition: border-color 0.3s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
.form-group textarea { resize: vertical; min-height: 100px; }
.form-group select option { background: var(--secondary); color: white; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* CONTACT */
.contact-section { padding: 80px 0; }
.contact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.contact-card { background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; text-align: center; transition: all 0.3s; }
.contact-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.contact-icon { width: 56px; height: 56px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px; }
.contact-label { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
.contact-value { font-size: 16px; font-weight: 700; color: var(--secondary); }

/* FOOTER */
.footer { background: var(--secondary); color: white; padding: 60px 0 0; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.footer-about p { font-size: 14px; color: var(--text-light); line-height: 1.8; margin-top: 16px; }
.footer-col h4 { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: var(--accent); }
.footer-col ul { list-style: none; }
.footer-col ul li { margin-bottom: 10px; }
.footer-col ul li a { color: var(--text-light); text-decoration: none; font-size: 14px; transition: color 0.3s; }
.footer-col ul li a:hover { color: var(--accent); }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; }
.footer-bottom p { font-size: 13px; color: var(--text-light); }

@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero h1 { font-size: 32px; }
  .hero-visual { display: none; }
  .hero-trust { justify-content: center; }
  .hero-actions { justify-content: center; }
  .practice-grid { grid-template-columns: 1fr 1fr; }
  .team-grid { grid-template-columns: 1fr; }
  .cases-grid { grid-template-columns: 1fr; }
  .consultation-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr 1fr; }
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
      <PracticeAreas />
      <Team />
      <CaseStudies />
      <Consultation />
      <ContactInfo />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <div className="logo-icon">⚖️</div>
          <div className="logo-text">مكتب <span>العدالة</span></div>
        </a>
        <ul className="nav-links">
          <li><a href="#practice">مجالات الممارسة</a></li>
          <li><a href="#team">فريقنا</a></li>
          <li><a href="#cases">قصص النجاح</a></li>
          <li><a href="#consultation">استشارة</a></li>
        </ul>
        <div className="header-cta">
          <a href="#consultation" className="btn btn-accent" style={{padding:'10px 20px',fontSize:'14px'}}>استشارة مجانية</a>
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
          <div className="hero-badge">⚖️ مكتب محاماة واستشارات قانونية معتمد</div>
          <h1>حماية حقوقك <span>أولويتنا</span> القصوى</h1>
          <p className="hero-desc">فريق من المحامين والمستشارين القانونيين ذوي الخبرة الواسعة في مختلف التخصصات القانونية. نقدم خدمات قانونية متميزة بأعلى معايير المهنية والسرية.</p>
          <div className="hero-actions">
            <a href="#consultation" className="btn btn-accent">احجز استشارة مجانية</a>
            <a href="#practice" className="btn btn-outline-light">مجالات الممارسة</a>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-item"><div className="hero-trust-num">+500</div><div className="hero-trust-label">قضية ناجحة</div></div>
            <div className="hero-trust-item"><div className="hero-trust-num">+20</div><div className="hero-trust-label">سنة خبرة</div></div>
            <div className="hero-trust-item"><div className="hero-trust-num">98%</div><div className="hero-trust-label">نسبة النجاح</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-scales">⚖️</div>
        </div>
      </div>
    </section>
  );
}

function PracticeAreas() {
  const areas = [
    { icon: "🏢", title: "القانون التجاري", desc: "تأسيس الشركات، العقود التجارية، الاندماجات والاستحواذات، وحل النزاعات التجارية." },
    { icon: "🏠", title: "القانون العقاري", desc: "عقود البيع والشراء، النزاعات العقارية، التسجيل العيني، وإدارة الأملاك." },
    { icon: "👨‍👩‍👧", title: "قانون الأسرة", desc: "قضايا الطلاق والنفقة، الحضانة، الميراث والوصايا، والأحوال الشخصية." },
    { icon: "⚡", title: "القانون الجنائي", desc: "الدفاع الجنائي، قضايا الاحتيال المالي، الجرائم الإلكترونية، والتحكيم." },
    { icon: "💼", title: "قانون العمل", desc: "عقود العمل، حقوق الموظفين، تسوية المنازعات العمالية، ونظام العمل." },
    { icon: "🌐", title: "القانون الدولي", desc: "التحكيم الدولي، الاستثمار الأجنبي، التجارة الدولية، والمعاهدات." },
    { icon: "📱", title: "القانون الرقمي", desc: "حماية البيانات، التجارة الإلكترونية، الملكية الفكرية الرقمية، والأمن السيبراني." },
    { icon: "🏛️", title: "القانون الإداري", desc: "الطعون الإدارية، العقود الحكومية، المنافسات، والتراخيص التجارية." },
  ];

  return (
    <section className="practice-section" id="practice">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📋 مجالات الممارسة</div>
          <h2>تخصصات قانونية شاملة</h2>
          <p>نغطي جميع المجالات القانونية بفريق متخصص في كل تخصص</p>
        </div>
        <div className="practice-grid">
          {areas.map((a,i)=>(
            <div key={i} className="practice-card">
              <div className="practice-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  const members = [
    { name: "أ. خالد المحمدي", role: "الشريك المؤسس - قانون تجاري", exp: "+25 سنة خبرة", desc: "محامٍ بارز متخصص في القانون التجاري والشركات مع خبرة واسعة في الاندماجات والاستحواذات.", emoji: "👨‍💼" },
    { name: "أ. سارة العتيبي", role: "شريك أول - قانون الأسرة", exp: "+18 سنة خبرة", desc: "مستشارة قانونية متخصصة في الأحوال الشخصية والميراث مع سجل حافل بالنجاحات.", emoji: "👩‍💼" },
    { name: "أ. فهد الدوسري", role: "مستشار أول - القانون الجنائي", exp: "+15 سنة خبرة", desc: "محامٍ متمرس في الدفاع الجنائي وقضايا الاحتيال المالي والجرائم الإلكترونية.", emoji: "👨‍⚖️" },
  ];

  return (
    <section className="team-section" id="team">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👥 فريقنا</div>
          <h2>نخبة من المحامين المتخصصين</h2>
          <p>فريق من أفضل المحامين والمستشارين القانونيين في المملكة</p>
        </div>
        <div className="team-grid">
          {members.map((m,i)=>(
            <div key={i} className="team-card">
              <div className="team-photo">{m.emoji}</div>
              <div className="team-info">
                <h3>{m.name}</h3>
                <div className="team-role">{m.role}</div>
                <p className="team-desc">{m.desc}</p>
                <div className="team-exp">⭐ {m.exp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  const cases = [
    { tag: "قانون تجاري", title: "استحواذ شركة بقيمة 50 مليون ريال", desc: "نجحنا في إتمام صفقة استحواذ معقدة شملت فحص قانوني شامل وهيكلة تعاقدية متقدمة لضمان حماية مصالح العميل.", result: "✅ تمت الصفقة بنجاح تام" },
    { tag: "قانون عقاري", title: "حل نزاع عقاري بين شركتين كبرى", desc: "تمكنا من حل نزاع عقاري معقد يتعلق بأراضي تجارية بقيمة 30 مليون ريال عبر التحكيم والوساطة.", result: "✅ تسوية لصالح العميل 100%" },
    { tag: "قانون الأسرة", title: "قضية حضانة دولية معقدة", desc: "نجحنا في الحصول على حكم حضانة في قضية معقدة تتضمن أطرافاً من جنسيات مختلفة وقوانين متعددة.", result: "✅ حكم حضانة لصالح الموكل" },
    { tag: "جنائي", title: "تبرئة في قضية احتيال مالي كبرى", desc: "تم تبرئة العميل بالكامل في قضية احتيال مالي معقدة بعد تقديم دفاع متقن ومستندات دامغة.", result: "✅ تبرئة كاملة" },
  ];

  return (
    <section className="cases-section" id="cases">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🏆 قصص النجاح</div>
          <h2>سجل حافل بالإنجازات</h2>
          <p>نماذج من القضايا التي أنجزناها بنجاح لعملائنا</p>
        </div>
        <div className="cases-grid">
          {cases.map((c,i)=>(
            <div key={i} className="case-card">
              <div className="case-tag">{c.tag}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="case-result">{c.result}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Consultation() {
  return (
    <section className="consultation-section" id="consultation">
      <div className="container consultation-grid">
        <div className="consultation-content">
          <div className="section-badge" style={{background:'rgba(196,163,90,0.2)',color:'#C4A35A'}}>📞 استشارة مجانية</div>
          <h2>احصل على استشارة قانونية مجانية</h2>
          <p>نقدم لك استشارة قانونية أولية مجانية لتقييم قضيتك وتحديد أفضل المسارات القانونية المتاحة.</p>
          <div className="consultation-features">
            <div className="consultation-feature"><div className="consultation-feature-icon">✓</div>تقييم مجاني للقضية</div>
            <div className="consultation-feature"><div className="consultation-feature-icon">✓</div>سرية تامة</div>
            <div className="consultation-feature"><div className="consultation-feature-icon">✓</div>رد خلال 24 ساعة</div>
            <div className="consultation-feature"><div className="consultation-feature-icon">✓</div>خطة عمل واضحة</div>
          </div>
        </div>
        <div className="consultation-form">
          <h3>نموذج طلب الاستشارة</h3>
          <div className="form-row">
            <div className="form-group"><label>الاسم الكامل</label><input type="text" placeholder="أدخل اسمك" /></div>
            <div className="form-group"><label>رقم الجوال</label><input type="tel" placeholder="05xxxxxxxx" /></div>
          </div>
          <div className="form-group"><label>نوع القضية</label>
            <select><option>قانون تجاري</option><option>قانون عقاري</option><option>قانون الأسرة</option><option>قانون جنائي</option><option>قانون العمل</option><option>أخرى</option></select>
          </div>
          <div className="form-group"><label>وصف مختصر</label><textarea placeholder="اشرح قضيتك بإيجاز..." rows={4}></textarea></div>
          <button className="btn btn-accent" style={{width:'100%'}}>إرسال طلب الاستشارة</button>
        </div>
      </div>
    </section>
  );
}

function ContactInfo() {
  return (
    <section className="contact-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📍 تواصل معنا</div>
          <h2>معلومات التواصل</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-card"><div className="contact-icon">📍</div><div className="contact-label">العنوان</div><div className="contact-value">الرياض، حي الورود، شارع العليا</div></div>
          <div className="contact-card"><div className="contact-icon">📞</div><div className="contact-label">الهاتف</div><div className="contact-value" style={{direction:'ltr'}}>+966 11 000 0000</div></div>
          <div className="contact-card"><div className="contact-icon">✉️</div><div className="contact-label">البريد</div><div className="contact-value">info@aladala-law.sa</div></div>
          <div className="contact-card"><div className="contact-icon">⏰</div><div className="contact-label">ساعات العمل</div><div className="contact-value">الأحد-الخميس: 8ص - 5م</div></div>
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
            <div className="logo"><div className="logo-icon">⚖️</div><div className="logo-text" style={{color:'white'}}>مكتب <span>العدالة</span></div></div>
            <p>مكتب محاماة واستشارات قانونية متخصص يقدم خدمات قانونية متميزة في جميع التخصصات القانونية بأعلى معايير المهنية.</p>
          </div>
          <div className="footer-col"><h4>مجالات الممارسة</h4><ul><li><a href="#">قانون تجاري</a></li><li><a href="#">قانون عقاري</a></li><li><a href="#">قانون الأسرة</a></li><li><a href="#">قانون جنائي</a></li></ul></div>
          <div className="footer-col"><h4>روابط سريعة</h4><ul><li><a href="#team">فريقنا</a></li><li><a href="#cases">قصص النجاح</a></li><li><a href="#consultation">استشارة مجانية</a></li><li><a href="#">سياسة الخصوصية</a></li></ul></div>
          <div className="footer-col"><h4>تواصل معنا</h4><ul><li><a href="#">📍 الرياض، حي الورود</a></li><li><a href="tel:+966110000000">📞 +966 11 000 0000</a></li><li><a href="#">✉️ info@aladala-law.sa</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 مكتب العدالة للمحاماة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
`
  }
];
