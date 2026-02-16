import { VFSFile } from "@/hooks/v2/useVFS";

/**
 * Restaurant Premium Template — مطعم فاخر
 * Full professional pre-built code for instant template customization.
 * Each component is 200-400 lines of production-ready JSX.
 */

const STYLES_CSS = `:root {
  --primary: #D4A574;
  --primary-dark: #B8895A;
  --secondary: #2C1810;
  --accent: #E8C07D;
  --bg-dark: #1A0F0A;
  --bg-light: #FFF8F0;
  --text-dark: #2C1810;
  --text-light: #F5E6D3;
  --gold: #D4A574;
  --gold-light: #E8C07D;
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

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 3s linear infinite; }
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
.animate-rotate-slow { animation: rotate-slow 30s linear infinite; }
.animate-slide-in-right { animation: slideInRight 0.8s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }

.glass-effect {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-gradient {
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gold-border {
  border: 1px solid rgba(212, 165, 116, 0.3);
}

.section-padding {
  padding: 6rem 0;
}

@media (min-width: 768px) {
  .section-padding { padding: 8rem 0; }
}`;

const APP_TSX = `const sections = ['Header', 'Hero', 'Menu', 'Chef', 'Gallery', 'Reservations', 'Testimonials', 'Contact', 'Footer'];

return (
  <div dir="rtl" lang="ar" style={{ fontFamily: '"Cairo", "Tajawal", sans-serif', backgroundColor: '#FFF8F0', color: '#2C1810' }}>
    <Header />
    <Hero />
    <Menu />
    <Chef />
    <Gallery />
    <Reservations />
    <Testimonials />
    <Contact />
    <Footer />
  </div>
);`;

const HEADER_TSX = `const [isScrolled, setIsScrolled] = React.useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

React.useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 50);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const navLinks = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'القائمة', href: '#menu' },
  { label: 'الشيف', href: '#chef' },
  { label: 'المعرض', href: '#gallery' },
  { label: 'الحجوزات', href: '#reservations' },
  { label: 'آراء الضيوف', href: '#testimonials' },
  { label: 'تواصل معنا', href: '#contact' },
];

const scrollTo = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  setIsMobileMenuOpen(false);
};

return (
  <header
    className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-500 \${
      isScrolled
        ? 'bg-[#2C1810]/95 backdrop-blur-xl shadow-2xl shadow-black/20 py-3'
        : 'bg-transparent py-5'
    }\`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('#hero')}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#E8C07D] flex items-center justify-center shadow-lg shadow-[#D4A574]/30">
            <svg className="w-6 h-6 text-[#2C1810]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#E8C07D] tracking-wide">مطعم النخبة</h1>
            <p className="text-[10px] text-[#D4A574]/60 tracking-[0.3em] uppercase">Fine Dining</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => scrollTo(link.href)}
              className="px-4 py-2 text-sm font-medium text-[#F5E6D3]/80 hover:text-[#E8C07D] transition-all duration-300 rounded-lg hover:bg-white/5 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] group-hover:w-3/4 transition-all duration-300 rounded-full" />
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => scrollTo('#reservations')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold text-sm hover:shadow-lg hover:shadow-[#D4A574]/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            احجز طاولتك
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#E8C07D] hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </div>
    </div>

    {/* Mobile Menu */}
    {isMobileMenuOpen && (
      <div className="lg:hidden absolute top-full left-0 right-0 bg-[#2C1810]/98 backdrop-blur-xl border-t border-[#D4A574]/20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
          {navLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-right px-4 py-3 text-[#F5E6D3] hover:text-[#E8C07D] hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-[#D4A574]/20">
            <button
              onClick={() => scrollTo('#reservations')}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold text-sm"
            >
              احجز طاولتك
            </button>
          </div>
        </div>
      </div>
    )}
  </header>
);`;

