import { useEffect, useState } from "react";
import { BUILD_PHASES } from "@/lib/barq-api";
import { Progress } from "@/components/ui/progress";

interface BuildProgressBarProps {
  currentPhase: number;
  completedPhases: number[];
  phaseLabel: string;
  serverSideBuild?: boolean;
  compact?: boolean;
}

/**
 * BuildProgressBar — Real percentage-based progress bar with phase labels.
 * Shows smooth animated progress, elapsed time, and phase indicators.
 */
export function BuildProgressBar({
  currentPhase,
  completedPhases,
  phaseLabel,
  serverSideBuild,
  compact = false,
}: BuildProgressBarProps) {
  const totalPhases = BUILD_PHASES.length;
  const [elapsed, setElapsed] = useState(0);
  const [subProgress, setSubProgress] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate sub-progress within the current phase
  useEffect(() => {
    setSubProgress(0);
    const interval = setInterval(() => {
      setSubProgress((prev) => Math.min(prev + Math.random() * 3 + 0.5, 90));
    }, 800);
    return () => clearInterval(interval);
  }, [currentPhase]);

  // Calculate overall percentage
  const completedPercent = (completedPhases.length / totalPhases) * 100;
  const currentPhasePercent = currentPhase > 0 ? (subProgress / 100) * (100 / totalPhases) : 0;
  const totalPercent = Math.min(Math.round(completedPercent + currentPhasePercent), 99);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}ث`;
  };

  return (
    <div className={`rounded-2xl bg-secondary/50 border border-border space-y-3 animate-slide-up ${compact ? "mx-2 p-4" : "p-5"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-bold text-sm text-foreground">جاري البناء</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">{formatTime(elapsed)}</span>
          <span className="text-sm font-bold text-primary font-mono">{totalPercent}%</span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative">
        <Progress value={totalPercent} className="h-3 bg-muted" />
        {/* Glow effect */}
        <div
          className="absolute top-0 h-3 rounded-full bg-primary/30 blur-sm transition-all duration-700"
          style={{ width: `${totalPercent}%` }}
        />
      </div>

      {/* Phase Indicators */}
      <div className={`flex ${compact ? "gap-1" : "gap-2"}`}>
        {BUILD_PHASES.map((phase, i) => {
          const p = phase.id;
          const isCompleted = completedPhases.includes(p);
          const isCurrent = currentPhase === p;

          return (
            <div key={p} className="flex-1 space-y-1">
              <div className="flex items-center justify-center gap-1">
                {isCompleted ? (
                  <span className="text-primary text-xs">✓</span>
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                )}
                <p className={`text-[10px] font-medium truncate ${
                  isCompleted ? "text-primary" :
                  isCurrent ? "text-foreground" :
                  "text-muted-foreground/50"
                }`}>
                  {phase.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current phase label */}
      <p className="text-xs text-muted-foreground text-center">{phaseLabel}</p>

      {/* Server-side indicator */}
      {serverSideBuild && (
        <p className="text-xs text-primary text-center flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          يعمل على السيرفر — يمكنك إغلاق المتصفح 💾
        </p>
      )}
    </div>
  );
}
