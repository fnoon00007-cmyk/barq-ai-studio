import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30;

// ─── TEMPLATE CUSTOMIZATION PROMPT ───
const TEMPLATE_CUSTOMIZER_PROMPT = [
  'You are "Barq Template Customizer" — an expert at modifying pre-built Arabic RTL website templates.',
  '',
  '## YOUR JOB:',
  'Take a COMPLETE, PROFESSIONAL template and apply PRECISE customizations.',
  'The template is already production-ready. You only modify specific parts.',
  '',
  '## STRICT RULES:',
  '1. You receive complete template files — DO NOT rewrite from scratch',
  '2. ONLY modify what the modifications object specifies:',
  '   - Brand name: Replace ALL instances of the template brand name',
  '   - Colors: Update CSS variables and Tailwind color classes',
  '   - Content: Replace text content (hero titles, descriptions, service names)',
  '   - Contact info: Update phone, email, address',
  '   - Sections: Reorder or hide sections in App.tsx',
  '3. PRESERVE the template structure, animations, layout, and professional quality',
  '4. ALL text MUST remain in Arabic',
  '5. Keep the EXACT same number of lines (+-10%) — do NOT shorten files',
  '6. MUST call generate_website tool with ALL template files (modified)',
  '7. Return COMPLETE file contents, not diffs',
  '',
  '## CUSTOMIZATION TYPES:',
  '- **brandName**: Find-and-replace the original brand name throughout all files',
  '- **colors**: Update :root CSS variables (--primary, --secondary, --accent) and any hardcoded Tailwind color classes',
  '- **content**: Replace hero heading, subheading, about text, service names, testimonial names',
  '- **contact**: Update phone numbers, email, physical address',
  '- **sections.remove**: Comment out or remove component imports in App.tsx',
  '- **sections.order**: Reorder component rendering in App.tsx',
  '',
  '## OUTPUT:',
  'Call generate_website with ALL files from the template, with modifications applied.',
  'Every file must be complete and production-ready.',
].join('\n');

// ─── MODIFICATION MODE PROMPT (for editing existing sites) ───
const MODIFICATION_PROMPT = [
  'You are "Barq Builder Pro" — modifying an existing Arabic RTL website.',
  '## RULES:',
  '- MUST call generate_website tool',
  '- Only create/update files that need changes',
  '- Use action: "update" for modified files',
  '- Keep existing color scheme and structure unless told otherwise',
  '- All text in Arabic, RTL, Tailwind CSS only',
  '- Each modified file: 200-400 lines',
].join('\n');

function sseEvent(data: Record<string, unknown>): string {
  return "data: " + JSON.stringify(data) + "\n\n";
}

// ─── AUTH ───
async function authenticateUser(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "غير مصرح — يرجى تسجيل الدخول" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response(JSON.stringify({ error: "جلسة غير صالحة — يرجى تسجيل الدخول مجدداً" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: allowed } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: user.id,
    p_function_type: "builder",
    p_daily_limit: DAILY_LIMIT,
  });

  if (!allowed) {
    return new Response(JSON.stringify({ error: "تم تجاوز الحد اليومي للبناء. حاول بكرة! ⚡" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId: user.id };
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

// ─── Validation ───
function validateGeneratedFiles(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ops = result?.vfs_operations;
  if (!Array.isArray(ops) || ops.length === 0) return { valid: false, errors: ['لم يتم توليد أي ملفات'] };

  for (const op of ops) {
    const content = op.content || '';
    if (op.path.endsWith('.tsx')) {
      const lines = content.split('\n').length;
      if (lines < 50) errors.push(`${op.path}: ${lines} سطر فقط (قصير جداً)`);

      const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
      const totalChars = content.replace(/\s/g, '').length;
      if (totalChars > 0 && arabicChars / totalChars < 0.05) {
        errors.push(`${op.path}: نسبة العربي ${Math.round((arabicChars / totalChars) * 100)}% (المطلوب 5%+)`);
      }
    }
    for (const pattern of ['// TODO', '// Add content', 'placeholder']) {
      if (content.includes(pattern)) errors.push(`${op.path}: يحتوي على "${pattern}"`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── Call AI with retry ───
async function callAI(
  messages: Array<{role: string; content: string}>,
  toolsDef: any[],
  toolName: string,
  geminiKeys: string[], groqKeys: string[], lovableKey: string | undefined
): Promise<any | null> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`[retry] Attempt ${attempt + 1}...`);
      await new Promise(r => setTimeout(r, 5000 * attempt));
    }

    const bodyBase = {
      messages,
      stream: true,
      max_tokens: 32768,
      temperature: 0.3,
      tools: toolsDef,
      tool_choice: { type: "function", function: { name: toolName } },
    };

    let response: Response | null = null;

    // Gemini
    response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      JSON.stringify({ ...bodyBase, model: "gemini-2.5-flash" }), "Gemini");

    // Groq fallback
    if (!response) {
      response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions",
        JSON.stringify({ ...bodyBase, model: "llama-3.3-70b-versatile" }), "Groq");
    }

    // Lovable fallback
    if (!response && lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + lovableKey, "Content-Type": "application/json" },
        body: JSON.stringify({ ...bodyBase, model: "google/gemini-2.5-flash" }),
      });
      if (res.ok) response = res;
    }

    if (!response) continue;

    const args = await collectStreamedToolCall(response);
    if (!args) continue;

    try {
      const parsed = JSON.parse(args);
      if (parsed?.vfs_operations?.length > 0) {
        console.log(`[callAI] Got ${parsed.vfs_operations.length} files`);
        return parsed;
      }
    } catch { console.error("[parse] Failed to parse tool call args"); }
  }
  return null;
}

