
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

// --- Types and Interfaces ---

export interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  thinkingSteps?: ThinkingStep[];
  affectedFiles?: string[];
}

interface UseBuilderChatProps {
  userId: string | null;
  projectId: string | null;
}

export function useBuilderChat({ userId, projectId }: UseBuilderChatProps) {
  const supabase = useSupabaseClient();
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
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    } catch (err: any) {
      toast.error('فشل تحميل سجل المحادثات.');
    } finally {
      setLoading(false);
    }
  }, [projectId, supabase]);

  // Add a new message to the local state
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update a streaming message
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  }, []);

  // Save a message to the database
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
  }, [projectId, userId, supabase]);

  // Clear all messages
  const clearMessages = useCallback(async () => {
    if (!projectId) return;
    try {
        const { error } = await supabase.from('chat_messages').delete().eq('project_id', projectId);
        if(error) throw error;
        setMessages([]);
    } catch(err: any) {
        toast.error("فشل حذف المحادثات السابقة.")
    }
  }, [projectId, supabase]);

  useEffect(() => {
    if (projectId) {
      loadMessages();
    }
  }, [projectId, loadMessages]);

  return {
    messages,
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
