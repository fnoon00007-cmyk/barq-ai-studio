import { useState, useCallback } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { MobilePreview } from "@/components/MobilePreview";
import { ActivityLog } from "@/components/ActivityLog";
import { useVFS, ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { callBarqAI } from "@/lib/barq-api";
import { toast } from "sonner";

export default function Dashboard() {
  const { files, activityLog, addLogEntry, applyVFSOperations } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

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
      setIsThinking(true);
      addLogEntry("read", "تحليل طلب المستخدم...");

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      try {
        const result = await callBarqAI(conversationHistory);

        // Animate thinking steps from AI
        if (result.thought_process?.length) {
          await animateThinkingSteps(result.thought_process);
        }

        // Apply VFS operations
        if (result.vfs_operations?.length) {
          applyVFSOperations(result.vfs_operations);
          setActiveFile(result.vfs_operations[0].path);
        }

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.user_message || "تم بناء الموقع بنجاح! ⚡",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error("Barq AI error:", err);
        toast.error(err.message || "حدث خطأ أثناء التوليد");
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, addLogEntry, animateThinkingSteps, applyVFSOperations]
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <ActivityLog entries={activityLog} />

        {/* File Tabs */}
        {files.length > 0 && (
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
        )}

        <MobilePreview files={files} activeFile={activeFile} />
      </div>

      {/* Left Panel - Chat */}
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