const HERO_TSX = `return (
  <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A0F0A] via-[#2C1810] to-[#1A0F0A]">
    {/* Decorative Background Elements */}
    <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-[#D4A574]/15 to-[#E8C07D]/10 rounded-full blur-[120px] animate-pulse-slow" />
    <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#D4A574]/10 to-transparent rounded-full blur-[100px] animate-float" />
    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#E8C07D]/5 rounded-full blur-[80px]" />
    
    {/* Pattern Overlay */}
    <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,165,116,0.3) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    }} />
    
    {/* Decorative Lines */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-[#D4A574]/30 to-transparent" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-transparent via-[#D4A574]/30 to-transparent" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 text-[#E8C07D] text-sm font-medium mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        تجربة طعام استثنائية منذ ١٩٩٥
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <span className="block text-[#F5E6D3] mb-2">مطعم النخبة</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] via-[#E8C07D] to-[#D4A574]">
          للمأكولات السعودية الفاخرة
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl md:text-2xl text-[#F5E6D3]/60 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-light" style={{ animationDelay: '0.6s' }}>
        نقدم لكم أرقى الأطباق السعودية الأصيلة بلمسة عصرية فاخرة، في أجواء ساحرة تجمع بين الأصالة والحداثة في قلب الرياض
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={() => document.querySelector('#reservations')?.scrollIntoView({ behavior: 'smooth' })}
          className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold text-lg hover:shadow-2xl hover:shadow-[#D4A574]/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
        >
          احجز طاولتك الآن
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button
          onClick={() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 rounded-2xl border-2 border-[#D4A574]/30 text-[#E8C07D] font-bold text-lg hover:bg-[#D4A574]/10 hover:border-[#D4A574]/50 transition-all duration-300"
        >
          اكتشف القائمة
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '1s' }}>
        {[
          { number: '+٣٠', label: 'سنة خبرة', icon: '🏆' },
          { number: '+٥٠٠', label: 'طبق مميز', icon: '🍽️' },
          { number: '+١٠٠ ألف', label: 'ضيف سعيد', icon: '😊' },
          { number: '+١٥', label: 'جائزة دولية', icon: '⭐' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-5 rounded-2xl bg-white/5 border border-[#D4A574]/10 hover:border-[#D4A574]/30 hover:bg-white/8 transition-all duration-300 group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{stat.icon}</span>
            <span className="block text-3xl sm:text-4xl font-black text-[#E8C07D] mb-1">{stat.number}</span>
            <span className="text-sm text-[#F5E6D3]/50 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
      <span className="text-xs text-[#D4A574]/40 font-medium">اكتشف المزيد</span>
      <svg className="w-5 h-5 text-[#D4A574]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    </div>
  </section>
);`;

