import { UtensilsCrossed, Stethoscope, Building2, ShoppingCart, Scale, Scissors, Dumbbell, Code2, GraduationCap, Briefcase } from "lucide-react";

const TEMPLATES = [
  { icon: UtensilsCrossed, label: "موقع مطعم فاخر", prompt: "أبي موقع لمطعم فاخر سعودي يقدم أكلات تراثية مع قائمة الطعام وحجز طاولات" },
  { icon: Stethoscope, label: "عيادة طبية", prompt: "أبي موقع لعيادة طبية متخصصة فيه حجز مواعيد وعرض الأطباء والخدمات الطبية" },
  { icon: Building2, label: "موقع عقارات", prompt: "أبي موقع لشركة عقارات يعرض العقارات المتاحة للبيع والإيجار مع تفاصيل كل عقار" },
  { icon: ShoppingCart, label: "متجر إلكتروني", prompt: "أبي متجر إلكتروني احترافي لبيع المنتجات مع سلة مشتريات وصفحة دفع" },
  { icon: Scale, label: "موقع محامي", prompt: "أبي موقع لمكتب محاماة يعرض الخدمات القانونية والاستشارات مع نموذج تواصل" },
  { icon: Scissors, label: "صالون تجميل", prompt: "أبي موقع لصالون تجميل نسائي فاخر يعرض الخدمات والأسعار مع حجز مواعيد" },
  { icon: Dumbbell, label: "جيم ونادي رياضي", prompt: "أبي موقع لنادي رياضي يعرض الاشتراكات والمدربين والجدول اليومي" },
  { icon: Code2, label: "شركة برمجيات", prompt: "أبي موقع لشركة برمجيات وتقنية يعرض الخدمات والمشاريع السابقة وفريق العمل" },
  { icon: GraduationCap, label: "مدرسة أو أكاديمية", prompt: "أبي موقع لأكاديمية تعليمية يعرض الدورات والمدربين ونظام التسجيل" },
  { icon: Briefcase, label: "موقع شخصي (Portfolio)", prompt: "أبي موقع شخصي احترافي (Portfolio) يعرض أعمالي ومهاراتي وطريقة التواصل معي" },
];

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
  compact?: boolean;
}

export function PromptTemplates({ onSelect, compact = false }: PromptTemplatesProps) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
      {TEMPLATES.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          onClick={() => onSelect(prompt)}
          className={`flex items-center gap-2 rounded-xl border border-border bg-secondary text-secondary-foreground hover:border-primary/50 hover:bg-secondary/80 transition-all text-right ${
            compact ? "px-2.5 py-2 text-[11px]" : "px-3 py-2.5 text-xs"
          }`}
        >
          <Icon className={`shrink-0 text-primary ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}
