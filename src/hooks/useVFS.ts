import { useState, useCallback } from "react";

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
  affectedFiles?: string[];
  isStreaming?: boolean;
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
  const [files, setFiles] = useState<VFSFile[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const addLogEntry = useCallback((type: ActivityLogEntry["type"], message: string) => {
    setActivityLog((prev) => [
      { id: crypto.randomUUID(), type, message, timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  const updateFile = useCallback((name: string, content: string) => {
    setFiles((prev) => {
      const exists = prev.find((f) => f.name === name);
      if (exists) {
        return prev.map((f) => (f.name === name ? { ...f, content } : f));
      }
      return prev;
    });
  }, []);

  const createFile = useCallback((name: string, content: string, language: string) => {
    setFiles((prev) => {
      const exists = prev.find((f) => f.name === name);
      if (exists) {
        return prev.map((f) => (f.name === name ? { ...f, content, language } : f));
      }
      return [...prev, { name, content, language }];
    });
  }, []);

  const applyVFSOperations = useCallback(
    (operations: { path: string; action: "create" | "update"; content: string; language: string }[]) => {
      for (const op of operations) {
        if (op.action === "create") {
          createFile(op.path, op.content, op.language);
          addLogEntry("create", `إنشاء ${op.path}...`);
        } else {
          createFile(op.path, op.content, op.language); // upsert
          addLogEntry("update", `تحديث ${op.path}...`);
        }
      }
      addLogEntry("complete", "اكتمال بناء الموقع بنجاح ⚡");
    },
    [createFile, addLogEntry]
  );

  return { files, activityLog, addLogEntry, updateFile, createFile, applyVFSOperations };
}
