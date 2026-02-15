import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30;

// ─────────────────────────────────────────────────────────
//  BUILD PHASES — each phase generates 2-4 files max
// ─────────────────────────────────────────────────────────
const BUILD_PHASES = [
  {
    id: 1,
    label: "الأساس",
    labelEn: "Foundation",
    files: ["styles.css", "App.tsx", "Header.tsx"],
    description: "Generate ONLY these 3 files: styles.css (CSS variables + keyframe animations + utility classes, 80+ lines), App.tsx (main layout wrapper importing all components, 30+ lines), Header.tsx (sticky nav with glass effect + mobile menu, 250+ lines)",
  },
  {
    id: 2,
    label: "المحتوى الرئيسي",
    labelEn: "Main Content",
    files: ["Hero.tsx", "Services.tsx", "About.tsx"],
    description: "Generate ONLY these 3 files: Hero.tsx (full-screen hero with gradient bg + stats bar + CTAs, 300+ lines), Services.tsx (6-9 service cards grid with icons + hover effects, 300+ lines), About.tsx (2-column layout with features list + visual card, 250+ lines)",
  },
  {
    id: 3,
    label: "التفاعل",
    labelEn: "Engagement",
    files: ["Stats.tsx", "Testimonials.tsx", "CTA.tsx"],
    description: "Generate ONLY these 3 files: Stats.tsx (dark gradient bg + 4 stat counters with icons, 200+ lines), Testimonials.tsx (3 testimonial cards with stars + avatars, 250+ lines), CTA.tsx (gradient section with heading + 2 buttons + decorations, 150+ lines)",
  },
  {
    id: 4,
    label: "الإغلاق",
    labelEn: "Closing",
    files: ["Contact.tsx", "Footer.tsx"],
    description: "Generate ONLY these 2 files: Contact.tsx (2-column: form with 5 inputs + contact info cards, 300+ lines), Footer.tsx (dark bg + 4 columns + social icons + newsletter + copyright, 250+ lines)",
  },
];

