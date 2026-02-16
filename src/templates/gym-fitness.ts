import { VFSFile } from "@/hooks/v2/useVFS";

export const GYM_FITNESS_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Gym Fitness - Bold Energetic Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #EF4444;
  --primary-dark: #DC2626;
  --primary-light: #F87171;
  --secondary: #111111;
  --accent: #F97316;
  --accent-light: #FB923C;
  --bg-dark: #111111;
  --bg-darker: #0A0A0A;
  --bg-card: #1A1A1A;
  --text-white: #FFFFFF;
  --text-light: #D1D5DB;
  --text-muted: #9CA3AF;
  --border: #2A2A2A;
  --gradient-fire: linear-gradient(135deg, #EF4444, #F97316);
  --shadow-sm: 0 1px 2px rgba(239,68,68,0.05);
  --shadow-md: 0 4px 6px -1px rgba(239,68,68,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(239,68,68,0.15);
  --shadow-xl: 0 20px 25px -5px rgba(239,68,68,0.15);
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
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(17,17,17,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-fire); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: white; }
.logo-text { font-size: 24px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary); }
.header-cta { display: flex; gap: 12px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-fire); color: white; box-shadow: 0 4px 14px rgba(239,68,68,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239,68,68,0.5); }
.btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }
.btn-dark:hover { border-color: var(--primary); }

/* HERO */
.hero { padding: 140px 0 80px; background: linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-dark) 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.08) 0%, transparent 60%); }
.hero::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 70% 30%, rgba(249,115,22,0.06) 0%, transparent 60%); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.1); color: var(--primary); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(239,68,68,0.2); }
.hero h1 { font-size: 52px; font-weight: 900; color: var(--text-white); line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 40px; }
.hero-stats { display: flex; gap: 40px; }
.hero-stat { text-align: center; }
.hero-stat-value { font-size: 36px; font-weight: 900; background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-stat-label { font-size: 14px; color: var(--text-muted); font-weight: 500; }
.hero-visual { position: relative; display: flex; justify-content: center; }
.hero-image-placeholder { width: 100%; max-width: 500px; height: 450px; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(239,68,68,0.1) 100%); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; border: 1px solid var(--border); }

/* SECTION COMMON */
.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.1); color: var(--primary); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(239,68,68,0.2); }
.section-title { font-size: 38px; font-weight: 900; color: var(--text-white); margin-bottom: 16px; }
.section-title span { background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

/* PLANS */
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.plan-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); transition: all 0.3s; position: relative; overflow: hidden; }
.plan-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.plan-card.featured { border-color: var(--primary); background: linear-gradient(180deg, rgba(239,68,68,0.05) 0%, var(--bg-card) 100%); }
.plan-card.featured::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--gradient-fire); }
.plan-popular { position: absolute; top: 16px; left: 16px; background: var(--gradient-fire); color: white; padding: 4px 14px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
.plan-name { font-size: 22px; font-weight: 800; color: var(--text-white); margin-bottom: 8px; }
.plan-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 24px; }
.plan-price-value { font-size: 48px; font-weight: 900; background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.plan-price-period { font-size: 16px; color: var(--text-muted); }
.plan-features { list-style: none; margin-bottom: 28px; }
.plan-features li { padding: 8px 0; font-size: 15px; color: var(--text-light); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.plan-features li:last-child { border: none; }
.plan-check { color: var(--primary); font-weight: 700; }

/* SCHEDULE */
.schedule-tabs { display: flex; gap: 12px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
.schedule-tab { padding: 10px 24px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); transition: all 0.3s; }
.schedule-tab.active { background: var(--gradient-fire); color: white; border-color: transparent; }
.schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.schedule-item { background: var(--bg-card); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); transition: all 0.3s; }
.schedule-item:hover { border-color: var(--primary); }
.schedule-time { font-size: 14px; color: var(--primary); font-weight: 700; margin-bottom: 8px; }
.schedule-name { font-size: 18px; font-weight: 700; color: var(--text-white); margin-bottom: 4px; }
.schedule-trainer { font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
.schedule-meta { display: flex; gap: 16px; }
.schedule-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }

/* TRAINERS */
.trainers-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.trainer-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; }
.trainer-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.trainer-image { width: 100%; height: 260px; background: linear-gradient(135deg, var(--bg-darker), rgba(239,68,68,0.1)); display: flex; align-items: center; justify-content: center; font-size: 60px; }
.trainer-info { padding: 24px; }
.trainer-name { font-size: 18px; font-weight: 800; color: var(--text-white); margin-bottom: 4px; }
.trainer-specialty { font-size: 14px; color: var(--primary); font-weight: 600; margin-bottom: 12px; }
.trainer-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

