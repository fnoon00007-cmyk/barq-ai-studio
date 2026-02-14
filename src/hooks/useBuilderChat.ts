import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/hooks/useVFS";

export function useBuilderChat(userId: string | null, currentProjectId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from DB
  useEffect(() => {
    if (!userId) return;
    setLoadingMessages(true);
    const query = supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (currentProjectId) {
      query.eq("project_id", currentProjectId);
    } else {
      query.is("project_id", null);
    }

    query.then(({ data, error }) => {
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
  }, [userId, currentProjectId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!userId) return;
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role,
        content,
        project_id: currentProjectId,
      });
    },
    [userId, currentProjectId]
  );

  const clearMessages = useCallback(async () => {
    if (!userId) return;
    setMessages([]);
    const query = supabase.from("chat_messages").delete().eq("user_id", userId);
    if (currentProjectId) {
      query.eq("project_id", currentProjectId);
    } else {
      query.is("project_id", null);
    }
    await query;
  }, [userId, currentProjectId]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((msgId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, ...updates } : m))
    );
  }, []);

  return {
    messages,
    setMessages,
    loadingMessages,
    input,
    setInput,
    messagesEndRef,
    saveMessage,
    clearMessages,
    addMessage,
    updateMessage,
  };
}
