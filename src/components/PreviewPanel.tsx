import { VFSFile } from "@/hooks/useVFS";
import { Globe } from "lucide-react";
import { useMemo } from "react";

interface PreviewPanelProps {
  files: VFSFile[];
}

// Assembles multi-file VFS into a single preview HTML.
// If App.tsx exists, use it as skeleton and replace placeholders with component content.
// Otherwise concatenate all components in logical order.
function buildPreviewHTML(files: VFSFile[]): string | null {
  if (files.length === 0) return null;

  const cssFile = files.find((f) => f.language === "css" || f.name.endsWith(".css"));
  const cssContent = cssFile?.content || "";

  const appFile = files.find((f) => f.name === "App.tsx");
  const componentFiles = files.filter(
    (f) => f.name !== "App.tsx" && f.name !== "styles.css" && (f.language === "tsx" || f.language === "html")
  );

  let bodyContent: string;

  if (appFile) {
    let appContent = cleanJSX(appFile.content);

    // Try to replace placeholders with actual component content
    let replacedAny = false;
    for (const comp of componentFiles) {
      const baseName = comp.name.replace(/\.(tsx|jsx|html)$/, "");
      // Match patterns like: <!-- Header --> , {/* Header.tsx */}, {/* Header */}, <!-- Header.tsx -->
      const patterns = [
        new RegExp(`<!--\\s*${baseName}(\\.tsx)?\\s*-->`, "gi"),
        new RegExp(`\\{/\\*\\s*${baseName}(\\.tsx)?\\s*(محتوى|يُدرج هنا|content)?[^*]*\\*/\\}`, "gi"),
        new RegExp(`<!--\\s*${baseName}(\\.tsx)?\\s*(محتوى|يُدرج هنا|section)?[^-]*-->`, "gi"),
      ];
      
      const compContent = cleanJSX(comp.content);
      for (const pattern of patterns) {
        if (pattern.test(appContent)) {
          appContent = appContent.replace(pattern, compContent);
          replacedAny = true;
          break;
        }
      }
    }

    // If no placeholders were replaced, the App.tsx might already have full content
    // or we need to assemble components in order
    if (!replacedAny && componentFiles.length > 0) {
      // Check if App.tsx is mostly empty/skeleton (less than 200 chars of actual content)
      const stripped = appContent.replace(/<[^>]*>/g, "").replace(/\s/g, "");
      if (stripped.length < 200) {
        // App.tsx is a skeleton — fill it with all components in logical order
        const ordered = orderComponents(componentFiles);
        const combinedContent = ordered.map((f) => cleanJSX(f.content)).join("\n\n");
        
        // Try to insert inside the main wrapper div
        const wrapperMatch = appContent.match(/(<div[^>]*>)([\s\S]*?)(<\/div>\s*$)/);
        if (wrapperMatch) {
          bodyContent = wrapperMatch[1] + "\n" + combinedContent + "\n" + wrapperMatch[3];
        } else {
          bodyContent = `<div dir="rtl" lang="ar" style="font-family: 'Cairo', sans-serif">\n${combinedContent}\n</div>`;
        }
      } else {
        // App.tsx has real content already
        bodyContent = appContent;
      }
    } else {
      bodyContent = appContent;
    }
  } else if (componentFiles.length > 0) {
    // No App.tsx — combine all components in order
    const ordered = orderComponents(componentFiles);
    const combinedContent = ordered.map((f) => cleanJSX(f.content)).join("\n\n");
    bodyContent = `<div dir="rtl" lang="ar" style="font-family: 'Cairo', sans-serif">\n${combinedContent}\n</div>`;
  } else {
    return null;
  }

  // Clean any remaining React-isms
  bodyContent = bodyContent
    .replace(/className=/g, "class=")
    .replace(/\{`([^`]*)`\}/g, "$1")
    .replace(/style=\{\{([^}]*)\}\}/g, (_, styles) => {
      const cssStyles = styles
        .split(",")
        .map((s: string) => {
          const [key, val] = s.split(":").map((x: string) => x.trim());
          if (!key || !val) return "";
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^'|'$/g, "");
          const cssVal = val.replace(/^'|'$/g, "").replace(/^"|"$/g, "");
          return `${cssKey}: ${cssVal}`;
        })
        .filter(Boolean)
        .join("; ");
      return `style="${cssStyles}"`;
    });

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
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    ${cssContent}
  </style>
</head>
<body>${bodyContent}</body>
</html>`;
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
    .trim();

  // If still wrapped in return(...), extract inner content
  const returnMatch = cleaned.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) cleaned = returnMatch[1].trim();

  return cleaned;
}

/** Order components in logical website section order */
function orderComponents(files: VFSFile[]): VFSFile[] {
  const orderMap: Record<string, number> = {
    "Header.tsx": 0, "Navbar.tsx": 0, "Nav.tsx": 0,
    "Hero.tsx": 1, "Banner.tsx": 1,
    "Services.tsx": 2, "Features.tsx": 2,
    "About.tsx": 3, "AboutUs.tsx": 3,
    "Products.tsx": 4, "Menu.tsx": 4, "Portfolio.tsx": 4, "Gallery.tsx": 4,
    "Testimonials.tsx": 5, "Reviews.tsx": 5,
    "Team.tsx": 6, "Stats.tsx": 6, "Pricing.tsx": 6,
    "Contact.tsx": 7, "ContactUs.tsx": 7, "CTA.tsx": 7,
    "Footer.tsx": 8,
  };

  return [...files].sort((a, b) => {
    const orderA = orderMap[a.name] ?? 5;
    const orderB = orderMap[b.name] ?? 5;
    return orderA - orderB;
  });
}

export function PreviewPanel({ files }: PreviewPanelProps) {
  const previewHTML = useMemo(() => buildPreviewHTML(files), [files]);

  if (!previewHTML) {
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

  return (
    <iframe
      srcDoc={previewHTML}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="معاينة الموقع"
    />
  );
}