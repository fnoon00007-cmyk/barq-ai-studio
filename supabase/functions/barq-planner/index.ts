import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 50;

const PLANNER_SYSTEM_PROMPT = `أنت "برق" ⚡ — مساعد ذكي سعودي متخصص في بناء وتعديل المواقع.

## شخصيتك:
- تتكلم باللهجة السعودية بشكل طبيعي ومحترف
- ودود وحماسي لكن مختصر
- استخدم إيموجي باعتدال ⚡🚀✨

## مهمتك:
فهم متطلبات المستخدم سواءً كان يبي **موقع جديد** أو **تعديل على موقع موجود**.

## ⛔ قواعد صارمة:
1. **سؤال واحد فقط في كل رد** — لا تسأل أكثر من سؤال
2. **لا تستدعي أداة prepare_build_prompt** إلا بعد فهم المطلوب وموافقة صريحة من المستخدم
3. **ردودك مختصرة** — سطر أو سطرين مع السؤال
4. **لا ترد بأي كود أبداً**
5. **لا تقل أبداً "ما أقدر أعدّل"** — أنت تقدر تعدّل أي شي!

## وضع البناء الجديد (ما فيه ملفات موجودة):
1. "وش نوع النشاط أو المشروع اللي تبي موقع له؟"
2. "وش اسم المشروع أو الشركة؟"
3. "عندك تفاصيل إضافية؟ مثلاً: خدمات معينة، ألوان مفضلة، أرقام تواصل؟"
4. لخّص وقل: "إذا كل شي تمام، قل لي **ابدأ** وأبدأ أبني لك الموقع! ⚡"

## وضع التعديل (فيه ملفات موجودة — existing_files):
- لا تحتاج 3 جولات أسئلة — المستخدم يبي تعديل محدد
- افهم التعديل المطلوب، لخصه، واطلب التأكيد
- مثال: "تبي أضيف قائمة جانبية فيها أقسام المقاولات، تمام؟ قل **ابدأ** وأعدّله لك ⚡"
- عند استدعاء الأداة: اذكر في build_prompt الملفات الموجودة والتعديلات المطلوبة بالتفصيل

## متى تستدعي الأداة:
- فقط لما المستخدم يقول كلمة صريحة: "ابدأ"، "يلا"، "ابني"، "باشر"، "تمام ابدأ"، "موافق"، "عدّل"، "نفذ"
- عند الاستدعاء: حوّل كل المتطلبات لبرومبت إنجليزي تقني مفصل
- **للتعديل**: اذكر في البرومبت أي ملفات موجودة يجب تعديلها وأي ملفات جديدة يجب إنشاؤها`;

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

  // Check rate limit
  const { data: allowed } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: user.id,
    p_function_type: "planner",
    p_daily_limit: DAILY_LIMIT,
  });

  if (!allowed) {
    return new Response(JSON.stringify({ error: "تم تجاوز الحد اليومي المسموح. حاول بكرة! ⚡" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { messages } = await req.json();
    const geminiKeys = [
      Deno.env.get("GEMINI_API_KEY"),
      Deno.env.get("GEMINI_API_KEY_2"),
    ].filter(Boolean) as string[];
    if (geminiKeys.length === 0) throw new Error("GEMINI_API_KEY is not configured");

    const geminiRequestBody = JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: PLANNER_SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "prepare_build_prompt",
            description:
              "استخدم هذه الأداة فقط بعد جمع كل المتطلبات وموافقة المستخدم الصريحة. أنشئ برومبت إنجليزي تقني مفصل لبناء الموقع.",
            parameters: {
              type: "object",
              properties: {
                build_prompt: {
                  type: "string",
                  description:
                    "A detailed English technical prompt for the website builder. Include: business type, business name, color scheme (primary, secondary, accent colors as Tailwind classes), sections needed (Hero, Services, About, Testimonials, Contact, Footer), specific content in Arabic (services list, about text, contact info), design style (modern, minimalist, bold, etc.), and any special requirements. Be very specific and detailed.",
                },
                summary_ar: {
                  type: "string",
                  description:
                    "ملخص عربي مختصر للمستخدم يوضح ما سيتم بناؤه",
                },
                project_name: {
                  type: "string",
                  description: "اسم المشروع أو الشركة",
                },
              },
              required: ["build_prompt", "summary_ar", "project_name"],
            },
          },
        },
      ],
    });

    let response: Response | null = null;
    let usedProvider = "gemini";

    // Try Gemini keys first
    for (const key of geminiKeys) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: geminiRequestBody,
        }
      );
      if (res.ok) {
        response = res;
        break;
      }
      if (res.status === 429) {
        console.warn("Gemini key rate-limited, trying fallback...");
        continue;
      }
      const errBody = {
        error: res.status === 402
          ? "يرجى إضافة رصيد لحسابك."
          : "حدث خطأ في الاتصال بالذكاء الاصطناعي",
      };
      return new Response(JSON.stringify(errBody), {
        status: res.status >= 400 && res.status < 500 ? res.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to Groq if all Gemini keys are rate-limited
    if (!response) {
      console.warn("All Gemini keys exhausted, falling back to Groq...");
      const groqKeys = [
        Deno.env.get("GROQ_API_KEY"),
        Deno.env.get("GROQ_API_KEY_2"),
      ].filter(Boolean) as string[];

      if (groqKeys.length > 0) {
        const groqRequestBody = JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: PLANNER_SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
          tools: [
            {
              type: "function",
              function: {
                name: "prepare_build_prompt",
                description:
                  "استخدم هذه الأداة فقط بعد جمع كل المتطلبات وموافقة المستخدم الصريحة. أنشئ برومبت إنجليزي تقني مفصل لبناء الموقع.",
                parameters: {
                  type: "object",
                  properties: {
                    build_prompt: {
                      type: "string",
                      description:
                        "A detailed English technical prompt for the website builder.",
                    },
                    summary_ar: {
                      type: "string",
                      description: "ملخص عربي مختصر للمستخدم يوضح ما سيتم بناؤه",
                    },
                    project_name: {
                      type: "string",
                      description: "اسم المشروع أو الشركة",
                    },
                  },
                  required: ["build_prompt", "summary_ar", "project_name"],
                },
              },
            },
          ],
        });

        for (const key of groqKeys) {
          const res = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: groqRequestBody,
            }
          );
          if (res.ok) {
            response = res;
            usedProvider = "groq";
            console.log("Successfully fell back to Groq for planning");
            break;
          }
          if (res.status === 429) {
            console.warn("Groq key also rate-limited...");
            continue;
          }
        }
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: "جميع الخوادم مشغولة حالياً، حاول بعد دقيقة ⚡" }),
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

          if (isToolCall && toolCallArgs) {
            let result: any;
            try {
              result = JSON.parse(toolCallArgs);
            } catch {
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    event: "message_delta",
                    content:
                      "عذراً، حدث خطأ في معالجة الرد. حاول مرة ثانية.",
                  })
                )
              );
              controller.enqueue(
                encoder.encode(sseEvent({ event: "done" }))
              );
              controller.close();
              return;
            }

            controller.enqueue(
              encoder.encode(
                sseEvent({
                  event: "build_ready",
                  build_prompt: result.build_prompt,
                  summary: result.summary_ar,
                  project_name: result.project_name,
                })
              )
            );

            if (result.summary_ar) {
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    event: "message_delta",
                    content: result.summary_ar,
                  })
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(sseEvent({ event: "done" }))
          );
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.enqueue(
            encoder.encode(
              sseEvent({
                event: "message_delta",
                content: "حدث خطأ أثناء المعالجة",
              })
            )
          );
          controller.enqueue(
            encoder.encode(sseEvent({ event: "done" }))
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
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("barq-planner error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "خطأ غير معروف",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
