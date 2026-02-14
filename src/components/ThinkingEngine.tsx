import { ThinkingStep } from "@/hooks/v2/useBuilderChat";
import { Zap, Check, Loader2, Circle, ChevronDown, FileCode } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface ThinkingEngineProps {
  steps: ThinkingStep[];
  affectedFiles?: string[];
  dependencyGraph?: any; // New: Dependency graph to display
  isComplete?: boolean;
}

export function ThinkingEngine({ steps, affectedFiles, dependencyGraph, isComplete }: ThinkingEngineProps) {
  const [open, setOpen] = useState(true);

  if (steps.length === 0 && (!affectedFiles || affectedFiles.length === 0) && !dependencyGraph) return null;

  const allDone = isComplete || steps.every((s) => s.status === "completed");

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
      <CollapsibleTrigger className="flex items-center gap-2 text-xs w-full group">
        <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="font-bold text-accent">
          {allDone ? "اكتمل التفكير والبناء" : "برق يفكر ويبني..."}
        </span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform mr-auto ${open ? "" : "-rotate-90"}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-1.5">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2 text-xs">
            {step.status === "completed" && <Check className="h-3 w-3 text-green-400 shrink-0" />}
            {(step.status === "loading" || step.status === "failed") && <Loader2 className="h-3 w-3 text-accent animate-spin shrink-0" />}
            {step.status === "pending" && <Circle className="h-3 w-3 text-muted-foreground shrink-0" />}
            <span className={step.status === "completed" ? "text-foreground" : (step.status === "loading" || step.status === "failed") ? "text-accent" : "text-muted-foreground"}>
              {step.label}
            </span>
          </div>
        ))}
        {affectedFiles && affectedFiles.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <FileCode className="h-3 w-3" />
              <span>الملفات المتأثرة ({affectedFiles.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {affectedFiles.map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono" dir="ltr">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
        {dependencyGraph && dependencyGraph.nodes && dependencyGraph.nodes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <FileCode className="h-3 w-3" />
              <span>مخطط الاعتماديات ({dependencyGraph.nodes.length} مكون)</span>
            </div>
            <div className="flex flex-col gap-1">
              {dependencyGraph.nodes.map((node: any) => (
                <span key={node.id} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono" dir="ltr">
                  {node.id} ({node.action})
                </span>
              ))}
            </div>
          </div>
        )}

      </CollapsibleContent>
    </Collapsible>
  );
}
