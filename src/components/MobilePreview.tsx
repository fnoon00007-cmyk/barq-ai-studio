import { VFSFile } from "@/hooks/useVFS";
import { Smartphone } from "lucide-react";

interface MobilePreviewProps {
  files: VFSFile[];
  activeFile: string | null;
}

export function MobilePreview({ files, activeFile }: MobilePreviewProps) {
  const file = files.find((f) => f.name === activeFile);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      {/* Phone Frame */}
      <div className="relative w-[320px] h-[640px] rounded-[3rem] border-4 border-border bg-background shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 flex justify-center z-10">
          <div className="w-32 h-6 bg-border rounded-b-2xl" />
        </div>

        {/* Screen Content */}
        <div className="h-full pt-8 pb-4 px-1 overflow-hidden">
          {file ? (
            <div className="h-full rounded-2xl bg-barq-surface p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                <span className="text-xs font-mono text-barq-electric">
                  {file.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {file.language}
                </span>
              </div>
              <pre className="text-[11px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap" dir="ltr">
                {file.content}
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-barq-surface flex items-center justify-center animate-pulse-glow">
                <Smartphone className="h-8 w-8 text-barq-electric" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  معاينة الموقع
                </p>
                <p className="text-xs text-muted-foreground">
                  ابدأ محادثة مع برق لبناء موقعك
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center">
          <div className="w-28 h-1 rounded-full bg-border" />
        </div>
      </div>
    </div>
  );
}