// ─────────────────────────────────────────────────────────
//  BUILDER SYSTEM PROMPT (per-phase focused)
// ─────────────────────────────────────────────────────────
function getPhaseSystemPrompt(phase: typeof BUILD_PHASES[number], cssVars?: string): string {
  return [
    'You are "Barq Builder Pro" — an elite frontend architect generating PRODUCTION-GRADE Arabic RTL websites.',
    '',
    '## ⛔ ABSOLUTE NON-NEGOTIABLE RULES:',
    '1. You MUST call generate_website tool — NEVER respond with plain text',
    '2. ALL visible text content MUST be in Arabic (100%) — headings, paragraphs, labels, buttons, placeholders, alt text — EVERYTHING',
    '3. Use realistic Saudi business data: Saudi names (أحمد, فاطمة, محمد), Saudi cities (الرياض, جدة, الدمام), Saudi phone format (966+), Saudi currency (ريال)',
    '4. RTL direction with font-family: "Cairo", sans-serif',
    '5. Use Tailwind CSS classes ONLY — no custom CSS in components',
    '6. SVG inline icons (viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2")',
    '7. No external images — use gradients, SVG, patterns, CSS art',
    '8. No function declarations, export, import statements — raw JSX only',
    '9. Every interactive element MUST have hover + focus + active states',
    '',
    '## ⚠️ ARABIC CONTENT ENFORCEMENT:',
    '- ZERO English text allowed in any visible element',
    '- Button text: Arabic (e.g., "تواصل معنا", "اكتشف المزيد", "ابدأ الآن")',
    '- Headings: Arabic (e.g., "خدماتنا المميزة", "من نحن", "آراء عملائنا")',
    '- Placeholder text: Arabic (e.g., "أدخل اسمك الكامل", "البريد الإلكتروني")',
    '- Stats labels: Arabic (e.g., "عميل سعيد", "مشروع مكتمل", "سنة خبرة")',
    '- Footer links: Arabic (e.g., "الرئيسية", "من نحن", "خدماتنا", "تواصل معنا")',
    '- Testimonial names: Saudi Arabic names with titles (e.g., "م. أحمد الشهري", "د. فاطمة القحطاني")',
    '',
    '## 📏 MINIMUM SIZE REQUIREMENTS (STRICTLY ENFORCED):',
    '- Each .tsx component: MINIMUM 200 lines of rich JSX (NOT 50-100 lines)',
    '- styles.css: MINIMUM 80 lines with 6+ keyframe animations',
    '- App.tsx: 15-30 lines wrapper',
    '- Every section must have 3+ decorative background elements',
    '- Every card/item must have 8+ Tailwind utility classes',
    '- If a component is under 200 lines, ADD MORE: decorative elements, nested grids, detailed content, multiple states',
    '',
    '## PHASE INSTRUCTION:',
    `You are generating Phase ${phase.id}/4: "${phase.labelEn}"`,
    `${phase.description}`,
    '',
    `⚠️ Generate EXACTLY these files: ${phase.files.join(", ")}`,
    '⚠️ Do NOT skip any file. ALL files listed above MUST be generated.',
    '⚠️ If you generate fewer files than listed, the build will FAIL.',
    '',
    cssVars ? `## EXISTING CSS VARIABLES (use these colors consistently):\n${cssVars}\n` : '',
    '## COLOR SYSTEM (Context-Aware):',
    '| Business Type | Primary | Secondary | Accent |',
    '|---|---|---|---|',
    '| Restaurant/Food | amber-600 | stone-800 | amber-400 |',
    '| Tech/Software | blue-600 | slate-800 | cyan-400 |',
    '| Health/Medical | emerald-600 | slate-700 | green-400 |',
    '| Education | violet-600 | slate-800 | purple-400 |',
    '| Real Estate | sky-600 | gray-800 | sky-400 |',
    '| Fashion/Beauty | rose-500 | gray-800 | pink-400 |',
    '| General/Corporate | slate-700 | blue-600 | blue-400 |',
    '',
    '## DESIGN STANDARDS:',
    '- Hero heading: text-5xl sm:text-6xl md:text-7xl font-black',
    '- Section heading: text-3xl sm:text-4xl md:text-5xl font-bold',
    '- Section padding: py-24 md:py-32',
    '- Container: max-w-7xl mx-auto px-6 sm:px-8 lg:px-12',
    '- Cards: rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500',
    '- Glass: bg-white/80 backdrop-blur-xl border border-white/20',
    '- Buttons: hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] transition-all duration-300',
    '- Gradients: use via- for complex gradients',
    '- Every section: 3+ decorative bg elements (gradient orbs, dot patterns)',
    '- Inputs: focus:border-primary focus:ring-4 focus:ring-primary/20',
    '',
    '## BACKGROUND DECORATIONS (mandatory per section):',
    '<div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />',
    '<div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />',
    '',
    phase.id === 1 ? [
      '## styles.css MUST include (80+ lines):',
      '- CSS custom properties (--primary, --secondary, --accent, --gradient)',
      '- 6+ @keyframes: fadeInUp, fadeIn, slideInRight, float, pulse-slow, shimmer, bounce-gentle',
      '- .glass-effect, .text-gradient, .animate-float, .animate-pulse-slow, .section-fade',
      '- html { scroll-behavior: smooth }',
      '- ::selection { background: var(--primary); color: white }',
      '- Multiple utility classes for shadows, gradients, borders',
      '',
      '## App.tsx TEMPLATE:',
      '<div dir="rtl" lang="ar" style={{fontFamily: "\'Cairo\', sans-serif", overflow: "hidden"}}>',
      '  <Header /> <Hero /> <Services /> <About /> <Stats /> <Testimonials /> <CTA /> <Contact /> <Footer />',
      '</div>',
    ].join('\n') : '',
    '',
    '## QUALITY CHECKLIST (ALL must be true):',
    `- [ ] Generated EXACTLY ${phase.files.length} files: ${phase.files.join(", ")}`,
    '- [ ] Each .tsx component has 200+ lines of rich JSX',
    '- [ ] ZERO English text in any visible element',
    '- [ ] Saudi-specific data (names, cities, phone numbers)',
    '- [ ] Every interactive element has hover + focus + active states',
    '- [ ] Complex gradients with via- keyword',
    '- [ ] Multiple shadow layers on cards',
    '- [ ] Responsive: sm:, md:, lg: breakpoints on every element',
    '- [ ] 3+ decorative background elements per section',
  ].join('\n');
}

function sseEvent(data: Record<string, unknown>): string {
  return "data: " + JSON.stringify(data) + "\n\n";
}

