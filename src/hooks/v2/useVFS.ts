
import { useState, useCallback, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

// --- Types and Interfaces ---

export interface VFSFile {
  name: string;
  content: string;
  language: 'tsx' | 'css' | 'html' | 'json' | 'ts' | 'js'; // Added more languages
  version?: number; // New: To track the version of this specific file
}

export interface VFSOperation {
  path: string;
  content?: string; // Content is optional for delete operations
  action: 'create' | 'update' | 'delete';
  timestamp?: string; // New: For better history tracking
}

// New: Represents a snapshot of the VFS at a given point in time
export interface VFSVersionSnapshot {
  version: number;
  timestamp: string;
  files: VFSFile[];
  message: string; // e.g., "Initial build", "User requested button", "AI fixed error"
}

interface UseVFSProps {
  projectId: string | null;
  initialFiles?: VFSFile[];
}

export function useVFS({ projectId, initialFiles = [] }: UseVFSProps) {
  const supabase = useSupabaseClient();
  const [files, setFiles] = useState<VFSFile[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vfsHistory, setVfsHistory] = useState<VFSVersionSnapshot[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);

  // Load files and history from the database
  const loadFilesAndHistory = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('vfs_history, current_vfs_version')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (data && data.vfs_history && data.vfs_history.length > 0) {
        const history: VFSVersionSnapshot[] = data.vfs_history;
        const currentVersion = data.current_vfs_version !== null ? data.current_vfs_version : history.length - 1;
        
        setVfsHistory(history);
        setCurrentVersionIndex(currentVersion);
        setFiles(history[currentVersion].files);
      } else {
        // If no history, initialize with current files (if any) and create first snapshot
        if (initialFiles.length > 0) {
          const initialSnapshot: VFSVersionSnapshot = {
            version: 0,
            timestamp: new Date().toISOString(),
            files: initialFiles,
            message: "Initial project setup",
          };
          setVfsHistory([initialSnapshot]);
          setCurrentVersionIndex(0);
          setFiles(initialFiles);
          // Persist this initial state
          await supabase
            .from('projects')
            .update({ vfs_history: [initialSnapshot], current_vfs_version: 0 })
            .eq('id', projectId);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load VFS history.');
      toast.error('لا يمكن تحميل سجل VFS للمشروع.');
    } finally {
      setLoading(false);
    }
  }, [projectId, supabase, initialFiles]);

  useEffect(() => {
    loadFilesAndHistory();
  }, [loadFilesAndHistory]);

  // Apply a set of operations to the VFS and create a new version in history
  const applyVFSOperations = useCallback(async (operations: VFSOperation[], message: string = "AI build update") => {
    setLoading(true);
    setError(null);

    let newFiles = [...files];
    let changed = false;

    operations.forEach(op => {
      const fileIndex = newFiles.findIndex(f => f.name === op.path);
      const fileLanguage = op.path.endsWith('.css') ? 'css' : op.path.endsWith('.tsx') ? 'tsx' : op.path.endsWith('.ts') ? 'ts' : op.path.endsWith('.js') ? 'js' : 'html';

      if (op.action === 'create' && fileIndex === -1) {
        newFiles.push({ name: op.path, content: op.content || '', language: fileLanguage, version: 0 });
        changed = true;
      } else if (op.action === 'update' && fileIndex !== -1) {
        if (newFiles[fileIndex].content !== op.content) {
          newFiles[fileIndex].content = op.content || '';
          newFiles[fileIndex].version = (newFiles[fileIndex].version || 0) + 1; // Increment file version
          changed = true;
        }
      } else if (op.action === 'delete' && fileIndex !== -1) {
        newFiles.splice(fileIndex, 1);
        changed = true;
      }
    });

    if (changed) {
      // If we are not at the latest version, truncate future history
      const newHistory = vfsHistory.slice(0, currentVersionIndex + 1);
      const newVersion = currentVersionIndex + 1;

      const newSnapshot: VFSVersionSnapshot = {
        version: newVersion,
        timestamp: new Date().toISOString(),
        files: newFiles,
        message: message,
      };

      const updatedHistory = [...newHistory, newSnapshot];

      setFiles(newFiles);
      setVfsHistory(updatedHistory);
      setCurrentVersionIndex(newVersion);

      // Persist changes to the database
      try {
        const { error } = await supabase
          .from('projects')
          .update({ vfs_history: updatedHistory, current_vfs_version: newVersion })
          .eq('id', projectId);
        if (error) throw error;
        toast.success("تم حفظ التغييرات في VFS بنجاح!");
      } catch (err: any) {
        setError(err.message || 'Failed to save VFS changes.');
        toast.error('فشل حفظ التغييرات في قاعدة البيانات.');
        // Optionally revert state or reload
        loadFilesAndHistory(); 
      }
    }
    setLoading(false);
  }, [files, projectId, supabase, vfsHistory, currentVersionIndex, loadFilesAndHistory]);

  const undo = useCallback(async () => {
    if (currentVersionIndex > 0) {
      const previousVersionIndex = currentVersionIndex - 1;
      const previousSnapshot = vfsHistory[previousVersionIndex];
      setFiles(previousSnapshot.files);
      setCurrentVersionIndex(previousVersionIndex);
      try {
        await supabase
          .from('projects')
          .update({ current_vfs_version: previousVersionIndex })
          .eq('id', projectId);
        toast.info(`تراجع إلى الإصدار ${previousSnapshot.version}: ${previousSnapshot.message}`);
      } catch (err: any) {
        setError(err.message || 'Failed to undo VFS.');
        toast.error('فشل التراجع عن التغييرات.');
      }
    }
  }, [currentVersionIndex, vfsHistory, projectId, supabase]);

  const redo = useCallback(async () => {
    if (currentVersionIndex < vfsHistory.length - 1) {
      const nextVersionIndex = currentVersionIndex + 1;
      const nextSnapshot = vfsHistory[nextVersionIndex];
      setFiles(nextSnapshot.files);
      setCurrentVersionIndex(nextVersionIndex);
      try {
        await supabase
          .from('projects')
          .update({ current_vfs_version: nextVersionIndex })
          .eq('id', projectId);
        toast.info(`إعادة تطبيق الإصدار ${nextSnapshot.version}: ${nextSnapshot.message}`);
      } catch (err: any) {
        setError(err.message || 'Failed to redo VFS.');
        toast.error('فشل إعادة تطبيق التغييرات.');
      }
    }
  }, [currentVersionIndex, vfsHistory, projectId, supabase]);

  return {
    files,
    loading,
    error,
    loadFilesAndHistory,
    applyVFSOperations,
    undo,
    redo,
    canUndo: currentVersionIndex > 0,
    canRedo: currentVersionIndex < vfsHistory.length - 1,
    currentVersion: vfsHistory[currentVersionIndex] || null,
    vfsHistory,
  };
}
