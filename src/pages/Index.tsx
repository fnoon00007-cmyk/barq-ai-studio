import { useState, useCallback } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { MobilePreview } from "@/components/MobilePreview";
import { ActivityLog } from "@/components/ActivityLog";
import { useVFS, ChatMessage, ThinkingStep } from "@/hooks/useVFS";

const defaultThinkingSteps: ThinkingStep[] = [
  { id: "1", label: "تحليل هوية المشروع", status: "pending" },
  { id: "2", label: "هيكلة تخطيط الصفحات", status: "pending" },
  { id: "3", label: "اختيار الحمض النووي للتصميم", status: "pending" },
  { id: "4", label: "تحديد شخصية التصميم", status: "pending" },
  { id: "5", label: "بناء المكونات", status: "pending" },
];

export default function Dashboard() {
  const { files, activityLog, addLogEntry } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const simulateThinking = useCallback(async () => {
    const steps = defaultThinkingSteps.map((s) => ({ ...s, status: "pending" as const }));
    setThinkingSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setThinkingSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "loading" } : idx < i ? { ...s, status: "completed" } : s
        )
      );
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
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
      setIsThinking(true);

      addLogEntry("read", "تحليل طلب المستخدم...");

      await simulateThinking();

      addLogEntry("update", "تعديل ألوان الهوية...");
      await new Promise((r) => setTimeout(r, 400));
      addLogEntry("create", "إنشاء Hero.tsx...");
      await new Promise((r) => setTimeout(r, 300));
      addLogEntry("update", "تعديل Global.css...");
      await new Promise((r) => setTimeout(r, 300));
      addLogEntry("complete", "اكتمال بناء الموقع بنجاح ⚡");

      setActiveFile("App.tsx");

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `تم تحليل طلبك بنجاح! ⚡\n\nقمت ببناء هيكل الموقع بناءً على وصفك. يمكنك رؤية المعاينة في الإطار المجاور.\n\nهل تريد تعديل أي شيء؟`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    },
    [addLogEntry, simulateThinking]
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Activity Log */}
        <ActivityLog entries={activityLog} />

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card overflow-x-auto">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={`text-xs px-3 py-1.5 rounded-md font-mono transition-colors whitespace-nowrap ${
                activeFile === file.name
                  ? "bg-barq-electric/15 text-barq-electric border border-barq-electric/30"
                  : "text-muted-foreground hover:bg-barq-surface hover:text-secondary-foreground"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Mobile Preview */}
        <MobilePreview files={files} activeFile={activeFile} />
      </div>

      {/* Left Panel - Chat (RTL: appears on right visually) */}
      <div className="w-[420px] shrink-0">
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
          thinkingSteps={thinkingSteps}
        />
      </div>
    </div>
  );
}
