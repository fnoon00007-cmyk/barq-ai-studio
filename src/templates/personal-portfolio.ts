import { VFSFile } from "@/hooks/v2/useVFS";

export const PERSONAL_PORTFOLIO_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Personal Portfolio - Modern Indigo Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #6366F1;
  --primary-dark: #4F46E5;
  --primary-light: #818CF8;
  --secondary: #0F0F1A;
  --accent: #818CF8;
  --bg-dark: #0F0F1A;
  --bg-darker: #08081A;
  --bg-card: #1A1A2E;
  --text-white: #FFFFFF;
  --text-light: #C7D2FE;
  --text-muted: #9B9ECF;
  --border: #2A2A4A;
  --gradient-indigo: linear-gradient(135deg, #6366F1, #818CF8);
  --shadow-lg: 0 10px 15px -3px rgba(99,102,241,0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Cairo', sans-serif; background: var(--bg-dark); color: var(--text-white); direction: rtl; line-height: 1.7; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(15,15,26,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-indigo); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; color: white; }
.logo-text { font-size: 22px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-indigo); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary-light); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-indigo); color: white; box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
.btn-outline { background: transparent; color: var(--primary-light); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }

.hero { padding: 140px 0 80px; background: var(--bg-darker); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.08) 0%, transparent 60%); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.1); color: var(--primary-light); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(99,102,241,0.2); }
.hero h1 { font-size: 48px; font-weight: 900; line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-indigo); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 32px; }
.hero-social { display: flex; gap: 12px; }
.hero-social a { width: 44px; height: 44px; background: var(--bg-card); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: all 0.3s; border: 1px solid var(--border); font-size: 18px; }
.hero-social a:hover { background: var(--primary); color: white; border-color: var(--primary); }
.hero-visual { display: flex; justify-content: center; }
.hero-avatar { width: 350px; height: 350px; background: linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.15)); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 100px; border: 3px solid var(--border); }

.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.1); color: var(--primary-light); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(99,102,241,0.2); }
.section-title { font-size: 38px; font-weight: 900; margin-bottom: 16px; }
.section-title span { background: var(--gradient-indigo); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.about-text p { font-size: 16px; color: var(--text-muted); line-height: 1.9; margin-bottom: 20px; }
.about-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.about-info-item { background: var(--bg-card); border-radius: var(--radius); padding: 16px; border: 1px solid var(--border); }
.about-info-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
.about-info-value { font-size: 16px; font-weight: 700; }

.skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.skill-group { background: var(--bg-card); border-radius: var(--radius-lg); padding: 28px; border: 1px solid var(--border); }
.skill-group-title { font-size: 18px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.skill-item { margin-bottom: 16px; }
.skill-name { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.skill-bar { height: 8px; background: var(--border); border-radius: var(--radius-full); overflow: hidden; }
.skill-fill { height: 100%; background: var(--gradient-indigo); border-radius: var(--radius-full); }

.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.project-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; }
.project-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.project-image { width: 100%; height: 220px; background: linear-gradient(135deg, var(--bg-darker), rgba(99,102,241,0.1)); display: flex; align-items: center; justify-content: center; font-size: 50px; }
.project-info { padding: 24px; }
.project-category { font-size: 13px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
.project-name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.project-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
.project-techs { display: flex; flex-wrap: wrap; gap: 8px; }
.project-tech { background: rgba(99,102,241,0.08); color: var(--primary-light); padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }

.experience-list { max-width: 700px; margin: 0 auto; }
.exp-item { background: var(--bg-card); border-radius: var(--radius-lg); padding: 28px; border: 1px solid var(--border); margin-bottom: 16px; }
.exp-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
.exp-title { font-size: 18px; font-weight: 800; }
.exp-period { font-size: 13px; color: var(--accent); font-weight: 600; background: rgba(99,102,241,0.1); padding: 4px 12px; border-radius: var(--radius-full); }
.exp-company { font-size: 15px; color: var(--primary-light); font-weight: 600; margin-bottom: 8px; }
.exp-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

.contact-inner { max-width: 600px; margin: 0 auto; background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; border: 1px solid var(--border); }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 16px; background: var(--bg-dark); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-white); font-family: 'Cairo', sans-serif; font-size: 15px; direction: rtl; transition: border-color 0.3s; }
.form-input:focus { outline: none; border-color: var(--primary); }
textarea.form-input { min-height: 120px; resize: vertical; }

.footer { padding: 40px 0; background: var(--bg-darker); border-top: 1px solid var(--border); text-align: center; }
.footer-social { display: flex; gap: 12px; justify-content: center; margin-bottom: 20px; }
.footer-social a { width: 40px; height: 40px; background: var(--bg-card); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); text-decoration: none; transition: all 0.3s; border: 1px solid var(--border); }
.footer-social a:hover { background: var(--primary); color: white; border-color: var(--primary); }
.footer p { font-size: 13px; color: var(--text-muted); }

