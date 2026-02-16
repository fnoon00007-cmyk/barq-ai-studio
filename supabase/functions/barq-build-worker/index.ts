import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── TEMPLATE CUSTOMIZATION PROMPT ───
const TEMPLATE_CUSTOMIZER_PROMPT = [
  'You are "Barq Template Customizer" — an expert at modifying pre-built Arabic RTL website templates.',
  '',
  '## YOUR JOB:',
  'Take a COMPLETE, PROFESSIONAL template and apply PRECISE customizations.',
  '',
  '## STRICT RULES:',
  '1. You receive complete template files — DO NOT rewrite from scratch',
  '2. ONLY modify what the modifications object specifies',
  '3. PRESERVE the template structure, animations, layout, and professional quality',
  '4. ALL text MUST remain in Arabic',
  '5. Keep the EXACT same number of lines (+-10%)',
  '6. MUST call generate_website tool with ALL template files (modified)',
  '7. Return COMPLETE file contents, not diffs',
].join('\n');

function sseEvent(data: Record<string, unknown>): string {
  return "data: " + JSON.stringify(data) + "\n\n";
}

// ─── MULTI-KEY ROTATION ───
const AI_CALL_TIMEOUT = 90_000;

async function tryKeys(keys: string[], url: string, body: string, label: string): Promise<Response | null> {
  for (const key of keys) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_CALL_TIMEOUT);
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) { console.log(label + " ok"); return res; }
      if (res.status === 429) { console.warn(label + " 429, next..."); continue; }
      console.error(label + " error:", res.status);
      continue;
    } catch (err) {
      console.warn(label + " timeout/error:", err instanceof Error ? err.message : err);
      continue;
    }
  }
  return null;
}

// ─── Collect streamed tool call ───
async function collectStreamedToolCall(response: Response): Promise<string> {
  const decoder = new TextDecoder();
  const reader = response.body!.getReader();
  let toolCallArgs = "";
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, idx);
      textBuffer = textBuffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const tc = parsed.choices?.[0]?.delta?.tool_calls?.[0];
        if (tc?.function?.arguments) toolCallArgs += tc.function.arguments;
      } catch { /* skip */ }
    }
  }
  return toolCallArgs;
}

// ─── Call AI ───
async function callAI(
  messages: Array<{role: string; content: string}>,
  toolsDef: any[],
  geminiKeys: string[], groqKeys: string[], lovableKey: string | undefined
): Promise<any | null> {
  const bodyBase = {
    messages,
    stream: true,
    max_tokens: 32768,
    temperature: 0.3,
    tools: toolsDef,
    tool_choice: { type: "function", function: { name: "generate_website" } },
  };

  let response: Response | null = null;

  response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    JSON.stringify({ ...bodyBase, model: "gemini-2.5-flash" }), "Gemini");

  if (!response) {
    response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions",
      JSON.stringify({ ...bodyBase, model: "llama-3.3-70b-versatile" }), "Groq");
  }

  if (!response && lovableKey) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + lovableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ ...bodyBase, model: "google/gemini-2.5-flash" }),
    });
    if (res.ok) response = res;
  }

  if (!response) return null;

  const args = await collectStreamedToolCall(response);
  if (!args) return null;

  try { return JSON.parse(args); } catch { return null; }
}

// ─── MAIN HANDLER ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { job_id } = await req.json();
    if (!job_id) throw new Error("job_id required");

    console.log(`[worker] Job ${job_id}`);
    const startTime = Date.now();

    // Load job from DB
    const { data: job, error: jobErr } = await supabase
      .from("build_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) throw new Error("Job not found: " + job_id);
    if (job.status === "completed" || job.status === "cancelled") {
      return new Response(JSON.stringify({ status: "skipped", reason: job.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status
    await supabase.from("build_jobs").update({
      status: "building_template",
      current_phase: 1,
    }).eq("id", job_id);

    // API keys
    const geminiKeys = [
      Deno.env.get("GEMINI_API_KEY"), Deno.env.get("GEMINI_API_KEY_2"),
      Deno.env.get("GEMINI_API_KEY_3"), Deno.env.get("GEMINI_API_KEY_4"),
      Deno.env.get("GEMINI_API_KEY_5"),
    ].filter(Boolean) as string[];
    const groqKeys = [
      Deno.env.get("GROQ_API_KEY"), Deno.env.get("GROQ_API_KEY_2"),
      Deno.env.get("GROQ_API_KEY_3"),
    ].filter(Boolean) as string[];
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    // Template files are stored in the job's dependency_graph.templateFiles
    const templateFiles = (job.dependency_graph as any)?.templateFiles || [];
    const modifications = (job.dependency_graph as any)?.modifications || {};

    if (!templateFiles.length) {
      console.error("[worker] No template files in job");
      await supabase.from("build_jobs").update({ status: "failed_no_template" }).eq("id", job_id);
      return new Response(JSON.stringify({ status: "failed", reason: "no template files" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[worker] Template customization: ${templateFiles.length} files`);

    // Build AI prompt
    const templateContext = templateFiles
      .map((f: any) => `--- ${f.path || f.name} ---\n${f.content}`)
      .join("\n\n");

    const modStr = JSON.stringify(modifications, null, 2);

    const toolsDef = [{
      type: "function",
      function: {
        name: "generate_website",
        description: "Output the customized template files.",
        parameters: {
          type: "object",
          properties: {
            thought_process: { type: "array", items: { type: "string" } },
            vfs_operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  action: { type: "string", enum: ["create", "update"] },
                  content: { type: "string" },
                  language: { type: "string", enum: ["tsx", "css", "html"] },
                },
                required: ["path", "action", "content", "language"],
              },
            },
            user_message: { type: "string" },
          },
          required: ["vfs_operations", "user_message"],
        },
      },
    }];

    const messages = [
      { role: "system", content: TEMPLATE_CUSTOMIZER_PROMPT },
      {
        role: "user",
        content: [
          `## BUILD PROMPT:\n${job.build_prompt}`,
          `\n## MODIFICATIONS:\n${modStr}`,
          `\n## TEMPLATE FILES:\n${templateContext}`,
        ].join('\n'),
      },
    ];

    const result = await callAI(messages, toolsDef, geminiKeys, groqKeys, lovableKey);

    const elapsed = Date.now() - startTime;
    console.log(`[worker] Completed in ${(elapsed / 1000).toFixed(1)}s`);

    if (!result || !result.vfs_operations?.length) {
      console.error(`[worker] Failed after ${(elapsed / 1000).toFixed(1)}s`);
      await supabase.from("build_jobs").update({ status: "failed" }).eq("id", job_id);
      return new Response(JSON.stringify({ status: "failed", timeMs: elapsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save all files to phase_1 (single-pass, no multi-phase needed)
    const allFiles = result.vfs_operations.map((op: any) => ({
      name: op.path?.split("/").pop() || op.path,
      content: op.content,
    }));

    await supabase.from("build_jobs").update({
      phase_1_files: allFiles,
      current_phase: 1,
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", job_id);

    console.log(`[worker] Done — ${allFiles.length} files saved in ${(elapsed / 1000).toFixed(1)}s`);

    return new Response(JSON.stringify({ status: "ok", files: allFiles.length, timeMs: elapsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("[worker] error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
