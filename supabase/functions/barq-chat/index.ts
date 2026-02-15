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
  const ARABIC_EXAMPLES: Record<number, string> = {
    1: [
      '## MANDATORY ARABIC TEXT FOR Header.tsx:',
      '- Nav links: "الرئيسية" | "خدماتنا" | "من نحن" | "آراء العملاء" | "تواصل معنا"',
      '- CTA button: "احصل على استشارة مجانية"',
      '- Mobile menu title: "القائمة"',
      '- Logo alt: "الشعار"',
    ].join('\n'),
    2: [
      '## MANDATORY ARABIC TEXT FOR Hero.tsx:',
      '- Main heading: e.g. "نصنع تجارب رقمية استثنائية تُلهم النجاح"',
      '- Subheading: e.g. "شريكك الموثوق في التحول الرقمي منذ أكثر من ١٥ عاماً في المملكة العربية السعودية"',
      '- Primary CTA: "ابدأ مشروعك الآن"',
      '- Secondary CTA: "تعرّف علينا أكثر"',
      '- Stats: "+٥٠٠ مشروع ناجح" | "+١٥ سنة خبرة" | "+٩٨% رضا العملاء" | "+٢٠٠ عميل دائم"',
      '',
      '## MANDATORY ARABIC TEXT FOR Services.tsx:',
      '- Section title: "خدماتنا المميزة"',
      '- 6 services with Arabic titles and 2-3 sentence descriptions each',
      '',
      '## MANDATORY ARABIC TEXT FOR About.tsx:',
      '- Section title: "من نحن"',
      '- Features: "فريق محترف" | "حلول مبتكرة" | "دعم متواصل" | "أسعار تنافسية"',
    ].join('\n'),
    3: [
      '## MANDATORY ARABIC TEXT FOR Stats.tsx:',
      '- Section title: "إنجازاتنا بالأرقام"',
      '- 4 stats with Arabic labels',
      '',
      '## MANDATORY ARABIC TEXT FOR Testimonials.tsx:',
      '- Section title: "ماذا يقول عملاؤنا"',
      '- 3 testimonials with Saudi names: "م. أحمد الشهري" | "أ. نورة القحطاني" | "د. فهد العتيبي"',
      '- Roles: "مدير شركة تقنية - الرياض" | "صاحبة مشروع - جدة" | "طبيب أسنان - الدمام"',
      '',
      '## MANDATORY ARABIC TEXT FOR CTA.tsx:',
      '- Heading: "مستعد لبدء مشروعك القادم؟"',
      '- Button 1: "تواصل معنا الآن" | Button 2: "اطلب عرض سعر"',
    ].join('\n'),
    4: [
      '## MANDATORY ARABIC TEXT FOR Contact.tsx:',
      '- Form labels: "الاسم الكامل" | "البريد الإلكتروني" | "رقم الجوال" | "الموضوع" | "رسالتك"',
      '- Contact: "الرياض، حي العليا، شارع الملك فهد" | "+٩٦٦ ٥٥ ١٢٣ ٤٥٦٧" | "info@example.sa"',
      '',
      '## MANDATORY ARABIC TEXT FOR Footer.tsx:',
      '- Columns: "عن الشركة" | "روابط سريعة" | "خدماتنا" | "تواصل معنا"',
      '- Newsletter: "اشترك في نشرتنا البريدية"',
      '- Copyright: "جميع الحقوق محفوظة © ٢٠٢٤"',
    ].join('\n'),
  };

  return [
    '⚠️⚠️⚠️ CRITICAL RULES - MUST FOLLOW ⚠️⚠️⚠️',
    'YOU ARE A PROFESSIONAL FRONTEND ENGINEER, NOT AN AI ASSISTANT.',
    'YOUR ONLY JOB: Generate COMPLETE, PRODUCTION-READY code files.',
    '═══════════════════════════════════════════════════════════════',
    'MANDATORY FILE SIZE REQUIREMENTS:',
    'Each component MUST be AT LEAST:',
    '- Header.tsx: 250+ lines MINIMUM',
    '- Hero.tsx: 300+ lines MINIMUM',
    '- Services.tsx: 300+ lines MINIMUM',
    '- About.tsx: 250+ lines MINIMUM',
    '- Stats.tsx: 200+ lines MINIMUM',
    '- Testimonials.tsx: 250+ lines MINIMUM',
    '- CTA.tsx: 150+ lines MINIMUM',
    '- Contact.tsx: 300+ lines MINIMUM',
    '- Footer.tsx: 250+ lines MINIMUM',
    '- styles.css: 80+ lines MINIMUM',
    '- App.tsx: 50+ lines MINIMUM',
    'IF ANY FILE IS LESS THAN THE MINIMUM → YOU FAILED.',
    '═══════════════════════════════════════════════════════════════',
    'ABSOLUTELY FORBIDDEN:',
    '❌ NO placeholders like: "// Add content here"',
    '❌ NO TODO comments like: "// TODO: implement"',
    '❌ NO abbreviated code like: "// ... rest of code"',
    '❌ NO incomplete functions',
    '❌ NO English text (ONLY Arabic allowed)',
    '❌ NO short components (< 100 lines)',
    '═══════════════════════════════════════════════════════════════',
    'MANDATORY CODE STRUCTURE:',
    'Every component MUST include:',
    '✅ At least 200 lines of ACTUAL code (not comments)',
    '✅ Multiple decorative background shapes (3-5 per component)',
    '✅ Complex Tailwind classes: bg-gradient-to-br, shadow-2xl, hover:scale-105',
    '✅ ALL text content in Arabic (100%)',
    '✅ Saudi data: phone numbers (966+), addresses, names',
    '✅ Hover effects on EVERY interactive element',
    '✅ Responsive design (sm:, md:, lg:, xl:)',
    '✅ Animations (@keyframes or Tailwind animate-)',
    '═══════════════════════════════════════════════════════════════',
    'EXAMPLE OF CORRECT OUTPUT:',
    '// Hero.tsx (350 lines) ✅',
    '',
    '<section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">',
    '  {/* Decorative background shapes - MANDATORY */}',
    '  <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />',
    '  <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" />',
    '  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />',
    '  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">',
    '    <div className="max-w-5xl mx-auto text-center space-y-12">',
    '      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight">',
    '        <span className="block text-gray-900 mb-4">نصنع تجارب رقمية</span>',
    '        <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">استثنائية تُلهم النجاح</span>',
    '      </h1>',
    '      ... (continue for 300+ lines with stats, CTAs, trust indicators, etc.)',
    '    </div>',
    '  </div>',
    '</section>',
    '═══════════════════════════════════════════════════════════════',
    'EXAMPLE OF WRONG OUTPUT (DO NOT DO THIS):',
    '// Hero.tsx (10 lines) ❌ WRONG!',
    '<div className="hero"><h1>عنوان رئيسي</h1><p>وصف قصير</p><button>ابدأ الآن</button></div>',
    '// THIS IS WRONG! TOO SHORT! NO DETAIL!',
    '═══════════════════════════════════════════════════════════════',
    'REMEMBER:',
    '- You are NOT writing examples or demos',
    '- You are writing PRODUCTION-READY code',
    '- Every component = 200-500 lines MINIMUM',
    '- ALL text MUST be in Arabic',
    '- RICH Tailwind classes are MANDATORY',
    '- NO placeholders, NO TODOs, NO shortcuts',
    '- IF YOU GENERATE SHORT/INCOMPLETE CODE → YOU FAILED THE TASK.',
    '',
    '# ADDITIONAL RULES:',
    '- Call generate_website tool — NEVER respond with plain text',
    '- RTL direction with font-family: "Cairo", sans-serif',
    '- Tailwind CSS classes ONLY — no custom CSS in components',
    '- SVG inline icons (viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2")',
    '- No external images — use gradients, SVG, patterns',
    '- No import/export statements — raw JSX only',
    '- Every interactive element: hover + focus + active states',
    '',
    ARABIC_EXAMPLES[phase.id] || '',
    '',
    '## PHASE INSTRUCTION:',
    `Phase ${phase.id}/4: "${phase.labelEn}" — Generate EXACTLY: ${phase.files.join(", ")}`,
    phase.description,
    '',
    `⚠️ ALL ${phase.files.length} files MUST be generated. Missing files = FAILURE.`,
    `⚠️ Each .tsx file MUST meet the MINIMUM line count specified above. Under minimum = REJECTED.`,
    `⚠️ ZERO English in visible text. Any English = REJECTED.`,
    '',
    cssVars ? `## CSS VARIABLES:\n${cssVars}\n` : '',
    '## COLOR SYSTEM:',
    '| Type | Primary | Secondary | Accent |',
    '|---|---|---|---|',
    '| Restaurant | amber-600 | stone-800 | amber-400 |',
    '| Tech | blue-600 | slate-800 | cyan-400 |',
    '| Health | emerald-600 | slate-700 | green-400 |',
    '| Education | violet-600 | slate-800 | purple-400 |',
    '| Real Estate | sky-600 | gray-800 | sky-400 |',
    '| General | slate-700 | blue-600 | blue-400 |',
    '',
    '## DESIGN:',
    '- Hero heading: text-5xl sm:text-6xl md:text-7xl font-black',
    '- Section heading: text-3xl sm:text-4xl md:text-5xl font-bold',
    '- Section padding: py-24 md:py-32',
    '- Container: max-w-7xl mx-auto px-6 sm:px-8 lg:px-12',
    '- Cards: rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500',
    '- Glass: bg-white/80 backdrop-blur-xl border border-white/20',
    '- Buttons: hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]',
    '- Every section: 3+ decorative bg elements (gradient orbs with blur-3xl)',
    '',
    phase.id === 1 ? [
      '## styles.css (80+ lines): CSS vars, 6+ @keyframes, .glass-effect, .text-gradient, .animate-float',
      '## App.tsx: <div dir="rtl" lang="ar"> wrapper importing all components',
    ].join('\n') : '',
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
