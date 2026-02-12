import { VFSFile } from "@/hooks/useVFS";
import { ArrowRight, Code, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";

interface PreviewPageProps {
  files: VFSFile[];
  onBack: () => void;
}

function buildPreviewHTML(files: VFSFile[]): string | null {
  // Find the main app file - could be "App.tsx", "src/App.tsx", or any .tsx file
  const appFile = files.find((f) => f.name === "App.tsx") 
    || files.find((f) => f.name.endsWith("App.tsx"))
    || files.find((f) => f.language === "tsx" || f.language === "html");
  if (!appFile) return null;

  const cssFile = files.find((f) => f.language === "css");
  const cssContent = cssFile?.content || "";

  let jsxContent = appFile.content;
  
  // Strip function/export wrappers to get raw JSX
  // Remove: export default function X() { return (...) }
  const returnMatch = jsxContent.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) {
    jsxContent = returnMatch[1];
  }
  // Also strip any remaining import/export lines
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

export function PreviewPage({ files, onBack }: PreviewPageProps) {
  const previewHTML = useMemo(() => buildPreviewHTML(files), [files]);
  const [showCode, setShowCode] = useState(false);
  const [activeFile, setActiveFile] = useState(files[0]?.name || null);
  const file = files.find((f) => f.name === activeFile);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-barq-surface transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمحادثة
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !showCode ? "bg-barq-electric/15 text-barq-electric" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            معاينة
          </button>
          <button
            onClick={() => setShowCode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showCode ? "bg-barq-electric/15 text-barq-electric" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            الكود
          </button>
        </div>
      </div>

      {showCode ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card overflow-x-auto">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFile(f.name)}
                className={`text-xs px-3 py-1.5 rounded-md font-mono transition-colors whitespace-nowrap ${
                  activeFile === f.name
                    ? "bg-barq-electric/15 text-barq-electric border border-barq-electric/30"
                    : "text-muted-foreground hover:bg-barq-surface"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-barq-surface p-4">
            <pre className="text-xs leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap" dir="ltr">
              {file?.content || "اختر ملفاً لعرضه"}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          {previewHTML ? (
            <div className="w-full max-w-md mx-auto">
              {/* Phone frame */}
              <div className="relative mx-auto w-full max-w-[360px] aspect-[9/18] rounded-[2.5rem] border-4 border-border bg-background shadow-2xl overflow-hidden">
                <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                  <div className="w-28 h-5 bg-border rounded-b-xl" />
                </div>
                <div className="h-full pt-6 pb-3 px-0.5 overflow-hidden">
                  <iframe
                    srcDoc={previewHTML}
                    className="w-full h-full rounded-2xl border-0"
                    sandbox="allow-scripts"
                    title="معاينة الموقع"
                  />
                </div>
                <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                  <div className="w-24 h-1 rounded-full bg-border" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا يوجد محتوى للمعاينة بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
