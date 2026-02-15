import { ThinkingStep, PipelineStage } from "@/hooks/v2/useBuilderChat";
import { Zap, Check, Loader2, Circle, ChevronDown, FileCode, Brain, ArrowLeftRight, Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

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

export function ThinkingEngine({ steps, affectedFiles, dependencyGraph, isComplete, pipelineStage, handoffPrompt }: ThinkingEngineProps) {
  const [open, setOpen] = useState(true);

  if (steps.length === 0 && (!affectedFiles || affectedFiles.length === 0) && !dependencyGraph && !pipelineStage) return null;

  const allDone = isComplete || pipelineStage === "done";
  const currentStage = pipelineStage || (allDone ? "done" : "thinking");
  const stageConfig = STAGE_CONFIG[currentStage];
  const StageIcon = stageConfig.icon;

  // Build pipeline progress indicators
  const pipelineStages: PipelineStage[] = ["thinking", "planning", "handoff", "building", "reviewing", "done"];
  const currentStageIndex = pipelineStages.indexOf(currentStage);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3 bg-secondary/50 rounded-xl p-3 border border-border/50">
      <CollapsibleTrigger className="flex items-center gap-2 text-xs w-full group">
        <StageIcon className={`h-3.5 w-3.5 shrink-0 ${stageConfig.color} ${!allDone ? "animate-pulse" : ""}`} />
        <span className={`font-bold ${stageConfig.color}`}>
          {stageConfig.label}
        </span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform mr-auto ${open ? "" : "-rotate-90"}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        {/* Pipeline Progress Bar */}
        <div className="flex items-center gap-1">
          {pipelineStages.slice(0, -1).map((stage, i) => {
            const config = STAGE_CONFIG[stage];
            const Icon = config.icon;
            const isActive = i === currentStageIndex;
            const isDone = i < currentStageIndex;
            return (
              <div key={stage} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isDone ? "bg-green-500/20" : isActive ? "bg-primary/20 ring-1 ring-primary/40" : "bg-secondary"
                }`}>
                  {isDone ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : isActive ? (
                    <Icon className={`h-3 w-3 ${config.color} animate-pulse`} />
                  ) : (
                    <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />
                  )}
                </div>
                {i < pipelineStages.length - 2 && (
                  <div className={`flex-1 h-0.5 rounded ${isDone ? "bg-green-500/40" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Stage Labels */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground px-1">
          <span>تفكير</span>
          <span>تخطيط</span>
          <span>تسليم</span>
          <span>تنفيذ</span>
          <span>مراجعة</span>
        </div>

        {/* Thinking Steps */}
        {steps.length > 0 && (
          <div className="space-y-1.5 pt-1">
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
          </div>
        )}

        {/* Handoff Prompt (Planner → Builder) */}
        {handoffPrompt && (currentStage === "handoff" || currentStage === "building" || currentStage === "reviewing" || currentStage === "done") && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5">
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
          <div className="pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
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

        {/* Dependency Graph */}
        {dependencyGraph && dependencyGraph.nodes && dependencyGraph.nodes.length > 0 && (
          <div className="pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <FileCode className="h-3 w-3" />
              <span>مخطط الاعتماديات ({dependencyGraph.nodes.length} مكون)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {dependencyGraph.nodes.map((node: any) => (
                <span key={node.id} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono" dir="ltr">
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
