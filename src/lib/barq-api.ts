export interface VFSOperation {
  path: string;
  action: "create" | "update";
  content: string;
  language: "tsx" | "css" | "html";
}

export interface StreamCallbacks {
  onThinkingStart?: () => void;
  onThinkingStep?: (step: string) => void;
  onFileStart?: (path: string, action: string) => void;
  onFileDone?: (path: string, content: string) => void;
  onMessageDelta?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export async function streamBarqAI(
  messages: { role: string; content: string }[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-chat`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل الاتصال" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { callbacks.onDone?.(); return; }

      try {
        const parsed = JSON.parse(jsonStr);
        const event = parsed.event;

        switch (event) {
          case "thinking_start":
            callbacks.onThinkingStart?.();
            break;
          case "thinking_step":
            callbacks.onThinkingStep?.(parsed.step);
            break;
          case "file_start":
            callbacks.onFileStart?.(parsed.path, parsed.action);
            break;
          case "file_done":
            callbacks.onFileDone?.(parsed.path, parsed.content);
            break;
          case "message_delta":
            callbacks.onMessageDelta?.(parsed.content);
            break;
          case "done":
            callbacks.onDone?.();
            return;
        }
      } catch {
        // partial JSON, put back
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.event === "message_delta") callbacks.onMessageDelta?.(parsed.content);
        if (parsed.event === "done") { callbacks.onDone?.(); return; }
      } catch { /* ignore */ }
    }
  }

  callbacks.onDone?.();
}
