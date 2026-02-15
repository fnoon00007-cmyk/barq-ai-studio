import { ThinkingStep, PipelineStage } from "@/hooks/v2/useBuilderChat";
import { Zap, Check, Loader2, Circle, ChevronDown, FileCode, Brain, ArrowLeftRight, Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect, useRef } from "react";

interface ThinkingEngineProps {
  steps: ThinkingStep[];
  affectedFiles?: string[];
  dependencyGraph?: any;
  isComplete?: boolean;
  pipelineStage?: PipelineStage;
  handoffPrompt?: string;
}

const STAGE_CONFIG: Record<PipelineStage, { icon: typeof Brain; label: string; color: string }> = {
  thinking: { icon: Brain, label: "برق يفكر...", color: "text-purple-400" },
  planning: { icon: Zap, label: "يخطط البنية...", color: "text-accent" },
  handoff: { icon: ArrowLeftRight, label: "يرسل التعليمات للمبرمج...", color: "text-blue-400" },
  building: { icon: Hammer, label: "المبرمج ينفذ...", color: "text-amber-400" },
  reviewing: { icon: ShieldCheck, label: "المراجع يتحقق...", color: "text-emerald-400" },
  done: { icon: Sparkles, label: "اكتمل! ✨", color: "text-green-400" },
};

const STAGE_LABELS: Record<string, string> = {
  thinking: "تفكير",
  planning: "تخطيط",
  handoff: "تسليم",
  building: "تنفيذ",
  reviewing: "مراجعة",
};

