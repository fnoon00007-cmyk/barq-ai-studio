import { useState, useCallback, useRef } from "react";
import { streamBarqPlanner, streamBarqBuilder, reviewBuild } from "@/lib/barq-api";
import { ChatMessage, ThinkingStep, ActivityLogEntry } from "@/hooks/useVFS";
import { VFSFile } from "@/hooks/useVFS";
import { toast } from "sonner";

interface UseBuildEngineProps {
  addLogEntry: (type: ActivityLogEntry["type"], message: string) => void;
  applyVFSOperations: (ops: { path: string; action: "create" | "update"; content: string; language: string }[]) => void;
  saveMessage: (role: "user" | "assistant", content: string) => void;
  saveProject: () => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  messages: ChatMessage[];
  files: VFSFile[];
  setMobileView: (view: "preview" | "chat") => void;
}

export function useBuildEngine({
  addLogEntry,
  applyVFSOperations,
  saveMessage,
  saveProject,
  addMessage,
  updateMessage,
  messages,
  files,
  setMobileView,
}: UseBuildEngineProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildPrompt, setBuildPrompt] = useState<string | null>(null);
  const [buildProjectName, setBuildProjectName] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAbort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsThinking(false);
  }, []);

  const handleStartBuild = useCallback(
    async (prompt: string) => {
      if (isBuilding) return;
      setIsBuilding(true);
      setIsThinking(true);
      setBuildPrompt(null);

      const assistantMsgId = crypto.randomUUID();
      let assistantContent = "";
      const thinkingSteps: ThinkingStep[] = [];
      const affectedFiles: string[] = [];
      const pendingOps: { path: string; action: "create" | "update"; content: string; language: string }[] = [];

      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "جاري بناء موقعك... ⚡",
        timestamp: new Date(),
        isStreaming: true,
        thinkingSteps: [],
        affectedFiles: [],
      });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const safetyTimeout = setTimeout(() => {
        abortController.abort();
        toast.error("انتهت مهلة البناء، حاول مرة أخرى");
      }, 120_000);

      try {
        await streamBarqBuilder(
          { buildPrompt: prompt, projectId: null, dependencyGraph: null, existingFiles: files.map(f => ({ path: f.name || (f as any).path, content: f.content })) },
          {
            onThinkingStart: () => addLogEntry("read", "تحليل وتخطيط البناء..."),
            onThinkingStep: (step) => {
              const newStep: ThinkingStep = { id: String(thinkingSteps.length), label: step, status: "completed" };
              thinkingSteps.push(newStep);
              updateMessage(assistantMsgId, { thinkingSteps: [...thinkingSteps] });
            },
            onFileStart: (path, action) => {
              addLogEntry(action === "create" ? "create" : "update", `${action === "create" ? "إنشاء" : "تحديث"} ${path}...`);
              if (!affectedFiles.includes(path)) affectedFiles.push(path);
              updateMessage(assistantMsgId, { affectedFiles: [...affectedFiles] });
            },
            onFileDone: (path, fileContent) => {
              pendingOps.push({ path, action: "create", content: fileContent, language: path.endsWith(".css") ? "css" : "tsx" });
            },
            onMessageDelta: (text) => {
              assistantContent += text;
              updateMessage(assistantMsgId, { content: assistantContent });
            },
            onDone: async () => {
              if (pendingOps.length > 0) {
                applyVFSOperations(pendingOps);
                updateMessage(assistantMsgId, { isStreaming: false });

                // === REVIEW PHASE ===
                setReviewStatus("reviewing");
                addLogEntry("read", "مراجعة الملفات بواسطة المدير (Gemini)...");
                try {
                  const reviewResult = await reviewBuild(prompt, pendingOps);
                  if (reviewResult.status === "approved") {
                    setReviewStatus("approved");
                    addLogEntry("complete", "✅ تمت المراجعة — الموقع مكتمل!");
                    toast.success("تمت المراجعة بنجاح! الموقع مكتمل ⚡");
                  } else {
                    setReviewStatus("fixing");
                    addLogEntry("update", `🔧 تم اكتشاف ${reviewResult.issues.length} مشكلة — جاري الإصلاح...`);
                    
                    const reviewMsgId = crypto.randomUUID();
                    addMessage({
                      id: reviewMsgId,
                      role: "assistant",
                      content: `🔍 مراجعة المدير:\n${reviewResult.summary_ar}\n\nجاري إصلاح ${reviewResult.issues.length} مشكلة تلقائياً...`,
                      timestamp: new Date(),
                    });

                    if (reviewResult.fix_prompt) {
                      const fixPrompt = `${prompt}\n\n## FIX INSTRUCTIONS:\n${reviewResult.fix_prompt}\n\n## EXISTING FILES:\n${pendingOps.map(f => `- ${f.path}`).join("\n")}\n\nFix the issues and regenerate ONLY the affected files.`;
                      
                      const fixOps: typeof pendingOps = [];
                      await streamBarqBuilder(
                        { buildPrompt: fixPrompt, projectId: null, dependencyGraph: null, existingFiles: pendingOps.map(f => ({ path: f.path, content: f.content })) },
                        {
                        onFileStart: (path) => addLogEntry("update", `إصلاح ${path}...`),
                        onFileDone: (path, content) => {
                          fixOps.push({ path, action: "update", content, language: path.endsWith(".css") ? "css" : "tsx" });
                        },
                        onDone: () => {
                          if (fixOps.length > 0) {
                            applyVFSOperations(fixOps);
                          }
                          setReviewStatus("approved");
                          addLogEntry("complete", "✅ تم الإصلاح — الموقع مكتمل!");
                          toast.success("تم إصلاح المشاكل! الموقع مكتمل ⚡");
                        },
                      });
                    }
                  }
                } catch (reviewErr) {
                  console.error("Review error:", reviewErr);
                  setReviewStatus(null);
                }

                toast("المعاينة جاهزة! ⚡", {
                  description: "تم بناء موقعك بنجاح",
                  action: { label: "انتقل للمعاينة", onClick: () => setMobileView("preview") },
                  duration: 10000,
                });
              }
              updateMessage(assistantMsgId, { isStreaming: false });
            },
          },
          abortController.signal
        );
        saveMessage("assistant", assistantContent);
        if (pendingOps.length > 0) setTimeout(() => saveProject(), 500);
      } catch (err: any) {
        if (err.name === "AbortError") {
          if (assistantContent) {
            updateMessage(assistantMsgId, { isStreaming: false });
            saveMessage("assistant", assistantContent);
          } else {
            updateMessage(assistantMsgId, { content: "انقطع الاتصال، حاول مرة أخرى ⚡", isStreaming: false });
          }
        } else {
          console.error("Barq Builder error:", err);
          toast.error(err.message || "حدث خطأ أثناء البناء");
          const errContent = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
          updateMessage(assistantMsgId, { content: errContent, isStreaming: false });
          saveMessage("assistant", errContent);
        }
      } finally {
        clearTimeout(safetyTimeout);
        setIsThinking(false);
        setIsBuilding(false);
        abortControllerRef.current = null;
      }
    },
    [addLogEntry, applyVFSOperations, saveMessage, saveProject, addMessage, updateMessage, files, setMobileView, isBuilding]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      addMessage(userMsg);
      saveMessage("user", content);
      setIsThinking(true);

      let userContent = content;
      if (files.length > 0) {
        const fileList = files.map((f) => f.name || (f as any).path).join(", ");
        userContent = `[existing_files: ${fileList}]\n${content}`;
      }

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userContent },
      ];

      const assistantMsgId = crypto.randomUUID();
      let assistantContent = "";

      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const safetyTimeout = setTimeout(() => {
        abortController.abort();
        toast.error("انتهت مهلة الاتصال، حاول مرة أخرى");
      }, 50_000);

      try {
        await streamBarqPlanner(
          { conversationHistory: conversationHistory, projectId: null, vfsContext: files.map(f => ({ path: f.name || (f as any).path, type: 'file' })) },
          {
            onMessageDelta: (text) => {
              assistantContent += text;
              updateMessage(assistantMsgId, { content: assistantContent });
            },
            onBuildReady: (prompt, summary, projectName) => {
              setBuildPrompt(prompt);
              if (projectName) {
                setBuildProjectName(projectName);
              }
              return projectName;
            },
            onDone: () => {
              updateMessage(assistantMsgId, { isStreaming: false });
            },
          },
          abortController.signal
        );
        saveMessage("assistant", assistantContent);
      } catch (err: any) {
        if (err.name === "AbortError") {
          if (assistantContent) {
            updateMessage(assistantMsgId, { isStreaming: false });
            saveMessage("assistant", assistantContent);
          } else {
            updateMessage(assistantMsgId, { content: "انقطع الاتصال، حاول مرة أخرى ⚡", isStreaming: false });
          }
        } else {
          console.error("Barq Planner error:", err);
          toast.error(err.message || "حدث خطأ");
          const errContent = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
          updateMessage(assistantMsgId, { content: errContent, isStreaming: false });
          saveMessage("assistant", errContent);
        }
      } finally {
        clearTimeout(safetyTimeout);
        setIsThinking(false);
        abortControllerRef.current = null;
      }
    },
    [messages, saveMessage, addMessage, updateMessage, files]
  );

  return {
    isThinking,
    isBuilding,
    buildPrompt,
    buildProjectName,
    reviewStatus,
    handleAbort,
    handleStartBuild,
    handleSendMessage,
    setBuildPrompt,
  };
}
