import { Check, Zap, Crown, Building2 } from "lucide-react";

const plans = [
  {
    name: "الأساسية",
    nameEn: "Basic",
    price: "مجاناً",
    priceDetail: "للأبد",
    icon: Zap,
    color: "primary",
    features: [
      "3 مشاريع مواقع",
      "قوالب أساسية",
      "معاينة مباشرة",
      "دعم المحادثة الذكية",
      "تصدير HTML",
    ],
    cta: "ابدأ مجاناً",
    popular: false,
  },
  {
    name: "الاحترافية",
    nameEn: "Pro",
    price: "49",
    priceDetail: "ريال / شهرياً",
    icon: Crown,
    color: "accent",
    features: [
      "مشاريع غير محدودة",
      "قوالب متقدمة واحترافية",
      "هوية تجارية مخصصة",
      "ربط دومين خاص",
      "دعم أولوية ⚡",
      "تحليلات الموقع",
      "إزالة شعار برق",
    ],
    cta: "اشترك الآن",
    popular: true,
  },
  {
    name: "المؤسسات",
    nameEn: "Enterprise",
    price: "199",
    priceDetail: "ريال / شهرياً",
    icon: Building2,
    color: "primary",
    features: [
      "كل مميزات الاحترافية",
      "API وصول كامل",
      "فريق متعدد المستخدمين",
      "SLA مضمون",
      "مدير حساب مخصص",
      "تخصيص كامل للقوالب",
      "استضافة مخصصة",
      "تدريب فريق العمل",
    ],
    cta: "تواصل معنا",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold mb-4">
          <Zap className="h-3.5 w-3.5" />
          الأسعار والباقات
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          اختر الخطة المناسبة لك
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          ابدأ مجاناً وطوّر حسب احتياجك. جميع الخطط تشمل الذكاء الاصطناعي ⚡
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.nameEn}
              className={`relative bg-card border rounded-2xl p-6 flex flex-col transition-all ${
                isPopular
                  ? "border-accent shadow-[0_0_30px_hsl(var(--barq-gold)/0.15)] scale-[1.02]"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                  الأكثر شعبية ⚡
                </div>
              )}

              <div className="mb-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isPopular ? "bg-accent/15" : "bg-primary/10"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isPopular ? "text-accent" : "text-primary"}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price === "مجاناً" ? plan.price : plan.price}
                  </span>
                  {plan.price !== "مجاناً" && (
                    <span className="text-sm text-muted-foreground">{plan.priceDetail}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isPopular ? "text-accent" : "text-primary"
                      }`}
                    />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 ${
                  isPopular
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-foreground border border-border hover:border-primary/40"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
