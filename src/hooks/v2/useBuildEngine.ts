
import { useState, useCallback, useRef, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { streamBarqPlanner, streamBarqBuilder, streamBarqFixer, reviewBuild, BUILD_PHASES } from "@/lib/barq-api";
import { VFSFile, VFSOperation } from "./useVFS";
import { ChatMessage, ThinkingStep } from "./useBuilderChat";
import { supabase } from "@/integrations/supabase/client";
import { hasFullTemplate, loadTemplateFiles } from "@/lib/template-registry";

// --- Types and Interfaces ---

interface BuildPhaseProgress {
  currentPhase: number;
  totalPhases: number;
  phaseLabel: string;
  completedPhases: number[];
  phaseFiles: Record<number, string[]>;
}

interface BuildEngineState {
  isThinking: boolean;
  isBuilding: boolean;
  buildPrompt: string | null;
  buildProjectName: string | null;
  reviewStatus: "reviewing" | "fixing" | "approved" | null;
  fixSuggestion: { operations: VFSOperation[]; summary: string } | null;
  error: string | null;
  dependencyGraph: any | null;
  phaseProgress: BuildPhaseProgress | null;
  activeJobId: string | null;
  serverSideBuild: boolean;
}

type BuildEngineAction =
  | { type: "SET_STATUS"; payload: Partial<Pick<BuildEngineState, "isThinking" | "isBuilding" | "reviewStatus" | "error" | "activeJobId" | "serverSideBuild">> }
  | { type: "SET_BUILD_PROMPT"; payload: { prompt: string | null; projectName?: string | null; dependencyGraph?: any } }
  | { type: "SET_FIX_SUGGESTION"; payload: { operations: VFSOperation[]; summary: string } | null }
  | { type: "SET_PHASE_PROGRESS"; payload: BuildPhaseProgress | null }
  | { type: "RESET" };

interface UseBuildEngineProps {
  userId: string | null;
  projectId: string | null;
  files: VFSFile[];
  messages: ChatMessage[];
  applyVFSOperations: (ops: VFSOperation[], message?: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  saveMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  saveProject: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const initialState: BuildEngineState = {
  isThinking: false,
  isBuilding: false,
  buildPrompt: null,
  buildProjectName: null,
  reviewStatus: null,
  error: null,
  dependencyGraph: null,
  fixSuggestion: null,
  phaseProgress: null,
  activeJobId: null,
  serverSideBuild: false,
};

const buildEngineReducer = (state: BuildEngineState, action: BuildEngineAction): BuildEngineState => {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, ...action.payload };
    case "SET_BUILD_PROMPT":
      return { 
        ...state, 
        buildPrompt: action.payload.prompt, 
        buildProjectName: action.payload.projectName || state.buildProjectName,
        dependencyGraph: action.payload.dependencyGraph || state.dependencyGraph
      };
    case "SET_FIX_SUGGESTION":
      return { ...state, fixSuggestion: action.payload };
    case "SET_PHASE_PROGRESS":
      return { ...state, phaseProgress: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// --- Helper: extract VFS files from a build_jobs row ---
function extractFilesFromJob(job: any): VFSFile[] {
  const files: VFSFile[] = [];
  for (let i = 1; i <= 4; i++) {
    const pf = job[`phase_${i}_files`];
    if (Array.isArray(pf)) files.push(...pf);
  }
  return files;
}

function getCompletedPhases(job: any): number[] {
  const phases: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const pf = job[`phase_${i}_files`];
    if (Array.isArray(pf) && pf.length > 0) phases.push(i);
  }
  return phases;
}

function getCurrentPhaseFromStatus(status: string): number {
  const match = status.match(/building_phase_(\d)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * useBuildEngine - The Core Orchestrator for Barq AI
 * Server-side worker for new builds, client-side streaming for modifications.
 */
export function useBuildEngine({
  userId,
  projectId,
  files,
  messages,
  applyVFSOperations,
  addMessage,
  updateMessage,
  saveMessage,
  saveProject,
  getAuthToken,
}: UseBuildEngineProps) {
  const [state, dispatch] = useReducer(buildEngineReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fixAttemptsRef = useRef<number>(0);
  const realtimeChannelRef = useRef<any>(null);
  const connectedJobIdRef = useRef<string | null>(null);
  const MAX_FIX_ATTEMPTS = 2;

  // --- Cleanup realtime on unmount ---
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, []);

  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch({ type: "SET_STATUS", payload: { isThinking: false, isBuilding: false } });
      toast.info("تم إلغاء العملية.");
    }
    // Cancel server-side job if active
    if (state.activeJobId) {
      supabase.from("build_jobs").update({ status: "cancelled" }).eq("id", state.activeJobId);
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      dispatch({ type: "SET_STATUS", payload: { activeJobId: null, serverSideBuild: false } });
    }
  }, [state.activeJobId]);

  // --- Subscribe to Realtime updates for a server-side build job ---
  const subscribeToJob = useCallback((jobId: string, assistantMsgId: string) => {
    // Remove old channel
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`build_job_${jobId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "build_jobs",
        filter: `id=eq.${jobId}`,
      }, async (payload) => {
        const job = payload.new as any;
        console.log("[realtime] Job update:", job.status, "phase:", job.current_phase);

        const completedPh = getCompletedPhases(job);
        const curPhase = getCurrentPhaseFromStatus(job.status);

        if (curPhase > 0) {
          const phaseInfo = BUILD_PHASES[curPhase - 1];
          dispatch({
            type: "SET_PHASE_PROGRESS",
            payload: {
              currentPhase: curPhase,
              totalPhases: 4,
              phaseLabel: phaseInfo?.label || "",
              completedPhases: completedPh,
              phaseFiles: {},
            },
          });
          updateMessage(assistantMsgId, {
            content: `⚡ المرحلة ${curPhase}/4: ${phaseInfo?.label || ""} — ${phaseInfo?.files.join("، ") || ""}`,
          });
        }

        // Phase completion toasts
        for (const p of completedPh) {
          const phaseInfo = BUILD_PHASES[p - 1];
          if (phaseInfo) {
            // Toast only once per phase (simple heuristic)
          }
        }

        // Build completed
        if (job.status === "completed") {
          const allFiles = extractFilesFromJob(job);
          
          // Apply all files to VFS
          if (allFiles.length > 0) {
            const ops: VFSOperation[] = allFiles.map((f: any) => ({
              path: f.name || f.path,
              content: f.content,
              action: "create" as const,
            }));
            await applyVFSOperations(ops, "بناء سيرفري مكتمل");
          }

          dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
          dispatch({ type: "SET_STATUS", payload: { isBuilding: false, isThinking: false, activeJobId: null, serverSideBuild: false } });
          connectedJobIdRef.current = null;
          updateMessage(assistantMsgId, { content: "اكتمل البناء! ✅", isStreaming: false, pipelineStage: "done" });
          await saveMessage({ role: "assistant", content: "اكتمل البناء!" });
          await saveProject();
          toast.success("✅ اكتمل البناء السيرفري بنجاح!");

          // Browser Notification (works even in background tabs)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⚡ برق — اكتمل البناء!", { body: "موقعك جاهز للمعاينة الآن", icon: "/favicon.png" });
          }

          // Auto review
          const buildPrompt = job.build_prompt;
          if (allFiles.length > 0 && buildPrompt) {
            dispatch({ type: "SET_STATUS", payload: { reviewStatus: "reviewing" } });
            try {
              const reviewFiles = allFiles.map((f: any) => ({
                path: f.name || f.path, content: f.content, language: (f.name || f.path)?.endsWith(".css") ? "css" : "tsx",
              }));
              const reviewResult = await reviewBuild(buildPrompt, reviewFiles);
              if (reviewResult.status === "approved") {
                dispatch({ type: "SET_STATUS", payload: { reviewStatus: "approved" } });
                const reviewMsgId = crypto.randomUUID();
                addMessage({ id: reviewMsgId, role: "assistant", content: `✅ ${reviewResult.summary_ar}`, timestamp: new Date(), pipelineStage: "done" });
                await saveMessage({ role: "assistant", content: `✅ ${reviewResult.summary_ar}` });
                setTimeout(() => dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } }), 4000);
              } else {
                dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
              }
            } catch {
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
            }
          }

          supabase.removeChannel(channel);
          realtimeChannelRef.current = null;
        }

        // Build failed
        if (job.status?.startsWith("failed")) {
          dispatch({ type: "SET_STATUS", payload: { isBuilding: false, isThinking: false, activeJobId: null, serverSideBuild: false, error: "فشل البناء في المرحلة " + job.current_phase } });
          connectedJobIdRef.current = null;
          dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
          updateMessage(assistantMsgId, { content: "فشل البناء ❌", isStreaming: false });
          toast.error("فشل البناء في المرحلة " + job.current_phase);
          supabase.removeChannel(channel);
          realtimeChannelRef.current = null;
        }
      })
      .subscribe();

    realtimeChannelRef.current = channel;
    return channel;
  }, [applyVFSOperations, addMessage, updateMessage, saveMessage, saveProject]);

  // --- Check for active/completed server-side builds on mount AND on tab focus ---
  const appliedJobIdsRef = useRef<Set<string>>(new Set());
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    
    const checkActiveBuilds = async () => {
      // Prevent concurrent checks
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        // Check for active builds
        const { data: activeJobs } = await supabase
          .from("build_jobs")
          .select("*")
          .eq("user_id", userId)
          .in("status", ["building_phase_1", "building_phase_2", "building_phase_3", "building_phase_4"])
          .order("started_at", { ascending: false })
          .limit(1);

        if (activeJobs && activeJobs.length > 0) {
          const job = activeJobs[0];
          
          // Prevent duplicate reconnections to the same job
          if (connectedJobIdRef.current === job.id) { checkingRef.current = false; return; }
          connectedJobIdRef.current = job.id;
          
          // Check for stale builds (no update for 5 minutes)
          const lastUpdate = new Date(job.updated_at).getTime();
          if (Date.now() - lastUpdate > 5 * 60 * 1000) {
            console.warn("[build] Stale build detected, marking as failed:", job.id);
            await supabase.from("build_jobs").update({ status: "failed_timeout" }).eq("id", job.id);
            checkingRef.current = false;
            return;
          }

          dispatch({ type: "SET_STATUS", payload: { isBuilding: true, isThinking: true, activeJobId: job.id, serverSideBuild: true } });
          
          const curPhase = getCurrentPhaseFromStatus(job.status);
          const completedPh = getCompletedPhases(job);
          if (curPhase > 0) {
            const phaseInfo = BUILD_PHASES[curPhase - 1];
            dispatch({
              type: "SET_PHASE_PROGRESS",
              payload: {
                currentPhase: curPhase,
                totalPhases: 4,
                phaseLabel: phaseInfo?.label || "",
                completedPhases: completedPh,
                phaseFiles: {},
              },
            });
          }

          const assistantMsgId = crypto.randomUUID();
          addMessage({
            id: assistantMsgId,
            role: "assistant",
            content: `🔄 متصل ببناء جاري — المرحلة ${curPhase}/4`,
            timestamp: new Date(),
            isStreaming: true,
            pipelineStage: "building",
          });
          
          subscribeToJob(job.id, assistantMsgId);
          toast.info("🔄 متصل ببناء سيرفري جاري — يمكنك إغلاق المتصفح بأمان");
          checkingRef.current = false;
          return;
        }

        // Check for recently completed builds that weren't applied yet (user was away)
        const { data: completedJobs } = await supabase
          .from("build_jobs")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1);

        if (completedJobs && completedJobs.length > 0) {
          const job = completedJobs[0];
          
          // Skip if already applied this session
          if (appliedJobIdsRef.current.has(job.id)) { checkingRef.current = false; return; }
          
          const completedAt = new Date(job.completed_at || job.updated_at).getTime();
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          
          // Only auto-apply if completed recently (within 5 minutes)
          if (completedAt > fiveMinutesAgo) {
            appliedJobIdsRef.current.add(job.id);
            
            const allFiles = extractFilesFromJob(job);
            if (allFiles.length > 0) {
              const ops = allFiles.map((f: any) => ({
                path: f.name || f.path,
                content: f.content,
                action: "create" as const,
              }));
              await applyVFSOperations(ops, "بناء سيرفري مكتمل — مزامنة تلقائية");
              await saveProject();
              toast.success("✅ تم تطبيق البناء المكتمل تلقائياً!");

              const assistantMsgId = crypto.randomUUID();
              addMessage({
                id: assistantMsgId,
                role: "assistant",
                content: "✅ تم مزامنة البناء المكتمل تلقائياً — موقعك جاهز للمعاينة!",
                timestamp: new Date(),
                pipelineStage: "done",
              });
              await saveMessage({ role: "assistant", content: "تم مزامنة البناء المكتمل تلقائياً" });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to check active builds:", err);
      } finally {
        checkingRef.current = false;
      }
    };

    checkActiveBuilds();

    // Re-check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkActiveBuilds();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // --- Phase 1: Strategic Planning (Gemini 2.0 Flash Thinking) ---
  const handleSendMessage = useCallback(async (content: string, isFixAttempt: boolean = false) => {
    if (!userId) {
      toast.error("يرجى تسجيل الدخول للمتابعة");
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    await saveMessage({ role: "user", content });

    dispatch({ type: "SET_STATUS", payload: { isThinking: true, error: null } });

    const assistantMsgId = crypto.randomUUID();
    addMessage({
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      pipelineStage: "thinking",
    });

    abortControllerRef.current = new AbortController();
    let assistantContent = "";

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication failed");

      const vfsContext = files.map(f => {
        const lines = f.content.split('\n');
        return {
          path: f.name,
          type: 'file',
          language: f.language || 'tsx',
          lines: lines.length,
          size: f.content.length,
          preview: f.content.length <= 1500
            ? f.content
            : f.content.slice(0, 800) + '\n// ... [truncated] ...\n' + f.content.slice(-300),
        };
      });
      const conversationHistory = messages.map(({ role, content }) => ({ role, content }));

      await streamBarqPlanner(
        { 
          conversationHistory: [...conversationHistory, { role: "user", content }], 
          projectId,
          vfsContext
        },
        {
          onMessageDelta: (text) => {
            assistantContent += text;
            updateMessage(assistantMsgId, { content: assistantContent, pipelineStage: "planning" });
          },
          onBuildReady: (prompt, summary, projectName, dependencyGraph) => {
            dispatch({ 
              type: "SET_BUILD_PROMPT", 
              payload: { prompt, projectName, dependencyGraph } 
            });
            if (isFixAttempt) {
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: "fixing" } });
            }
            updateMessage(assistantMsgId, { 
              content: summary, 
              pipelineStage: "handoff",
              handoffPrompt: prompt,
            });
          },
          onDone: async () => {
            updateMessage(assistantMsgId, { isStreaming: false });
            saveMessage({ role: "assistant", content: assistantContent });
            if (state.fixSuggestion) {
              dispatch({ type: "SET_FIX_SUGGESTION", payload: null });
            }
          },
          onError: (error) => {
            throw new Error(error);
          },
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      const isAbort = err.name === "AbortError";
      const isAuth = err.message?.includes("تسجيل الدخول");
      const isRateLimit = err.message?.includes("429") || err.message?.includes("الحد");
      
      let errorMessage: string;
      if (isAbort) {
        errorMessage = "انقطع الاتصال.";
        toast.warning("انقطع الاتصال بالخدمة. حاول مرة ثانية.");
      } else if (isAuth) {
        errorMessage = "يرجى تسجيل الدخول أولاً";
        toast.error("انتهت جلسة تسجيل الدخول. يرجى إعادة تسجيل الدخول.");
      } else if (isRateLimit) {
        errorMessage = "وصلت للحد اليومي. حاول بكرة 😊";
        toast.error("وصلت للحد اليومي من الاستخدام. حاول مرة ثانية بكرة.");
      } else {
        errorMessage = err.message || "حدث خطأ غير متوقع.";
        toast.error(`خطأ: ${errorMessage}`);
      }
      
      updateMessage(assistantMsgId, { content: errorMessage, isStreaming: false });
      dispatch({ type: "SET_STATUS", payload: { error: errorMessage } });
      saveMessage({ role: "assistant", content: errorMessage });
    } finally {
      dispatch({ type: "SET_STATUS", payload: { isThinking: false } });
      abortControllerRef.current = null;
    }
  }, [userId, projectId, messages, files, addMessage, updateMessage, saveMessage, getAuthToken]);

  // --- Phase 2: Building ---
  // NEW BUILD → Server-side worker (survives browser close)
  // MODIFICATION → Client-side streaming (fast, single pass)
  const handleStartBuild = useCallback(async () => {
    if (!state.buildPrompt || !userId) return;

    dispatch({ type: "SET_STATUS", payload: { isBuilding: true, isThinking: true, error: null } });
    const buildPromptContent = state.buildPrompt;
    const currentDependencyGraph = state.dependencyGraph;
    const isModification = files.length > 0;

    // Request browser notification permission for server-side builds
    if (!isModification && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    dispatch({ type: "SET_BUILD_PROMPT", payload: { prompt: null } });

    const assistantMsgId = crypto.randomUUID();
    const thinkingSteps: ThinkingStep[] = [];
    const affectedFiles: string[] = [];
    const allFileBuffers = new Map<string, { content: string, action: VFSOperation['action'] }>();

    addMessage({
      id: assistantMsgId,
      role: "assistant",
      content: isModification ? "جاري تعديل الموقع..." : "جاري البناء على السيرفر... ⚡",
      timestamp: new Date(),
      isStreaming: true,
      thinkingSteps: [],
      affectedFiles: [],
      pipelineStage: "building",
      handoffPrompt: buildPromptContent,
    });

    abortControllerRef.current = new AbortController();

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication failed");

      if (isModification) {
        // ─── MODIFICATION MODE: client-side single-pass (fast) ───
        dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
        dispatch({ type: "SET_STATUS", payload: { serverSideBuild: false } });

        await streamBarqBuilder(
          {
            buildPrompt: buildPromptContent,
            projectId,
            dependencyGraph: currentDependencyGraph,
            existingFiles: files.map(f => ({ path: f.name, content: f.content, language: f.language || 'tsx' })),
          },
          {
            onThinkingStep: (step) => {
              const newStep: ThinkingStep = { id: String(thinkingSteps.length + 1), label: step, status: "completed" };
              thinkingSteps.push(newStep);
              updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });
            },
            onFileStart: (path, action) => {
              if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); }
              allFileBuffers.set(path, { content: "", action: (action as VFSOperation['action']) || 'update' });
            },
            onFileChunk: (path, chunk) => {
              const buf = allFileBuffers.get(path);
              if (buf) buf.content += chunk;
              else { allFileBuffers.set(path, { content: chunk, action: 'update' }); if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); } }
            },
            onFileDone: (path, content) => {
              const buf = allFileBuffers.get(path);
              if (buf) buf.content = content;
              else { allFileBuffers.set(path, { content, action: 'update' }); if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); } }
            },
            onDone: () => {},
            onError: (error) => { throw new Error(error); },
          },
          abortControllerRef.current.signal
        );

        // Apply modification files
        const finalOps: VFSOperation[] = Array.from(allFileBuffers.entries()).map(([path, data]) => ({
          path, content: data.content, action: data.action,
        }));

        dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
        updateMessage(assistantMsgId, { content: "اكتمل التعديل! جارٍ المراجعة التلقائية... 🔍", isStreaming: false, pipelineStage: "reviewing" });
        await saveMessage({ role: "assistant", content: "اكتمل التعديل!" });
        await saveProject();

        // Auto Review for modifications
        if (finalOps.length > 0 && buildPromptContent) {
          dispatch({ type: "SET_STATUS", payload: { reviewStatus: "reviewing" } });
          try {
            const reviewFiles = finalOps.map(op => ({
              path: op.path, content: op.content || "", language: op.path.endsWith(".css") ? "css" : "tsx",
            }));
            const reviewResult = await reviewBuild(buildPromptContent, reviewFiles);

            if (reviewResult.status === "approved") {
              fixAttemptsRef.current = 0;
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: "approved" } });
              const reviewMsgId = crypto.randomUUID();
              addMessage({ id: reviewMsgId, role: "assistant", content: `✅ ${reviewResult.summary_ar}`, timestamp: new Date(), pipelineStage: "done" });
              await saveMessage({ role: "assistant", content: `✅ ${reviewResult.summary_ar}` });
              setTimeout(() => dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } }), 4000);
            } else if (reviewResult.status === "needs_fix" && reviewResult.fix_prompt) {
              if (fixAttemptsRef.current >= MAX_FIX_ATTEMPTS) {
                fixAttemptsRef.current = 0;
                dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
                const issuesSummary = reviewResult.issues.map(i => `• ${i.file}: ${i.issue}`).join("\n");
                const reviewMsgId = crypto.randomUUID();
                addMessage({ id: reviewMsgId, role: "assistant", content: `⚠️ المراجعة وجدت مشاكل لم يتم حلها بعد ${MAX_FIX_ATTEMPTS} محاولات:\n${issuesSummary}`, timestamp: new Date(), pipelineStage: "done" });
                await saveMessage({ role: "assistant", content: reviewResult.summary_ar });
              } else {
                fixAttemptsRef.current += 1;
                dispatch({ type: "SET_STATUS", payload: { reviewStatus: "fixing" } });
                const issuesSummary = reviewResult.issues.map(i => `• ${i.file}: ${i.issue}`).join("\n");
                const reviewMsgId = crypto.randomUUID();
                addMessage({ id: reviewMsgId, role: "assistant", content: `🔧 المراجعة وجدت مشاكل (محاولة ${fixAttemptsRef.current}/${MAX_FIX_ATTEMPTS}):\n${issuesSummary}\n\nجارٍ الإصلاح التلقائي...`, timestamp: new Date() });
                await saveMessage({ role: "assistant", content: reviewResult.summary_ar });
                handleSendMessage(reviewResult.fix_prompt, true);
              }
            } else {
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
            }
          } catch (reviewErr: any) {
            console.warn("Auto-review failed (non-blocking):", reviewErr.message);
            dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
          }
        }

        dispatch({ type: "SET_STATUS", payload: { isBuilding: false, isThinking: false } });

      } else {
        // ─── NEW BUILD: Server-side worker (survives browser close) ───
        dispatch({ type: "SET_STATUS", payload: { serverSideBuild: true } });

        updateMessage(assistantMsgId, {
          content: "🚀 جاري تحميل القالب وإطلاق البناء على السيرفر...",
        });

        // Load template files from the registry before creating the job
        const templateId = currentDependencyGraph?.templateId;
        let templateFilesForJob: any[] = [];
        if (templateId && hasFullTemplate(templateId)) {
          try {
            const loaded = await loadTemplateFiles(templateId);
            templateFilesForJob = loaded.map(f => ({
              path: f.name,
              name: f.name,
              content: f.content,
              language: f.language || (f.name.endsWith(".css") ? "css" : "tsx"),
            }));
            console.log(`[build] Loaded ${templateFilesForJob.length} template files for ${templateId}`);
          } catch (err) {
            console.error("[build] Failed to load template files:", err);
          }
        }

        // Create job in DB with template files included
        const jobDependencyGraph = {
          ...currentDependencyGraph,
          templateFiles: templateFilesForJob,
        };

        const { data: newJob, error: jobErr } = await supabase
          .from("build_jobs")
          .insert({
            user_id: userId,
            prompt: buildPromptContent.slice(0, 500),
            build_prompt: buildPromptContent,
            dependency_graph: jobDependencyGraph,
            status: "building_phase_1",
            current_phase: 0,
          })
          .select("id")
          .single();

        if (jobErr || !newJob) throw new Error("فشل إنشاء عملية البناء");

        const jobId = newJob.id;
        dispatch({ type: "SET_STATUS", payload: { activeJobId: jobId } });
        dispatch({
          type: "SET_PHASE_PROGRESS",
          payload: {
            currentPhase: 1,
            totalPhases: 4,
            phaseLabel: BUILD_PHASES[0].label,
            completedPhases: [],
            phaseFiles: {},
          },
        });

        updateMessage(assistantMsgId, {
          content: `⚡ المرحلة 1/4: ${BUILD_PHASES[0].label} — ${BUILD_PHASES[0].files.join("، ")}`,
        });

        // Subscribe to Realtime for job updates
        subscribeToJob(jobId, assistantMsgId);

        // Trigger server-side worker (fire-and-forget)
        const workerUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-build-worker`;
        const resp = await fetch(workerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ job_id: jobId, phase_number: 1 }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "فشل الاتصال بالسيرفر" }));
          throw new Error(err.error || "Worker failed");
        }

        toast.success("🚀 بدأ البناء على السيرفر — يمكنك إغلاق المتصفح والعودة لاحقاً!");
        // Don't set isBuilding to false here — Realtime will handle completion
      }

    } catch (err: any) {
      const isAbort = err.name === "AbortError";
      const errorMessage = isAbort ? "تم إيقاف عملية البناء." : err.message || "حدث خطأ أثناء البناء.";
      updateMessage(assistantMsgId, { content: errorMessage, isStreaming: false });
      dispatch({ type: "SET_STATUS", payload: { error: errorMessage, isBuilding: false, isThinking: false, activeJobId: null, serverSideBuild: false } });
      dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
      if (isAbort) toast.warning("تم إيقاف البناء.");
      else toast.error(`فشل البناء: ${errorMessage}`);
      saveMessage({ role: "assistant", content: errorMessage });
    } finally {
      abortControllerRef.current = null;
    }
  }, [state.buildPrompt, state.dependencyGraph, userId, projectId, files, applyVFSOperations, addMessage, updateMessage, saveMessage, saveProject, getAuthToken, handleSendMessage, subscribeToJob]);

  // --- Phase 3: Error Fixing (Gemini 2.0 Flash) ---
  const handleFixError = useCallback(async (errorMessage: string, componentStack: string) => {
    if (!userId || !projectId) return;

    dispatch({ type: "SET_STATUS", payload: { reviewStatus: "fixing", error: null } });

    const assistantMsgId = crypto.randomUUID();
    addMessage({
      id: assistantMsgId,
      role: "assistant",
      content: "جاري تحليل الخطأ واقتراح إصلاح...",
      timestamp: new Date(),
      isStreaming: true,
    });

    abortControllerRef.current = new AbortController();

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication failed");

      await streamBarqFixer(
        {
          errorMessage,
          componentStack,
          vfsContext: files.map(f => ({ path: f.name, content: f.content }))
        },
        {
          onFixReady: (operations, summary) => {
            dispatch({ type: "SET_FIX_SUGGESTION", payload: { operations, summary } });
            updateMessage(assistantMsgId, { content: summary });
          },
          onDone: () => {
            updateMessage(assistantMsgId, { isStreaming: false });
          },
          onError: (error) => {
            throw new Error(error);
          },
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      const errorMsg = err.name === "AbortError" ? "تم إلغاء عملية الإصلاح." : err.message || "حدث خطأ أثناء محاولة الإصلاح.";
      updateMessage(assistantMsgId, { content: errorMsg, isStreaming: false });
      dispatch({ type: "SET_STATUS", payload: { error: errorMsg, reviewStatus: null } });
      toast.error(`فشل الإصلاح التلقائي: ${errorMsg}`);
    } finally {
      dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
      abortControllerRef.current = null;
    }
  }, [userId, projectId, files, addMessage, updateMessage, getAuthToken]);

  const handleApplyFix = useCallback(async () => {
    if (!state.fixSuggestion || !projectId) return;

    dispatch({ type: "SET_STATUS", payload: { isBuilding: true, reviewStatus: "fixing", error: null } });

    try {
      await applyVFSOperations(state.fixSuggestion.operations, "AI applied fix");
      toast.success("تم تطبيق الإصلاحات بنجاح! ✅");
      dispatch({ type: "SET_FIX_SUGGESTION", payload: null });
      dispatch({ type: "SET_STATUS", payload: { reviewStatus: "approved" } });
      await saveProject();
    } catch (err: any) {
      const errorMessage = err.message || "فشل تطبيق الإصلاحات.";
      toast.error(errorMessage);
      dispatch({ type: "SET_STATUS", payload: { error: errorMessage, reviewStatus: null } });
    } finally {
      dispatch({ type: "SET_STATUS", payload: { isBuilding: false } });
    }
  }, [state.fixSuggestion, projectId, applyVFSOperations, saveProject]);

  const handleRejectFix = useCallback(() => {
    dispatch({ type: "SET_FIX_SUGGESTION", payload: null });
    dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
    toast.info("تم رفض الإصلاح المقترح.");
  }, []);

  return {
    state,
    handleAbort,
    handleSendMessage,
    handleStartBuild,
    handleFixError,
    handleApplyFix,
    handleRejectFix,
  };
}
