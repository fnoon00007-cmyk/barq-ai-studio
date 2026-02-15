
import { useState, useCallback, useRef, useReducer } from "react";
import { toast } from "sonner";
import { streamBarqPlanner, streamBarqBuilder, streamBarqFixer, reviewBuild, BUILD_PHASES } from "@/lib/barq-api";
import { VFSFile, VFSOperation } from "./useVFS";
import { ChatMessage, ThinkingStep } from "./useBuilderChat";

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
}

type BuildEngineAction =
  | { type: "SET_STATUS"; payload: { isThinking?: boolean; isBuilding?: boolean; reviewStatus?: BuildEngineState["reviewStatus"]; error?: string | null } }
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

/**
 * useBuildEngine - The Core Orchestrator for Barq AI
 * Now upgraded to support Context-Aware Refinement and Iterative Builds.
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
  const MAX_FIX_ATTEMPTS = 2;

  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch({ type: "SET_STATUS", payload: { isThinking: false, isBuilding: false } });
      toast.info("تم إلغاء العملية.");
    }
  }, []);

  // --- Phase 1: Strategic Planning (Gemini 2.0 Flash Thinking) ---
  // Now context-aware: analyzes existing VFS to plan diffs or new components.
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

      // Enhanced Context-Aware Payload: structured metadata + content preview
      const vfsContext = files.map(f => {
        const lines = f.content.split('\n');
        return {
          path: f.name,
          type: 'file',
          language: f.language || 'tsx',
          lines: lines.length,
          size: f.content.length,
          // Send more content for smaller files, less for larger ones
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

  // --- Phase 2: Iterative Building (Groq Llama 3.3 70B) ---
  // Now supports parallel execution and targeted file updates (Diffs).
  const handleStartBuild = useCallback(async () => {
    if (!state.buildPrompt || !userId) return;

    dispatch({ type: "SET_STATUS", payload: { isBuilding: true, isThinking: true, error: null } });
    const buildPromptContent = state.buildPrompt;
    const currentDependencyGraph = state.dependencyGraph;
    const isModification = files.length > 0;
    
    dispatch({ type: "SET_BUILD_PROMPT", payload: { prompt: null } });

    const assistantMsgId = crypto.randomUUID();
    const thinkingSteps: ThinkingStep[] = [];
    const affectedFiles: string[] = [];
    const allFileBuffers = new Map<string, { content: string, action: VFSOperation['action'] }>();

    addMessage({
      id: assistantMsgId,
      role: "assistant",
      content: isModification ? "جاري تعديل الموقع..." : "جاري البناء على مراحل... ⚡",
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
        // ─── MODIFICATION MODE: single-pass, no phases ───
        dispatch({ type: "SET_PHASE_PROGRESS", payload: null });

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
      } else {
        // ─── NEW BUILD: multi-phase (4 phases) ───
        for (let phaseNum = 1; phaseNum <= 4; phaseNum++) {
          if (abortControllerRef.current?.signal.aborted) break;

          const phase = BUILD_PHASES[phaseNum - 1];
          
          dispatch({
            type: "SET_PHASE_PROGRESS",
            payload: {
              currentPhase: phaseNum,
              totalPhases: 4,
              phaseLabel: phase.label,
              completedPhases: Array.from({ length: phaseNum - 1 }, (_, i) => i + 1),
              phaseFiles: {},
            },
          });

          updateMessage(assistantMsgId, {
            content: `⚡ المرحلة ${phaseNum}/4: ${phase.label} — ${phase.files.join("، ")}`,
          });

          // Add phase thinking step
          const phaseStep: ThinkingStep = { id: `phase-${phaseNum}`, label: `المرحلة ${phaseNum}: ${phase.label} (${phase.files.join(", ")})`, status: "loading" };
          thinkingSteps.push(phaseStep);
          updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });

          // Collect files from previous phases as context for consistency
          const existingFromPrevPhases = Array.from(allFileBuffers.entries()).map(([path, data]) => ({
            path,
            content: data.content,
            language: path.endsWith(".css") ? "css" : "tsx",
          }));

          const phaseFileBuffers = new Map<string, { content: string, action: VFSOperation['action'] }>();

          await streamBarqBuilder(
            {
              buildPrompt: buildPromptContent,
              projectId,
              dependencyGraph: currentDependencyGraph,
              existingFiles: existingFromPrevPhases,
              phase: phaseNum,
            },
            {
              onThinkingStep: (step) => {
                const newStep: ThinkingStep = { id: String(thinkingSteps.length + 1), label: step, status: "completed" };
                thinkingSteps.push(newStep);
                updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });
              },
              onFileStart: (path, action) => {
                if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); }
                phaseFileBuffers.set(path, { content: "", action: (action as VFSOperation['action']) || 'create' });
              },
              onFileChunk: (path, chunk) => {
                const buf = phaseFileBuffers.get(path);
                if (buf) buf.content += chunk;
                else { phaseFileBuffers.set(path, { content: chunk, action: 'create' }); if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); } }
              },
              onFileDone: (path, content) => {
                const buf = phaseFileBuffers.get(path);
                if (buf) buf.content = content;
                else { phaseFileBuffers.set(path, { content, action: 'create' }); if (!affectedFiles.includes(path)) { affectedFiles.push(path); updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] }); } }
              },
              onDone: () => {},
              onError: (error) => { throw new Error(error); },
            },
            abortControllerRef.current.signal
          );

          // Apply this phase's files immediately
          const phaseOps: VFSOperation[] = Array.from(phaseFileBuffers.entries()).map(([path, data]) => ({
            path, content: data.content, action: data.action,
          }));

          if (phaseOps.length > 0) {
            await applyVFSOperations(phaseOps, `المرحلة ${phaseNum}: ${phase.label}`);
            // Merge into allFileBuffers
            for (const [path, data] of phaseFileBuffers) {
              allFileBuffers.set(path, data);
            }
          }

          // Mark phase step as completed
          const stepIdx = thinkingSteps.findIndex(s => s.id === `phase-${phaseNum}`);
          if (stepIdx >= 0) {
            thinkingSteps[stepIdx].status = "completed";
            updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });
          }

          toast.success(`المرحلة ${phaseNum}/4 اكتملت: ${phase.label} ⚡`);
        }
      }

      // All phases done — finalize
      const finalOps: VFSOperation[] = Array.from(allFileBuffers.entries()).map(([path, data]) => ({
        path, content: data.content, action: data.action,
      }));

      dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
      updateMessage(assistantMsgId, { content: "اكتمل البناء! جارٍ المراجعة التلقائية... 🔍", isStreaming: false, pipelineStage: "reviewing" });
      await saveMessage({ role: "assistant", content: "اكتمل البناء!" });
      await saveProject();

      // --- Auto Review Phase ---
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

    } catch (err: any) {
      const isAbort = err.name === "AbortError";
      const errorMessage = isAbort ? "تم إيقاف عملية البناء." : err.message || "حدث خطأ أثناء البناء.";
      updateMessage(assistantMsgId, { content: errorMessage, isStreaming: false });
      dispatch({ type: "SET_STATUS", payload: { error: errorMessage } });
      dispatch({ type: "SET_PHASE_PROGRESS", payload: null });
      if (isAbort) toast.warning("تم إيقاف البناء.");
      else toast.error(`فشل البناء: ${errorMessage}`);
      saveMessage({ role: "assistant", content: errorMessage });
    } finally {
      dispatch({ type: "SET_STATUS", payload: { isBuilding: false, isThinking: false } });
      abortControllerRef.current = null;
    }
  }, [state.buildPrompt, state.dependencyGraph, userId, projectId, files, applyVFSOperations, addMessage, updateMessage, saveMessage, saveProject, getAuthToken, handleSendMessage]);

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
          vfsContext: files.map(f => ({ path: f.name, content: f.content })) // Send full VFS for context
        },
        {
          onFixReady: (operations, summary) => {
            dispatch({ type: "SET_FIX_SUGGESTION", payload: { operations, summary } });
            updateMessage(assistantMsgId, { content: summary });
          },
          onDone: () => {
            updateMessage(assistantMsgId, { isStreaming: false });
            // No need to save message here, fix suggestion is handled separately
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
