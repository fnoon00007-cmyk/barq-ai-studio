import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { useVFS } from "@/hooks/useVFS";
import { streamBarqAI } from "@/lib/barq-api";
import { toast } from "sonner";
import { ThinkingEngine } from "@/components/ThinkingEngine";
import { PreviewPanel } from "@/components/PreviewPanel";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, Bot, User, Info, X, Plus } from "lucide-react";

export default function BuilderPage() {
  const { files, addLogEntry, applyVFSOperations, activityLog } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "details">("chat");
  const [chatOpen, setChatOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load messages from DB
  useEffect(() => {
    if (!userId) return;
    setLoadingMessages(true);
    supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .is("project_id", null)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
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
  }, [userId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!userId) return;
      await supabase.from("chat_messages").insert({ user_id: userId, role, content });
    },
    [userId]
  );

  const clearMessages = useCallback(async () => {
    if (!userId) return;
    setMessages([]);
    await supabase.from("chat_messages").delete().eq("user_id", userId).is("project_id", null);
  }, [userId]);

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
      setChatOpen(true);

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      const assistantMsgId = crypto.randomUUID();
      let assistantContent = "";
      const thinkingSteps: ThinkingStep[] = [];
      const affectedFiles: string[] = [];
      const pendingOps: { path: string; action: "create" | "update"; content: string; language: string }[] = [];

      // Create streaming assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
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

      try {
        await streamBarqAI(
          conversationHistory,
          {
            onThinkingStart: () => {
              addLogEntry("read", "تحليل طلب المستخدم...");
            },
            onThinkingStep: (step) => {
              const newStep: ThinkingStep = {
                id: String(thinkingSteps.length),
                label: step,
                status: "completed",
              };
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
            onDone: () => {
              // Apply all file operations at once
              if (pendingOps.length > 0) {
                applyVFSOperations(pendingOps);
              }
              updateAssistantMsg({ isStreaming: false });
            },
          },
          abortController.signal
        );

        saveMessage("assistant", assistantContent);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Barq AI error:", err);
        toast.error(err.message || "حدث خطأ أثناء التوليد");
        const errContent = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
        updateAssistantMsg({ content: errContent, isStreaming: false });
        saveMessage("assistant", errContent);
      } finally {
        setIsThinking(false);
        abortControllerRef.current = null;
      }
    },
    [messages, addLogEntry, applyVFSOperations, saveMessage]
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Main Content Area - Preview */}
      <div className="flex-1 overflow-auto">
        <PreviewPanel files={files} />
      </div>

      {/* Floating Chat Panel */}
      {chatOpen && (
        <div className="absolute bottom-20 right-3 left-3 sm:right-4 sm:left-4 max-h-[60vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-30 animate-slide-up">
          {/* Tab Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "chat"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                محادثة
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "details"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                تفاصيل
              </button>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[45vh]">
            {activeTab === "chat" ? (
              <div className="px-4 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-4 py-8">
                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center animate-pulse-glow">
                      <Zap className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground mb-1">مرحباً بك في برق ⚡</h2>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">أخبرني عن مشروعك وسأساعدك في بناء موقع احترافي</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["أبي موقع لمطعم", "أبي متجر إلكتروني", "أبي محفظة أعمال"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSendMessage(s)}
                          className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:border-primary/50 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {messages.map((msg) => (
                  <div key={msg.id} className="animate-slide-up">
                    <div className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary/20" : "bg-accent/20"}`}>
                        {msg.role === "user" ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-accent" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary/15 text-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                          {msg.isStreaming && !msg.content && (
                            <span className="inline-flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-1" />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-2" />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-3" />
                            </span>
                          )}
                        </div>
                        {/* Inline Thinking Engine */}
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

                {isThinking && !messages.some((m) => m.isStreaming) && (
                  <div className="flex gap-2 animate-slide-up">
                    <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="bg-secondary rounded-2xl px-3 py-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-1" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-3" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">سجل النشاط</h3>
                </div>
                {activityLog.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">لا يوجد نشاط بعد</p>
                ) : (
                  activityLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                {files.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-4 mb-2">
                      <h3 className="text-sm font-bold text-foreground">الملفات ({files.length})</h3>
                    </div>
                    {files.map((f) => (
                      <div key={f.name} className="text-xs px-3 py-2 rounded-lg bg-secondary text-muted-foreground font-mono" dir="ltr">
                        {f.name}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Fixed Bar - Input */}
      <div className="border-t border-border bg-card z-40">
        <div className="px-3 sm:px-4 pt-3 pb-2">
          <div className="flex items-end gap-2 bg-secondary rounded-2xl p-2 border border-border focus-within:border-primary/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { setChatOpen(true); setActiveTab("chat"); }}
              placeholder="اسأل برق..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 px-2 max-h-20"
              disabled={isThinking}
            />
            {isThinking ? (
              <button
                onClick={handleAbort}
                className="w-9 h-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center shrink-0"
              >
                <div className="w-3 h-3 rounded-sm bg-destructive-foreground" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
              >
                <Send className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex items-center gap-2 px-3 sm:px-4 pb-3">
          <button
            onClick={() => { clearMessages(); setChatOpen(true); setActiveTab("chat"); }}
            className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="flex-1 flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => { setChatOpen(true); setActiveTab("chat"); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold text-center transition-all ${
                chatOpen && activeTab === "chat"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              محادثة
            </button>
            <button
              onClick={() => { setChatOpen(true); setActiveTab("details"); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold text-center transition-all ${
                chatOpen && activeTab === "details"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              تفاصيل
            </button>
          </div>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className={`h-4 w-4 transition-transform ${chatOpen ? "" : "rotate-45"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