// ─────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  MULTI-KEY ROTATION
// ─────────────────────────────────────────────────────────
async function tryKeys(
  keys: string[],
  url: string,
  body: string,
  label: string
): Promise<Response | null> {
  for (const key of keys) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body,
    });
    if (res.ok) {
      console.log(label + " succeeded");
      return res;
    }
    if (res.status === 429) {
      console.warn(label + " rate-limited, trying next...");
      continue;
    }
    console.error(label + " error:", res.status);
    continue;
  }
  return null;
}

// ─────────────────────────────────────────────────────────
//  COLLECT FULL STREAMED TOOL CALL
// ─────────────────────────────────────────────────────────
async function collectStreamedToolCall(response: Response): Promise<string> {
  const decoder = new TextDecoder();
  const reader = response.body!.getReader();
  let toolCallArgs = "";
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    textBuffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIdx);
      textBuffer = textBuffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;

      let parsed: any;
      try { parsed = JSON.parse(jsonStr); } catch { continue; }

      const delta = parsed.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.tool_calls) {
        const tc = delta.tool_calls[0];
        if (tc?.function?.arguments) {
          toolCallArgs += tc.function.arguments;
        }
      }
    }
  }

  return toolCallArgs;
}

// ─────────────────────────────────────────────────────────
//  CALL AI FOR SINGLE PHASE
// ─────────────────────────────────────────────────────────
async function callAIForPhase(
  messages: Array<{role: string; content: string}>,
  toolsDef: any[],
  geminiKeys: string[],
  groqKeys: string[],
  lovableKey: string | undefined
): Promise<any | null> {

  const geminiBody = JSON.stringify({
    model: "gemini-2.5-flash",
    messages,
    stream: true,
    max_tokens: 16384,
    tools: toolsDef,
    tool_choice: { type: "function", function: { name: "generate_website" } },
  });

  const groqBody = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages,
    stream: true,
    max_tokens: 16384,
    tools: toolsDef,
    tool_choice: { type: "function", function: { name: "generate_website" } },
  });

  let response: Response | null = null;

  // 1. Gemini
  response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", geminiBody, "Gemini builder");

  // 2. Groq fallback
  if (!response) {
    response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions", groqBody, "Groq builder");
  }

  // 3. Lovable fallback
  if (!response && lovableKey) {
    const lovableBody = JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      stream: true,
      max_tokens: 16384,
      tools: toolsDef,
      tool_choice: { type: "function", function: { name: "generate_website" } },
    });
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + lovableKey, "Content-Type": "application/json" },
      body: lovableBody,
    });
    if (res.ok) response = res;
  }

  if (!response) return null;

  const toolCallArgs = await collectStreamedToolCall(response);
  if (!toolCallArgs) return null;

  try { return JSON.parse(toolCallArgs); } catch { return null; }
}

