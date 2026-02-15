
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- Types and Interfaces ---

export interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'completed' | 'failed' | 'loading';
}

export type PipelineStage = 'thinking' | 'planning' | 'handoff' | 'building' | 'reviewing' | 'done';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  thinkingSteps?: ThinkingStep[];
  affectedFiles?: string[];
  pipelineStage?: PipelineStage;
  handoffPrompt?: string; // The English prompt sent to the builder
}

interface UseBuilderChatProps {
  userId: string | null;
  projectId: string | null;
}

export function useBuilderChat({ userId, projectId }: UseBuilderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  const loadMessages = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data.map((m: any) => ({ 
          id: m.id, 
          role: m.role, 
          content: m.content, 
          timestamp: new Date(m.created_at) 
        })));
      }
    } catch (err: any) {
      toast.error('فشل تحميل سجل المحادثات.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  }, []);

  const saveMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!projectId || !userId) return;
    try {
      const { error } = await supabase.from('chat_messages').insert([
        {
          project_id: projectId,
          user_id: userId,
          role: message.role,
          content: message.content,
        }
      ]);
      if (error) throw error;
    } catch (err: any) {
      toast.error('فشل حفظ الرسالة في قاعدة البيانات.');
    }
  }, [projectId, userId]);

  const clearMessages = useCallback(async () => {
    if (!projectId) return;
    try {
      const { error } = await supabase.from('chat_messages').delete().eq('project_id', projectId);
      if (error) throw error;
      setMessages([]);
    } catch (err: any) {
      toast.error("فشل حذف المحادثات السابقة.");
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadMessages();
    }
  }, [projectId, loadMessages]);

  return {
    messages,
    setMessages,
    input,
    loadingMessages: loading,
    messagesEndRef,
    setInput,
    addMessage,
    updateMessage,
    saveMessage,
    clearMessages,
  };
}
