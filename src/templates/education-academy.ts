import { VFSFile } from "@/hooks/v2/useVFS";

export const EDUCATION_ACADEMY_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Education Academy - Inspiring Learning Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #7C3AED;
  --primary-dark: #6D28D9;
  --primary-light: #A78BFA;
  --secondary: #1E1B4B;
  --accent: #A78BFA;
  --accent-light: #C4B5FD;
  --bg-dark: #1E1B4B;
  --bg-darker: #0F0D2E;
  --bg-card: #2D2A5E;
  --text-white: #FFFFFF;
  --text-light: #C4B5FD;
  --text-muted: #9B8EC4;
  --border: #3D3A6E;
  --gradient-edu: linear-gradient(135deg, #7C3AED, #A78BFA);
  --shadow-lg: 0 10px 15px -3px rgba(124,58,237,0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Cairo', sans-serif; background: var(--bg-dark); color: var(--text-white); direction: rtl; line-height: 1.7; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(30,27,75,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
.logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { width: 44px; height: 44px; background: var(--gradient-edu); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.logo-text { font-size: 22px; font-weight: 900; color: var(--text-white); }
.logo-text span { background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 28px; list-style: none; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; transition: color 0.3s; }
.nav-links a:hover { color: var(--primary-light); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 28px; border-radius: var(--radius-full); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; text-decoration: none; }
.btn-primary { background: var(--gradient-edu); color: white; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
.btn-outline { background: transparent; color: var(--primary-light); border: 2px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-dark { background: var(--bg-card); color: var(--text-white); border: 1px solid var(--border); }

.hero { padding: 140px 0 80px; background: linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-dark) 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.08) 0%, transparent 60%); }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.1); color: var(--primary-light); padding: 8px 20px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 20px; border: 1px solid rgba(124,58,237,0.2); }
.hero h1 { font-size: 48px; font-weight: 900; line-height: 1.2; margin-bottom: 20px; }
.hero h1 span { background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { font-size: 18px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; margin-bottom: 40px; }
.hero-stats { display: flex; gap: 40px; }
.hero-stat-value { font-size: 36px; font-weight: 900; background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-stat-label { font-size: 14px; color: var(--text-muted); }
.hero-visual { display: flex; justify-content: center; }
.hero-image-placeholder { width: 100%; max-width: 500px; height: 400px; background: linear-gradient(135deg, var(--bg-card), rgba(124,58,237,0.1)); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; border: 1px solid var(--border); }

.section { padding: 100px 0; }
.section-dark { background: var(--bg-darker); }
.section-header { text-align: center; margin-bottom: 60px; }
.section-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.1); color: var(--primary-light); padding: 6px 18px; border-radius: var(--radius-full); font-size: 14px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(124,58,237,0.2); }
.section-title { font-size: 38px; font-weight: 900; margin-bottom: 16px; }
.section-title span { background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }

.courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.course-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s; }
.course-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.course-image { width: 100%; height: 200px; background: linear-gradient(135deg, var(--bg-darker), rgba(124,58,237,0.1)); display: flex; align-items: center; justify-content: center; font-size: 50px; }
.course-info { padding: 24px; }
.course-category { font-size: 13px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
.course-name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.course-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.6; }
.course-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); }
.course-price { font-size: 20px; font-weight: 900; background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.course-duration { font-size: 13px; color: var(--text-muted); }

.instructors-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.instructor-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
.instructor-card:hover { border-color: var(--primary); transform: translateY(-4px); }
.instructor-image { width: 100%; height: 220px; background: linear-gradient(135deg, var(--bg-darker), rgba(124,58,237,0.08)); display: flex; align-items: center; justify-content: center; font-size: 50px; }
.instructor-info { padding: 20px; }
.instructor-name { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
.instructor-specialty { font-size: 14px; color: var(--accent); font-weight: 600; }

.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testimonial-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 28px; border: 1px solid var(--border); }
.testimonial-text { font-size: 15px; color: var(--text-light); line-height: 1.8; margin-bottom: 20px; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar { width: 44px; height: 44px; background: var(--gradient-edu); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.testimonial-name { font-size: 15px; font-weight: 700; }
.testimonial-role { font-size: 13px; color: var(--text-muted); }
.testimonial-stars { color: #F59E0B; margin-bottom: 12px; }

.cta { padding: 100px 0; background: linear-gradient(135deg, var(--bg-darker), rgba(124,58,237,0.08)); text-align: center; }
.cta h2 { font-size: 42px; font-weight: 900; margin-bottom: 16px; }
.cta h2 span { background: var(--gradient-edu); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.cta p { font-size: 18px; color: var(--text-muted); margin-bottom: 36px; max-width: 600px; margin-left: auto; margin-right: auto; }
.cta-actions { display: flex; gap: 16px; justify-content: center; }

.footer { padding: 60px 0 30px; background: var(--bg-darker); border-top: 1px solid var(--border); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-brand .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-logo-icon { width: 40px; height: 40px; background: var(--gradient-edu); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 18px; }
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
  .hero-inner, .footer-grid { grid-template-columns: 1fr; }
  .courses-grid, .testimonials-grid { grid-template-columns: 1fr; }
  .instructors-grid { grid-template-columns: repeat(2, 1fr); }
  .hero h1 { font-size: 32px; }
  .section-title { font-size: 28px; }
  .nav-links { display: none; }
  .hero-stats { flex-wrap: wrap; gap: 20px; }
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
      <Courses />
      <Instructors />
      <Testimonials />
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
            <div className="logo-icon">🎓</div>
            <div className="logo-text">أكاديمية <span>المعرفة</span></div>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#courses">الدورات</a></li>
              <li><a href="#instructors">المدرسون</a></li>
              <li><a href="#testimonials">آراء الطلاب</a></li>
              <li><a href="#contact">تواصل معنا</a></li>
            </ul>
          </nav>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="#courses" className="btn btn-primary">سجّل الآن</a>
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
    { value: "١٠,٠٠٠+", label: "طالب مسجل" },
    { value: "٢٠٠+", label: "دورة تدريبية" },
    { value: "٥٠+", label: "مدرب معتمد" },
    { value: "٩٥٪", label: "نسبة الرضا" },
  ];
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">🏆 الأكاديمية الأولى في المملكة</div>
            <h1>تعلّم. تطوّر.<br /><span>تميّز.</span></h1>
            <p className="hero-desc">أكاديمية رقمية سعودية تقدم دورات احترافية في البرمجة والتصميم والتسويق الرقمي واللغات بإشراف نخبة من الخبراء المعتمدين.</p>
            <div className="hero-actions">
              <a href="#courses" className="btn btn-primary">تصفح الدورات 🎓</a>
              <a href="#instructors" className="btn btn-dark">تعرّف على المدرسين</a>
            </div>
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-placeholder">🎓</div>
          </div>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    name: "Courses.tsx",
    language: "tsx",
    content: `export default function Courses() {
  const courses = [
    { icon: "💻", category: "برمجة", name: "تطوير مواقع الويب الحديثة", desc: "تعلم React و TypeScript وبناء مواقع احترافية من الصفر.", price: "٧٩٩ ر.س", duration: "٤٨ ساعة" },
    { icon: "📱", category: "تطبيقات", name: "تطوير تطبيقات الجوال", desc: "بناء تطبيقات iOS و Android باستخدام Flutter.", price: "٨٩٩ ر.س", duration: "٥٦ ساعة" },
    { icon: "🎨", category: "تصميم", name: "تصميم UI/UX احترافي", desc: "أساسيات التصميم وتجربة المستخدم مع Figma.", price: "٥٩٩ ر.س", duration: "٣٢ ساعة" },
    { icon: "📊", category: "تسويق", name: "التسويق الرقمي الشامل", desc: "استراتيجيات التسويق عبر منصات التواصل الاجتماعي والإعلانات.", price: "٤٩٩ ر.س", duration: "٢٤ ساعة" },
    { icon: "🤖", category: "ذكاء اصطناعي", name: "مقدمة في الذكاء الاصطناعي", desc: "أساسيات ML و Deep Learning مع مشاريع عملية.", price: "٩٩٩ ر.س", duration: "٦٤ ساعة" },
    { icon: "🗣️", category: "لغات", name: "اللغة الإنجليزية للأعمال", desc: "إتقان الإنجليزية في بيئة العمل والمراسلات المهنية.", price: "٣٩٩ ر.س", duration: "٤٠ ساعة" },
  ];
  return (
    <section className="section section-dark" id="courses">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📚 الدورات التدريبية</div>
          <h2 className="section-title">دورات <span>احترافية</span> ومعتمدة</h2>
          <p className="section-desc">اختر من بين أكثر من ٢٠٠ دورة في مختلف التخصصات التقنية والإبداعية</p>
        </div>
        <div className="courses-grid">
          {courses.map((c, i) => (
            <div key={i} className="course-card">
              <div className="course-image">{c.icon}</div>
              <div className="course-info">
                <div className="course-category">{c.category}</div>
                <div className="course-name">{c.name}</div>
                <div className="course-desc">{c.desc}</div>
                <div className="course-meta">
                  <span className="course-price">{c.price}</span>
                  <span className="course-duration">⏱️ {c.duration}</span>
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
    name: "Instructors.tsx",
    language: "tsx",
    content: `export default function Instructors() {
  const instructors = [
    { icon: "👨‍💻", name: "م. سعود الراشد", specialty: "تطوير الويب و React" },
    { icon: "👩‍🎨", name: "أ. لمى العتيبي", specialty: "تصميم UI/UX" },
    { icon: "👨‍🔬", name: "د. فهد المالكي", specialty: "الذكاء الاصطناعي" },
    { icon: "👩‍💼", name: "أ. نوف الحربي", specialty: "التسويق الرقمي" },
  ];
  return (
    <section className="section" id="instructors">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">👨‍🏫 المدرسون</div>
          <h2 className="section-title">نخبة من <span>الخبراء</span></h2>
          <p className="section-desc">مدرسون معتمدون بخبرات عالمية في مجالاتهم</p>
        </div>
        <div className="instructors-grid">
          {instructors.map((inst, i) => (
            <div key={i} className="instructor-card">
              <div className="instructor-image">{inst.icon}</div>
              <div className="instructor-info">
                <div className="instructor-name">{inst.name}</div>
                <div className="instructor-specialty">{inst.specialty}</div>
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
    name: "Testimonials.tsx",
    language: "tsx",
    content: `export default function Testimonials() {
  const reviews = [
    { text: "دورة تطوير الويب غيرت مساري المهني بالكامل. المحتوى ممتاز والمدرب يشرح بطريقة سلسة وعملية.", name: "محمد العنزي", role: "مطور ويب", icon: "👨‍💻", stars: 5 },
    { text: "أفضل أكاديمية أونلاين في السعودية. الدورات محدثة والشهادات معتمدة والدعم الفني ممتاز.", name: "سارة القحطاني", role: "مصممة UI/UX", icon: "👩‍🎨", stars: 5 },
    { text: "بدأت من الصفر في التسويق الرقمي والآن أدير حملات إعلانية لشركات كبرى. شكراً أكاديمية المعرفة!", name: "عبدالرحمن الشمري", role: "مسوّق رقمي", icon: "👨‍💼", stars: 5 },
  ];
  return (
    <section className="section section-dark" id="testimonials">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">⭐ آراء الطلاب</div>
          <h2 className="section-title">ماذا يقول <span>طلابنا</span></h2>
          <p className="section-desc">آلاف الطلاب حققوا أهدافهم المهنية من خلال دوراتنا</p>
        </div>
        <div className="testimonials-grid">
          {reviews.map((r, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">{"⭐".repeat(r.stars)}</div>
              <p className="testimonial-text">"{r.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{r.icon}</div>
                <div>
                  <div className="testimonial-name">{r.name}</div>
                  <div className="testimonial-role">{r.role}</div>
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
    name: "CTA.tsx",
    language: "tsx",
    content: `export default function CTA() {
  return (
    <section className="cta" id="contact">
      <div className="container">
        <h2>ابدأ رحلة <span>التعلّم</span> اليوم</h2>
        <p>سجّل الآن واحصل على أول دورة بخصم ٣٠٪ مع شهادة معتمدة ودعم فني مستمر.</p>
        <div className="cta-actions">
          <a href="#courses" className="btn btn-primary">سجّل الآن 🎓</a>
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
              <div className="footer-logo-icon">🎓</div>
              <div className="footer-logo-text">أكاديمية المعرفة</div>
            </div>
            <p className="footer-desc">أكاديمية رقمية سعودية رائدة تقدم دورات احترافية معتمدة في البرمجة والتصميم والتسويق الرقمي.</p>
            <div className="footer-social">
              <a href="#">𝕏</a>
              <a href="#">📸</a>
              <a href="#">📘</a>
              <a href="#">▶️</a>
            </div>
          </div>
          <div className="footer-col"><h4>الدورات</h4><ul><li><a href="#">البرمجة</a></li><li><a href="#">التصميم</a></li><li><a href="#">التسويق</a></li><li><a href="#">اللغات</a></li></ul></div>
          <div className="footer-col"><h4>الأكاديمية</h4><ul><li><a href="#">من نحن</a></li><li><a href="#">المدرسون</a></li><li><a href="#">الشهادات</a></li><li><a href="#">المدونة</a></li></ul></div>
          <div className="footer-col"><h4>تواصل</h4><ul><li><a href="#">📍 الرياض، حي الملقا</a></li><li><a href="#">📞 ٠٥٠١٢٣٤٥٦٧</a></li><li><a href="#">✉️ info@academy.sa</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <p>© ٢٠٢٥ أكاديمية المعرفة. جميع الحقوق محفوظة</p>
          <p>صنع بـ ❤️ في السعودية</p>
        </div>
      </div>
    </footer>
  );
}`
  },
];