/* GALLERY */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.gallery-item { border-radius: var(--radius); overflow: hidden; position: relative; height: 280px; background: linear-gradient(135deg, var(--bg-card), rgba(239,68,68,0.05)); display: flex; align-items: center; justify-content: center; font-size: 50px; border: 1px solid var(--border); transition: all 0.3s; cursor: pointer; }
.gallery-item:hover { border-color: var(--primary); transform: scale(1.02); }

/* CTA */
.cta { padding: 100px 0; background: linear-gradient(135deg, var(--bg-darker) 0%, rgba(239,68,68,0.08) 100%); text-align: center; position: relative; overflow: hidden; }
.cta::before { content: ''; position: absolute; top: -150px; right: -150px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%); border-radius: 50%; }
.cta h2 { font-size: 42px; font-weight: 900; color: var(--text-white); margin-bottom: 16px; }
.cta h2 span { background: var(--gradient-fire); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.cta p { font-size: 18px; color: var(--text-muted); margin-bottom: 36px; max-width: 600px; margin-left: auto; margin-right: auto; }
.cta-actions { display: flex; gap: 16px; justify-content: center; }

/* FOOTER */
.footer { padding: 60px 0 30px; background: var(--bg-darker); border-top: 1px solid var(--border); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-brand { }
.footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-logo-icon { width: 40px; height: 40px; background: var(--gradient-fire); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 18px; }
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
  .hero-inner, .footer-grid { grid-template-columns: 1fr; }
  .plans-grid { grid-template-columns: 1fr; }
  .trainers-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .hero h1 { font-size: 32px; }
  .section-title { font-size: 28px; }
  .hero-stats { flex-wrap: wrap; gap: 20px; }
  .nav-links { display: none; }
  .schedule-grid { grid-template-columns: 1fr; }
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
      <Plans />
      <Schedule />
      <Trainers />
      <Gallery />
      <CTA />
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
            <div className="logo-icon">💪</div>
            <div className="logo-text">باور <span>فيت</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#plans">الباقات</a></li>
              <li><a href="#schedule">جدول الحصص</a></li>
              <li><a href="#trainers">المدربون</a></li>
              <li><a href="#gallery">معرض الصور</a></li>
              <li><a href="#contact">تواصل معنا</a></li>
            </ul>
          </nav>
          <div className="header-cta">
            <a href="#plans" className="btn btn-outline">الباقات</a>
            <a href="#contact" className="btn btn-primary">سجّل الآن 🔥</a>
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
  const stats = [
    { value: "٥٠٠٠+", label: "عضو نشط" },
    { value: "٥٠+", label: "مدرب محترف" },
    { value: "١٠٠+", label: "حصة أسبوعية" },
    { value: "١٥", label: "سنة خبرة" },
  ];

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">🏆 النادي الأول في المملكة</div>
            <h1>غيّر جسمك.<br /><span>غيّر حياتك.</span></h1>
            <p className="hero-desc">
              انضم لأكبر نادي رياضي في المملكة العربية السعودية. أحدث الأجهزة، أفضل المدربين المعتمدين، وبرامج تدريبية متكاملة مصممة لتحقيق أهدافك.
            </p>
            <div className="hero-actions">
              <a href="#plans" className="btn btn-primary">ابدأ رحلتك اليوم 💪</a>
              <a href="#schedule" className="btn btn-dark">جدول الحصص</a>
            </div>
            <div className="hero-stats">
              {stats.map((stat, i) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-value">{stat.value}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">🏋️</div>
          </div>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Plans.tsx",
    language: "tsx",
    content: `export default function Plans() {
  const plans = [
    {
      name: "الباقة الأساسية",
      desc: "مثالية للمبتدئين",
      price: "١٩٩",
      period: "شهرياً",
      featured: false,
      features: [
        "دخول النادي من ٦ص - ١٠م",
        "استخدام جميع الأجهزة",
        "خزانة شخصية",
        "موقف سيارات مجاني",
        "تقييم لياقة أولي",
        "تطبيق تتبع التمارين",
      ],
    },
    {
      name: "الباقة الذهبية",
      desc: "الأكثر مبيعاً",
      price: "٣٤٩",
      period: "شهرياً",
      featured: true,
      popular: true,
      features: [
        "دخول ٢٤ ساعة",
        "جميع الحصص الجماعية",
        "مدرب شخصي (٤ جلسات)",
        "برنامج غذائي شهري",
        "ساونا وجاكوزي",
        "ضيف مجاني مرتين شهرياً",
        "تقييم شهري للأداء",
        "خصم ٢٠٪ على المتجر",
      ],
    },
    {
      name: "الباقة البلاتينية",
      desc: "للمحترفين والرياضيين",
      price: "٥٩٩",
      period: "شهرياً",
      featured: false,
      features: [
        "كل مميزات الذهبية",
        "مدرب شخصي (١٢ جلسة)",
        "برنامج تغذية متقدم",
        "تحليل تركيب الجسم",
        "أولوية الحجز بالحصص",
        "منطقة VIP خاصة",
        "غرفة تعافي وتدليك",
        "إيقاف الاشتراك مرتين",
      ],
    },
  ];

  return (
    <section className="section section-dark" id="plans">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">💰 الباقات والأسعار</div>
          <h2 className="section-title">اختر <span>باقتك</span> المناسبة</h2>
          <p className="section-desc">باقات مرنة تناسب جميع المستويات والأهداف مع ضمان استرجاع المبلغ خلال ٧ أيام</p>
        </div>
        <div className="plans-grid">
          {plans.map((plan, i) => (
            <div key={i} className={"plan-card" + (plan.featured ? " featured" : "")}>
              {plan.popular && <div className="plan-popular">⭐ الأكثر مبيعاً</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-desc">{plan.desc}</div>
              <div className="plan-price">
                <span className="plan-price-value">{plan.price}</span>
                <span className="plan-price-period">ر.س / {plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j}><span className="plan-check">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className={"btn " + (plan.featured ? "btn-primary" : "btn-outline")} style={{ width: "100%" }}>
                {plan.featured ? "اشترك الآن 🔥" : "اختر الباقة"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Schedule.tsx",
    language: "tsx",
    content: `export default function Schedule() {
  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const classes = [
    { time: "٦:٠٠ - ٧:٠٠ ص", name: "كروس فت", trainer: "أ. سلطان العتيبي", duration: "٦٠ دقيقة", level: "متقدم", icon: "🏋️" },
    { time: "٧:٣٠ - ٨:٣٠ ص", name: "يوغا", trainer: "أ. نورة الحربي", duration: "٦٠ دقيقة", level: "جميع المستويات", icon: "🧘" },
    { time: "٩:٠٠ - ١٠:٠٠ ص", name: "تمارين القوة", trainer: "أ. خالد الشمري", duration: "٦٠ دقيقة", level: "متوسط", icon: "💪" },
    { time: "٤:٠٠ - ٥:٠٠ م", name: "ملاكمة", trainer: "أ. فهد القحطاني", duration: "٦٠ دقيقة", level: "متقدم", icon: "🥊" },
    { time: "٥:٣٠ - ٦:٣٠ م", name: "زومبا", trainer: "أ. ريم السالم", duration: "٦٠ دقيقة", level: "مبتدئ", icon: "💃" },
    { time: "٧:٠٠ - ٨:٠٠ م", name: "HIIT", trainer: "أ. عبدالله الدوسري", duration: "٦٠ دقيقة", level: "متقدم", icon: "⚡" },
    { time: "٨:٣٠ - ٩:٣٠ م", name: "بيلاتس", trainer: "أ. سارة المطيري", duration: "٦٠ دقيقة", level: "جميع المستويات", icon: "🤸" },
    { time: "١٠:٠٠ - ١١:٠٠ م", name: "تمارين وظيفية", trainer: "أ. أحمد الغامدي", duration: "٦٠ دقيقة", level: "متوسط", icon: "🔥" },
  ];

  return (
    <section className="section" id="schedule">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📅 جدول الحصص</div>
          <h2 className="section-title">جدول <span>الحصص</span> الأسبوعي</h2>
          <p className="section-desc">أكثر من ١٠٠ حصة أسبوعية بإشراف مدربين معتمدين دولياً</p>
        </div>
        <div className="schedule-tabs">
          {days.map((day, i) => (
            <button key={i} className={"schedule-tab" + (i === 0 ? " active" : "")}>{day}</button>
          ))}
        </div>
        <div className="schedule-grid">
          {classes.map((cls, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-time">{cls.icon} {cls.time}</div>
              <div className="schedule-name">{cls.name}</div>
              <div className="schedule-trainer">{cls.trainer}</div>
              <div className="schedule-meta">
                <span className="schedule-meta-item">⏱️ {cls.duration}</span>
                <span className="schedule-meta-item">📊 {cls.level}</span>
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
    name: "Trainers.tsx",
    language: "tsx",
    content: `export default function Trainers() {
  const trainers = [
    { name: "سلطان العتيبي", specialty: "كروس فت وتمارين القوة", desc: "بطل المملكة في كروس فت لعام ٢٠٢٣، خبرة ١٢ سنة في التدريب الرياضي، حاصل على شهادة NASM و ACE الدولية.", icon: "🏋️" },
    { name: "خالد الشمري", specialty: "بناء الأجسام والتغذية", desc: "مدرب معتمد من IFBB، متخصص في برامج التضخيم والتنشيف، خبرة ١٠ سنوات مع أبطال رياضيين.", icon: "💪" },
    { name: "نورة الحربي", specialty: "يوغا وبيلاتس", desc: "مدربة يوغا معتمدة دولياً RYT-500، خبرة ٨ سنوات في التأهيل الحركي واليوغا العلاجية.", icon: "🧘" },
    { name: "فهد القحطاني", specialty: "الملاكمة والفنون القتالية", desc: "بطل الملاكمة السابق، مدرب معتمد من AIBA، خبرة ١٥ سنة في تدريب الملاكمة واللياقة القتالية.", icon: "🥊" },
  ];

  return (
    <section className="section section-dark" id="trainers">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👨‍🏫 فريق المدربين</div>
          <h2 className="section-title">مدربون <span>محترفون</span> ومعتمدون</h2>
          <p className="section-desc">نخبة من المدربين المعتمدين دولياً لمساعدتك في تحقيق أهدافك الرياضية</p>
        </div>
        <div className="trainers-grid">
          {trainers.map((trainer, i) => (
            <div key={i} className="trainer-card">
              <div className="trainer-image">{trainer.icon}</div>
              <div className="trainer-info">
                <div className="trainer-name">{trainer.name}</div>
                <div className="trainer-specialty">{trainer.specialty}</div>
                <div className="trainer-desc">{trainer.desc}</div>
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
    name: "Gallery.tsx",
    language: "tsx",
    content: `export default function Gallery() {
  const items = [
    { icon: "🏋️", label: "صالة الأوزان الحرة" },
    { icon: "🏃", label: "منطقة الكارديو" },
    { icon: "🥊", label: "حلبة الملاكمة" },
    { icon: "🧘", label: "صالة اليوغا" },
    { icon: "🏊", label: "المسبح الأولمبي" },
    { icon: "🧖", label: "الساونا والجاكوزي" },
  ];

  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📸 معرض الصور</div>
          <h2 className="section-title">جولة في <span>مرافقنا</span></h2>
          <p className="section-desc">مرافق حديثة ومجهزة بأعلى المعايير العالمية لتجربة رياضية متكاملة</p>
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
    name: "CTA.tsx",
    language: "tsx",
    content: `export default function CTA() {
  return (
    <section className="cta" id="contact">
      <div className="container">
        <h2>جاهز <span>تبدأ</span> رحلتك؟</h2>
        <p>
          انضم لعائلة باور فيت اليوم واحصل على تجربة مجانية لمدة ٣ أيام مع تقييم لياقة شامل ومجاني. حقّق أهدافك مع أفضل المدربين والمرافق في المملكة.
        </p>
        <div className="cta-actions">
          <a href="#plans" className="btn btn-primary">ابدأ تجربتك المجانية 🔥</a>
          <a href="tel:+966501234567" className="btn btn-outline">اتصل بنا: ٠٥٠١٢٣٤٥٦٧</a>
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
              <div className="footer-logo-icon">💪</div>
              <div className="footer-logo-text">باور فيت</div>
            </div>
            <p className="footer-desc">
              النادي الرياضي الأول في المملكة العربية السعودية. نقدم أحدث الأجهزة وأفضل المدربين لمساعدتك في تحقيق أهدافك الرياضية والصحية.
            </p>
            <div className="footer-social">
              <a href="#">𝕏</a>
              <a href="#">📸</a>
              <a href="#">📘</a>
              <a href="#">▶️</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><a href="#plans">الباقات والأسعار</a></li>
              <li><a href="#schedule">جدول الحصص</a></li>
              <li><a href="#trainers">المدربون</a></li>
              <li><a href="#gallery">مرافقنا</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>الخدمات</h4>
            <ul>
              <li><a href="#">تدريب شخصي</a></li>
              <li><a href="#">برامج تغذية</a></li>
              <li><a href="#">حصص جماعية</a></li>
              <li><a href="#">تأهيل رياضي</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <ul>
              <li><a href="#">📍 حي الملقا، الرياض</a></li>
              <li><a href="tel:+966501234567">📞 ٠٥٠١٢٣٤٥٦٧</a></li>
              <li><a href="mailto:info@powerfit.sa">✉️ info@powerfit.sa</a></li>
              <li><a href="#">🕐 ٢٤ ساعة / ٧ أيام</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ٢٠٢٥ باور فيت. جميع الحقوق محفوظة</p>
          <p>صنع بـ ❤️ في السعودية</p>
        </div>
      </div>
    </footer>
  );
}`
  },
];
