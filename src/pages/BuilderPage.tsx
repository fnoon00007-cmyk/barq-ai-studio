import { useState, useEffect, useRef } from "react";
import { ThinkingEngine } from "@/components/ThinkingEngine";
import { PreviewPanel } from "@/components/PreviewPanel";
import { GitHubExportModal } from "@/components/GitHubExportModal";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useBuilderProject } from "@/hooks/useBuilderProject";
import { useBuilderChat } from "@/hooks/useBuilderChat";
import { useBuildEngine } from "@/hooks/useBuildEngine";
import { useGitHubExport } from "@/hooks/useGitHubExport";
import {
  Send, Zap, Bot, User, Info, Plus, PanelLeftClose, PanelLeft,
  LogOut, FolderOpen, FileCode, Save, Smartphone, Tablet, Monitor,
  Github, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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

  // Extracted hooks
  const project = useBuilderProject(projectId);
  const chat = useBuilderChat(project.userId, project.currentProjectId);

  const engine = useBuildEngine({
    addLogEntry: project.addLogEntry,
    applyVFSOperations: project.applyVFSOperations,
    saveMessage: chat.saveMessage,
    saveProject: project.saveProject,
    addMessage: chat.addMessage,
    updateMessage: chat.updateMessage,
    messages: chat.messages,
    files: project.files,
    setMobileView,
  });

  const github = useGitHubExport(project.files, project.projectTitle);

  // Update project title from build engine
  useEffect(() => {
    if (engine.buildProjectName) {
      project.setProjectTitle(engine.buildProjectName);
    }
  }, [engine.buildProjectName]);

  // Handle prompt from landing page
  useEffect(() => {
    if (promptSentRef.current) return;
    const prompt = searchParams.get("prompt");
    if (prompt && project.userId && !chat.loadingMessages) {
      promptSentRef.current = true;
      engine.handleSendMessage(prompt);
    }
  }, [searchParams, project.userId, chat.loadingMessages]);

  const handleSubmit = () => {
    if (!chat.input.trim() || engine.isThinking) return;
    engine.handleSendMessage(chat.input.trim());
    chat.setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
            <h1 className="text-sm font-bold text-foreground">{project.projectTitle}</h1>
            <p className="text-[11px] text-muted-foreground">برق AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {project.files.length > 0 && (
            <button
              onClick={project.saveProject}
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
            onClick={project.handleLogout}
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
          {project.files.length > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{project.files.length}</span>
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
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {/* Build Ready Button */}
            {engine.buildPrompt && !engine.isBuilding && !engine.isThinking && (
              <div className="flex justify-center animate-slide-up">
                <button
                  onClick={() => engine.handleStartBuild(engine.buildPrompt!)}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  ابدأ البناء ⚡
                </button>
              </div>
            )}

            {engine.isThinking && !chat.messages.some((m) => m.isStreaming) && (
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

            <div ref={chat.messagesEndRef} />
          </div>
        ) : activeTab === "code" ? (
          <div className="flex flex-col h-full">
            {project.files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileCode className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">لم يتم إنشاء ملفات بعد</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto border-b border-border">
                  {project.files.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFile(f.name)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-mono whitespace-nowrap transition-colors ${
                        activeFile === f.name || (!activeFile && f.name === project.files[0]?.name)
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-xs leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap" dir="ltr">
                    {(project.files.find((f) => f.name === (activeFile || project.files[0]?.name)))?.content || ""}
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
            {project.activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا يوجد نشاط بعد</p>
            ) : (
              project.activityLog.map((entry) => (
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
            onClick={() => { chat.clearMessages(); navigate("/builder"); }}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="محادثة جديدة"
          >
            <Plus className="h-4 w-4" />
          </button>
          <textarea
            value={chat.input}
            onChange={(e) => chat.setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اسأل برق..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-base text-foreground placeholder:text-muted-foreground focus:outline-none py-2 px-2 max-h-24"
            disabled={engine.isThinking}
          />
          {engine.isThinking ? (
            <button
              onClick={engine.handleAbort}
              className="w-10 h-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center shrink-0"
            >
              <div className="w-3.5 h-3.5 rounded-sm bg-destructive-foreground" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!chat.input.trim()}
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
            <div className={`w-2 h-2 rounded-full ${project.files.length > 0 ? "bg-green-500" : "bg-muted-foreground/30"}`} />
            <span className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
              {project.projectTitle.replace(/\s/g, "-").toLowerCase()}.barq.app
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
          {project.files.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground mr-2">{project.files.length} ملفات</span>
              <button
                onClick={() => github.githubToken ? github.setShowGithubExport(true) : github.handleConnectGithub()}
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
          <PreviewPanel files={project.files} />
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
            <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{project.projectTitle}</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setMobileView("chat")}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                mobileView === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              محادثة
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                mobileView === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              معاينة
            </button>
          </div>
          <div className="flex items-center gap-1">
            {project.files.length > 0 && (
              <button
                onClick={() => github.githubToken ? github.setShowGithubExport(true) : github.handleConnectGithub()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="تصدير لـ GitHub"
              >
                <Github className="h-4 w-4" />
              </button>
            )}
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
      {github.showGithubExport && github.githubToken && (
        <GitHubExportModal
          open={github.showGithubExport}
          onClose={() => github.setShowGithubExport(false)}
          githubToken={github.githubToken}
          files={project.files}
          projectTitle={project.projectTitle}
        />
      )}

      {/* Review Status Badge */}
      {engine.reviewStatus && (
        <div className="fixed bottom-4 left-4 z-40 animate-slide-up">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
            engine.reviewStatus === "reviewing" ? "bg-accent/10 border-accent/30 text-accent" :
            engine.reviewStatus === "fixing" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
            engine.reviewStatus === "approved" ? "bg-green-500/10 border-green-500/30 text-green-400" :
            "bg-secondary border-border text-muted-foreground"
          }`}>
            {engine.reviewStatus === "reviewing" && <><Loader2 className="h-4 w-4 animate-spin" /> المدير يراجع...</>}
            {engine.reviewStatus === "fixing" && <><AlertCircle className="h-4 w-4" /> جاري الإصلاح...</>}
            {engine.reviewStatus === "approved" && <><CheckCircle2 className="h-4 w-4" /> تمت المراجعة ✅</>}
          </div>
        </div>
      )}
    </div>
  );
}
