import { useState, useEffect, useRef } from "react";
import { ThinkingEngine } from "@/components/ThinkingEngine";
import { PreviewPanel } from "@/components/v2/PreviewPanel";
import { GitHubExportModal } from "@/components/GitHubExportModal";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { useBuilderProject } from "@/hooks/useBuilderProject"; // Removed
import { useBuilderChat } from "@/hooks/v2/useBuilderChat"; // Updated import path
import { useBuildEngine } from "@/hooks/v2/useBuildEngine"; // Updated import path
import { useVFS } from "@/hooks/v2/useVFS"; // New import
import { useGitHubExport } from "@/hooks/useGitHubExport";
import {
  Send, Zap, Bot, User, Info, Plus, PanelLeftClose, PanelLeft,
  LogOut, FolderOpen, FileCode, Save, Smartphone, Tablet, Monitor,
  Github, Loader2, CheckCircle2, AlertCircle, Undo2, Redo2,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function BuilderPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"chat" | "details" | "code">("chat");
  const [mobileView, setMobileView] = useState<"preview" | "chat">("chat");
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const promptSentRef = useRef(false);

  // User state (moved from useBuilderProject)
  const [userId, setUserId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("مشروع جديد");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // VFS hook
  const vfs = useVFS({ projectId: currentProjectId });

  // Chat hook
  const chat = useBuilderChat({ userId, projectId: currentProjectId });

  // Build Engine hook
  const engine = useBuildEngine({
    userId,
    projectId: currentProjectId,
    files: vfs.files,
    messages: chat.messages,
    applyVFSOperations: vfs.applyVFSOperations,
    addMessage: chat.addMessage,
    updateMessage: chat.updateMessage,
    saveMessage: chat.saveMessage,
    saveProject: async () => {
      // The actual VFS persistence is handled by useVFS now.
      // This saveProject is for project metadata like title.
      if (!userId || !currentProjectId) return;
      try {
        await supabase
          .from("projects")
          .update({ title: projectTitle, updated_at: new Date().toISOString() })
          .eq("id", currentProjectId);
        toast.success("تم حفظ بيانات المشروع ⚡");
      } catch (error: any) {
        toast.error(`فشل حفظ بيانات المشروع: ${error.message}`);
      }
    },
    getAuthToken: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    },
  });

  // GitHub Export hook (now uses vfs.files directly)
  const github = useGitHubExport(vfs.files, projectTitle);

  // Load project title and ID on mount or projectId change
  useEffect(() => {
    if (!projectId) return;
    setCurrentProjectId(projectId);
    supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast.error(`فشل تحميل المشروع: ${error.message}`);
          navigate("/projects"); // Redirect if project not found or error
          return;
        }
        if (data) {
          setProjectTitle(data.title || "مشروع جديد");
        }
      });
  }, [projectId, navigate]);

  // Update project title from build engine
  useEffect(() => {
    if (engine.state.buildProjectName) {
      setProjectTitle(engine.state.buildProjectName);
      if (currentProjectId) {
        supabase.from("projects").update({ title: engine.state.buildProjectName }).eq("id", currentProjectId).then(({ error }) => {
          if (error) console.error("Failed to update project title in DB:", error);
        });
      }
    }
  }, [engine.state.buildProjectName, currentProjectId]);

  // Handle prompt from landing page
  useEffect(() => {
    if (promptSentRef.current) return;
    const prompt = searchParams.get("prompt");
    if (prompt && userId && !chat.loadingMessages && !currentProjectId) { // Only for new projects
      promptSentRef.current = true;
      engine.handleSendMessage(prompt);
    }
  }, [searchParams, userId, chat.loadingMessages, currentProjectId]);

  const handleSubmit = () => {
    if (!chat.input.trim() || engine.state.isThinking) return;
    engine.handleSendMessage(chat.input.trim());
    chat.setInput("");
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
          {/* Undo/Redo Buttons */}
          <button
            onClick={vfs.undo}
            disabled={!vfs.canUndo || vfs.loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="تراجع"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={vfs.redo}
            disabled={!vfs.canRedo || vfs.loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="إعادة"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          {vfs.files.length > 0 && (
            <button
              onClick={async () => {
                if (!userId || !currentProjectId) return;
                try {
                  await supabase.from("projects").update({ title: projectTitle, updated_at: new Date().toISOString() }).eq("id", currentProjectId);
                  toast.success("تم حفظ بيانات المشروع ⚡");
                } catch (error: any) { toast.error(`فشل الحفظ: ${error.message}`); }
              }}
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
            activeTab === "chat" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          محادثة
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "code" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          الكود
          {vfs.files.length > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{vfs.files.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "details" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          تفاصيل
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" ? (
          <div className="px-4 py-4 space-y-4">
            {chat.loadingMessages ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chat.messages.length === 0 ? (
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
                      onClick={() => engine.handleSendMessage(s)}
                      className="text-sm px-4 py-2 rounded-xl border border-border bg-secondary text-secondary-foreground hover:border-primary/50 hover:bg-secondary/80 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {chat.messages.map((msg) => (
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
                        dependencyGraph={engine.state.dependencyGraph}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {/* Build Ready Button */}
            {engine.state.buildPrompt && !engine.state.isBuilding && !engine.state.isThinking && (
              <div className="flex justify-center animate-slide-up">
                <button
                  onClick={engine.handleStartBuild}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  ابدأ البناء ⚡
                </button>
              </div>
            )}

            {/* Fix Suggestion Button */}
            {engine.state.fixSuggestion && !engine.state.isBuilding && !engine.state.isThinking && (
              <div className="flex justify-center animate-slide-up">
                <button
                  onClick={engine.handleApplyFix}
                  className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  تطبيق الإصلاح المقترح ✅
                </button>
                <button
                  onClick={engine.handleRejectFix}
                  className="ml-4 px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5" />
                  رفض الإصلاح ❌
                </button>
              </div>
            )}

            {/* Error Display */}
            {engine.state.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 animate-slide-up">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{engine.state.error}</p>
              </div>
            )}

            {/* Loading Indicator */}
            {(engine.state.isThinking || engine.state.isBuilding) && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {/* Current VFS Version Display */}
            {vfs.currentVersion && (
              <div className="text-xs text-muted-foreground text-center mt-4">
                الإصدار الحالي: {vfs.currentVersion.version} - {vfs.currentVersion.message}
              </div>
            )}

            {/* Chat Input */}
            <div className="sticky bottom-0 bg-card pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <textarea
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك هنا..."
                  rows={1}
                  className="flex-1 p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!chat.input.trim() || engine.state.isThinking || engine.state.isBuilding}
                  className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                برق AI يمكنه ارتكاب الأخطاء. تحقق من المعلومات المهمة.
              </p>
            </div>
          </div>
        ) : activeTab === "code" ? (
          <div className="h-full">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 border-b border-border p-2 flex items-center gap-2 overflow-x-auto">
                {vfs.files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFile(file.name)}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${activeFile === file.name ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900 text-gray-500">
                {activeFile ? (
                  <pre className="whitespace-pre-wrap break-all">
                    {vfs.files.find(f => f.name === activeFile)?.content}
                  </pre>
                ) : (
                  <p className="text-center text-muted-foreground">اختر ملفًا لعرض الكود.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">تفاصيل المشروع</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">عنوان المشروع</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  onBlur={async () => {
                    if (!userId || !currentProjectId) return;
                    await supabase.from("projects").update({ title: projectTitle }).eq("id", currentProjectId);
                  }}
                  className="mt-1 block w-full rounded-md border-border bg-background shadow-sm p-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">معرف المشروع</label>
                <p className="mt-1 text-foreground p-2 bg-secondary rounded-md">{currentProjectId || "غير محفوظ"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">عدد الملفات</label>
                <p className="mt-1 text-foreground p-2 bg-secondary rounded-md">{vfs.files.length}</p>
              </div>
              {/* GitHub Export */}
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-md font-bold mb-2">تصدير GitHub</h4>
                <button
                  onClick={() => {
                    if (github.githubToken) {
                      github.setShowGithubExport(true);
                    } else {
                      github.handleConnectGithub();
                    }
                  }}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  تصدير إلى GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      {chatPanelOpen && (
        <ResizablePanelGroup direction="horizontal" className="min-h-screen">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={50} className="flex flex-col">
            {chatPanel}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={40} className="flex flex-col">
            <PreviewPanel 
              files={vfs.files} 
              device={previewDevice} 
            />
            <div className="flex-shrink-0 border-t border-border bg-card p-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-md ${previewDevice === "mobile" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                title="عرض الجوال"
              >
                <Smartphone className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`p-2 rounded-md ${previewDevice === "tablet" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                title="عرض الجهاز اللوحي"
              >
                <Tablet className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-md ${previewDevice === "desktop" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                title="عرض سطح المكتب"
              >
                <Monitor className="h-5 w-5" />
              </button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {!chatPanelOpen && (
        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 border-b border-border bg-card p-2 flex items-center gap-2">
            <button
              onClick={() => setChatPanelOpen(true)}
              className="p-2 rounded-md text-muted-foreground hover:bg-secondary"
              title="إظهار المحادثة"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-bold text-foreground">{projectTitle}</h1>
          </div>
          <PreviewPanel files={vfs.files} device={previewDevice} />
          <div className="flex-shrink-0 border-t border-border bg-card p-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`p-2 rounded-md ${previewDevice === "mobile" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              title="عرض الجوال"
            >
              <Smartphone className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`p-2 rounded-md ${previewDevice === "tablet" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              title="عرض الجهاز اللوحي"
            >
              <Tablet className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`p-2 rounded-md ${previewDevice === "desktop" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
              title="عرض سطح المكتب"
            >
              <Monitor className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* GitHub Export Modal */}
      {github.showGithubExport && github.githubToken && (
        <GitHubExportModal
          open={github.showGithubExport}
          onClose={() => github.setShowGithubExport(false)}
          githubToken={github.githubToken}
          files={vfs.files}
          projectTitle={projectTitle}
        />
      )}

      {/* Review Status Badge */}
      {engine.state.reviewStatus && (
        <div className="fixed bottom-4 left-4 z-40 animate-slide-up">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
            engine.state.reviewStatus === "reviewing" ? "bg-accent/10 border-accent/30 text-accent" :
            engine.state.reviewStatus === "fixing" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
            engine.state.reviewStatus === "approved" ? "bg-green-500/10 border-green-500/30 text-green-400" :
            "bg-secondary border-border text-muted-foreground"
          }`}>
            {engine.state.reviewStatus === "reviewing" && <><Loader2 className="h-4 w-4 animate-spin" /> المدير يراجع...</>}
            {engine.state.reviewStatus === "fixing" && <><AlertCircle className="h-4 w-4" /> جاري الإصلاح...</>}
            {engine.state.reviewStatus === "approved" && <><CheckCircle2 className="h-4 w-4" /> تمت المراجعة ✅</>}
          </div>
        </div>
      )}
    </div>
  );
}
