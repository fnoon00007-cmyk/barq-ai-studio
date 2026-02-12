import { useState, useRef, useEffect } from "react";
import { ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { ThinkingEngine } from "./ThinkingEngine";
import { Send, Zap, Bot, User } from "lucide-react";

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  thinkingSteps: ThinkingStep[];
}

export function ChatSidebar({
  messages,
  onSendMessage,
  isThinking,
  thinkingSteps,
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = () => {
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-barq-surface flex items-center justify-center animate-pulse-glow">
          <Zap className="h-5 w-5 text-barq-gold" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">برق Ai</h1>
          <p className="text-[11px] text-muted-foreground">منشئ المواقع الذكي</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <div className="w-20 h-20 rounded-2xl bg-barq-surface flex items-center justify-center animate-pulse-glow">
              <Zap className="h-10 w-10 text-barq-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                مرحباً بك في برق ⚡
              </h2>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                أخبرني عن مشروعك وسأبني لك موقعاً احترافياً في ثوانٍ
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["موقع مطعم", "متجر إلكتروني", "محفظة أعمال"].map((s) => (
                <button
                  key={s}
                  onClick={() => onSendMessage(`أريد بناء ${s}`)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-barq-surface text-secondary-foreground hover:bg-barq-surface-hover hover:border-barq-electric/50 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="animate-slide-up">
            <div
              className={`flex gap-2.5 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-barq-electric/20"
                    : "bg-barq-gold/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-barq-electric" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-barq-gold" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-barq-electric/15 text-foreground"
                    : "bg-barq-surface text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2.5 animate-slide-up">
            <div className="w-7 h-7 rounded-lg bg-barq-gold/20 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-barq-gold" />
            </div>
            <div className="bg-barq-surface rounded-xl px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-1" />
              <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-2" />
              <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-3" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Thinking Engine */}
      {isThinking && thinkingSteps.length > 0 && <ThinkingEngine steps={thinkingSteps} />}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 bg-barq-surface rounded-xl p-2 border border-border focus-within:border-barq-electric/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب وصف موقعك هنا..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 px-2 max-h-24"
            disabled={isThinking}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-lg bg-barq-electric text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
          >
            <Send className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
