import { VFSFile } from "@/hooks/useVFS";
import { Globe, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

interface PreviewPanelProps {
  files: VFSFile[];
}

/**
 * Assembles multi-file VFS into a single preview HTML.
 * Improved: Better JSX cleaning, error recovery, and edge-case handling.
 */
function buildPreviewHTML(files: VFSFile[]): string | null {
  if (files.length === 0) return null;

  try {
    const cssFile = files.find((f) => f.language === "css" || f.name.endsWith(".css"));
    const cssContent = cssFile?.content || "";

    const appFile = files.find((f) => f.name === "App.tsx");
    const componentFiles = files.filter(
      (f) => f.name !== "App.tsx" && f.name !== "styles.css" && (f.language === "tsx" || f.language === "html")
    );

    let bodyContent: string;

    if (appFile) {
      let appContent = cleanJSX(appFile.content);

      let replacedAny = false;
      for (const comp of componentFiles) {
        const baseName = comp.name.replace(/\.(tsx|jsx|html)$/, "");
        const patterns = [
          new RegExp(`<${baseName}\\s*/\\s*>`, "gi"),
          new RegExp(`<${baseName}\\s*>\\s*</${baseName}\\s*>`, "gi"),
          new RegExp(`<!--\\s*${baseName}(\\.tsx)?\\s*-->`, "gi"),
          new RegExp(`\\{/\\*\\s*${baseName}(\\.tsx)?\\s*(محتوى|يُدرج هنا|content)?[^*]*\\*/\\}`, "gi"),
          new RegExp(`<!--\\s*${baseName}(\\.tsx)?\\s*(محتوى|يُدرج هنا|section)?[^-]*-->`, "gi"),
        ];
        
        const compContent = cleanJSX(comp.content);
        for (const pattern of patterns) {
          if (pattern.test(appContent)) {
            pattern.lastIndex = 0;
            appContent = appContent.replace(pattern, compContent);
            replacedAny = true;
            break;
          }
        }
      }

      if (!replacedAny && componentFiles.length > 0) {
        const stripped = appContent.replace(/<[^>]*>/g, "").replace(/\s/g, "");
        if (stripped.length < 200) {
          const ordered = orderComponents(componentFiles);
          const combinedContent = ordered.map((f) => cleanJSX(f.content)).join("\n\n");
          
          const wrapperMatch = appContent.match(/(<div[^>]*>)([\s\S]*?)(<\/div>\s*$)/);
          if (wrapperMatch) {
            bodyContent = wrapperMatch[1] + "\n" + combinedContent + "\n" + wrapperMatch[3];
          } else {
            bodyContent = wrapRTL(combinedContent);
          }
        } else {
          bodyContent = appContent;
        }
      } else {
        bodyContent = appContent;
      }
    } else if (componentFiles.length > 0) {
      const ordered = orderComponents(componentFiles);
      const combinedContent = ordered.map((f) => cleanJSX(f.content)).join("\n\n");
      bodyContent = wrapRTL(combinedContent);
    } else {
      return null;
    }

    // Convert React-isms to HTML
    bodyContent = convertReactToHTML(bodyContent);

    return assembleHTML(bodyContent, cssContent);
  } catch (err) {
    console.error("Preview build error:", err);
    return assembleErrorHTML("حدث خطأ في بناء المعاينة. حاول تعديل الملفات.");
  }
}

/** Wrap content in RTL container */
function wrapRTL(content: string): string {
  return `<div dir="rtl" lang="ar" style="font-family: 'Cairo', sans-serif">\n${content}\n</div>`;
}

/** Convert React JSX patterns to valid HTML */
function convertReactToHTML(content: string): string {
  return content
    // className → class
    .replace(/className=/g, "class=")
    // Template literals in JSX: {`text`} → text
    .replace(/\{`([^`]*)`\}/g, "$1")
    // Inline styles: style={{...}} → style="..."
    .replace(/style=\{\{([^}]*)\}\}/g, (_, styles) => {
      const cssStyles = styles
        .split(",")
        .map((s: string) => {
          const colonIdx = s.indexOf(":");
          if (colonIdx === -1) return "";
          const key = s.slice(0, colonIdx).trim();
          const val = s.slice(colonIdx + 1).trim();
          if (!key || !val) return "";
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^'|'$/g, "");
          const cssVal = val.replace(/^'|'$/g, "").replace(/^"|"$/g, "");
          return `${cssKey}: ${cssVal}`;
        })
        .filter(Boolean)
        .join("; ");
      return `style="${cssStyles}"`;
    })
    // Remove JSX expressions that can't render: {variable}
    .replace(/\{([a-zA-Z_]\w*)\}/g, "")
    // Remove event handlers: onClick={...}
    .replace(/\s(on[A-Z]\w*)=\{[^}]*\}/g, "")
    // Remove dangling JSX: {() => ...}
    .replace(/\{[\s]*\([^)]*\)[\s]*=>[\s\S]*?\}/g, "")
    // Clean up empty attributes
    .replace(/\s(key|ref)=\{[^}]*\}/g, "");
}

/** Clean JSX: remove imports, exports, function declarations, return wrappers */
function cleanJSX(content: string): string {
  let cleaned = content
    // Remove import/export lines
    .replace(/^(import|export)\s+.*$/gm, "")
    // Remove function/const component declarations
    .replace(/^(export\s+)?(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{?\s*$/gm, "")
    .replace(/^(export\s+)?(const|let|var)\s+\w+\s*[:=]\s*(React\.FC|FC|\([^)]*\)\s*=>)\s*\{?\s*$/gm, "")
    // Remove return ( ... ) wrapper
    .replace(/^\s*return\s*\(\s*$/gm, "")
    .replace(/^\s*\)\s*;?\s*\}?\s*$/gm, "")
    // Remove trailing }
    .replace(/^\s*\}\s*;?\s*$/gm, "")
    // Remove useState/useEffect/hooks
    .replace(/^\s*const\s+\[.*?\]\s*=\s*useState.*$/gm, "")
    .replace(/^\s*useEffect\s*\(.*$/gm, "")
    .trim();

  // If still wrapped in return(...), extract inner content
  const returnMatch = cleaned.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) cleaned = returnMatch[1].trim();

  return cleaned;
}

/** Order components in logical website section order */
function orderComponents(files: VFSFile[]): VFSFile[] {
  const orderMap: Record<string, number> = {
    "Header.tsx": 0, "Navbar.tsx": 0, "Nav.tsx": 0, "Navigation.tsx": 0,
    "Hero.tsx": 1, "Banner.tsx": 1, "HeroSection.tsx": 1,
    "Services.tsx": 2, "Features.tsx": 2, "ServicesSection.tsx": 2,
    "About.tsx": 3, "AboutUs.tsx": 3, "AboutSection.tsx": 3,
    "Products.tsx": 4, "Menu.tsx": 4, "Portfolio.tsx": 4, "Gallery.tsx": 4,
    "Testimonials.tsx": 5, "Reviews.tsx": 5, "TestimonialsSection.tsx": 5,
    "Team.tsx": 6, "Stats.tsx": 6, "Pricing.tsx": 6,
    "Contact.tsx": 7, "ContactUs.tsx": 7, "CTA.tsx": 7, "ContactSection.tsx": 7,
    "Footer.tsx": 8, "FooterSection.tsx": 8,
  };

  return [...files].sort((a, b) => {
    const orderA = orderMap[a.name] ?? 5;
    const orderB = orderMap[b.name] ?? 5;
    return orderA - orderB;
  });
}

/** Assemble final HTML document */
function assembleHTML(bodyContent: string, cssContent: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { cairo: ['Cairo', 'sans-serif'] },
        }
      }
    }
  <\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; direction: rtl; overflow-x: hidden; }
    img { max-width: 100%; height: auto; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
    .animate-slide-in-right { animation: slideInRight 0.6s ease-out; }
    .glass-effect { backdrop-filter: blur(12px); background: rgba(255,255,255,0.8); }
    ${cssContent}
  </style>
</head>
<body>
  ${bodyContent}
  <script>
    // Error boundary for preview
    window.onerror = function(msg, url, line) {
      console.warn('Preview error:', msg);
      return true;
    };
  <\/script>
</body>
</html>`;
}

/** Assemble error HTML fallback */
function assembleErrorHTML(message: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fafafa; color: #333; text-align: center; padding: 2rem; }
    .error-box { max-width: 400px; padding: 2rem; border-radius: 1rem; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eee; }
    h2 { color: #e53e3e; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="error-box">
    <h2>⚠️ خطأ في المعاينة</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

export function PreviewPanel({ files }: PreviewPanelProps) {
  const [hasError, setHasError] = useState(false);
  const previewHTML = useMemo(() => {
    setHasError(false);
    const html = buildPreviewHTML(files);
    if (files.length > 0 && !html) setHasError(true);
    return html;
  }, [files]);

  if (!previewHTML && !hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Globe className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">معاينة الموقع</h2>
        <p className="text-base text-muted-foreground max-w-sm">
          ابدأ محادثة مع برق وسيظهر الموقع هنا مباشرة ⚡
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">خطأ في المعاينة</h2>
        <p className="text-base text-muted-foreground max-w-sm">
          تعذّر بناء المعاينة. حاول تعديل الملفات أو إعادة البناء.
        </p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={previewHTML!}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="معاينة الموقع"
    />
  );
}
