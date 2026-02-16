import { VFSFile } from "@/hooks/v2/useVFS";
import { TEMPLATES, type Template, type TemplateCategory } from "./templates-data";

export interface TemplateConfig {
  id: string;
  name: string;
  nameEn: string;
  category: TemplateCategory;
  description: string;
  keywords: string[];
  features: string[];
  components: string[];
  colors: { primary: string; secondary: string; accent: string };
  customizableFields: string[];
}

export interface TemplateModifications {
  templateId: string;
  brandName: string;
  colors?: { primary?: string; secondary?: string; accent?: string };
  content?: Record<string, any>;
  contact?: { phone?: string; email?: string; address?: string };
  sections?: { order?: string[]; remove?: string[]; add?: string[] };
}

// Registry of template IDs that have full pre-built code
const FULL_TEMPLATE_IDS = new Set<string>([
  "restaurant-luxury",
  "medical-clinic",
  "ecommerce-store",
  "real-estate-agency",
  "law-firm",
  "beauty-salon",
  "gym-fitness",
  "tech-company",
  "education-academy",
  "photography-portfolio",
  "consulting-firm",
  "personal-portfolio",
]);

/** Check if a template has full pre-built code available */
export function hasFullTemplate(templateId: string): boolean {
  return FULL_TEMPLATE_IDS.has(templateId);
}

/** Load a full template's files dynamically */
export async function loadTemplateFiles(templateId: string): Promise<VFSFile[]> {
  switch (templateId) {
    case "restaurant-luxury": {
      const mod = await import("@/templates/restaurant-premium");
      return mod.RESTAURANT_TEMPLATE_FILES;
    }
    case "medical-clinic": {
      const mod = await import("@/templates/medical-clinic");
      return mod.MEDICAL_CLINIC_TEMPLATE_FILES;
    }
    case "ecommerce-store": {
      const mod = await import("@/templates/ecommerce-store");
      return mod.ECOMMERCE_STORE_TEMPLATE_FILES;
    }
    case "real-estate-agency": {
      const mod = await import("@/templates/real-estate-agency");
      return mod.REAL_ESTATE_TEMPLATE_FILES;
    }
    case "law-firm": {
      const mod = await import("@/templates/law-firm");
      return mod.LAW_FIRM_TEMPLATE_FILES;
    }
    case "beauty-salon": {
      const mod = await import("@/templates/beauty-salon");
      return mod.BEAUTY_SALON_TEMPLATE_FILES;
    }
    case "gym-fitness": {
      const mod = await import("@/templates/gym-fitness");
      return mod.GYM_FITNESS_TEMPLATE_FILES;
    }
    case "tech-company": {
      const mod = await import("@/templates/tech-company");
      return mod.TECH_COMPANY_TEMPLATE_FILES;
    }
    case "education-academy": {
      const mod = await import("@/templates/education-academy");
      return mod.EDUCATION_ACADEMY_TEMPLATE_FILES;
    }
    case "photography-portfolio": {
      const mod = await import("@/templates/photography-portfolio");
      return mod.PHOTOGRAPHY_PORTFOLIO_TEMPLATE_FILES;
    }
    case "consulting-firm": {
      const mod = await import("@/templates/consulting-firm");
      return mod.CONSULTING_FIRM_TEMPLATE_FILES;
    }
    case "personal-portfolio": {
      const mod = await import("@/templates/personal-portfolio");
      return mod.PERSONAL_PORTFOLIO_TEMPLATE_FILES;
    }
    default:
      return [];
  }
}

/** Select the best matching template for a user prompt */
export function selectBestTemplate(prompt: string): Template | null {
  const promptLower = prompt.toLowerCase();
  const arabicPrompt = prompt;

  const keywordMap: Record<string, string[]> = {
    "restaurant-luxury": ["مطعم", "طعام", "أكل", "حجوزات", "قائمة طعام", "restaurant", "food", "dining", "كافيه", "مقهى"],
    "medical-clinic": ["عيادة", "طبي", "طب", "مواعيد", "أطباء", "صحة", "clinic", "medical", "health", "مستشفى"],
    "real-estate-agency": ["عقار", "عقارات", "شقق", "فلل", "أراضي", "real estate", "property", "بيع", "إيجار"],
    "ecommerce-store": ["متجر", "منتجات", "تسوق", "سلة", "بيع", "shop", "ecommerce", "store", "تجارة"],
    "law-firm": ["محام", "قانون", "استشار", "حقوق", "law", "legal", "attorney", "مكتب محاماة"],
    "beauty-salon": ["صالون", "تجميل", "شعر", "مكياج", "عناية", "salon", "beauty", "spa"],
    "gym-fitness": ["جيم", "رياضة", "لياقة", "نادي", "تدريب", "gym", "fitness", "sport"],
    "tech-company": ["برمجة", "تقنية", "تطبيق", "برمجيات", "tech", "software", "startup"],
    "education-academy": ["تعليم", "دورات", "أكاديمية", "تدريب", "education", "academy", "course"],
    "photography-portfolio": ["تصوير", "مصور", "صور", "فوتو", "photography", "photographer"],
    "consulting-firm": ["استشارات", "مستشار", "consulting", "consultant", "إدارة"],
    "personal-portfolio": ["شخصي", "بورتفوليو", "سيرة", "portfolio", "personal", "cv"],
  };

  let bestMatch: { id: string; score: number } = { id: "", score: 0 };

  for (const [templateId, keywords] of Object.entries(keywordMap)) {
    let score = 0;
    for (const kw of keywords) {
      if (arabicPrompt.includes(kw) || promptLower.includes(kw)) {
        score += 10;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { id: templateId, score };
    }
  }

  if (bestMatch.score > 0) {
    return TEMPLATES.find(t => t.id === bestMatch.id) || null;
  }

  return null;
}

/** Get all templates that have full pre-built code */
export function getFullTemplates(): Template[] {
  return TEMPLATES.filter(t => FULL_TEMPLATE_IDS.has(t.id));
}

/** Get template config metadata for an edge function */
export function getTemplateConfig(templateId: string): TemplateConfig | null {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  return {
    id: template.id,
    name: template.title,
    nameEn: templateId.replace(/-/g, " "),
    category: template.category,
    description: template.description,
    keywords: [],
    features: template.files.map(f => f.name.replace(".tsx", "").replace(".css", "")),
    components: template.files.filter(f => f.name.endsWith(".tsx")).map(f => f.name.replace(".tsx", "")),
    colors: template.colors,
    customizableFields: ["brandName", "hero.title", "hero.subtitle", "contact.phone", "contact.email", "contact.address"],
  };
}
