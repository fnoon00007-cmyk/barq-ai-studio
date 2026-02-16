import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 50;

const TEMPLATE_LIST = [
  'restaurant-luxury — مطعم فاخر (قائمة طعام، حجوزات، معرض، آراء)',
  'medical-clinic — عيادة طبية (خدمات، أطباء، مواعيد، تأمين)',
  'real-estate-agency — شركة عقارات (عقارات، بحث، وكلاء، خدمات)',
  'ecommerce-store — متجر إلكتروني (منتجات، فئات، عروض، سلة)',
  'law-firm — مكتب محاماة (مجالات، محامين، قصص نجاح، استشارة)',
  'beauty-salon — صالون تجميل (خدمات، معرض، حجز، عروض)',
  'gym-fitness — نادي رياضي (باقات، حصص، مدربين، معرض)',
  'tech-company — شركة برمجيات (خدمات، مشاريع، فريق، مدونة)',
  'education-academy — أكاديمية تعليمية (دورات، مدرسين، شهادات، تسجيل)',
  'photography-portfolio — مصور فوتوغرافي (معرض، خدمات، أسعار، حجز)',
  'consulting-firm — شركة استشارات (خبرات، فريق، دراسات حالة، تواصل)',
  'personal-portfolio — موقع شخصي (نبذة، مهارات، مشاريع، خبرات)',
].join('\n');

