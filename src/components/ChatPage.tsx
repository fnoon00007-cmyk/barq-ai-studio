import { useState, useCallback } from "react";
import { ChatMessage, ThinkingStep } from "@/hooks/useVFS";
import { ThinkingEngine } from "./ThinkingEngine";
import { Send, Zap, Bot, User, Eye } from "lucide-react";

interface ChatPageProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
  thinkingSteps: ThinkingStep[];
  hasPreview: boolean;
  onOpenPreview: () => void;
}

export function ChatPage({
  messages,
  onSendMessage,
  isThinking,
  thinkingSteps,
  hasPreview,
  onOpenPreview,
}: ChatPageProps) {
  const [input, setInput] = useState("");

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-barq-surface flex items-center justify-center animate-pulse-glow">
            <Zap className="h-5 w-5 text-barq-gold" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">برق Ai</h1>
            <p className="text-[11px] text-muted-foreground">منشئ المواقع الذكي ⚡</p>
          </div>
        </div>
        {hasPreview && (
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-barq-electric text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Eye className="h-4 w-4" />
            معاينة الموقع
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center gap-5 py-16">
              <div className="w-20 h-20 rounded-2xl bg-barq-surface flex items-center justify-center animate-pulse-glow">
                <Zap className="h-10 w-10 text-barq-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  مرحباً بك في برق ⚡
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  أخبرني عن مشروعك وسأساعدك في بناء موقع احترافي
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {["أبي موقع لمطعم", "أبي متجر إلكتروني", "أبي محفظة أعمال"].map((s) => (
                  <button
                    key={s}
                    onClick={() => onSendMessage(s)}
                    className="text-sm px-4 py-2 rounded-full border border-border bg-barq-surface text-secondary-foreground hover:bg-barq-surface-hover hover:border-barq-electric/50 transition-all"
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
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-barq-electric/20" : "bg-barq-gold/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-barq-electric" />
                  ) : (
                    <Bot className="h-4 w-4 text-barq-gold" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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
            <div className="flex gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-barq-gold/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-barq-gold" />
              </div>
              <div className="bg-barq-surface rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-1" />
                <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-2" />
                <div className="w-2 h-2 rounded-full bg-barq-electric animate-typing-dot-3" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thinking Engine */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <ThinkingEngine steps={thinkingSteps} visible={isThinking} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-end gap-2 bg-barq-surface rounded-2xl p-2.5 border border-border focus-within:border-barq-electric/50 transition-colors">
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
              className="w-10 h-10 rounded-xl bg-barq-electric text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
