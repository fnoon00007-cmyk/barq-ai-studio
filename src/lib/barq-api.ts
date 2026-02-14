import { supabase } from "@/integrations/supabase/client";

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
  onBuildReady?: (buildPrompt: string, summary: string, projectName: string, dependencyGraph: any) => void;
  onFixReady?: (operations: VFSOperation[], summary: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

const STREAM_TIMEOUT_MS = 45_000;

/** Get auth headers with user's actual session token */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    throw new Error("يرجى تسجيل الدخول أولاً");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function processSSEStream(
  resp: Response,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let lastActivity = Date.now();

  const timeoutCheck = setInterval(() => {
    if (Date.now() - lastActivity > STREAM_TIMEOUT_MS) {
      clearInterval(timeoutCheck);
      reader.cancel();
    }
  }, 5000);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      lastActivity = Date.now();
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          callbacks.onDone?.();
          return;
        }

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
            case "build_ready":
              callbacks.onBuildReady?.(parsed.build_prompt, parsed.summary, parsed.project_name, parsed.dependencyGraph);
              break;
            case "fix_ready":
              callbacks.onFixReady?.(parsed.operations, parsed.summary);
              break;
            case "done":
              callbacks.onDone?.();
              return;
          }
        } catch {
          console.warn("Skipped unparseable SSE line:", jsonStr.slice(0, 100));
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
          if (parsed.event === "build_ready") callbacks.onBuildReady?.(parsed.build_prompt, parsed.summary, parsed.project_name);
          if (parsed.event === "done") {
            callbacks.onDone?.();
            return;
          }
        } catch {
          /* ignore */
        }
      }
    }

    callbacks.onDone?.();
  } finally {
    clearInterval(timeoutCheck);
  }
}

/** Stream conversation with the Gemini planner */
export async function streamBarqPlanner(
  payload: { conversationHistory: { role: string; content: string }[]; projectId: string | null; vfsContext: any[] },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-planner`;
  const headers = await getAuthHeaders();

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages: payload.conversationHistory, projectId: payload.projectId, vfsContext: payload.vfsContext }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل الاتصال" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  await processSSEStream(resp, callbacks, signal);
}

/** Stream build execution with Groq builder */
export async function streamBarqBuilder(
  payload: { buildPrompt: string; projectId: string | null; dependencyGraph: any; existingFiles: { path: string; content: string }[] },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-chat`;
  const headers = await getAuthHeaders();

  const body: any = {
    build_prompt: payload.buildPrompt,
    projectId: payload.projectId,
    dependencyGraph: payload.dependencyGraph,
    existingFiles: payload.existingFiles,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل الاتصال" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  await processSSEStream(resp, callbacks, signal);
}

/** Review generated files with Gemini reviewer */
export interface ReviewResult {
  status: "approved" | "needs_fix";
  summary_ar: string;
  issues: { file: string; issue: string; fix_instruction: string }[];
  fix_prompt?: string;
}

export async function reviewBuild(
  buildPrompt: string,
  files: { path: string; content: string; language: string }[]
): Promise<ReviewResult> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-reviewer`;
  const headers = await getAuthHeaders();

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ build_prompt: buildPrompt, files }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل المراجعة" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  return resp.json();
}

/** GitHub Export API */
export async function githubExportAction(
  action: string,
  params: Record<string, any> = {},
  githubToken?: string
): Promise<any> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-export`;
  
  // Some actions don't require auth (get_auth_url, exchange_code)
  let headers: Record<string, string>;
  const noAuthActions = ["get_auth_url", "exchange_code"];
  if (noAuthActions.includes(action)) {
    headers = {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
  } else {
    headers = await getAuthHeaders();
  }
  
  if (githubToken) headers["x-github-token"] = githubToken;

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...params }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل العملية" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  return resp.json();
}

/** @deprecated Use streamBarqPlanner + streamBarqBuilder instead */
export async function streamBarqAI(
  messages: { role: string; content: string }[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamBarqPlanner(messages, callbacks, signal);
}

/** Stream fix suggestions from Gemini fixer */
export async function streamBarqFixer(
  payload: { errorMessage: string; componentStack: string; vfsContext: { path: string; content: string }[] },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-fixer`;
  const headers = await getAuthHeaders();

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      errorMessage: payload.errorMessage,
      componentStack: payload.componentStack,
      vfsContext: payload.vfsContext,
    }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل الاتصال بخدمة الإصلاح" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  await processSSEStream(resp, {
    onFixReady: (operations, summary) => {
      callbacks.onFixReady?.(operations, summary);
    },
    onDone: callbacks.onDone,
    onError: callbacks.onError,
    onMessageDelta: callbacks.onMessageDelta, // For any text output from fixer
  }, signal);
}
