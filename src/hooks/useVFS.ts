import { useState } from "react";

export interface VFSFile {
  name: string;
  content: string;
  language: string;
}

export interface ActivityLogEntry {
  id: string;
  type: "read" | "update" | "complete" | "create";
  message: string;
  timestamp: Date;
}

export interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "loading" | "completed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thinkingSteps?: ThinkingStep[];
}

const typeLabels: Record<ActivityLogEntry["type"], string> = {
  read: "قراءة",
  update: "تحديث",
  complete: "تم",
  create: "إنشاء",
};

export function getTypeLabel(type: ActivityLogEntry["type"]): string {
  return typeLabels[type];
}

export function useVFS() {
  const [files, setFiles] = useState<VFSFile[]>([
    { name: "App.tsx", content: "// Main App Component", language: "tsx" },
    { name: "Hero.tsx", content: "// Hero Section", language: "tsx" },
    { name: "Global.css", content: "/* Global Styles */", language: "css" },
  ]);

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const addLogEntry = (type: ActivityLogEntry["type"], message: string) => {
    setActivityLog((prev) => [
      { id: crypto.randomUUID(), type, message, timestamp: new Date() },
      ...prev,
    ]);
  };

  const updateFile = (name: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === name ? { ...f, content } : f))
    );
    addLogEntry("update", `تعديل ${name}...`);
  };

  const createFile = (name: string, content: string, language: string) => {
    setFiles((prev) => [...prev, { name, content, language }]);
    addLogEntry("create", `إنشاء ${name}...`);
  };

  return { files, activityLog, addLogEntry, updateFile, createFile };
}
