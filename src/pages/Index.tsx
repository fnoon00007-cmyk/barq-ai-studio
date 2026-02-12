import { useState, useCallback } from "react";
import { ChatPage } from "@/components/ChatPage";
import { PreviewPage } from "@/components/PreviewPage";
import { useVFS, ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { callBarqAI } from "@/lib/barq-api";
import { toast } from "sonner";

export default function Dashboard() {
  const { files, addLogEntry, applyVFSOperations } = useVFS();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [view, setView] = useState<"chat" | "preview">("chat");

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

      const conversationHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      try {
        const result = await callBarqAI(conversationHistory);

        if (result.type === "conversation") {
          // Conversational response - just add message
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Generation response - animate thinking + apply VFS
          addLogEntry("read", "تحليل طلب المستخدم...");

          if (result.thought_process?.length) {
            await animateThinkingSteps(result.thought_process);
          }

          if (result.vfs_operations?.length) {
            applyVFSOperations(result.vfs_operations);
          }

          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `${result.user_message || "تم بناء الموقع بنجاح!"} ⚡\n\nيمكنك الضغط على "معاينة الموقع" لرؤية النتيجة.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (err: any) {
        console.error("Barq AI error:", err);
        toast.error(err.message || "حدث خطأ أثناء التوليد");
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `عذراً، حدث خطأ: ${err.message}. حاول مرة أخرى. ⚡`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, addLogEntry, animateThinkingSteps, applyVFSOperations]
  );

  if (view === "preview") {
    return <PreviewPage files={files} onBack={() => setView("chat")} />;
  }

  return (
    <ChatPage
      messages={messages}
      onSendMessage={handleSendMessage}
      isThinking={isThinking}
      thinkingSteps={thinkingSteps}
      hasPreview={files.length > 0}
      onOpenPreview={() => setView("preview")}
    />
  );
}