const MENU_TSX = `const [activeCategory, setActiveCategory] = React.useState('مقبلات');

const categories = ['مقبلات', 'أطباق رئيسية', 'مشويات', 'حلويات', 'مشروبات'];

const menuItems = {
  'مقبلات': [
    { name: 'سمبوسة لحم بالتوابل السعودية', description: 'سمبوسة محشوة بلحم الغنم المتبل مع البصل والبهارات الخاصة، مقلية حتى الذهبي المثالي', price: '٤٥ ر.س', tag: 'الأكثر طلباً' },
    { name: 'حمص بالطحينة الفاخرة', description: 'حمص ناعم بطحينة فلسطينية أصلية مع زيت الزيتون البكر وحبوب الصنوبر المحمصة', price: '٣٥ ر.س', tag: '' },
    { name: 'متبل باذنجان مشوي', description: 'باذنجان مشوي على الفحم مع الطحينة والثوم المحمص وزيت الزيتون', price: '٣٨ ر.س', tag: '' },
    { name: 'فتة حمص بالسمن البلدي', description: 'طبقات من الخبز المحمص والحمص واللبن مع صنوبر محمص وسمن بلدي', price: '٤٢ ر.س', tag: 'جديد' },
    { name: 'ورق عنب محشي', description: 'ورق عنب محشي بالأرز واللحم المفروم والبهارات السبع، مطبوخ ببطء', price: '٤٨ ر.س', tag: '' },
    { name: 'كبة مقلية بالجوز', description: 'كبة مقرمشة محشوة بلحم الغنم والجوز والبصل المكرمل والبهارات', price: '٥٠ ر.س', tag: '' },
  ],
  'أطباق رئيسية': [
    { name: 'كبسة لحم خروف على الطريقة النجدية', description: 'أرز بسمتي طويل الحبة مع لحم خروف طري مطبوخ ببطء مع البهارات النجدية الأصيلة والمكسرات', price: '١٢٠ ر.س', tag: 'طبق الشيف' },
    { name: 'مندي دجاج بالعسل والزعفران', description: 'دجاج كامل مدخن على الحطب مع أرز المندي بالزعفران والمكسرات المشكلة', price: '٩٥ ر.س', tag: 'الأكثر طلباً' },
    { name: 'مظبي لحم على الحطب', description: 'لحم غنم مشوي على الحطب بتتبيلة خاصة من الأعشاب والبهارات مع أرز مبهر', price: '١٤٠ ر.س', tag: '' },
    { name: 'جريش سعودي بالدجاج', description: 'جريش قمح مطبوخ بمرق الدجاج الغني مع البصل المكرمل والسمن البلدي', price: '٧٥ ر.س', tag: '' },
    { name: 'مرقوق باللحم والخضار', description: 'عجينة رقيقة مطبوخة مع مرق اللحم والخضار الموسمية على الطريقة التقليدية', price: '٨٥ ر.س', tag: '' },
  ],
  'مشويات': [
    { name: 'مشكل مشويات النخبة', description: 'تشكيلة فاخرة من الكباب والتكة وريش الغنم والدجاج المشوي مع صلصات خاصة', price: '١٨٠ ر.س', tag: 'للمشاركة' },
    { name: 'ريش غنم مشوية بالأعشاب', description: 'ريش غنم أسترالي متبلة بالأعشاب الطازجة والثوم المحمص، مشوية على الفحم', price: '١٦٥ ر.س', tag: '' },
    { name: 'كباب لحم بالكرز', description: 'كباب لحم غنم مفروم يدوياً مع صلصة الكرز الحامض والبصل المشوي', price: '٩٠ ر.س', tag: '' },
    { name: 'شيش طاووق بالزعفران', description: 'صدور دجاج متبلة بالزعفران واللبن والبهارات، مشوية مع الخضار', price: '٧٨ ر.س', tag: '' },
  ],
  'حلويات': [
    { name: 'كنافة نابلسية بالقشطة', description: 'كنافة مقرمشة بالقشطة الطازجة وشراب السكر بماء الورد، مزينة بالفستق الحلبي', price: '٥٥ ر.س', tag: 'الأكثر طلباً' },
    { name: 'لقيمات بالدبس والزعفران', description: 'لقيمات ذهبية مقرمشة من الخارج وطرية من الداخل مع دبس التمر والزعفران', price: '٤٠ ر.س', tag: '' },
    { name: 'أم علي بالمكسرات', description: 'حلوى أم علي الدافئة بالعجين المورق والحليب والمكسرات المشكلة والزبيب', price: '٤٥ ر.س', tag: '' },
    { name: 'بسبوسة بالقشطة والتمر', description: 'بسبوسة طرية بحشوة القشطة والتمر المجدول، مزينة باللوز المحمص', price: '٤٨ ر.س', tag: 'جديد' },
  ],
  'مشروبات': [
    { name: 'قهوة سعودية بالهيل', description: 'قهوة عربية أصيلة محمصة طازجة مع الهيل والزعفران، تقدم مع التمر', price: '٢٥ ر.س', tag: '' },
    { name: 'شاي كرك بالزعفران', description: 'شاي كرك غني بالحليب والهيل والزعفران الأصلي', price: '٢٠ ر.س', tag: '' },
    { name: 'عصير ليمون بالنعناع', description: 'ليمون طازج مع أوراق النعناع الطازج والعسل الطبيعي مع الثلج المجروش', price: '٣٠ ر.س', tag: '' },
    { name: 'موهيتو توت بالريحان', description: 'مزيج التوت الطازج مع الريحان والليمون وماء الصودا المنعش', price: '٣٥ ر.س', tag: '' },
  ],
};

const currentItems = menuItems[activeCategory] || [];

return (
  <section id="menu" className="relative py-24 md:py-32 bg-gradient-to-b from-[#FFF8F0] via-white to-[#FFF8F0] overflow-hidden">
    {/* Decorative */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#D4A574]/8 to-transparent rounded-full blur-[100px]" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#E8C07D]/8 to-transparent rounded-full blur-[80px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A574]/3 rounded-full blur-[120px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 text-[#D4A574] text-sm font-bold mb-4">🍽️ قائمة الطعام</span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1810] mb-4">
          أطباقنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">المميزة</span>
        </h2>
        <p className="text-lg text-[#2C1810]/60 max-w-2xl mx-auto">أشهى الأطباق السعودية الأصيلة محضرة بعناية فائقة من أجود المكونات الطازجة</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mx-auto mt-6" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={\`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 \${
              activeCategory === cat
                ? 'bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] shadow-lg shadow-[#D4A574]/30 -translate-y-0.5'
                : 'bg-[#2C1810]/5 text-[#2C1810]/60 hover:bg-[#D4A574]/10 hover:text-[#D4A574]'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentItems.map((item, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-3xl bg-white border border-[#D4A574]/10 hover:border-[#D4A574]/30 hover:shadow-xl hover:shadow-[#D4A574]/10 hover:-translate-y-1 transition-all duration-500"
          >
            {item.tag && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] text-[10px] font-bold">{item.tag}</span>
            )}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2C1810] mb-2 group-hover:text-[#D4A574] transition-colors">{item.name}</h3>
                <p className="text-sm text-[#2C1810]/50 leading-relaxed">{item.description}</p>
              </div>
              <div className="text-left shrink-0">
                <span className="text-2xl font-black text-[#D4A574]">{item.price}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D4A574]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  </section>
);`;

