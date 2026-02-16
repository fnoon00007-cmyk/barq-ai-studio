import { Layers, Palette, Loader2, Eye } from "lucide-react";
import { CATEGORY_LABELS, type Template } from "@/lib/templates-data";
import { hasFullTemplate } from "@/lib/template-registry";

interface TemplateCardProps {
  template: Template;
  isLoading: boolean;
  onUse: () => void;
  onPreview: () => void;
}

export default function TemplateCard({ template, isLoading, onUse, onPreview }: TemplateCardProps) {
  const hasFull = hasFullTemplate(template.id);

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Thumbnail — clickable for preview */}
      <div
        onClick={onPreview}
        className="h-44 relative overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${template.colors.primary}22, ${template.colors.secondary}33)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{template.icon}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-3 py-1.5 rounded-lg bg-background/90 text-foreground text-xs font-bold flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            معاينة مباشرة
          </span>
        </div>

        {template.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-accent/90 text-accent-foreground text-[10px] font-bold">
            ⭐ مميز
          </div>
        )}
        {hasFull && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold">
            ✓ جاهز
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur text-foreground text-[10px] font-bold">
          {CATEGORY_LABELS[template.category].icon} {CATEGORY_LABELS[template.category].label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-lg mb-1.5">{template.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{template.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {template.pageCount} مكونات
          </span>
          <span className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span className="flex gap-1">
              {[template.colors.primary, template.colors.secondary, template.colors.accent].map((c) => (
                <span key={c} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />
              ))}
            </span>
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="h-4 w-4" />
            معاينة
          </button>
          <button
            onClick={onUse}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ...
              </>
            ) : (
              "استخدم ⚡"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
