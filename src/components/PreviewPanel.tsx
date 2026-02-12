import { VFSFile } from "@/hooks/useVFS";
import { Globe } from "lucide-react";
import { useMemo } from "react";

interface PreviewPanelProps {
  files: VFSFile[];
}

function buildPreviewHTML(files: VFSFile[]): string | null {
  const appFile = files.find((f) => f.name === "App.tsx")
    || files.find((f) => f.name.endsWith("App.tsx"))
    || files.find((f) => f.language === "tsx" || f.language === "html");
  if (!appFile) return null;

  const cssFile = files.find((f) => f.language === "css");
  const cssContent = cssFile?.content || "";

  let jsxContent = appFile.content;
  const returnMatch = jsxContent.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) jsxContent = returnMatch[1];
  jsxContent = jsxContent.replace(/^(import|export)\s+.*$/gm, '').trim();

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwindcss.config = {
      theme: { extend: { fontFamily: { cairo: ['Cairo', 'sans-serif'] } } }
    }
  <\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; direction: rtl; overflow-x: hidden; }
    ${cssContent}
  </style>
</head>
<body>${jsxContent}</body>
</html>`;
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