const CHEF_TSX = `return (
  <section id="chef" className="relative py-24 md:py-32 bg-gradient-to-br from-[#2C1810] via-[#1A0F0A] to-[#2C1810] overflow-hidden">
    {/* Decorative */}
    <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#D4A574]/10 rounded-full blur-[100px] animate-pulse-slow" />
    <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#E8C07D]/8 rounded-full blur-[80px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Content */}
        <div className="space-y-8">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 text-[#E8C07D] text-sm font-bold mb-4">👨‍🍳 الشيف التنفيذي</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F5E6D3] mb-4">
              الشيف <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">محمد العتيبي</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mb-6" />
          </div>

          <p className="text-lg text-[#F5E6D3]/60 leading-relaxed">
            بخبرة تمتد لأكثر من ٢٥ عاماً في أرقى المطابخ العالمية، يقود الشيف محمد العتيبي فريقنا بشغف لا ينضب لتقديم أفضل تجربة طعام سعودية أصيلة. تدرب في باريس ولندن وطوكيو قبل أن يعود ليقدم فن الطبخ السعودي بلمسة عالمية فريدة.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏆', label: 'أفضل شيف سعودي ٢٠٢٣' },
              { icon: '⭐', label: 'نجمتا ميشلان' },
              { icon: '🌍', label: 'خبرة في ٨ دول' },
              { icon: '📚', label: 'مؤلف ٣ كتب طبخ' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all duration-300">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-[#F5E6D3]/70 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <blockquote className="relative p-6 rounded-2xl bg-white/5 border border-[#D4A574]/10">
            <svg className="absolute top-4 right-4 w-8 h-8 text-[#D4A574]/20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z"/></svg>
            <p className="text-[#E8C07D] italic text-lg leading-relaxed pr-12">
              "الطبخ ليس مجرد مهنة، إنه فن وشغف وحب. كل طبق نقدمه يحمل قصة من تراثنا العريق ولمسة من إبداعنا المعاصر."
            </p>
            <footer className="mt-4 text-sm text-[#F5E6D3]/40">— الشيف محمد العتيبي</footer>
          </blockquote>
        </div>

        {/* Visual Card */}
        <div className="relative">
          <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-[#D4A574]/20 via-[#E8C07D]/10 to-[#D4A574]/20 border border-[#D4A574]/20 overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
              <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-[#D4A574] to-[#E8C07D] flex items-center justify-center shadow-2xl shadow-[#D4A574]/30">
                <span className="text-7xl">👨‍🍳</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#F5E6D3]">الشيف محمد العتيبي</h3>
                <p className="text-[#D4A574] text-sm mt-1">الشيف التنفيذي — مطعم النخبة</p>
              </div>
              <div className="flex justify-center gap-3">
                {['🇫🇷', '🇬🇧', '🇯🇵', '🇸🇦'].map((flag, i) => (
                  <span key={i} className="text-2xl p-2 rounded-xl bg-white/5 border border-[#D4A574]/10">{flag}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative elements around card */}
          <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-[#D4A574]/20 rounded-3xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-[#E8C07D]/20 rounded-3xl" />
        </div>
      </div>
    </div>
  </section>
);`;

