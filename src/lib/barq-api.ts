export interface VFSOperation {
  path: string;
  action: "create" | "update";
  content: string;
  language: "tsx" | "css" | "html";
}

export interface BarqGenerationResponse {
  type: "generation";
  thought_process: string[];
  design_personality: "formal" | "creative" | "minimalist" | "bold";
  vfs_operations: VFSOperation[];
  user_message: string;
  css_variables?: {
    primary_color?: string;
    secondary_color?: string;
    border_radius?: string;
    font_style?: string;
  };
}

export interface BarqConversationResponse {
  type: "conversation";
  message: string;
}

export type BarqAIResponse = BarqGenerationResponse | BarqConversationResponse;

export async function callBarqAI(
  messages: { role: string; content: string }[]
): Promise<BarqAIResponse> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barq-chat`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "فشل الاتصال" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }

  return resp.json();
}
