
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// --- Types and Interfaces ---

export interface VFSFile {
  name: string;
  content: string;
  language: 'tsx' | 'css' | 'html' | 'json' | 'ts' | 'js';
  version?: number;
}

export interface VFSOperation {
  path: string;
  content?: string;
  action: 'create' | 'update' | 'delete';
  timestamp?: string;
}

export interface VFSVersionSnapshot {
  version: number;
  timestamp: string;
  files: VFSFile[];
  message: string;
}

interface UseVFSProps {
  projectId: string | null;
  initialFiles?: VFSFile[];
}

export function useVFS({ projectId, initialFiles = [] }: UseVFSProps) {
  const [files, setFiles] = useState<VFSFile[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vfsHistory, setVfsHistory] = useState<VFSVersionSnapshot[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);

  const loadFilesAndHistory = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('vfs_data')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      if (data?.vfs_data && Array.isArray(data.vfs_data) && (data.vfs_data as any[]).length > 0) {
        // Try to load as VFS history format
        const vfsData = data.vfs_data as any;
        if (vfsData[0]?.files) {
          // It's history format
          const history: VFSVersionSnapshot[] = vfsData;
          setVfsHistory(history);
          setCurrentVersionIndex(history.length - 1);
          setFiles(history[history.length - 1].files);
        } else {
          // It's flat file array format
          const flatFiles: VFSFile[] = vfsData.map((f: any) => ({
            name: f.name || f.path,
            content: f.content || '',
            language: f.language || 'tsx',
          }));
          setFiles(flatFiles);
          const initialSnapshot: VFSVersionSnapshot = {
            version: 0,
            timestamp: new Date().toISOString(),
            files: flatFiles,
            message: "Loaded from project",
          };
          setVfsHistory([initialSnapshot]);
          setCurrentVersionIndex(0);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load VFS.');
      toast.error('لا يمكن تحميل ملفات المشروع.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadFilesAndHistory();
  }, [loadFilesAndHistory]);

  const applyVFSOperations = useCallback(async (operations: VFSOperation[], message: string = "AI build update") => {
    setLoading(true);
    setError(null);

    let newFiles = [...files];
    let changed = false;

    operations.forEach(op => {
      const fileIndex = newFiles.findIndex(f => f.name === op.path);
      const fileLanguage: VFSFile['language'] = op.path.endsWith('.css') ? 'css' : op.path.endsWith('.tsx') ? 'tsx' : op.path.endsWith('.ts') ? 'ts' : op.path.endsWith('.js') ? 'js' : op.path.endsWith('.json') ? 'json' : 'html';

      if ((op.action === 'create') && fileIndex === -1) {
        newFiles.push({ name: op.path, content: op.content || '', language: fileLanguage, version: 0 });
        changed = true;
      } else if ((op.action === 'create' || op.action === 'update') && fileIndex !== -1) {
        newFiles[fileIndex] = { ...newFiles[fileIndex], content: op.content || '', version: (newFiles[fileIndex].version || 0) + 1 };
        changed = true;
      } else if (op.action === 'delete' && fileIndex !== -1) {
        newFiles.splice(fileIndex, 1);
        changed = true;
      }
    });

    if (changed) {
      const newHistory = vfsHistory.slice(0, currentVersionIndex + 1);
      const newVersion = currentVersionIndex + 1;

      const newSnapshot: VFSVersionSnapshot = {
        version: newVersion,
        timestamp: new Date().toISOString(),
        files: newFiles,
        message,
      };

      const updatedHistory = [...newHistory, newSnapshot];

      setFiles(newFiles);
      setVfsHistory(updatedHistory);
      setCurrentVersionIndex(newVersion);

      try {
        const { error: saveError } = await supabase
          .from('projects')
          .update({ vfs_data: updatedHistory as any })
          .eq('id', projectId);
        if (saveError) throw saveError;
      } catch (err: any) {
        setError(err.message || 'Failed to save VFS changes.');
        toast.error('فشل حفظ التغييرات.');
      }
    }
    setLoading(false);
  }, [files, projectId, vfsHistory, currentVersionIndex]);

  const undo = useCallback(async () => {
    if (currentVersionIndex > 0) {
      const prev = currentVersionIndex - 1;
      setFiles(vfsHistory[prev].files);
      setCurrentVersionIndex(prev);
      toast.info(`تراجع إلى الإصدار ${vfsHistory[prev].version}`);
    }
  }, [currentVersionIndex, vfsHistory]);

  const redo = useCallback(async () => {
    if (currentVersionIndex < vfsHistory.length - 1) {
      const next = currentVersionIndex + 1;
      setFiles(vfsHistory[next].files);
      setCurrentVersionIndex(next);
      toast.info(`إعادة الإصدار ${vfsHistory[next].version}`);
    }
  }, [currentVersionIndex, vfsHistory]);

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