const GALLERY_TSX = `const [selectedImage, setSelectedImage] = React.useState(null);

const galleryItems = [
  { title: 'كبسة الخروف الملكية', category: 'أطباق رئيسية', gradient: 'from-amber-600/30 to-amber-800/30' },
  { title: 'أجواء المطعم الداخلية', category: 'الأجواء', gradient: 'from-stone-600/30 to-stone-800/30' },
  { title: 'حلويات النخبة الفاخرة', category: 'حلويات', gradient: 'from-rose-600/30 to-rose-800/30' },
  { title: 'المندي على الحطب', category: 'أطباق رئيسية', gradient: 'from-orange-600/30 to-orange-800/30' },
  { title: 'جلسات VIP الخاصة', category: 'الأجواء', gradient: 'from-indigo-600/30 to-indigo-800/30' },
  { title: 'تشكيلة المقبلات', category: 'مقبلات', gradient: 'from-emerald-600/30 to-emerald-800/30' },
  { title: 'القهوة السعودية الأصيلة', category: 'مشروبات', gradient: 'from-yellow-700/30 to-yellow-900/30' },
  { title: 'الصالة الرئيسية', category: 'الأجواء', gradient: 'from-purple-600/30 to-purple-800/30' },
];

return (
  <section id="gallery" className="relative py-24 md:py-32 bg-gradient-to-b from-[#FFF8F0] to-white overflow-hidden">
    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#D4A574]/5 rounded-full blur-[100px]" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E8C07D]/5 rounded-full blur-[100px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 text-[#D4A574] text-sm font-bold mb-4">📸 معرض الصور</span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1810] mb-4">
          لحظات <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">لا تُنسى</span>
        </h2>
        <p className="text-lg text-[#2C1810]/60 max-w-2xl mx-auto">لمحات من أطباقنا الشهية وأجوائنا الساحرة</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mx-auto mt-6" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryItems.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelectedImage(item)}
            className={\`group relative rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#D4A574]/20 transition-all duration-500 \${
              i === 0 || i === 5 ? 'md:col-span-2 md:row-span-2' : ''
            }\`}
          >
            <div className={\`aspect-square bg-gradient-to-br \${item.gradient} flex items-center justify-center\`}>
              <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-500">
                {item.category === 'الأجواء' ? '🏛️' : item.category === 'حلويات' ? '🍰' : item.category === 'مشروبات' ? '☕' : '🍽️'}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 sm:p-6">
              <div>
                <h3 className="text-white font-bold text-sm sm:text-lg">{item.title}</h3>
                <p className="text-white/60 text-xs sm:text-sm">{item.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Lightbox */}
    {selectedImage && (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
        <div className="relative max-w-3xl w-full animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="aspect-video rounded-3xl bg-gradient-to-br from-[#D4A574]/30 to-[#E8C07D]/20 flex items-center justify-center">
            <div className="text-center">
              <span className="text-8xl mb-4 block">🍽️</span>
              <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
              <p className="text-white/60 mt-2">{selectedImage.category}</p>
            </div>
          </div>
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    )}
  </section>
);`;

