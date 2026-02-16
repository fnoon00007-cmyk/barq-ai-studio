import { VFSFile } from "@/hooks/v2/useVFS";

export const REAL_ESTATE_TEMPLATE_FILES: VFSFile[] = [
  {
    name: "styles.css",
    language: "css",
    content: `/* Real Estate Agency - Professional Theme */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #0EA5E9;
  --primary-dark: #0284C7;
  --primary-light: #38BDF8;
  --secondary: #1E293B;
  --secondary-light: #334155;
  --accent: #F59E0B;
  --accent-light: #FBBF24;
  --bg-light: #F8FAFC;
  --bg-white: #FFFFFF;
  --text-dark: #0F172A;
  --text-muted: #64748B;
  --text-light: #94A3B8;
  --border: #E2E8F0;
  --success: #10B981;
  --error: #EF4444;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Cairo', sans-serif;
  background: var(--bg-light);
  color: var(--text-dark);
  direction: rtl;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== HEADER ===== */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s ease;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: var(--secondary);
}

.logo-text span {
  color: var(--primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 15px;
  transition: color 0.3s;
  position: relative;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  right: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s;
}

.nav-links a:hover::after {
  width: 100%;
}

.header-cta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius);
  font-family: 'Cairo', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-white {
  background: white;
  color: var(--secondary);
  box-shadow: var(--shadow-md);
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-accent {
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: var(--secondary);
}

/* ===== HERO ===== */
.hero {
  padding: 140px 0 80px;
  background: linear-gradient(135deg, var(--secondary) 0%, #0F172A 100%);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230EA5E9' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-light);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.hero h1 {
  font-size: 48px;
  font-weight: 900;
  color: white;
  line-height: 1.3;
  margin-bottom: 20px;
}

.hero h1 span {
  background: linear-gradient(135deg, var(--primary-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 18px;
  color: var(--text-light);
  line-height: 1.8;
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.hero-stat {
  text-align: center;
}

.hero-stat-value {
  font-size: 32px;
  font-weight: 900;
  color: white;
}

.hero-stat-label {
  font-size: 14px;
  color: var(--text-light);
  margin-top: 4px;
}

.hero-visual {
  position: relative;
}

.hero-card-stack {
  position: relative;
  height: 420px;
}

.property-hero-card {
  position: absolute;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  width: 320px;
}

.property-hero-card:nth-child(1) {
  top: 0;
  right: 0;
  z-index: 3;
  transform: rotate(-3deg);
}

.property-hero-card:nth-child(2) {
  top: 40px;
  right: 40px;
  z-index: 2;
  transform: rotate(2deg);
  opacity: 0.8;
}

.property-hero-card:nth-child(3) {
  top: 80px;
  right: 80px;
  z-index: 1;
  transform: rotate(-1deg);
  opacity: 0.6;
}

.phc-image {
  height: 180px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
}

.phc-info {
  padding: 20px;
}

.phc-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 8px;
}

.phc-location {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.phc-price {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
}

/* ===== SEARCH ===== */
.search-section {
  padding: 0;
  margin-top: -50px;
  position: relative;
  z-index: 10;
}

.search-box {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.search-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.search-field select,
.search-field input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  color: var(--text-dark);
  background: var(--bg-light);
  transition: border-color 0.3s;
  appearance: none;
}

.search-field select:focus,
.search-field input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.search-btn {
  padding: 12px 32px;
  height: 48px;
}

/* ===== PROPERTIES ===== */
.properties-section {
  padding: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 800;
  color: var(--secondary);
  margin-bottom: 12px;
}

.section-header p {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
}

.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.filter-tab {
  padding: 10px 24px;
  border-radius: 50px;
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid var(--border);
  background: white;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tab.active,
.filter-tab:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.property-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all 0.4s ease;
}

.property-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.property-image {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.property-image-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: linear-gradient(135deg, #E0F2FE, #BAE6FD);
}

.property-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.badge-sale { background: var(--primary); }
.badge-rent { background: var(--success); }
.badge-new { background: var(--accent); color: var(--secondary); }

.property-fav {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 16px;
}

.property-fav:hover {
  background: var(--error);
  color: white;
}

.property-info {
  padding: 24px;
}

.property-type {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.property-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 8px;
}

.property-location {
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.property-features {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.property-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.property-feature span {
  font-weight: 700;
  color: var(--text-dark);
}

.property-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.property-price {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
}

.property-price small {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.property-details-btn {
  padding: 8px 20px;
  font-size: 13px;
}

/* ===== SERVICES ===== */
.services-section {
  padding: 80px 0;
  background: var(--secondary);
  color: white;
}

.services-section .section-header h2 { color: white; }
.services-section .section-header p { color: var(--text-light); }
.services-section .section-badge { background: rgba(14, 165, 233, 0.2); }

.services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.service-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  text-align: center;
  transition: all 0.4s ease;
}

.service-card:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-6px);
}

.service-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 20px;
}

.service-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.service-card p {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.7;
}

/* ===== ABOUT ===== */
.about-section {
  padding: 80px 0;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.about-visual {
  position: relative;
}

.about-image-main {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
}

.about-badge-card {
  position: absolute;
  bottom: -20px;
  left: -20px;
  background: white;
  padding: 20px 28px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: center;
  gap: 16px;
}

.about-badge-num {
  font-size: 36px;
  font-weight: 900;
  color: var(--primary);
}

.about-badge-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

.about-content h2 {
  font-size: 36px;
  font-weight: 800;
  color: var(--secondary);
  margin-bottom: 20px;
}

.about-content p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 24px;
}

.about-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.about-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary);
}

.about-feature-icon {
  width: 28px;
  height: 28px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--primary);
}

/* ===== CONTACT ===== */
.contact-section {
  padding: 80px 0;
  background: var(--bg-light);
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

.contact-form-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-md);
}

.contact-form-card h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  transition: border-color 0.3s;
  background: var(--bg-light);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.form-group textarea { resize: vertical; min-height: 120px; }

.contact-info-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-info-card {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.contact-info-card:hover {
  transform: translateX(-6px);
  box-shadow: var(--shadow-md);
}

.contact-info-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.contact-info-label {
  font-size: 13px;
  color: var(--text-muted);
}

.contact-info-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--secondary);
  margin-top: 4px;
}

.map-placeholder {
  background: linear-gradient(135deg, #E0F2FE, #BAE6FD);
  border-radius: var(--radius);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

/* ===== FOOTER ===== */
.footer {
  background: var(--secondary);
  color: white;
  padding: 60px 0 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.footer-about p {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.8;
  margin-top: 16px;
}

.footer-col h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 10px;
}

.footer-col ul li a {
  color: var(--text-light);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-col ul li a:hover {
  color: var(--primary-light);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
}

.footer-bottom p {
  font-size: 13px;
  color: var(--text-light);
}

.footer-social {
  display: flex;
  gap: 12px;
}

.footer-social a {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s;
}

.footer-social a:hover {
  background: var(--primary);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero h1 { font-size: 32px; }
  .hero-visual { display: none; }
  .hero-stats { justify-content: center; }
  .hero-actions { justify-content: center; }
  .search-grid { grid-template-columns: 1fr; }
  .properties-grid { grid-template-columns: 1fr; }
  .services-grid { grid-template-columns: 1fr 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .filter-tabs { flex-wrap: wrap; }
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
      <SearchSection />
      <Properties />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <div className="logo-icon">🏢</div>
          <div className="logo-text">دار <span>العقار</span></div>
        </a>
        <ul className="nav-links">
          <li><a href="#properties">العقارات</a></li>
          <li><a href="#services">خدماتنا</a></li>
          <li><a href="#about">من نحن</a></li>
          <li><a href="#contact">تواصل معنا</a></li>
        </ul>
        <div className="header-cta">
          <a href="#contact" className="btn btn-outline" style={{padding:'10px 20px',fontSize:'14px'}}>أضف عقارك</a>
          <a href="tel:+966500000000" className="btn btn-primary" style={{padding:'10px 20px',fontSize:'14px'}}>📞 اتصل بنا</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-badge">🏠 الوجهة الأولى للعقارات في المملكة</div>
          <h1>ابحث عن <span>عقار أحلامك</span> في أفضل المواقع</h1>
          <p className="hero-description">نقدم لك أوسع مجموعة من الفلل والشقق والأراضي في جميع مناطق المملكة العربية السعودية مع خدمات احترافية تضمن لك تجربة سلسة وآمنة.</p>
          <div className="hero-actions">
            <a href="#properties" className="btn btn-primary">تصفح العقارات</a>
            <a href="#contact" className="btn btn-white">طلب استشارة مجانية</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-value">+2,500</div><div className="hero-stat-label">عقار متاح</div></div>
            <div className="hero-stat"><div className="hero-stat-value">+1,200</div><div className="hero-stat-label">عميل سعيد</div></div>
            <div className="hero-stat"><div className="hero-stat-value">+15</div><div className="hero-stat-label">سنة خبرة</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="property-hero-card">
              <div className="phc-image">🏡</div>
              <div className="phc-info">
                <div className="phc-title">فيلا فاخرة - حي الملقا</div>
                <div className="phc-location">📍 الرياض، حي الملقا</div>
                <div className="phc-price">3,500,000 ر.س</div>
              </div>
            </div>
            <div className="property-hero-card">
              <div className="phc-image" style={{background:'linear-gradient(135deg, #10B981, #059669)'}}>🏢</div>
              <div className="phc-info">
                <div className="phc-title">شقة مودرن - حي النرجس</div>
                <div className="phc-location">📍 الرياض، حي النرجس</div>
                <div className="phc-price">850,000 ر.س</div>
              </div>
            </div>
            <div className="property-hero-card">
              <div className="phc-image" style={{background:'linear-gradient(135deg, #F59E0B, #D97706)'}}>🏗️</div>
              <div className="phc-info">
                <div className="phc-title">أرض تجارية - طريق الملك</div>
                <div className="phc-location">📍 جدة، طريق الملك</div>
                <div className="phc-price">5,200,000 ر.س</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  return (
    <section className="search-section">
      <div className="container">
        <div className="search-box">
          <div className="search-grid">
            <div className="search-field">
              <label>نوع العقار</label>
              <select><option>جميع الأنواع</option><option>فيلا</option><option>شقة</option><option>أرض</option><option>مكتب تجاري</option></select>
            </div>
            <div className="search-field">
              <label>المدينة</label>
              <select><option>جميع المدن</option><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة المكرمة</option></select>
            </div>
            <div className="search-field">
              <label>نوع العرض</label>
              <select><option>بيع وإيجار</option><option>للبيع</option><option>للإيجار</option></select>
            </div>
            <div className="search-field">
              <label>السعر الأقصى</label>
              <input type="text" placeholder="مثال: 2,000,000" />
            </div>
            <button className="btn btn-primary search-btn">🔍 ابحث</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Properties() {
  const properties = [
    { title: "فيلا فاخرة مع مسبح", location: "الرياض، حي الملقا", type: "فيلا", badge: "للبيع", badgeClass: "badge-sale", price: "3,500,000 ر.س", beds: 5, baths: 4, area: "450 م²", icon: "🏡" },
    { title: "شقة مودرن بإطلالة", location: "جدة، الكورنيش", type: "شقة", badge: "للإيجار", badgeClass: "badge-rent", price: "8,500 ر.س/شهر", beds: 3, baths: 2, area: "180 م²", icon: "🏢" },
    { title: "أرض سكنية مميزة", location: "الدمام، حي الشاطئ", type: "أرض", badge: "جديد", badgeClass: "badge-new", price: "1,200,000 ر.س", beds: 0, baths: 0, area: "600 م²", icon: "🏗️" },
    { title: "دوبلكس عائلي واسع", location: "الرياض، حي العارض", type: "دوبلكس", badge: "للبيع", badgeClass: "badge-sale", price: "2,800,000 ر.س", beds: 6, baths: 5, area: "380 م²", icon: "🏘️" },
    { title: "مكتب تجاري فاخر", location: "الرياض، طريق الملك فهد", type: "تجاري", badge: "للإيجار", badgeClass: "badge-rent", price: "15,000 ر.س/شهر", beds: 0, baths: 2, area: "200 م²", icon: "🏬" },
    { title: "شاليه على البحر", location: "الخبر، نصف القمر", type: "شاليه", badge: "جديد", badgeClass: "badge-new", price: "4,200,000 ر.س", beds: 4, baths: 3, area: "320 م²", icon: "🏖️" },
  ];

  return (
    <section className="properties-section" id="properties">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">🏠 عقارات مميزة</div>
          <h2>أحدث العقارات المتاحة</h2>
          <p>اكتشف مجموعتنا المختارة من أفضل العقارات في المملكة</p>
        </div>
        <div className="filter-tabs">
          {["الكل","فلل","شقق","أراضي","تجاري"].map((t,i)=>(
            <button key={t} className={"filter-tab"+(i===0?" active":"")}>{t}</button>
          ))}
        </div>
        <div className="properties-grid">
          {properties.map((p,i)=>(
            <div key={i} className="property-card">
              <div className="property-image">
                <div className="property-image-bg">{p.icon}</div>
                <span className={"property-badge "+p.badgeClass}>{p.badge}</span>
                <button className="property-fav">♡</button>
              </div>
              <div className="property-info">
                <div className="property-type">{p.type}</div>
                <h3 className="property-title">{p.title}</h3>
                <div className="property-location">📍 {p.location}</div>
                <div className="property-features">
                  {p.beds>0 && <div className="property-feature">🛏️ <span>{p.beds}</span> غرف</div>}
                  {p.baths>0 && <div className="property-feature">🚿 <span>{p.baths}</span> حمام</div>}
                  <div className="property-feature">📐 <span>{p.area}</span></div>
                </div>
                <div className="property-footer">
                  <div className="property-price">{p.price}</div>
                  <a href="#contact" className="btn btn-primary property-details-btn">التفاصيل</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { icon: "🏠", title: "بيع العقارات", desc: "نساعدك في بيع عقارك بأفضل سعر وأسرع وقت مع تسويق احترافي وتغطية واسعة." },
    { icon: "🔑", title: "شراء العقارات", desc: "نوفر لك أفضل الخيارات العقارية المناسبة لميزانيتك واحتياجاتك مع مشورة متخصصة." },
    { icon: "📋", title: "إيجار العقارات", desc: "إدارة شاملة لتأجير عقاراتك من البحث عن المستأجرين إلى إدارة العقود." },
    { icon: "📊", title: "تقييم العقارات", desc: "تقييم احترافي ودقيق لعقارك من قبل خبراء معتمدين وفق المعايير الدولية." },
  ];

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">⚡ خدماتنا</div>
          <h2>خدمات عقارية متكاملة</h2>
          <p>نقدم مجموعة شاملة من الخدمات العقارية لتلبية جميع احتياجاتك</p>
        </div>
        <div className="services-grid">
          {services.map((s,i)=>(
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="container about-grid">
        <div className="about-visual">
          <div className="about-image-main">🏙️</div>
          <div className="about-badge-card">
            <div className="about-badge-num">+15</div>
            <div className="about-badge-label">سنة خبرة<br/>في السوق العقاري</div>
          </div>
        </div>
        <div className="about-content">
          <div className="section-badge">🏢 من نحن</div>
          <h2>شريكك الموثوق في عالم العقارات</h2>
          <p>دار العقار هي شركة عقارية رائدة في المملكة العربية السعودية، متخصصة في تقديم حلول عقارية شاملة ومبتكرة. نسعى لتحقيق أعلى معايير الجودة والثقة في كل معاملة.</p>
          <div className="about-features">
            <div className="about-feature"><div className="about-feature-icon">✓</div>فريق خبراء معتمد</div>
            <div className="about-feature"><div className="about-feature-icon">✓</div>تغطية جميع المناطق</div>
            <div className="about-feature"><div className="about-feature-icon">✓</div>استشارات مجانية</div>
            <div className="about-feature"><div className="about-feature-icon">✓</div>ضمان أفضل سعر</div>
          </div>
          <a href="#contact" className="btn btn-primary">تواصل معنا الآن</a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">📞 تواصل معنا</div>
          <h2>نسعد بخدمتك</h2>
          <p>تواصل معنا لأي استفسار أو طلب معاينة عقار</p>
        </div>
        <div className="contact-grid">
          <div className="contact-form-card">
            <h3>طلب معاينة / استفسار</h3>
            <div className="form-row">
              <div className="form-group"><label>الاسم الكامل</label><input type="text" placeholder="محمد أحمد" /></div>
              <div className="form-group"><label>رقم الجوال</label><input type="tel" placeholder="05xxxxxxxx" /></div>
            </div>
            <div className="form-group"><label>نوع العقار المطلوب</label>
              <select><option>فيلا</option><option>شقة</option><option>أرض</option><option>تجاري</option></select>
            </div>
            <div className="form-group"><label>المدينة المفضلة</label>
              <select><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة</option></select>
            </div>
            <div className="form-group"><label>تفاصيل إضافية</label><textarea placeholder="أخبرنا بالمزيد عن متطلباتك..." rows={4}></textarea></div>
            <button className="btn btn-primary" style={{width:'100%'}}>إرسال الطلب</button>
          </div>
          <div className="contact-info-side">
            <div className="contact-info-card"><div className="contact-info-icon">📍</div><div><div className="contact-info-label">العنوان</div><div className="contact-info-value">الرياض، طريق الملك فهد، برج الأعمال</div></div></div>
            <div className="contact-info-card"><div className="contact-info-icon">📞</div><div><div className="contact-info-label">الهاتف</div><div className="contact-info-value" style={{direction:'ltr',textAlign:'right'}}>+966 50 000 0000</div></div></div>
            <div className="contact-info-card"><div className="contact-info-icon">✉️</div><div><div className="contact-info-label">البريد الإلكتروني</div><div className="contact-info-value">info@dar-aqar.sa</div></div></div>
            <div className="contact-info-card"><div className="contact-info-icon">⏰</div><div><div className="contact-info-label">ساعات العمل</div><div className="contact-info-value">السبت - الخميس: 9 ص - 9 م</div></div></div>
            <div className="map-placeholder">🗺️</div>
          </div>
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
            <div className="logo"><div className="logo-icon">🏢</div><div className="logo-text" style={{color:'white'}}>دار <span>العقار</span></div></div>
            <p>شريكك الموثوق في عالم العقارات. نقدم حلولاً عقارية شاملة ومبتكرة في جميع أنحاء المملكة العربية السعودية.</p>
          </div>
          <div className="footer-col"><h4>روابط سريعة</h4><ul><li><a href="#properties">العقارات</a></li><li><a href="#services">خدماتنا</a></li><li><a href="#about">من نحن</a></li><li><a href="#contact">تواصل معنا</a></li></ul></div>
          <div className="footer-col"><h4>خدماتنا</h4><ul><li><a href="#">بيع العقارات</a></li><li><a href="#">شراء العقارات</a></li><li><a href="#">إيجار العقارات</a></li><li><a href="#">تقييم العقارات</a></li></ul></div>
          <div className="footer-col"><h4>المدن</h4><ul><li><a href="#">الرياض</a></li><li><a href="#">جدة</a></li><li><a href="#">الدمام</a></li><li><a href="#">مكة المكرمة</a></li></ul></div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 دار العقار. جميع الحقوق محفوظة.</p>
          <div className="footer-social">
            <a href="#">𝕏</a><a href="#">📘</a><a href="#">📸</a><a href="#">🔗</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
`
  }
];
