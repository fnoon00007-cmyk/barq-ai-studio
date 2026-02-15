/**
 * Hook to run preview-builder in a Web Worker for non-blocking UI.
 * Falls back to main-thread if Worker is unavailable.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { VFSFile } from "@/hooks/v2/useVFS";
import { buildPreviewHTML } from "@/lib/preview-builder";

export function usePreviewWorker(files: VFSFile[], refreshKey: number) {
  const [html, setHtml] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const pendingIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL("@/lib/preview-builder.worker.ts", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = (e: MessageEvent) => {
        const { id, html: result, error } = e.data;
        if (id === pendingIdRef.current) {
          if (error) {
            console.error("[PreviewWorker] Error:", error);
            setHtml(null);
          } else {
            setHtml(result);
          }
          setIsBuilding(false);
        }
      };

      workerRef.current.onerror = (err) => {
        console.warn("[PreviewWorker] Worker error, falling back to main thread:", err.message);
        workerRef.current = null;
      };
    } catch {
      console.warn("[PreviewWorker] Workers not supported, using main thread");
      workerRef.current = null;
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Build preview when files change
  useEffect(() => {
    if (files.length === 0) {
      setHtml(null);
      return;
    }

    setIsBuilding(true);
    const id = ++pendingIdRef.current;

    if (workerRef.current) {
      // Serialize files for worker (strip non-serializable data)
      const serializableFiles = files.map(f => ({
        name: f.name,
        content: f.content,
        language: f.language,
      }));
      workerRef.current.postMessage({ id, files: serializableFiles });
    } else {
      // Fallback: main thread
      try {
        const result = buildPreviewHTML(files as any);
        if (id === pendingIdRef.current) {
          setHtml(result);
        }
      } catch (err) {
        console.error("[PreviewWorker] Fallback error:", err);
        if (id === pendingIdRef.current) setHtml(null);
      }
      setIsBuilding(false);
    }
  }, [files, refreshKey]);

  return { html, isBuilding };
}
