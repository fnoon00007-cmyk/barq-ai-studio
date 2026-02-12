import { VFSFile } from "@/hooks/useVFS";
import { Smartphone } from "lucide-react";
import { useMemo } from "react";

interface MobilePreviewProps {
  files: VFSFile[];
  activeFile: string | null;
}

function buildPreviewHTML(files: VFSFile[]): string | null {
  const appFile = files.find((f) => f.name === "App.tsx");
  if (!appFile) return null;

  const cssFile = files.find((f) => f.language === "css");
  const cssContent = cssFile?.content || "";

  // Extract JSX content - strip export/import/function wrappers for simple rendering
  let jsxContent = appFile.content;
  
  // If it looks like a component, try to extract the JSX return
  const returnMatch = jsxContent.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) {
    jsxContent = returnMatch[1];
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwindcss.config = {
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
    ${cssContent}
  </style>
</head>
<body>
  ${jsxContent}
</body>
</html>`;
}

export function MobilePreview({ files, activeFile }: MobilePreviewProps) {
  const previewHTML = useMemo(() => buildPreviewHTML(files), [files]);
  const file = files.find((f) => f.name === activeFile);

  return (
    <div className="flex-1 flex items-center justify-center p-6 gap-6">
      {/* Live Preview Phone */}
      <div className="relative w-[320px] h-[640px] rounded-[3rem] border-4 border-border bg-background shadow-2xl overflow-hidden shrink-0">
        <div className="absolute top-0 inset-x-0 flex justify-center z-10">
          <div className="w-32 h-6 bg-border rounded-b-2xl" />
        </div>

        <div className="h-full pt-8 pb-4 px-1 overflow-hidden">
          {previewHTML ? (
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full rounded-2xl border-0"
              sandbox="allow-scripts"
              title="معاينة الموقع"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-barq-surface flex items-center justify-center animate-pulse-glow">
                <Smartphone className="h-8 w-8 text-barq-electric" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">معاينة الموقع</p>
                <p className="text-xs text-muted-foreground">ابدأ محادثة مع برق لبناء موقعك</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-2 inset-x-0 flex justify-center">
          <div className="w-28 h-1 rounded-full bg-border" />
        </div>
      </div>

      {/* Code Panel */}
      {file && (
        <div className="hidden lg:block w-[340px] h-[640px] rounded-xl bg-barq-surface border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <span className="text-xs font-mono text-barq-electric">{file.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {file.language}
            </span>
          </div>
          <pre className="p-4 text-[11px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap overflow-y-auto h-[calc(100%-40px)]" dir="ltr">
            {file.content}
          </pre>
        </div>
      )}
    </div>
  );
}
