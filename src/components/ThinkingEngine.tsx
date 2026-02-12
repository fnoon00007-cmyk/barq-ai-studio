import { ThinkingStep } from "@/hooks/useVFS";
import { Zap, Check, Loader2, Circle } from "lucide-react";

interface ThinkingEngineProps {
  steps: ThinkingStep[];
  visible: boolean;
}

export function ThinkingEngine({ steps, visible }: ThinkingEngineProps) {
  if (!visible || steps.length === 0) return null;

  return (
    <div className="mx-4 mb-3 rounded-lg border border-border bg-barq-surface p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-barq-gold animate-lightning" />
        <span className="text-sm font-bold text-barq-gold">
          برق يفكر ويخطط...
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3 text-sm">
            {step.status === "completed" && (
              <Check className="h-4 w-4 text-green-400 shrink-0" />
            )}
            {step.status === "loading" && (
              <Loader2 className="h-4 w-4 text-barq-electric animate-spin shrink-0" />
            )}
            {step.status === "pending" && (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={
                step.status === "completed"
                  ? "text-foreground"
                  : step.status === "loading"
                  ? "text-barq-electric"
                  : "text-muted-foreground"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
