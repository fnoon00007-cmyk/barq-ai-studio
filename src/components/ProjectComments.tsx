import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Trash2, Edit3, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCommentsProps {
  projectId: string;
  userId: string | null;
}

export function ProjectComments({ projectId, userId }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_comments", filter: `project_id=eq.${projectId}` }, () => {
        fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchComments]);

  const handleAdd = async () => {
    if (!newComment.trim() || !userId) return;
    const { error } = await supabase.from("project_comments").insert({
      project_id: projectId,
      user_id: userId,
      content: newComment.trim(),
    });
    if (error) { toast.error("فشل إضافة التعليق"); return; }
    setNewComment("");
    toast.success("تم إضافة التعليق");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("project_comments").delete().eq("id", id);
    toast.success("تم حذف التعليق");
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    await supabase.from("project_comments").update({ content: editContent.trim() }).eq("id", id);
    setEditingId(null);
    toast.success("تم تعديل التعليق");
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    return `منذ ${Math.floor(hrs / 24)} ي`;
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">التعليقات ({comments.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">لا توجد تعليقات بعد</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-secondary rounded-xl p-3 group">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    autoFocus
                  />
                  <button onClick={() => handleEdit(c.id)} className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                    {c.user_id === userId && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }} className="p-1 text-muted-foreground hover:text-foreground rounded"><Edit3 className="h-3 w-3" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1 text-destructive/60 hover:text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="اكتب تعليقاً..."
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button onClick={handleAdd} disabled={!newComment.trim()} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
