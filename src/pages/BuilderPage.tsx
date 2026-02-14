import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { useVFS } from "@/hooks/useVFS";
import { streamBarqPlanner, streamBarqBuilder, reviewBuild, githubExportAction } from "@/lib/barq-api";
import { toast } from "sonner";
import { ThinkingEngine } from "@/components/ThinkingEngine";
import { PreviewPanel } from "@/components/PreviewPanel";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, Bot, User, Info, Plus, PanelLeftClose, PanelLeft, LogOut, FolderOpen, FileCode, Save, Smartphone, Tablet, Monitor, Github, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function BuilderPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { files, addLogEntry, applyVFSOperations, activityLog } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "details" | "code">("chat");
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [mobileView, setMobileView] = useState<"preview" | "chat">("chat");
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [projectTitle, setProjectTitle] = useState("مشروع جديد");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [buildPrompt, setBuildPrompt] = useState<string | null>(null);
  const [buildProjectName, setBuildProjectName] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showGithubExport, setShowGithubExport] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubExporting, setGithubExporting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const promptSentRef = useRef(false);
  const navigate = useNavigate();

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load project data if projectId exists
  useEffect(() => {
    if (!projectId) return;
    setCurrentProjectId(projectId);
    supabase
      .from("projects")
      .select("title, vfs_data")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProjectTitle(data.title || "مشروع جديد");
          if (data.vfs_data && Array.isArray(data.vfs_data)) {
            applyVFSOperations(
              (data.vfs_data as any[]).map((f: any) => ({
                path: f.name || f.path,
                action: "create" as const,
                content: f.content,
                language: f.language || "tsx",
              }))
            );
          }
        }
      });
  }, [projectId]);

  // Load messages from DB
  useEffect(() => {
    if (!userId) return;
    setLoadingMessages(true);
    const query = supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (currentProjectId) {
      query.eq("project_id", currentProjectId);
    } else {
      query.is("project_id", null);
    }

    query.then(({ data, error }) => {
      if (!error && data) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      }
      setLoadingMessages(false);
    });
  }, [userId, currentProjectId]);

  // Handle prompt from landing page
  useEffect(() => {
    if (promptSentRef.current) return;
    const prompt = searchParams.get("prompt");
    if (prompt && userId && !loadingMessages) {
      promptSentRef.current = true;
      handleSendMessage(prompt);
    }
  }, [searchParams, userId, loadingMessages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!userId) return;
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role,
        content,
        project_id: currentProjectId,
      });
    },
    [userId, currentProjectId]
  );

  // Save VFS to project
  const saveProject = useCallback(async () => {
    if (!userId || files.length === 0) return;

    if (!currentProjectId) {
      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: projectTitle,
          user_id: userId,
          status: "draft",
          vfs_data: files as any,
        })
        .select("id")
        .single();

      if (!error && data) {
        setCurrentProjectId(data.id);
        navigate(`/builder/${data.id}`, { replace: true });
        toast.success("تم حفظ المشروع ⚡");
      }
    } else {
      // Update existing
      await supabase
        .from("projects")
        .update({ vfs_data: files as any, updated_at: new Date().toISOString() })
        .eq("id", currentProjectId);
      toast.success("تم حفظ المشروع ⚡");
    }
  }, [userId, files, currentProjectId, projectTitle, navigate]);

  // Auto-save project when files change
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userId || files.length === 0) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveProject();
    }, 2000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [files, userId, saveProject]);

  const clearMessages = useCallback(async () => {
    if (!userId) return;
    setMessages([]);
    const query = supabase.from("chat_messages").delete().eq("user_id", userId);
    if (currentProjectId) {
      query.eq("project_id", currentProjectId);
    } else {
      query.is("project_id", null);
    }
    await query;
  }, [userId, currentProjectId]);

  // Handle build execution (called when user clicks "ابدأ البناء")
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

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "جاري بناء موقعك... ⚡",
          timestamp: new Date(),
          isStreaming: true,
          thinkingSteps: [],
          affectedFiles: [],
        },
      ]);

      const updateAssistantMsg = (updates: Partial<ChatMessage>) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, ...updates } : m))
        );
      };

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const safetyTimeout = setTimeout(() => {
        abortController.abort();
        toast.error("انتهت مهلة البناء، حاول مرة أخرى");
      }, 120_000); // 2 minutes for build

      try {
        await streamBarqBuilder(
          prompt,
          {
            onThinkingStart: () => addLogEntry("read", "تحليل وتخطيط البناء..."),
            onThinkingStep: (step) => {
              const newStep: ThinkingStep = { id: String(thinkingSteps.length), label: step, status: "completed" };
              thinkingSteps.push(newStep);
              updateAssistantMsg({ thinkingSteps: [...thinkingSteps] });
            },
            onFileStart: (path, action) => {
              addLogEntry(action === "create" ? "create" : "update", `${action === "create" ? "إنشاء" : "تحديث"} ${path}...`);
              if (!affectedFiles.includes(path)) affectedFiles.push(path);
              updateAssistantMsg({ affectedFiles: [...affectedFiles] });
            },
            onFileDone: (path, fileContent) => {
              pendingOps.push({ path, action: "create", content: fileContent, language: path.endsWith(".css") ? "css" : "tsx" });
            },
            onMessageDelta: (text) => {
              assistantContent += text;
              updateAssistantMsg({ content: assistantContent });
            },
            onDone: async () => {
              if (pendingOps.length > 0) {
                applyVFSOperations(pendingOps);
                updateAssistantMsg({ isStreaming: false });

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
                    
                    // Show review summary
                    const reviewMsgId = crypto.randomUUID();
                    setMessages((prev) => [...prev, {
                      id: reviewMsgId,
                      role: "assistant",
                      content: `🔍 مراجعة المدير:\n${reviewResult.summary_ar}\n\nجاري إصلاح ${reviewResult.issues.length} مشكلة تلقائياً...`,
                      timestamp: new Date(),
                    }]);

                    // Send fix prompt to Groq
                    if (reviewResult.fix_prompt) {
                      const fixPrompt = `${prompt}\n\n## FIX INSTRUCTIONS:\n${reviewResult.fix_prompt}\n\n## EXISTING FILES:\n${pendingOps.map(f => `- ${f.path}`).join("\n")}\n\nFix the issues and regenerate ONLY the affected files.`;
                      
                      const fixOps: typeof pendingOps = [];
                      await streamBarqBuilder(fixPrompt, {
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
                  // Review failed but build succeeded - still ok
                }

                toast("المعاينة جاهزة! ⚡", {
                  description: "تم بناء موقعك بنجاح",
                  action: { label: "انتقل للمعاينة", onClick: () => setMobileView("preview") },
                  duration: 10000,
                });
              }
              updateAssistantMsg({ isStreaming: false });
            },
          },
          abortController.signal
        );
        saveMessage("assistant", assistantContent);
        if (pendingOps.length > 0) setTimeout(() => saveProject(), 500);
      } catch (err: any) {
        if (err.name === "AbortError") {
          if (assistantContent) {
            updateAssistantMsg({ isStreaming: false });
            saveMessage("assistant", assistantContent);
          } else {
            updateAssistantMsg({ content: "انقطع الاتصال، حاول مرة أخرى ⚡", isStreaming: false });
          }
        } else {
          console.error("Barq Builder error:", err);
          toast.error(err.message || "حدث خطأ أثناء البناء");
          const errContent = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
          updateAssistantMsg({ content: errContent, isStreaming: false });
          saveMessage("assistant", errContent);
        }
      } finally {
        clearTimeout(safetyTimeout);
        setIsThinking(false);
        setIsBuilding(false);
        abortControllerRef.current = null;
      }
    },
    [addLogEntry, applyVFSOperations, saveMessage, saveProject]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      saveMessage("user", content);
      setIsThinking(true);
      setActiveTab("chat");

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      const assistantMsgId = crypto.randomUUID();
      let assistantContent = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      const updateAssistantMsg = (updates: Partial<ChatMessage>) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, ...updates } : m))
        );
      };

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const safetyTimeout = setTimeout(() => {
        abortController.abort();
        toast.error("انتهت مهلة الاتصال، حاول مرة أخرى");
      }, 50_000);

      try {
        await streamBarqPlanner(
          conversationHistory,
          {
            onMessageDelta: (text) => {
              assistantContent += text;
              updateAssistantMsg({ content: assistantContent });
            },
            onBuildReady: (prompt, summary, projectName) => {
              setBuildPrompt(prompt);
              if (projectName) {
                setBuildProjectName(projectName);
                setProjectTitle(projectName);
              }
            },
            onDone: () => {
              updateAssistantMsg({ isStreaming: false });
            },
          },
          abortController.signal
        );
        saveMessage("assistant", assistantContent);
      } catch (err: any) {
        if (err.name === "AbortError") {
          if (assistantContent) {
            updateAssistantMsg({ isStreaming: false });
            saveMessage("assistant", assistantContent);
          } else {
            updateAssistantMsg({ content: "انقطع الاتصال، حاول مرة أخرى ⚡", isStreaming: false });
          }
        } else {
          console.error("Barq Planner error:", err);
          toast.error(err.message || "حدث خطأ");
          const errContent = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
          updateAssistantMsg({ content: errContent, isStreaming: false });
          saveMessage("assistant", errContent);
        }
      } finally {
        clearTimeout(safetyTimeout);
        setIsThinking(false);
        abortControllerRef.current = null;
      }
    },
    [messages, saveMessage]
  );

  const handleAbort = () => {
    abortControllerRef.current?.abort();
    setIsThinking(false);
  };

  const handleSubmit = () => {
    if (!input.trim() || isThinking) return;
    handleSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // GitHub OAuth callback handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !githubToken) {
      githubExportAction("exchange_code", { code }).then((data) => {
        if (data.access_token) {
          setGithubToken(data.access_token);
          setShowGithubExport(true);
          toast.success("تم ربط GitHub بنجاح! ⚡");
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);
        }
      }).catch((err) => {
        toast.error("فشل ربط GitHub: " + err.message);
      });
    }
  }, []);

  const handleGithubExport = async (mode: "new" | "existing", repoName?: string) => {
    if (!githubToken || files.length === 0) return;
    setGithubExporting(true);

    try {
      let repoFullName: string;

      if (mode === "new") {
        const name = repoName || projectTitle.replace(/\s+/g, "-").toLowerCase();
        const { repo } = await githubExportAction("create_repo", { repo_name: name }, githubToken);
        repoFullName = repo.full_name;
        // Wait for GitHub to init the repo
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        repoFullName = repoName!;
      }

      const vfsFiles = files.map((f) => ({
        path: f.name,
        content: f.content,
        language: f.language,
      }));

      await githubExportAction("push_files", { repo_full_name: repoFullName, files: vfsFiles }, githubToken);
      toast.success("تم تصدير المشروع لـ GitHub بنجاح! ⚡");
      window.open(`https://github.com/${repoFullName}`, "_blank");
      setShowGithubExport(false);
    } catch (err: any) {
      toast.error(err.message || "فشل التصدير");
    } finally {
      setGithubExporting(false);
    }
  };

  const handleConnectGithub = async () => {
    try {
      const { url } = await githubExportAction("get_auth_url");
      window.location.href = url;
    } catch (err: any) {
      toast.error("فشل الاتصال بـ GitHub: " + err.message);
    }
  };

  // ---- Chat Panel Content ----
  const chatPanel = (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">{projectTitle}</h1>
            <p className="text-[11px] text-muted-foreground">برق AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {files.length > 0 && (
            <button
              onClick={saveProject}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="حفظ المشروع"
            >
              <Save className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => navigate("/projects")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="المشاريع"
          >
            <FolderOpen className="h-4 w-4" />
          </button>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="تسجيل خروج"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChatPanelOpen(false)}
            className="w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden lg:flex"
            title="إخفاء المحادثة"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "chat"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          محادثة
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "code"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          الكود
          {files.length > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{files.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "details"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          تفاصيل
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" ? (
          <div className="px-4 py-4 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-5 py-16">
                <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center animate-pulse-glow">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">مرحباً بك في برق ⚡</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    أخبرني عن مشروعك وسأساعدك في بناء موقع احترافي
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["أبي موقع لمطعم 🍕", "أبي متجر إلكتروني 🛒", "أبي محفظة أعمال 💼"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSendMessage(s)}
                      className="text-sm px-4 py-2 rounded-xl border border-border bg-secondary text-secondary-foreground hover:border-primary/50 hover:bg-secondary/80 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((msg) => (
              <div key={msg.id} className="animate-slide-up">
                <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary/20" : "bg-accent/20"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-accent" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary/15 text-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && !msg.content && (
                        <span className="inline-flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-1" />
                          <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-2" />
                          <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-3" />
                        </span>
                      )}
                    </div>
                    {msg.role === "assistant" && (msg.thinkingSteps?.length || msg.affectedFiles?.length) ? (
                      <ThinkingEngine
                        steps={msg.thinkingSteps || []}
                        affectedFiles={msg.affectedFiles}
                        isComplete={!msg.isStreaming}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {/* Build Ready Button */}
            {buildPrompt && !isBuilding && !isThinking && (
              <div className="flex justify-center animate-slide-up">
                <button
                  onClick={() => handleStartBuild(buildPrompt)}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  ابدأ البناء ⚡
                </button>
              </div>
            )}

            {isThinking && !messages.some((m) => m.isStreaming) && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-1" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-2" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : activeTab === "code" ? (
          <div className="flex flex-col h-full">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileCode className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">لم يتم إنشاء ملفات بعد</p>
              </div>
            ) : (
              <>
                {/* File tabs */}
                <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto border-b border-border">
                  {files.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFile(f.name)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-mono whitespace-nowrap transition-colors ${
                        activeFile === f.name || (!activeFile && f.name === files[0]?.name)
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                {/* Code content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-xs leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap" dir="ltr">
                    {(files.find((f) => f.name === (activeFile || files[0]?.name)))?.content || ""}
                  </pre>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">سجل النشاط</h3>
            </div>
            {activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد نشاط بعد</p>
            ) : (
              activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 text-sm">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                    entry.type === "complete" ? "bg-green-500/15 text-green-400" :
                    entry.type === "create" ? "bg-primary/15 text-primary" :
                    "bg-accent/15 text-accent"
                  }`}>
                    {entry.type === "complete" ? "تم" : entry.type === "create" ? "إنشاء" : entry.type === "update" ? "تحديث" : "قراءة"}
                  </span>
                  <span className="text-muted-foreground">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="flex items-end gap-2 bg-secondary rounded-2xl p-2.5 border border-border focus-within:border-primary/50 transition-colors">
          <button
            onClick={() => { clearMessages(); navigate("/builder"); }}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="محادثة جديدة"
          >
            <Plus className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اسأل برق..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-base text-foreground placeholder:text-muted-foreground focus:outline-none py-2 px-2 max-h-24"
            disabled={isThinking}
          />
          {isThinking ? (
            <button
              onClick={handleAbort}
              className="w-10 h-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center shrink-0"
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-destructive-foreground" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ---- Preview Panel Content ----
  const previewPanel = (
    <div className="flex flex-col h-full bg-background">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {!chatPanelOpen && (
            <button
              onClick={() => setChatPanelOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="إظهار المحادثة"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 min-w-[200px]">
            <div className={`w-2 h-2 rounded-full ${files.length > 0 ? "bg-green-500" : "bg-muted-foreground/30"}`} />
            <span className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
              {projectTitle.replace(/\s/g, "-").toLowerCase()}.barq.app
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Device toggle buttons */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                previewDevice === "mobile" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="موبايل"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                previewDevice === "tablet" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="تابلت"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                previewDevice === "desktop" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="ديسكتوب"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
          {files.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground mr-2">{files.length} ملفات</span>
              <button
                onClick={() => githubToken ? setShowGithubExport(true) : handleConnectGithub()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground hover:bg-muted transition-colors"
                title="تصدير لـ GitHub"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-hidden flex items-start justify-center bg-muted/30">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${
            previewDevice === "mobile"
              ? "w-[375px] border-x border-border shadow-lg rounded-b-xl"
              : previewDevice === "tablet"
              ? "w-[768px] border-x border-border shadow-lg rounded-b-xl"
              : "w-full"
          }`}
        >
          <PreviewPanel files={files} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Mobile */}
      <div className="lg:hidden flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{projectTitle}</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setMobileView("chat")}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                mobileView === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              محادثة
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                mobileView === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              معاينة
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate("/projects")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
              <FolderOpen className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileView === "chat" ? chatPanel : previewPanel}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={chatPanelOpen ? 55 : 100} minSize={30}>
            {previewPanel}
          </ResizablePanel>
          {chatPanelOpen && (
            <>
              <ResizableHandle withHandle className="bg-border hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={45} minSize={25} maxSize={60}>
                {chatPanel}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* GitHub Export Modal */}
      {showGithubExport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !githubExporting && setShowGithubExport(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">تصدير لـ GitHub</h3>
                <p className="text-xs text-muted-foreground">اختر طريقة التصدير</p>
              </div>
            </div>

            {githubExporting ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">جاري تصدير المشروع...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleGithubExport("new")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary hover:bg-muted transition-colors text-right"
                >
                  <Plus className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-foreground">ريبو جديد</p>
                    <p className="text-xs text-muted-foreground">إنشاء ريبو جديد باسم المشروع</p>
                  </div>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { repos } = await githubExportAction("list_repos", {}, githubToken!);
                      const repoName = prompt("اختر اسم الريبو:\n" + repos.map((r: any) => r.full_name).join("\n"));
                      if (repoName) handleGithubExport("existing", repoName);
                    } catch (err: any) {
                      toast.error(err.message);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary hover:bg-muted transition-colors text-right"
                >
                  <ExternalLink className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-foreground">ريبو موجود</p>
                    <p className="text-xs text-muted-foreground">دفع الملفات لريبو موجود</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Status Badge */}
      {reviewStatus && (
        <div className="fixed bottom-4 left-4 z-40 animate-slide-up">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
            reviewStatus === "reviewing" ? "bg-accent/10 border-accent/30 text-accent" :
            reviewStatus === "fixing" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
            reviewStatus === "approved" ? "bg-green-500/10 border-green-500/30 text-green-400" :
            "bg-secondary border-border text-muted-foreground"
          }`}>
            {reviewStatus === "reviewing" && <><Loader2 className="h-4 w-4 animate-spin" /> المدير يراجع...</>}
            {reviewStatus === "fixing" && <><AlertCircle className="h-4 w-4" /> جاري الإصلاح...</>}
            {reviewStatus === "approved" && <><CheckCircle2 className="h-4 w-4" /> تمت المراجعة ✅</>}
          </div>
        </div>
      )}
    </div>
  );
}
