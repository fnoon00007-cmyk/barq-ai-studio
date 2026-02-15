import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

const THINKING_MESSAGES = [
  "برق يفكر في التصميم... 🎨",
  "يحلل طلبك بعناية... 🔍",
  "يبني المكونات... 🏗️",
  "يختار الألوان المناسبة... 🎯",
  "يراجع الجودة... ✅",
  "يكتب الكود... 💻",
  "يصمم الواجهة... 📱",
  "يرتب العناصر... 📐",
];

interface DynamicTypingIndicatorProps {
  isBuilding?: boolean;
}

export function DynamicTypingIndicator({ isBuilding }: DynamicTypingIndicatorProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const buildMessages = [
    "يبني المكونات... 🏗️",
    "يولّد الملفات... 📄",
    "يكتب React components... ⚛️",
    "يطبق التصميم... 🎨",
  ];

  const messages = isBuilding ? buildMessages : THINKING_MESSAGES;
  const currentMsg = messages[msgIndex % messages.length];

  return (
    <div className="flex gap-2.5 animate-slide-up">
      <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-accent animate-pulse" />
      </div>
      <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">{currentMsg}</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot-3" />
        </span>
      </div>
    </div>
  );
}