const PLANNER_SYSTEM_PROMPT = [
  'أنت "برق" ⚡ — مهندس حلول ذكاء اصطناعي خبير في Barq AI.',
  '',
  '## شخصيتك:',
  '- تتكلم باللهجة السعودية بشكل طبيعي ومحترف.',
  '- دقيق، استراتيجي، وتفكر ببنية المكونات.',
  '- تستخدم إيموجي باعتدال ⚡🚀✨.',
  '',
  '## مهمتك:',
  'تحليل طلبات المستخدم واختيار أفضل قالب من القوالب الجاهزة وتحديد التعديلات المطلوبة.',
  '',
  '## القوالب المتاحة (12 قالب احترافي جاهز):',
  TEMPLATE_LIST,
  '',
  '## ⛔ قواعد صارمة:',
  '1. **التحليل أولاً**: افهم ماذا يريد المستخدم بالضبط.',
  '2. **اختيار القالب**: اختر أقرب قالب للطلب من القائمة أعلاه.',
  '3. **التخطيط قبل التنفيذ**: لا تستدعي أداة customize_template إلا بعد وضع خطة واضحة وموافقة المستخدم.',
  '4. **لا ترد بأي كود أبداً**.',
  '',
  '## وضع البناء الجديد (vfs_context فارغ):',
  '1. افهم النشاط التجاري، الاسم، والتفاصيل.',
  '2. اختر أفضل قالب واقترح التعديلات.',
  '3. لخّص الخطة واطلب التأكيد: "راح أستخدم قالب [اسم القالب] وأعدله لك بالتفاصيل اللي ذكرتها. إذا تمام، قل **ابدأ** ⚡".',
  '',
  '## وضع التعديل (vfs_context موجود):',
  '1. حلل الطلب وقارن بالملفات الموجودة.',
  '2. ضع خطة تعديل مختصرة.',
  '3. عند الموافقة، استدع customize_template مع التعديلات.',
  '',
  '## متى تستدعي الأداة:',
  '- فقط عندما يقول المستخدم كلمة صريحة: "ابدأ"، "يلا"، "نفذ"، "عدّل".',
  '- عند الاستدعاء: حدد template_id والتعديلات بدقة.',
].join('\n');

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

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
    p_function_type: "planner",
    p_daily_limit: DAILY_LIMIT,
  });

  if (!allowed) {
    return new Response(JSON.stringify({ error: "تم تجاوز الحد اليومي للتخطيط. حاول بكرة! ⚡" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId: user.id };
}

async function tryKeys(
  keys: string[],
  url: string,
  body: string,
  label: string
): Promise<Response | null> {
  for (const key of keys) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body,
    });
    if (res.ok) { console.log(`${label} succeeded`); return res; }
    if (res.status === 429) { console.warn(`${label} rate-limited, trying next...`); continue; }
    console.error(`${label} error:`, res.status);
    continue;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { messages, vfsContext } = await req.json();
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

    if (geminiKeys.length === 0 && groqKeys.length === 0 && !lovableKey) {
      throw new Error("No AI API keys configured");
    }

    const aiMessages = [
      { role: "system", content: PLANNER_SYSTEM_PROMPT },
      ...messages,
      { role: "system", content: `## سياق الملفات الحالية (VFS Context):\n${JSON.stringify(vfsContext, null, 2)}` }
    ];

    const toolsDef = [
      {
        type: "function",
        function: {
          name: "customize_template",
          description: "اختر أفضل قالب وحدد التعديلات المطلوبة. استخدم هذه الأداة فقط بعد موافقة المستخدم.",
          parameters: {
            type: "object",
            properties: {
              template_id: {
                type: "string",
                description: "معرف القالب المختار",
                enum: [
                  "restaurant-luxury", "medical-clinic", "real-estate-agency",
                  "ecommerce-store", "law-firm", "beauty-salon",
                  "gym-fitness", "tech-company", "education-academy",
                  "photography-portfolio", "consulting-firm", "personal-portfolio"
                ]
              },
              modifications: {
                type: "object",
                description: "التعديلات المطلوبة على القالب",
                properties: {
                  brandName: { type: "string", description: "اسم العلامة التجارية أو المشروع" },
                  colors: {
                    type: "object",
                    properties: {
                      primary: { type: "string" },
                      secondary: { type: "string" },
                      accent: { type: "string" }
                    }
                  },
                  content: {
                    type: "object",
                    description: "المحتوى المخصص (عناوين، أوصاف، خدمات)"
                  },
                  contact: {
                    type: "object",
                    properties: {
                      phone: { type: "string" },
                      email: { type: "string" },
                      address: { type: "string" }
                    }
                  },
                  sections: {
                    type: "object",
                    properties: {
                      order: { type: "array", items: { type: "string" } },
                      remove: { type: "array", items: { type: "string" } },
                      add: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                required: ["brandName"]
              },
              summary_ar: { type: "string", description: "ملخص عربي مختصر للمستخدم" },
              project_name: { type: "string", description: "اسم المشروع" },
              build_prompt: { type: "string", description: "Detailed English technical prompt describing ALL customizations to apply to the template. Include brand name, colors, content changes, contact info, and any section modifications." }
            },
            required: ["template_id", "modifications", "summary_ar", "project_name", "build_prompt"],
          },
        },
      },
    ];

    let response: Response | null = null;

    // 1. Try Gemini
    const geminiBody = JSON.stringify({ model: "gemini-2.5-flash", messages: aiMessages, stream: true, tools: toolsDef });
    response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", geminiBody, "Gemini planner");

    // 2. Fallback to Groq
    if (!response) {
      console.warn("All Gemini keys exhausted, falling back to Groq...");
      const groqBody = JSON.stringify({ model: "llama-3.3-70b-versatile", messages: aiMessages, stream: true, tools: toolsDef });
      response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions", groqBody, "Groq planner");
    }

    // 3. Final fallback: Lovable AI Gateway
    if (!response && lovableKey) {
      console.warn("All Groq keys exhausted, falling back to Lovable AI...");
      const lovableBody = JSON.stringify({ model: "google/gemini-2.5-flash", messages: aiMessages, stream: true, tools: toolsDef });
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: lovableBody,
      });
      if (res.ok) {
        response = res;
        console.log("Lovable AI planner fallback succeeded");
      } else {
        console.error("Lovable AI planner error:", res.status);
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: "جميع مفاتيح الذكاء الاصطناعي وصلت للحد الأقصى، حاول بعد شوي ⚡" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let toolCallArgs = "";
        let isToolCall = false;
        let textBuffer = "";

        try {
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
              try {
                parsed = JSON.parse(jsonStr);
              } catch {
                continue;
              }

              const delta = parsed.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.tool_calls) {
                isToolCall = true;
                const tc = delta.tool_calls[0];
                if (tc?.function?.arguments) {
                  toolCallArgs += tc.function.arguments;
                }
                continue;
              }

              if (delta.content) {
                controller.enqueue(
                  encoder.encode(
                    sseEvent({
                      event: "message_delta",
                      content: delta.content,
                    })
                  )
                );
              }
            }
          }

          if (isToolCall) {
            const toolCallData = JSON.parse(toolCallArgs);
            controller.enqueue(
              encoder.encode(
                sseEvent({
                  event: "build_ready",
                  prompt: toolCallData.build_prompt,
                  summary: toolCallData.summary_ar,
                  projectName: toolCallData.project_name,
                  templateId: toolCallData.template_id,
                  modifications: toolCallData.modifications,
                  // Keep dependency graph for backward compat
                  dependencyGraph: { templateId: toolCallData.template_id },
                })
              )
            );
          }

          controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.enqueue(
            encoder.encode(
              sseEvent({ event: "error", message: e.message || "Stream error" })
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("Main handler error:", e);
    return new Response(JSON.stringify({ error: e.message || "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
