import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── BUILD PHASES ───
const BUILD_PHASES = [
  { id: 1, label: "الأساس", labelEn: "Foundation", files: ["styles.css", "App.tsx", "Header.tsx"],
    description: "Generate ONLY these 3 files: styles.css (CSS variables + keyframe animations, 80+ lines), App.tsx (main layout wrapper, 30+ lines), Header.tsx (sticky nav with glass effect + mobile menu, 250+ lines)" },
  { id: 2, label: "المحتوى الرئيسي", labelEn: "Main Content", files: ["Hero.tsx", "Services.tsx", "About.tsx"],
    description: "Generate ONLY these 3 files: Hero.tsx (full-screen hero, 300+ lines), Services.tsx (6-9 service cards, 300+ lines), About.tsx (2-column layout, 250+ lines)" },
  { id: 3, label: "التفاعل", labelEn: "Engagement", files: ["Stats.tsx", "Testimonials.tsx", "CTA.tsx"],
    description: "Generate ONLY these 3 files: Stats.tsx (stat counters, 200+ lines), Testimonials.tsx (testimonial cards, 250+ lines), CTA.tsx (gradient section, 200+ lines)" },
  { id: 4, label: "الإغلاق", labelEn: "Closing", files: ["Contact.tsx", "Footer.tsx"],
    description: "Generate ONLY these 2 files: Contact.tsx (form + contact info, 300+ lines), Footer.tsx (footer columns, 250+ lines)" },
];

// ─── Arabic content examples per phase ───
const ARABIC_EXAMPLES: Record<number, string> = {
  1: [
    '## MANDATORY ARABIC TEXT FOR Header.tsx:',
    '- Nav: "الرئيسية" | "خدماتنا" | "من نحن" | "آراء العملاء" | "تواصل معنا"',
    '- CTA: "احصل على استشارة مجانية" - Mobile: "القائمة"',
  ].join('\n'),
  2: [
    '## MANDATORY ARABIC TEXT:',
    '- Hero heading: "نصنع تجارب رقمية استثنائية تُلهم النجاح"',
    '- Hero sub: "شريكك الموثوق في التحول الرقمي منذ أكثر من ١٥ عاماً"',
    '- Stats: "+٥٠٠ مشروع ناجح" | "+١٥ سنة خبرة" | "+٩٨% رضا العملاء"',
    '- Services title: "خدماتنا المميزة" — 6 services with Arabic titles/descriptions',
    '- About title: "من نحن" — features: "فريق محترف" | "حلول مبتكرة" | "دعم متواصل"',
  ].join('\n'),
  3: [
    '## MANDATORY ARABIC TEXT:',
    '- Stats title: "إنجازاتنا بالأرقام" — labels: "مشروع مكتمل" | "سنة خبرة" | "رضا العملاء"',
    '- Testimonials title: "ماذا يقول عملاؤنا" — 3 testimonials with full Arabic text',
    '- Names: "م. أحمد الشهري" | "أ. نورة القحطاني" | "د. فهد العتيبي"',
    '- CTA: "مستعد لبدء مشروعك القادم؟" buttons: "تواصل معنا الآن" | "اطلب عرض سعر"',
  ].join('\n'),
  4: [
    '## MANDATORY ARABIC TEXT:',
    '- Contact title: "تواصل معنا" — labels: "الاسم الكامل" | "البريد الإلكتروني" | "رقم الجوال"',
    '- Placeholders: "أدخل اسمك" | "+٩٦٦ ٥٠ ٠٠٠ ٠٠٠٠" — submit: "إرسال الرسالة"',
    '- Footer: "عن الشركة" | "روابط سريعة" | "خدماتنا" | "تواصل معنا"',
    '- Newsletter: "اشترك في نشرتنا البريدية" — copyright: "جميع الحقوق محفوظة © ٢٠٢٤"',
  ].join('\n'),
};