const RESERVATIONS_TSX = `const [formData, setFormData] = React.useState({
  name: '', phone: '', email: '', date: '', time: '', guests: '2', occasion: '', notes: ''
});
const [isSubmitted, setIsSubmitted] = React.useState(false);

const handleChange = (e) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = (e) => {
  e.preventDefault();
  setIsSubmitted(true);
  setTimeout(() => setIsSubmitted(false), 5000);
};

const timeSlots = ['٦:٠٠ م', '٦:٣٠ م', '٧:٠٠ م', '٧:٣٠ م', '٨:٠٠ م', '٨:٣٠ م', '٩:٠٠ م', '٩:٣٠ م', '١٠:٠٠ م', '١٠:٣٠ م'];
const occasions = ['عشاء عادي', 'عيد ميلاد', 'ذكرى زواج', 'اجتماع عمل', 'مناسبة خاصة'];

return (
  <section id="reservations" className="relative py-24 md:py-32 bg-gradient-to-br from-[#2C1810] via-[#1A0F0A] to-[#2C1810] overflow-hidden">
    <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#D4A574]/10 rounded-full blur-[100px] animate-pulse-slow" />
    <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#E8C07D]/8 rounded-full blur-[80px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 text-[#E8C07D] text-sm font-bold mb-4">📅 الحجوزات</span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F5E6D3] mb-4">
          احجز <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">طاولتك</span>
        </h2>
        <p className="text-lg text-[#F5E6D3]/50 max-w-2xl mx-auto">احجز مقعدك في تجربة طعام لا تُنسى</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mx-auto mt-6" />
      </div>

      <div className="max-w-3xl mx-auto">
        {isSubmitted ? (
          <div className="text-center p-12 rounded-3xl bg-white/5 border border-[#D4A574]/20 animate-scale-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-[#E8C07D] mb-3">تم تأكيد حجزك! ✨</h3>
            <p className="text-[#F5E6D3]/60">سنتواصل معك قريباً لتأكيد التفاصيل. نتطلع لاستضافتك!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-[#D4A574]/15 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#E8C07D] mb-2">الاسم الكامل *</label>
                <input name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8C07D] mb-2">رقم الجوال *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="+٩٦٦ ٥٠ ٠٠٠ ٠٠٠٠"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E8C07D] mb-2">البريد الإلكتروني</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#E8C07D] mb-2">التاريخ *</label>
                <input name="date" type="date" value={formData.date} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8C07D] mb-2">الوقت *</label>
                <select name="time" value={formData.time} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all">
                  <option value="">اختر الوقت</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8C07D] mb-2">عدد الضيوف *</label>
                <select name="guests" value={formData.guests} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'شخص' : 'أشخاص'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E8C07D] mb-2">المناسبة</label>
              <select name="occasion" value={formData.occasion} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all">
                <option value="">اختر المناسبة (اختياري)</option>
                {occasions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E8C07D] mb-2">ملاحظات إضافية</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="أي طلبات خاصة أو حساسية طعام..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all resize-none" />
            </div>
            <button type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold text-lg hover:shadow-2xl hover:shadow-[#D4A574]/40 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3">
              تأكيد الحجز
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        )}
      </div>
    </div>
  </section>
);`;

const TESTIMONIALS_TSX = `const testimonials = [
  {
    name: 'م. عبدالله الشمري',
    role: 'رجل أعمال — الرياض',
    text: 'مطعم النخبة هو المكان الوحيد الذي أختاره لاستضافة ضيوفي المهمين. الطعام استثنائي والخدمة على أعلى مستوى. الكبسة الملكية لا تُضاهى!',
    rating: 5,
  },
  {
    name: 'أ. نورة القحطاني',
    role: 'مؤثرة طعام — جدة',
    text: 'تجربة لا تُنسى! من لحظة الدخول حتى آخر قضمة، كل شيء مثالي. الشيف محمد فنان حقيقي في تقديم الأطباق السعودية بلمسة عصرية فاخرة.',
    rating: 5,
  },
  {
    name: 'د. فهد العتيبي',
    role: 'جراح — الدمام',
    text: 'اخترت مطعم النخبة للاحتفال بذكرى زواجنا وكانت الأمسية مثالية. الأجواء الرومانسية والطعام الفاخر جعلاها ليلة لا تُنسى. شكراً لكم!',
    rating: 5,
  },
  {
    name: 'أ. سارة الدوسري',
    role: 'مهندسة معمارية — الرياض',
    text: 'أحب التصميم الداخلي للمطعم! كل ركن يحكي قصة من التراث السعودي. والمندي بالعسل والزعفران أفضل ما تذوقته في حياتي.',
    rating: 5,
  },
];

return (
  <section id="testimonials" className="relative py-24 md:py-32 bg-gradient-to-b from-white via-[#FFF8F0] to-white overflow-hidden">
    <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#D4A574]/5 rounded-full blur-[100px]" />
    <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#E8C07D]/5 rounded-full blur-[80px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 text-[#D4A574] text-sm font-bold mb-4">💬 آراء ضيوفنا</span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1810] mb-4">
          ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">ضيوفنا</span>
        </h2>
        <p className="text-lg text-[#2C1810]/60 max-w-2xl mx-auto">تجارب حقيقية من ضيوف مطعم النخبة</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mx-auto mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="group p-8 rounded-3xl bg-white border border-[#D4A574]/10 hover:border-[#D4A574]/30 hover:shadow-xl hover:shadow-[#D4A574]/10 hover:-translate-y-1 transition-all duration-500 relative">
            <svg className="absolute top-6 left-6 w-10 h-10 text-[#D4A574]/10 group-hover:text-[#D4A574]/20 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z"/></svg>
            
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <svg key={j} className="w-5 h-5 text-[#E8C07D]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>

            <p className="text-[#2C1810]/70 leading-relaxed mb-6 text-lg">{t.text}</p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#E8C07D] flex items-center justify-center text-[#2C1810] font-bold text-lg shadow-lg shadow-[#D4A574]/20">
                {t.name.charAt(t.name.indexOf(' ') + 1)}
              </div>
              <div>
                <h4 className="font-bold text-[#2C1810]">{t.name}</h4>
                <p className="text-sm text-[#2C1810]/40">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);`;