// ─────────────────────────────────────────────────────────
//  MAIN HANDLER
// ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { build_prompt, existing_files, phase } = await req.json();
    if (!build_prompt) throw new Error("build_prompt is required");

    // Determine which phase to build
    const phaseNum = typeof phase === "number" ? phase : null;

    // MODIFICATION MODE: if existing_files provided without phase, do single-pass
    const isModification = existing_files && Array.isArray(existing_files) && existing_files.length > 0 && !phaseNum;

    const geminiKeys = [
      Deno.env.get("GEMINI_API_KEY"),
      Deno.env.get("GEMINI_API_KEY_2"),
      Deno.env.get("GEMINI_API_KEY_3"),
      Deno.env.get("GEMINI_API_KEY_4"),
      Deno.env.get("GEMINI_API_KEY_5"),
    ].filter(Boolean) as string[];

    const groqKeys = [
      Deno.env.get("GROQ_API_KEY"),
      Deno.env.get("GROQ_API_KEY_2"),
      Deno.env.get("GROQ_API_KEY_3"),
    ].filter(Boolean) as string[];

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    // If phaseNum specified, build only that phase
    if (phaseNum && phaseNum >= 1 && phaseNum <= 4) {
      const currentPhase = BUILD_PHASES[phaseNum - 1];
      
      // For phases 2+, include CSS vars from phase 1 context
      let cssVarsContext = "";
      if (phaseNum > 1 && existing_files?.length > 0) {
        const cssFile = existing_files.find((f: any) => f.path === "styles.css");
        if (cssFile) cssVarsContext = cssFile.content.slice(0, 500);
      }

      const systemPrompt = getPhaseSystemPrompt(currentPhase, cssVarsContext || undefined);

      const toolsDef = [
        {
          type: "function",
          function: {
            name: "generate_website",
            description: `Generate EXACTLY ${currentPhase.files.length} files for Phase ${phaseNum}: ${currentPhase.files.join(", ")}. Each .tsx file must be 200-400 lines of rich JSX with Tailwind.`,
            parameters: {
              type: "object",
              properties: {
                thought_process: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-4 thinking steps in Arabic for this phase",
                },
                vfs_operations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string" },
                      action: { type: "string", enum: ["create", "update"] },
                      content: { type: "string", description: "Full component code, 200-400 lines for .tsx files" },
                      language: { type: "string", enum: ["tsx", "css", "html"] },
                    },
                    required: ["path", "action", "content", "language"],
                  },
                  description: `EXACTLY ${currentPhase.files.length} files: ${currentPhase.files.join(", ")}`,
                },
                user_message: { type: "string", description: "Short Arabic status message for this phase" },
              },
              required: ["thought_process", "vfs_operations", "user_message"],
            },
          },
        },
      ];

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: build_prompt },
      ];

      const result = await callAIForPhase(messages, toolsDef, geminiKeys, groqKeys, lovableKey);

      if (!result) {
        return new Response(
          JSON.stringify({ error: "فشل توليد المرحلة " + phaseNum }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Stream phase result
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode(sseEvent({ 
              event: "phase_info", 
              phase: phaseNum, 
              totalPhases: 4, 
              label: currentPhase.label,
              files: currentPhase.files 
            })));

            if (result.thought_process?.length) {
              controller.enqueue(encoder.encode(sseEvent({ event: "thinking_start" })));
              for (const step of result.thought_process) {
                controller.enqueue(encoder.encode(sseEvent({ event: "thinking_step", step })));
              }
            }

            if (result.vfs_operations?.length) {
              for (const op of result.vfs_operations) {
                controller.enqueue(encoder.encode(sseEvent({
                  event: "file_start", path: op.path, action: op.action, language: op.language,
                })));
                controller.enqueue(encoder.encode(sseEvent({
                  event: "file_done", path: op.path, content: op.content,
                })));
              }
            }

            const msg = result.user_message || `تم بناء المرحلة ${phaseNum}/4 ⚡`;
            controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: msg })));
            controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
          } catch (e) {
            console.error("Stream error:", e);
            controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "خطأ في المرحلة " + phaseNum })));
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

    // ─── MODIFICATION MODE (single-pass, no phases) ───
    if (isModification) {
      let fullPrompt = build_prompt;
      const filesContext = existing_files
        .map((f: any) => "--- " + f.path + " ---\n" + f.content.slice(0, 3000) + (f.content.length > 3000 ? "\n...(truncated)" : ""))
        .join("\n\n");
      fullPrompt += "\n\n## EXISTING FILES (modify these, don't rebuild from scratch):\n" + filesContext;

      const modSystemPrompt = [
        'You are "Barq Builder Pro" — modifying an existing Arabic RTL website.',
        '## RULES:',
        '- MUST call generate_website tool',
        '- Only create/update files that need changes',
        '- Use action: "update" for modified files',
        '- Keep existing color scheme and structure unless told otherwise',
        '- All text in Arabic, RTL, Tailwind CSS only',
        '- Each modified file: 200-400 lines',
      ].join('\n');

      const toolsDef = [{
        type: "function",
        function: {
          name: "generate_website",
          description: "Modify the existing website files.",
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
            required: ["thought_process", "vfs_operations", "user_message"],
          },
        },
      }];

      const messages = [
        { role: "system", content: modSystemPrompt },
        { role: "user", content: fullPrompt },
      ];

      const result = await callAIForPhase(messages, toolsDef, geminiKeys, groqKeys, lovableKey);

      if (!result) {
        return new Response(
          JSON.stringify({ error: "فشل التعديل" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
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
            controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: result.user_message || "تم التعديل ⚡" })));
            controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
          } catch (e) {
            controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "خطأ أثناء التعديل" })));
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

    // ─── DEFAULT: No phase specified for new build → return error asking for phase ───
    return new Response(
      JSON.stringify({ error: "يرجى تحديد رقم المرحلة (phase: 1-4) أو إرسال existing_files للتعديل" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("barq-builder error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