function getPhaseSystemPrompt(phase: typeof BUILD_PHASES[number], cssVars?: string): string {
  return [
    'You are "Barq Builder Pro" — elite frontend architect.',
    '',
    '# ⛔ RULE #1: ALL TEXT MUST BE ARABIC — ZERO English in visible text',
    '# ⛔ RULE #2: MINIMUM 200 LINES PER .tsx COMPONENT',
    '# ⛔ RULE #3: MUST call generate_website tool',
    '',
    '- RTL direction, font-family: "Cairo", sans-serif',
    '- Tailwind CSS ONLY, SVG inline icons, no external images',
    '- No import/export — raw JSX only',
    '- Every element: hover + focus + active states',
    '- 3+ decorative background elements per section',
    '',
    ARABIC_EXAMPLES[phase.id] || '',
    '',
    `## PHASE ${phase.id}/4: "${phase.labelEn}" — Generate EXACTLY: ${phase.files.join(", ")}`,
    phase.description,
    `⚠️ ALL ${phase.files.length} files MUST be generated. Each .tsx 200+ lines.`,
    '',
    cssVars ? `## CSS VARS:\n${cssVars}\n` : '',
    phase.id === 1 ? '## styles.css: 80+ lines with CSS vars + 6+ @keyframes\n## App.tsx: <div dir="rtl" lang="ar"> wrapper' : '',
    '',
    '## DESIGN: Hero text-5xl+, sections py-24 md:py-32, cards rounded-3xl hover:shadow-2xl hover:-translate-y-2, glass bg-white/80 backdrop-blur-xl',
  ].join('\n');
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

// ─── Delay helper ───
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Try multiple API keys with per-request timeout ───
const AI_CALL_TIMEOUT = 45_000; // 45 seconds per provider attempt (optimized from 120s)

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

// ─── Pre-Generation Validation ───
const REQUIRED_LINES: Record<string, number> = {
  'Header.tsx': 250, 'Hero.tsx': 300, 'Services.tsx': 300, 'About.tsx': 250,
  'Stats.tsx': 200, 'Testimonials.tsx': 250, 'CTA.tsx': 150, 'Contact.tsx': 300,
  'Footer.tsx': 250, 'styles.css': 80, 'App.tsx': 50,
};

function validateGeneratedFiles(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ops = result?.vfs_operations;
  if (!Array.isArray(ops) || ops.length === 0) return { valid: false, errors: ['لم يتم توليد أي ملفات'] };

  for (const op of ops) {
    const content = op.content || '';
    const lines = content.split('\n').length;
    const required = REQUIRED_LINES[op.path];
    if (required && lines < required) errors.push(`${op.path}: ${lines} سطر (المطلوب ${required}+)`);

    if (op.path.endsWith('.tsx')) {
      const arabicChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
      const totalChars = content.replace(/\s/g, '').length;
      if (totalChars > 0 && arabicChars / totalChars < 0.10) {
        errors.push(`${op.path}: نسبة العربي ${Math.round((arabicChars / totalChars) * 100)}% (المطلوب 10%+)`);
      }
    }

    for (const pattern of ['// TODO', '// Add content', '// ...', '// rest of code', 'placeholder']) {
      if (content.includes(pattern)) errors.push(`${op.path}: يحتوي على "${pattern}"`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── Call AI for a single phase with retry + validation + early termination ───
const MAX_RETRIES = 3;
const RETRY_DELAYS = [10000, 20000, 40000];
const MAX_VALIDATION_RETRIES = 1;

async function callAIForPhase(
  messages: Array<{role: string; content: string}>,
  toolsDef: any[],
  geminiKeys: string[], groqKeys: string[], lovableKey: string | undefined
): Promise<any | null> {

  async function doCall(msgs: Array<{role: string; content: string}>): Promise<any | null> {
    const geminiBody = JSON.stringify({ model: "gemini-2.5-flash", messages: msgs, stream: true, max_tokens: 16384, temperature: 0.5, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_website" } } });
    const groqBody = JSON.stringify({ model: "llama-3.3-70b-versatile", messages: msgs, stream: true, max_tokens: 16384, temperature: 0.5, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_website" } } });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const waitMs = RETRY_DELAYS[attempt - 1] || 40000;
        console.log(`[retry] Attempt ${attempt + 1}/${MAX_RETRIES + 1} — waiting ${waitMs / 1000}s...`);
        await delay(waitMs);
      }

      let response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", geminiBody, "Gemini");
      if (!response) response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions", groqBody, "Groq");
      if (!response && lovableKey) {
        const lb = JSON.stringify({ model: "google/gemini-2.5-flash", messages: msgs, stream: true, max_tokens: 16384, temperature: 0.5, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_website" } } });
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + lovableKey, "Content-Type": "application/json" }, body: lb });
        if (res.ok) response = res;
      }

      if (response) {
        const args = await collectStreamedToolCall(response);
        if (args) {
          try {
            const parsed = JSON.parse(args);
            if (parsed?.vfs_operations?.length > 0) {
              console.log(`[callAI] ✅ Got ${parsed.vfs_operations.length} files`);
              return parsed;
            }
          } catch { console.error("[parse] Failed to parse tool call args"); }
        }
        console.warn("[stream] No valid tool call args, retrying...");
        continue;
      }
      console.warn(`[retry] All providers failed on attempt ${attempt + 1}`);
    }
    return null;
  }

  // First attempt
  let result = await doCall(messages);
  if (!result) return null;

  // Validate
  const validation = validateGeneratedFiles(result);
  if (validation.valid) {
    console.log('✅ Validation PASSED');
    return result;
  }

  console.warn('❌ Validation FAILED:', validation.errors);

  // Retry with correction prompt
  for (let retry = 0; retry < MAX_VALIDATION_RETRIES; retry++) {
    console.log(`🔄 Validation retry ${retry + 1}/${MAX_VALIDATION_RETRIES}...`);
    const retryPrompt = [
      '❌ VALIDATION FAILED — YOUR PREVIOUS OUTPUT WAS REJECTED.',
      'Issues:', ...validation.errors.map(e => '- ' + e),
      '', 'REGENERATE with 200-500 lines per component, 10%+ Arabic, NO placeholders.',
    ].join('\n');

    result = await doCall([...messages, { role: 'assistant', content: 'I will regenerate.' }, { role: 'user', content: retryPrompt }]);
    if (!result) return null;

    const rv = validateGeneratedFiles(result);
    if (rv.valid) { console.log('✅ Validation PASSED on retry'); return result; }
    console.warn('❌ Still failed on retry:', rv.errors);
  }

  console.warn('⚠️ Returning result despite validation failures');
  return result;
}

// ─── MAIN HANDLER ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { job_id, phase_number } = await req.json();
    if (!job_id || !phase_number) throw new Error("job_id and phase_number required");

    console.log(`[worker] Job ${job_id} — Phase ${phase_number}`);
    const phaseStartTime = Date.now();

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

    const phaseNum = phase_number as number;
    if (phaseNum < 1 || phaseNum > 4) throw new Error("Invalid phase: " + phaseNum);

    const currentPhase = BUILD_PHASES[phaseNum - 1];

    // Update status
    await supabase.from("build_jobs").update({
      status: `building_phase_${phaseNum}`,
      current_phase: phaseNum,
    }).eq("id", job_id);

    // Gather existing files from previous phases
    const existingFiles: { path: string; content: string }[] = [];
    for (let i = 1; i < phaseNum; i++) {
      const phaseFiles = (job as any)[`phase_${i}_files`];
      if (Array.isArray(phaseFiles)) {
        for (const f of phaseFiles) {
          existingFiles.push({ path: f.name || f.path, content: f.content });
        }
      }
    }

    // Get CSS vars context for phases 2+
    let cssVars = "";
    if (phaseNum > 1) {
      const cssFile = existingFiles.find(f => f.path === "styles.css");
      if (cssFile) cssVars = cssFile.content.slice(0, 500);
    }

    const systemPrompt = getPhaseSystemPrompt(currentPhase, cssVars || undefined);

    const toolsDef = [{
      type: "function",
      function: {
        name: "generate_website",
        description: `Generate EXACTLY ${currentPhase.files.length} files for Phase ${phaseNum}: ${currentPhase.files.join(", ")}. Each .tsx 200+ lines.`,
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
                  content: { type: "string", description: "Full code, 200+ lines for .tsx" },
                  language: { type: "string", enum: ["tsx", "css", "html"] },
                },
                required: ["path", "action", "content", "language"],
              },
              description: `EXACTLY ${currentPhase.files.length} files: ${currentPhase.files.join(", ")}`,
            },
            user_message: { type: "string", description: "Short Arabic status message" },
          },
          required: ["thought_process", "vfs_operations", "user_message"],
        },
      },
    }];

    // Build user message with context
    let userContent = job.build_prompt;
    if (existingFiles.length > 0) {
      const ctx = existingFiles.map(f => `--- ${f.path} ---\n${f.content.slice(0, 800)}`).join("\n\n");
      userContent += "\n\n## EXISTING FILES (from previous phases):\n" + ctx;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

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

    const result = await callAIForPhase(messages, toolsDef, geminiKeys, groqKeys, lovableKey);

    // ─── Performance Monitoring ───
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`[perf] Phase ${phaseNum} completed in ${phaseTime}ms (${(phaseTime / 1000).toFixed(1)}s)`);
    if (phaseTime > 60000) {
      console.warn(`⚠️ Phase ${phaseNum} took ${(phaseTime / 1000).toFixed(1)}s — exceeds 60s target`);
    }

    if (!result || !result.vfs_operations?.length) {
      console.error(`[worker] Phase ${phaseNum} failed after ${(phaseTime / 1000).toFixed(1)}s`);
      await supabase.from("build_jobs").update({
        status: `failed_phase_${phaseNum}`,
      }).eq("id", job_id);
      return new Response(JSON.stringify({ status: "failed", phase: phaseNum, timeMs: phaseTime }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save phase files to DB
    const phaseFiles = result.vfs_operations.map((op: any) => ({
      name: op.path?.split("/").pop() || op.path,
      content: op.content,
    }));

    const isLastPhase = phaseNum >= 4;
    const phaseKey = `phase_${phaseNum}_files`;

    await supabase.from("build_jobs").update({
      [phaseKey]: phaseFiles,
      current_phase: phaseNum,
      status: isLastPhase ? "completed" : `building_phase_${phaseNum + 1}`,
      ...(isLastPhase ? { completed_at: new Date().toISOString() } : {}),
    }).eq("id", job_id);

    console.log(`[worker] Phase ${phaseNum} done — ${phaseFiles.length} files saved in ${(phaseTime / 1000).toFixed(1)}s`);

    // Fire-and-forget: trigger next phase
    if (!isLastPhase) {
      const selfUrl = `${supabaseUrl}/functions/v1/barq-build-worker`;
      fetch(selfUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ job_id, phase_number: phaseNum + 1 }),
      }).catch(err => console.error("[worker] Failed to trigger next phase:", err));
    }

    return new Response(JSON.stringify({ status: "ok", phase: phaseNum, files: phaseFiles.length }), {
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