const CONTACT_TSX = `const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', subject: '', message: '' });
const [isSent, setIsSent] = React.useState(false);

const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
const handleSubmit = (e) => { e.preventDefault(); setIsSent(true); setTimeout(() => setIsSent(false), 5000); };

const contactInfo = [
  { icon: '📍', label: 'العنوان', value: 'الرياض، حي السليمانية، شارع الأمير محمد بن عبدالعزيز' },
  { icon: '📞', label: 'الهاتف', value: '+٩٦٦ ١١ ٤٥٦ ٧٨٩٠' },
  { icon: '📱', label: 'الجوال', value: '+٩٦٦ ٥٠ ١٢٣ ٤٥٦٧' },
  { icon: '✉️', label: 'البريد', value: 'info@alnukhba.sa' },
  { icon: '🕐', label: 'ساعات العمل', value: 'يومياً من ١٢ ظهراً حتى ١٢ منتصف الليل' },
];

return (
  <section id="contact" className="relative py-24 md:py-32 bg-gradient-to-b from-[#FFF8F0] to-white overflow-hidden">
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4A574]/5 rounded-full blur-[100px]" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E8C07D]/5 rounded-full blur-[80px]" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4A574]/10 text-[#D4A574] text-sm font-bold mb-4">📬 تواصل معنا</span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1810] mb-4">
          نسعد <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E8C07D]">بتواصلكم</span>
        </h2>
        <p className="text-lg text-[#2C1810]/60 max-w-2xl mx-auto">لأي استفسار أو ملاحظة، لا تتردد في التواصل معنا</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4A574] to-[#E8C07D] rounded-full mx-auto mt-6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#2C1810] mb-8">معلومات التواصل</h3>
          {contactInfo.map((info, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#D4A574]/10 hover:border-[#D4A574]/30 hover:shadow-lg hover:shadow-[#D4A574]/5 transition-all duration-300 group">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#D4A574]/10 to-[#E8C07D]/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {info.icon}
              </div>
              <div>
                <h4 className="font-bold text-[#2C1810] text-sm mb-1">{info.label}</h4>
                <p className="text-[#2C1810]/60 text-sm">{info.value}</p>
              </div>
            </div>
          ))}

          {/* Social Links */}
          <div className="pt-4">
            <h4 className="font-bold text-[#2C1810] mb-4">تابعنا على</h4>
            <div className="flex gap-3">
              {['Instagram', 'Twitter', 'Snapchat', 'TikTok'].map((social, i) => (
                <button key={i} className="w-12 h-12 rounded-xl bg-[#2C1810]/5 hover:bg-gradient-to-br hover:from-[#D4A574] hover:to-[#E8C07D] text-[#2C1810]/60 hover:text-[#2C1810] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4A574]/20">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          {isSent ? (
            <div className="text-center p-12 rounded-3xl bg-white border border-[#D4A574]/10 animate-scale-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-[#2C1810] mb-2">تم إرسال رسالتك! ✨</h3>
              <p className="text-[#2C1810]/60">سنرد عليك في أقرب وقت ممكن</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-[#D4A574]/10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">الاسم الكامل *</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل اسمك"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A574]/20 text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/10 transition-all bg-[#FFF8F0]/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">البريد الإلكتروني *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A574]/20 text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/10 transition-all bg-[#FFF8F0]/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">رقم الجوال</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+٩٦٦ ٥٠ ٠٠٠ ٠٠٠٠"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A574]/20 text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/10 transition-all bg-[#FFF8F0]/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">الموضوع *</label>
                  <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="موضوع الرسالة"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4A574]/20 text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/10 transition-all bg-[#FFF8F0]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-2">رسالتك *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="اكتب رسالتك هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-[#D4A574]/20 text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/10 transition-all bg-[#FFF8F0]/50 resize-none" />
              </div>
              <button type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold text-lg hover:shadow-xl hover:shadow-[#D4A574]/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
                إرسال الرسالة ✉️
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  </section>
);`;