// ─── Stream result helper ───
function streamResult(result: any, extraEvents?: Record<string, unknown>[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (extraEvents) {
          for (const evt of extraEvents) {
            controller.enqueue(encoder.encode(sseEvent(evt)));
          }
        }
        if (result.thought_process?.length) {
          controller.enqueue(encoder.encode(sseEvent({ event: "thinking_start" })));
          for (const step of result.thought_process) {
            controller.enqueue(encoder.encode(sseEvent({ event: "thinking_step", step })));
          }
        }
        if (result.vfs_operations?.length) {
          for (const op of result.vfs_operations) {
            controller.enqueue(encoder.encode(sseEvent({ event: "file_start", path: op.path, action: op.action, language: op.language })));
            controller.enqueue(encoder.encode(sseEvent({ event: "file_done", path: op.path, content: op.content })));
          }
        }
        controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: result.user_message || "تم بنجاح ⚡" })));
        controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
      } catch (e) {
        controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "خطأ أثناء المعالجة" })));
        controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── MAIN HANDLER ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const body = await req.json();
    const { build_prompt, existing_files, template_files, modifications } = body;
    if (!build_prompt) throw new Error("build_prompt is required");

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

    const toolsDef = [{
      type: "function",
      function: {
        name: "generate_website",
        description: "Output the customized/modified website files.",
        parameters: {
          type: "object",
          properties: {
            thought_process: { type: "array", items: { type: "string" }, description: "3-4 thinking steps in Arabic" },
            vfs_operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  action: { type: "string", enum: ["create", "update"] },
                  content: { type: "string", description: "Full file content" },
                  language: { type: "string", enum: ["tsx", "css", "html"] },
                },
                required: ["path", "action", "content", "language"],
              },
            },
            user_message: { type: "string", description: "Short Arabic status message" },
          },
          required: ["thought_process", "vfs_operations", "user_message"],
        },
      },
    }];

    // ─── TEMPLATE CUSTOMIZATION MODE ───
    if (template_files && Array.isArray(template_files) && template_files.length > 0) {
      console.log(`[template-mode] Customizing template with ${template_files.length} files`);
      const startTime = Date.now();

      const templateContext = template_files
        .map((f: any) => `--- ${f.path || f.name} ---\n${f.content}`)
        .join("\n\n");

      const modStr = modifications ? JSON.stringify(modifications, null, 2) : "No specific modifications";

      const userContent = [
        `## BUILD PROMPT:\n${build_prompt}`,
        `\n## MODIFICATIONS:\n${modStr}`,
        `\n## TEMPLATE FILES (customize these — return ALL files with modifications applied):\n${templateContext}`,
      ].join('\n');

      const messages = [
        { role: "system", content: TEMPLATE_CUSTOMIZER_PROMPT },
        { role: "user", content: userContent },
      ];

      const result = await callAI(messages, toolsDef, "generate_website", geminiKeys, groqKeys, lovableKey);
      const elapsed = Date.now() - startTime;
      console.log(`[template-mode] Completed in ${(elapsed / 1000).toFixed(1)}s`);

      if (!result) {
        return new Response(
          JSON.stringify({ error: "فشل تخصيص القالب" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return streamResult(result);
    }

    // ─── MODIFICATION MODE (existing site, no template) ───
    if (existing_files && Array.isArray(existing_files) && existing_files.length > 0) {
      console.log(`[mod-mode] Modifying ${existing_files.length} existing files`);

      const filesContext = existing_files
        .map((f: any) => "--- " + (f.path || f.name) + " ---\n" + (f.content || "").slice(0, 3000))
        .join("\n\n");

      const userContent = build_prompt + "\n\n## EXISTING FILES (modify these, don't rebuild from scratch):\n" + filesContext;

      const messages = [
        { role: "system", content: MODIFICATION_PROMPT },
        { role: "user", content: userContent },
      ];

      const result = await callAI(messages, toolsDef, "generate_website", geminiKeys, groqKeys, lovableKey);

      if (!result) {
        return new Response(
          JSON.stringify({ error: "فشل التعديل" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return streamResult(result);
    }

    // ─── DEFAULT: error ───
    return new Response(
      JSON.stringify({ error: "يرجى إرسال template_files للتخصيص أو existing_files للتعديل" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("barq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
