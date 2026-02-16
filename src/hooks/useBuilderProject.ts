import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVFS, VFSFile } from "@/hooks/useVFS";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useBuilderProject(projectId: string | undefined) {
  const { files, addLogEntry, applyVFSOperations, activityLog } = useVFS();
  const [projectTitle, setProjectTitle] = useState("مشروع جديد");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [userId, setUserId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(projectId || null);
  const navigate = useNavigate();

  // Get user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Load project data
  useEffect(() => {
    if (!projectId) return;
    setCurrentProjectId(projectId);
    currentProjectIdRef.current = projectId;
    supabase
      .from("projects")
      .select("title, vfs_data")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProjectTitle(data.title || "مشروع جديد");
          if (data.vfs_data && Array.isArray(data.vfs_data)) {
            applyVFSOperations(
              (data.vfs_data as any[]).map((f: any) => ({
                path: f.name || f.path,
                action: "create" as const,
                content: f.content,
                language: f.language || "tsx",
              }))
            );
          }
        }
      });
  }, [projectId]);

  // Save project
  const saveProject = useCallback(async () => {
    if (!userId || files.length === 0) return;
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      const pid = currentProjectIdRef.current;
      if (!pid) {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            title: projectTitle,
            user_id: userId,
            status: "draft",
            vfs_data: files as any,
          })
          .select("id")
          .single();

        if (!error && data) {
          setCurrentProjectId(data.id);
          currentProjectIdRef.current = data.id;
          navigate(`/builder/${data.id}`, { replace: true });
          toast.success("تم حفظ المشروع ⚡");
        }
      } else {
        await supabase
          .from("projects")
          .update({ vfs_data: files as any, updated_at: new Date().toISOString() })
          .eq("id", pid);
      }
    } finally {
      savingRef.current = false;
    }
  }, [userId, files, projectTitle, navigate]);

  // Auto-save
  useEffect(() => {
    if (!userId || files.length === 0) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveProject();
    }, 2000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [files, userId, saveProject]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/");
  }, [navigate]);

  return {
    files,
    activityLog,
    addLogEntry,
    applyVFSOperations,
    projectTitle,
    setProjectTitle,
    currentProjectId,
    setCurrentProjectId,
    userId,
    saveProject,
    handleLogout,
  };
}