const FOOTER_TSX = `const [email, setEmail] = React.useState('');
const [isSubscribed, setIsSubscribed] = React.useState(false);

const handleSubscribe = (e) => { e.preventDefault(); if (email) { setIsSubscribed(true); setEmail(''); setTimeout(() => setIsSubscribed(false), 4000); } };

const footerLinks = {
  'روابط سريعة': ['الرئيسية', 'القائمة', 'الحجوزات', 'المعرض', 'تواصل معنا'],
  'خدماتنا': ['حفلات خاصة', 'تموين مناسبات', 'غرف VIP', 'خدمة التوصيل', 'هدايا وقسائم'],
  'المعلومات': ['عن المطعم', 'الشيف التنفيذي', 'فرص العمل', 'الأسئلة الشائعة', 'سياسة الخصوصية'],
};

return (
  <footer className="relative bg-gradient-to-b from-[#2C1810] to-[#1A0F0A] overflow-hidden">
    {/* Decorative */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent" />
    <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#D4A574]/5 rounded-full blur-[100px]" />

    {/* Newsletter Section */}
    <div className="border-b border-[#D4A574]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F5E6D3] mb-3">اشترك في نشرتنا البريدية</h3>
          <p className="text-[#F5E6D3]/50 mb-6">احصل على أحدث العروض والأخبار والفعاليات الخاصة</p>
          {isSubscribed ? (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium animate-scale-in">
              ✅ تم الاشتراك بنجاح! شكراً لك
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-[#D4A574]/20 text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 focus:outline-none focus:border-[#D4A574]/50 transition-all"
              />
              <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A574] to-[#E8C07D] text-[#2C1810] font-bold hover:shadow-lg hover:shadow-[#D4A574]/30 transition-all shrink-0">
                اشترك
              </button>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Main Footer */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#E8C07D] flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#2C1810]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E8C07D]">مطعم النخبة</h3>
              <p className="text-[10px] text-[#D4A574]/50 tracking-[0.3em] uppercase">Fine Dining Since 1995</p>
            </div>
          </div>
          <p className="text-[#F5E6D3]/50 leading-relaxed max-w-sm">
            نقدم أفخر المأكولات السعودية الأصيلة في أجواء ساحرة تجمع بين الأصالة والحداثة. رحلة طعم لا تُنسى في قلب الرياض.
          </p>
          <div className="flex gap-3">
            {['📸', '🐦', '👻', '🎵'].map((icon, i) => (
              <button key={i} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-[#D4A574] hover:to-[#E8C07D] text-[#F5E6D3]/50 hover:text-[#2C1810] flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-sm">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-[#E8C07D] font-bold mb-4">{title}</h4>
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-[#F5E6D3]/40 hover:text-[#D4A574] text-sm transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A574]/30 group-hover:bg-[#D4A574] transition-colors" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-[#D4A574]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#F5E6D3]/30">
          <p>© ٢٠٢٦ مطعم النخبة — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-1">
            <span>صُنع بـ</span>
            <span className="text-red-400">❤️</span>
            <span>في الرياض 🇸🇦</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);`;

export const RESTAURANT_TEMPLATE_FILES: VFSFile[] = [
  { name: "styles.css", content: STYLES_CSS, language: "css" },
  { name: "App.tsx", content: APP_TSX, language: "tsx" },
  { name: "Header.tsx", content: HEADER_TSX, language: "tsx" },
  { name: "Hero.tsx", content: HERO_TSX, language: "tsx" },
  { name: "Menu.tsx", content: MENU_TSX, language: "tsx" },
  { name: "Chef.tsx", content: CHEF_TSX, language: "tsx" },
  { name: "Gallery.tsx", content: GALLERY_TSX, language: "tsx" },
  { name: "Reservations.tsx", content: RESERVATIONS_TSX, language: "tsx" },
  { name: "Testimonials.tsx", content: TESTIMONIALS_TSX, language: "tsx" },
  { name: "Contact.tsx", content: CONTACT_TSX, language: "tsx" },
  { name: "Footer.tsx", content: FOOTER_TSX, language: "tsx" },
];
