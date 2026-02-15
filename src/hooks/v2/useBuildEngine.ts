
import { useState, useCallback, useRef, useReducer } from "react";
import { toast } from "sonner";
import { streamBarqPlanner, streamBarqBuilder, streamBarqFixer, reviewBuild } from "@/lib/barq-api";
import { VFSFile, VFSOperation } from "./useVFS";
import { ChatMessage, ThinkingStep } from "./useBuilderChat";

// --- Types and Interfaces ---

interface BuildEngineState {
  isThinking: boolean;
  isBuilding: boolean;
  buildPrompt: string | null;
  buildProjectName: string | null;
  reviewStatus: "reviewing" | "fixing" | "approved" | null;
  fixSuggestion: { operations: VFSOperation[]; summary: string } | null;
  error: string | null;
  dependencyGraph: any | null; // New: To store the structure planned by Gemini
}

type BuildEngineAction =
  | { type: "SET_STATUS"; payload: { isThinking?: boolean; isBuilding?: boolean; reviewStatus?: BuildEngineState["reviewStatus"]; error?: string | null } }
      | { type: "SET_BUILD_PROMPT"; payload: { prompt: string | null; projectName?: string | null; dependencyGraph?: any } }
      | { type: "SET_FIX_SUGGESTION"; payload: { operations: VFSOperation[]; summary: string } | null }
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
            updateMessage(assistantMsgId, { content: assistantContent });
          },
          onBuildReady: (prompt, summary, projectName, dependencyGraph) => {
            dispatch({ 
              type: "SET_BUILD_PROMPT", 
              payload: { prompt, projectName, dependencyGraph } 
            });
            if (isFixAttempt) {
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: "fixing" } });
            }
            updateMessage(assistantMsgId, { content: summary });
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
      const errorMessage = err.name === "AbortError" ? "انقطع الاتصال." : err.message || "حدث خطأ غير متوقع.";
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
    
    dispatch({ type: "SET_BUILD_PROMPT", payload: { prompt: null } });

    const assistantMsgId = crypto.randomUUID();
    const thinkingSteps: ThinkingStep[] = [];
    const affectedFiles: string[] = [];

    addMessage({
      id: assistantMsgId,
      role: "assistant",
      content: "جاري تنفيذ خطة البناء التكرارية...",
      timestamp: new Date(),
      isStreaming: true,
      thinkingSteps: [],
      affectedFiles: [],
    });

    abortControllerRef.current = new AbortController();
    
    const fileBuffers = new Map<string, { content: string, action: VFSOperation['action'] }>();

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication failed");

      await streamBarqBuilder(
        { 
          buildPrompt: buildPromptContent,
          projectId,
          dependencyGraph: currentDependencyGraph,
          existingFiles: files.map(f => ({
            path: f.name,
            content: f.content,
            language: f.language || 'tsx',
          }))
        },
        { // Callbacks object is now the second argument
          onThinkingStep: (step) => {
            const newStep: ThinkingStep = { id: String(thinkingSteps.length + 1), label: step, status: "completed" };
            thinkingSteps.push(newStep);
            updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });
          },
          onFileStart: (path, action) => {
            if (!affectedFiles.includes(path)) {
              affectedFiles.push(path);
              updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] });
            }
            fileBuffers.set(path, { content: "", action: (action as VFSOperation['action']) || 'create' });
          },
          onFileChunk: (path, chunk) => {
            const buffer = fileBuffers.get(path);
            if (buffer) {
              buffer.content += chunk;
            } else {
              // Handle case where file_start wasn't received
              fileBuffers.set(path, { content: chunk, action: 'create' });
              if (!affectedFiles.includes(path)) {
                affectedFiles.push(path);
                updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] });
              }
            }
          },
          onFileDone: (path, content) => {
            // file_done carries the full content - use it as the final source of truth
            const existing = fileBuffers.get(path);
            if (existing) {
              existing.content = content;
            } else {
              fileBuffers.set(path, { content, action: 'create' });
              if (!affectedFiles.includes(path)) {
                affectedFiles.push(path);
                updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] });
              }
            }
          },
          onDone: async () => {
            const finalOps: VFSOperation[] = Array.from(fileBuffers.entries()).map(([path, data]) => ({
              path,
              content: data.content,
              action: data.action
            }));

            if (finalOps.length > 0) {
              await applyVFSOperations(finalOps, "AI build update");
              toast.success("تم تحديث النظام بنجاح! ⚡");
            }
            
            updateMessage(assistantMsgId, { content: "اكتمل البناء! جارٍ المراجعة التلقائية... 🔍", isStreaming: false });
            await saveMessage({ role: "assistant", content: "اكتمل البناء!" });
            await saveProject();

            // --- Auto Review Phase ---
            if (finalOps.length > 0 && buildPromptContent) {
              dispatch({ type: "SET_STATUS", payload: { reviewStatus: "reviewing" } });
              try {
                const reviewFiles = finalOps.map(op => ({
                  path: op.path,
                  content: op.content || "",
                  language: op.path.endsWith(".css") ? "css" : "tsx",
                }));

                const reviewResult = await reviewBuild(buildPromptContent, reviewFiles);

                if (reviewResult.status === "approved") {
                  dispatch({ type: "SET_STATUS", payload: { reviewStatus: "approved" } });
                  const reviewMsgId = crypto.randomUUID();
                  addMessage({
                    id: reviewMsgId,
                    role: "assistant",
                    content: `✅ ${reviewResult.summary_ar}`,
                    timestamp: new Date(),
                  });
                  await saveMessage({ role: "assistant", content: `✅ ${reviewResult.summary_ar}` });
                  // Clear approved badge after 4s
                  setTimeout(() => dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } }), 4000);
                } else if (reviewResult.status === "needs_fix" && reviewResult.fix_prompt) {
                  dispatch({ type: "SET_STATUS", payload: { reviewStatus: "fixing" } });
                  const issuesSummary = reviewResult.issues
                    .map(i => `• ${i.file}: ${i.issue}`)
                    .join("\n");
                  const reviewMsgId = crypto.randomUUID();
                  addMessage({
                    id: reviewMsgId,
                    role: "assistant",
                    content: `🔧 المراجعة وجدت مشاكل:\n${issuesSummary}\n\nجارٍ الإصلاح التلقائي...`,
                    timestamp: new Date(),
                  });
                  await saveMessage({ role: "assistant", content: reviewResult.summary_ar });
                  // Auto-fix: re-send the fix prompt through the planner
                  handleSendMessage(reviewResult.fix_prompt, true);
                } else {
                  dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
                }
              } catch (reviewErr: any) {
                console.warn("Auto-review failed (non-blocking):", reviewErr.message);
                dispatch({ type: "SET_STATUS", payload: { reviewStatus: null } });
              }
            }
          },
          onError: (error) => {
            throw new Error(error);
          },
        },
        abortControllerRef.current.signal
      );

    } catch (err: any) {
      const errorMessage = err.name === "AbortError" ? "تم إيقاف عملية البناء." : err.message || "حدث خطأ أثناء البناء.";
      updateMessage(assistantMsgId, { content: errorMessage, isStreaming: false });
      dispatch({ type: "SET_STATUS", payload: { error: errorMessage } });
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