@media (max-width: 768px) {
  .hero-inner, .about-grid { grid-template-columns: 1fr; }
  .skills-grid, .projects-grid { grid-template-columns: 1fr; }
  .hero h1 { font-size: 32px; }
  .section-title { font-size: 28px; }
  .nav-links { display: none; }
  .hero-avatar { width: 250px; height: 250px; }
  .about-info { grid-template-columns: 1fr; }
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
      <About />
      <Skills />
      <Projects />
      <Experience />
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
            <div className="logo-icon">س</div>
            <div className="logo-text">سعود <span>المطور</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#about">عني</a></li>
              <li><a href="#skills">المهارات</a></li>
              <li><a href="#projects">المشاريع</a></li>
              <li><a href="#experience">الخبرات</a></li>
              <li><a href="#contact">تواصل معي</a></li>
            </ul>
          </nav>
          <a href="#contact" className="btn btn-primary">تواصل معي</a>
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
            <div className="hero-badge">👋 مرحباً، أنا سعود</div>
            <h1>مطور <span>Full-Stack</span><br />ومصمم واجهات</h1>
            <p className="hero-desc">مطور برمجيات سعودي متخصص في بناء تطبيقات الويب والجوال بأحدث التقنيات. شغوف بتحويل الأفكار إلى منتجات رقمية متميزة تخدم المستخدم العربي.</p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">شاهد مشاريعي 🚀</a>
              <a href="#contact" className="btn btn-outline">تواصل معي</a>
            </div>
            <div className="hero-social">
              <a href="#">🐙</a>
              <a href="#">💼</a>
              <a href="#">𝕏</a>
              <a href="#">📧</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-avatar">👨‍💻</div>
          </div>
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
  const info = [
    { label: "الاسم", value: "سعود الراشد" },
    { label: "الموقع", value: "الرياض، السعودية" },
    { label: "الخبرة", value: "+٧ سنوات" },
    { label: "التخصص", value: "Full-Stack Developer" },
  ];
  return (
    <section className="section section-dark" id="about">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👤 عني</div>
          <h2 className="section-title">تعرّف <span>عليّ</span></h2>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <p>أنا سعود الراشد، مطور برمجيات سعودي بخبرة تزيد عن ٧ سنوات في تطوير تطبيقات الويب والجوال. تخرجت من جامعة الملك سعود تخصص علوم حاسب وعملت في عدة شركات تقنية رائدة.</p>
            <p>شغوف ببناء منتجات رقمية تحل مشاكل حقيقية وتقدم تجربة مستخدم استثنائية. أؤمن بأن الكود النظيف والتصميم الجميل وجهان لعملة واحدة.</p>
          </div>
          <div className="about-info">
            {info.map((item, i) => (
              <div key={i} className="about-info-item">
                <div className="about-info-label">{item.label}</div>
                <div className="about-info-value">{item.value}</div>
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
    name: "Skills.tsx",
    language: "tsx",
    content: `export default function Skills() {
  const groups = [
    { title: "💻 Frontend", skills: [{ name: "React / Next.js", level: 95 }, { name: "TypeScript", level: 90 }, { name: "Tailwind CSS", level: 92 }, { name: "React Native", level: 80 }] },
    { title: "⚙️ Backend", skills: [{ name: "Node.js / Express", level: 88 }, { name: "Python / Django", level: 82 }, { name: "PostgreSQL", level: 85 }, { name: "REST / GraphQL APIs", level: 90 }] },
    { title: "🛠️ أدوات", skills: [{ name: "Git / GitHub", level: 92 }, { name: "Docker / CI/CD", level: 78 }, { name: "AWS / GCP", level: 75 }, { name: "Figma / التصميم", level: 85 }] },
  ];
  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🔧 المهارات</div>
          <h2 className="section-title">المهارات <span>التقنية</span></h2>
          <p className="section-desc">مجموعة المهارات والتقنيات التي أتقنها وأستخدمها في مشاريعي</p>
        </div>
        <div className="skills-grid">
          {groups.map((g, i) => (
            <div key={i} className="skill-group">
              <div className="skill-group-title">{g.title}</div>
              {g.skills.map((s, j) => (
                <div key={j} className="skill-item">
                  <div className="skill-name"><span>{s.name}</span><span>{s.level}٪</span></div>
                  <div className="skill-bar"><div className="skill-fill" style={{ width: s.level + "%" }}></div></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Projects.tsx",
    language: "tsx",
    content: `export default function Projects() {
  const projects = [
    { icon: "🛒", category: "تجارة إلكترونية", name: "متجر سوق الخليج", desc: "منصة تجارة إلكترونية متعددة البائعين مع نظام دفع متكامل وإدارة مخزون ذكية.", techs: ["Next.js", "Stripe", "PostgreSQL"] },
    { icon: "📱", category: "تطبيق جوال", name: "تطبيق توصيل الطعام", desc: "تطبيق جوال لتوصيل الطعام مع تتبع مباشر للطلبات وتقييمات المطاعم.", techs: ["React Native", "Node.js", "MongoDB"] },
    { icon: "📊", category: "لوحة تحكم", name: "نظام إدارة المدارس", desc: "نظام متكامل لإدارة المدارس يشمل الطلاب والدرجات والحضور والتقارير.", techs: ["React", "Python", "PostgreSQL"] },
    { icon: "🤖", category: "ذكاء اصطناعي", name: "منصة تحليل البيانات", desc: "منصة ذكية لتحليل البيانات مع تقارير تفاعلية وتنبؤات مبنية على AI.", techs: ["Python", "TensorFlow", "D3.js"] },
  ];
  return (
    <section className="section section-dark" id="projects">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🏆 المشاريع</div>
          <h2 className="section-title">مشاريع <span>مميزة</span></h2>
          <p className="section-desc">نماذج من المشاريع التي عملت عليها في مختلف المجالات التقنية</p>
        </div>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <div key={i} className="project-card">
              <div className="project-image">{p.icon}</div>
              <div className="project-info">
                <div className="project-category">{p.category}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-desc">{p.desc}</div>
                <div className="project-techs">
                  {p.techs.map((t, j) => (<span key={j} className="project-tech">{t}</span>))}
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
    name: "Experience.tsx",
    language: "tsx",
    content: `export default function Experience() {
  const exps = [
    { title: "مطور أول Full-Stack", company: "شركة تقنية رائدة - الرياض", period: "٢٠٢٢ - الحالي", desc: "قيادة فريق تطوير مكون من ٥ مطورين وبناء منتجات SaaS باستخدام React و Node.js مع إدارة البنية التحتية السحابية." },
    { title: "مطور واجهات أمامية", company: "وكالة رقمية - جدة", period: "٢٠٢٠ - ٢٠٢٢", desc: "تطوير مواقع ومنصات ويب لأكثر من ٣٠ عميلاً باستخدام React و TypeScript مع التركيز على الأداء وتجربة المستخدم." },
    { title: "مطور مبتدئ", company: "شركة ناشئة - الرياض", period: "٢٠١٨ - ٢٠٢٠", desc: "بناء وصيانة تطبيقات ويب وجوال باستخدام JavaScript و Python مع المشاركة في تصميم قواعد البيانات." },
  ];
  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">💼 الخبرات</div>
          <h2 className="section-title">الخبرات <span>العملية</span></h2>
        </div>
        <div className="experience-list">
          {exps.map((e, i) => (
            <div key={i} className="exp-item">
              <div className="exp-header">
                <div className="exp-title">{e.title}</div>
                <div className="exp-period">{e.period}</div>
              </div>
              <div className="exp-company">{e.company}</div>
              <div className="exp-desc">{e.desc}</div>
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
  return (
    <section className="section section-dark" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📩 تواصل معي</div>
          <h2 className="section-title">تبي نشتغل <span>سوا</span>؟</h2>
          <p className="section-desc">أرسل لي رسالة وبرد عليك في أسرع وقت</p>
        </div>
        <div className="contact-inner">
          <div className="form-group"><label className="form-label">الاسم</label><input className="form-input" placeholder="اسمك الكامل" /></div>
          <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input className="form-input" type="email" placeholder="email@example.com" /></div>
          <div className="form-group"><label className="form-label">الموضوع</label><input className="form-input" placeholder="عن ماذا تريد التحدث؟" /></div>
          <div className="form-group"><label className="form-label">الرسالة</label><textarea className="form-input" placeholder="اكتب رسالتك هنا..."></textarea></div>
          <button className="btn btn-primary" style={{ width: "100%" }}>إرسال الرسالة 🚀</button>
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
        <div className="footer-social">
          <a href="#">🐙</a>
          <a href="#">💼</a>
          <a href="#">𝕏</a>
          <a href="#">📧</a>
        </div>
        <p>© ٢٠٢٥ سعود الراشد. جميع الحقوق محفوظة | صنع بـ ❤️ في السعودية</p>
      </div>
    </footer>
  );
}`
  },
];