export function ThinkingEngine({ steps, affectedFiles, dependencyGraph, isComplete, pipelineStage, handoffPrompt }: ThinkingEngineProps) {
  const [open, setOpen] = useState(true);
  const [prevStage, setPrevStage] = useState<PipelineStage | null>(null);
  const [stageTransition, setStageTransition] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allDone = isComplete || pipelineStage === "done";
  const currentStage = pipelineStage || (allDone ? "done" : "thinking");
  const stageConfig = STAGE_CONFIG[currentStage];
  const StageIcon = stageConfig.icon;

  const pipelineStages: PipelineStage[] = ["thinking", "planning", "handoff", "building", "reviewing", "done"];
  const currentStageIndex = pipelineStages.indexOf(currentStage);

  // Detect stage transitions for animation
  useEffect(() => {
    if (prevStage && prevStage !== currentStage) {
      setStageTransition(true);
      const timer = setTimeout(() => setStageTransition(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevStage(currentStage);
  }, [currentStage, prevStage]);

  if (steps.length === 0 && (!affectedFiles || affectedFiles.length === 0) && !dependencyGraph && !pipelineStage) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3 rounded-xl border border-border/50 overflow-hidden animate-slide-up" ref={containerRef}>
      {/* Header with animated background */}
      <div className={`transition-all duration-700 ease-out ${allDone ? "bg-green-500/5" : "bg-secondary/50"}`}>
        <CollapsibleTrigger className="flex items-center gap-2.5 text-xs w-full p-3 group">
          <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-500 ${
            allDone ? "bg-green-500/15" : "bg-primary/10"
          }`}>
            <StageIcon className={`h-3.5 w-3.5 shrink-0 transition-all duration-500 ${stageConfig.color} ${
              !allDone ? "animate-pulse" : ""
            } ${stageTransition ? "scale-125" : "scale-100"}`} />
            {!allDone && (
              <span className="absolute inset-0 rounded-lg animate-ping opacity-20 bg-primary" />
            )}
          </div>
          <span className={`font-bold transition-all duration-500 ${stageConfig.color} ${stageTransition ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
            {stageConfig.label}
          </span>
          {!allDone && (
            <span className="flex gap-0.5 mr-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-typing-dot-1" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-typing-dot-2" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-typing-dot-3" />
            </span>
          )}
          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 mr-auto ${open ? "" : "-rotate-90"}`} />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {/* Pipeline Progress Bar */}
        <div className="flex items-center gap-0.5 pt-2">
          {pipelineStages.slice(0, -1).map((stage, i) => {
            const config = STAGE_CONFIG[stage];
            const Icon = config.icon;
            const isActive = i === currentStageIndex;
            const isDone = i < currentStageIndex;
            return (
              <div key={stage} className="flex items-center gap-0.5 flex-1">
                <div
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ease-out ${
                    isDone
                      ? "bg-green-500/20 scale-100"
                      : isActive
                        ? "bg-primary/15 scale-110 ring-2 ring-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                        : "bg-secondary scale-90 opacity-40"
                  }`}
                  style={{ transitionDelay: isDone ? `${i * 80}ms` : '0ms' }}
                >
                  {isDone ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : isActive ? (
                    <>
                      <Icon className={`h-3 w-3 ${config.color}`} />
                      <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-30" />
                    </>
                  ) : (
                    <Circle className="h-2 w-2 text-muted-foreground/30" />
                  )}
                </div>
                {i < pipelineStages.length - 2 && (
                  <div className="flex-1 h-[2px] rounded-full bg-border relative overflow-hidden">
                    <div
                      className={`absolute inset-y-0 right-0 rounded-full transition-all duration-700 ease-out ${
                        isDone ? "bg-green-500/50 w-full" : isActive ? "bg-primary/40 w-1/2 animate-pulse" : "w-0"
                      }`}
                      style={{ transitionDelay: isDone ? `${i * 100 + 200}ms` : '0ms' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage Labels */}
        <div className="flex items-center justify-between text-[9px] px-1">
          {pipelineStages.slice(0, -1).map((stage, i) => {
            const isActive = i === currentStageIndex;
            const isDone = i < currentStageIndex;
            return (
              <span
                key={stage}
                className={`transition-all duration-500 font-medium ${
                  isDone ? "text-green-400/70" : isActive ? `${STAGE_CONFIG[stage].color} font-bold` : "text-muted-foreground/40"
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            );
          })}
        </div>

        {/* Thinking Steps - Staggered */}
        {steps.length > 0 && (
          <div className="space-y-1 pt-1">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className="flex items-center gap-2 text-xs py-0.5 transition-all duration-300 ease-out"
                style={{
                  animation: 'slide-up-fade 0.3s ease-out forwards',
                  animationDelay: `${i * 60}ms`,
                  opacity: 0,
                }}
              >
                <div className="relative">
                  {step.status === "completed" && <Check className="h-3 w-3 text-green-400 shrink-0" />}
                  {(step.status === "loading" || step.status === "failed") && (
                    <Loader2 className="h-3 w-3 text-accent animate-spin shrink-0" />
                  )}
                  {step.status === "pending" && <Circle className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
                </div>
                <span className={`transition-colors duration-300 ${
                  step.status === "completed" ? "text-foreground"
                  : (step.status === "loading" || step.status === "failed") ? "text-accent font-medium"
                  : "text-muted-foreground/50"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Handoff Prompt */}
        {handoffPrompt && (currentStage === "handoff" || currentStage === "building" || currentStage === "reviewing" || currentStage === "done") && (
          <div className="rounded-lg p-2.5 border border-blue-500/20 bg-blue-500/5 animate-slide-up">
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold mb-1.5">
              <ArrowLeftRight className="h-3 w-3" />
              تعليمات المشرف → المبرمج
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-mono line-clamp-3" dir="ltr">
              {handoffPrompt.slice(0, 200)}{handoffPrompt.length > 200 ? "..." : ""}
            </p>
          </div>
        )}

        {/* Affected Files */}
        {affectedFiles && affectedFiles.length > 0 && (
          <div className="pt-1 border-t border-border/50 animate-slide-up">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <FileCode className="h-3 w-3" />
              <span>الملفات المتأثرة ({affectedFiles.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {affectedFiles.map((f, i) => (
                <span
                  key={f}
                  className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono"
                  dir="ltr"
                  style={{
                    animation: 'slide-up-fade 0.2s ease-out forwards',
                    animationDelay: `${i * 40}ms`,
                    opacity: 0,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dependency Graph */}
        {dependencyGraph && dependencyGraph.nodes && dependencyGraph.nodes.length > 0 && (
          <div className="pt-1 border-t border-border/50 animate-slide-up">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <FileCode className="h-3 w-3" />
              <span>مخطط الاعتماديات ({dependencyGraph.nodes.length} مكون)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {dependencyGraph.nodes.map((node: any, i: number) => (
                <span
                  key={node.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono"
                  dir="ltr"
                  style={{
                    animation: 'slide-up-fade 0.2s ease-out forwards',
                    animationDelay: `${i * 40}ms`,
                    opacity: 0,
                  }}
                >
                  {node.id}
                  <span className={`mr-1 ${node.action === 'create' ? 'text-green-400' : 'text-amber-400'}`}>
                    ({node.action === 'create' ? 'جديد' : 'تعديل'})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
