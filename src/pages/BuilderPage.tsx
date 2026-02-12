import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { useVFS } from "@/hooks/useVFS";
import { callBarqAI } from "@/lib/barq-api";
import { toast } from "sonner";
import { ThinkingEngine } from "@/components/ThinkingEngine";
import { PreviewPanel } from "@/components/PreviewPanel";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, Bot, User, Info, Eye, ArrowLeft } from "lucide-react";

export default function BuilderPage() {
  const { files, addLogEntry, applyVFSOperations, activityLog } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "details">("chat");
  const [showPreview, setShowPreview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role,
        content,
      });
    },
    [userId]
  );

  const animateThinkingSteps = useCallback(async (steps: string[]) => {
    const mapped: ThinkingStep[] = steps.map((label, i) => ({
      id: String(i),
      label,
      status: "pending" as const,
    }));
    setThinkingSteps(mapped);
    for (let i = 0; i < mapped.length; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setThinkingSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "loading" } : idx < i ? { ...s, status: "completed" } : s
        )
      );
      await new Promise((r) => setTimeout(r, 400));
      setThinkingSteps((prev) =>
        prev.map((s, idx) => (idx <= i ? { ...s, status: "completed" } : s))
      );
    }
  }, []);

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

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      try {
        const result = await callBarqAI(conversationHistory);
        let assistantContent = "";
        if (result.type === "conversation") {
          assistantContent = result.message;
        } else {
          addLogEntry("read", "تحليل طلب المستخدم...");
          if (result.thought_process?.length) await animateThinkingSteps(result.thought_process);
          if (result.vfs_operations?.length) applyVFSOperations(result.vfs_operations);
          assistantContent = `${result.user_message || "تم بناء الموقع بنجاح!"} ⚡`;
        }
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: assistantContent, timestamp: new Date() },
        ]);
        saveMessage("assistant", assistantContent);
      } catch (err: any) {
        console.error("Barq AI error:", err);
        toast.error(err.message || "حدث خطأ أثناء التوليد");
        const errMsg = `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`;
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: errMsg, timestamp: new Date() },
        ]);
        saveMessage("assistant", errMsg);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, addLogEntry, animateThinkingSteps, applyVFSOperations, saveMessage]
  );

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

  // Preview mode
  if (showPreview) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            رجوع للمحادثة
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <PreviewPanel files={files} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">برق Ai</h1>
            <p className="text-[10px] text-muted-foreground">منشئ المواقع الذكي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Eye className="h-3.5 w-3.5" />
              معاينة
            </button>
          )}
          {/* Tab switcher */}
          <div className="flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                activeTab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              محادثة
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                activeTab === "details" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              تفاصيل
            </button>
          </div>
        </div>
      </div>

      {/* Content - Full Page */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" ? (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-5 py-16">
                <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center animate-pulse-glow">
                  <Zap className="h-10 w-10 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">مرحباً بك في برق ⚡</h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">أخبرني عن مشروعك وسأساعدك في بناء موقع احترافي</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {["أبي موقع لمطعم", "أبي متجر إلكتروني", "أبي محفظة أعمال"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSendMessage(s)}
                      className="text-sm px-4 py-2 rounded-full border border-border bg-secondary text-secondary-foreground hover:border-primary/50 transition-all"
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
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-primary/15 text-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-1" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-2" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-typing-dot-3" />
                </div>
              </div>
            )}

            <ThinkingEngine steps={thinkingSteps} visible={isThinking} />
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
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

      {/* Input - Fixed Bottom */}
      <div className="border-t border-border bg-card">
        <div className="max-w-2xl mx-auto p-3 sm:p-4">
          <div className="flex items-end gap-2 bg-secondary rounded-2xl p-2.5 border border-border focus-within:border-primary/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 px-2 max-h-24"
              disabled={isThinking}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isThinking}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
