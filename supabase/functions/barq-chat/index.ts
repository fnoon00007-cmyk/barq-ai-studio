import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "برق" ⚡ — مساعد سعودي ذكي ومحبوب، متخصص في بناء مواقع ويب عربية احترافية.

## شخصيتك:
- تتكلم باللهجة السعودية بشكل طبيعي (أبشر، يا بطل، ذوقك، عسى، إن شاء الله).
- كأنك مصمم مواقع سعودي شاطر يسولف مع عميله بالكافيه.
- تكون ودود ومحترم وحماسي.
- استخدم إيموجي باعتدال ⚡🚀✨

## طريقة العمل (مهم جداً):

### المرحلة الأولى: السوالف والفهم (إلزامي - لا تتجاوزها أبداً)
- لازم تسأل المستخدم **3 جولات أسئلة على الأقل** قبل ما تبدأ البناء.
- كل جولة اسأل **سؤالين أو ثلاثة** بس، لا تكثر عليه.
- لا تبدأ البناء حتى لو المستخدم أعطاك تفاصيل كثيرة من البداية - لازم تتحاور معه.
- الجولة الأولى: فهم النشاط والاسم والنوع.
- الجولة الثانية: التفاصيل (خدمات، ألوان، أرقام تواصل).
- الجولة الثالثة: تأكيد وملخص قبل البناء ("تمام يا بطل، خلني ألخص لك اللي فهمته...").
- إذا قال "يلا ابني" أو "ابدأ" بعد جولتين على الأقل، ابدأ البناء.

### المرحلة الثانية: البناء
- استخدم أداة generate_website فقط بعد ما تفهم المشروع كامل.
- أنشئ ملفات متعددة منفصلة (Header.tsx, Hero.tsx, Services.tsx, Footer.tsx, App.tsx, styles.css).
- كل component في ملف منفصل.

## قواعد البناء (عند استخدام الأداة):
- كل المحتوى بالعربية (RTL) مع خط Cairo.
- تصميم سعودي عصري يراعي الثقافة المحلية.
- استخدم Tailwind CSS classes فقط.
- أقسام أساسية: Header, Hero, Features/Services, About, Footer - كل واحد في ملف منفصل.
- محتوى واقعي مناسب لنوع المشروع.
- تصميم متجاوب (responsive).
- لا تستخدم import أو require - كل شيء inline HTML مع Tailwind classes.
- استخدم SVG inline للأيقونات.
- App.tsx يجمع كل الأقسام مع بعض.
- الكود لازم يكون HTML/JSX صافي بدون function declarations أو export statements.`;

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
          tools: [
            {
              type: "function",
              function: {
                name: "generate_website",
                description:
                  "استخدم هذه الأداة فقط عندما تكون جاهزاً لبناء الموقع بعد فهم المشروع",
                parameters: {
                  type: "object",
                  properties: {
                    thought_process: {
                      type: "array",
                      items: { type: "string" },
                      description: "خطوات التفكير بالعربية",
                    },
                    design_personality: {
                      type: "string",
                      enum: ["formal", "creative", "minimalist", "bold"],
                    },
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
                    css_variables: {
                      type: "object",
                      properties: {
                        primary_color: { type: "string" },
                        secondary_color: { type: "string" },
                        border_radius: { type: "string" },
                        font_style: { type: "string" },
                      },
                    },
                  },
                  required: ["thought_process", "design_personality", "vfs_operations", "user_message"],
                },
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const errBody = { error: status === 429 ? "تم تجاوز الحد المسموح، حاول لاحقاً." : status === 402 ? "يرجى إضافة رصيد لحسابك." : "حدث خطأ في الاتصال بالذكاء الاصطناعي" };
      return new Response(JSON.stringify(errBody), {
        status: status >= 400 && status < 500 ? status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream SSE to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let contentBuffer = "";
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
              try { parsed = JSON.parse(jsonStr); } catch { continue; }

              const delta = parsed.choices?.[0]?.delta;
              if (!delta) continue;

              // Check for tool calls
              if (delta.tool_calls) {
                isToolCall = true;
                const tc = delta.tool_calls[0];
                if (tc?.function?.arguments) {
                  toolCallArgs += tc.function.arguments;
                }
                continue;
              }

              // Regular content (conversation)
              if (delta.content) {
                contentBuffer += delta.content;
                controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: delta.content })));
              }
            }
          }

          // After stream ends, process tool call if present
          if (isToolCall && toolCallArgs) {
            let result: any;
            try {
              result = JSON.parse(toolCallArgs);
            } catch {
              controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "عذراً، حدث خطأ في معالجة الرد. حاول مرة ثانية." })));
              controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
              controller.close();
              return;
            }

            // Emit thinking steps
            if (result.thought_process?.length) {
              controller.enqueue(encoder.encode(sseEvent({ event: "thinking_start" })));
              for (const step of result.thought_process) {
                controller.enqueue(encoder.encode(sseEvent({ event: "thinking_step", step })));
              }
            }

            // Emit file operations
            if (result.vfs_operations?.length) {
              for (const op of result.vfs_operations) {
                controller.enqueue(encoder.encode(sseEvent({ event: "file_start", path: op.path, action: op.action, language: op.language })));
                controller.enqueue(encoder.encode(sseEvent({ event: "file_done", path: op.path, content: op.content })));
              }
            }

            // Emit final message
            const msg = result.user_message || "تم بناء الموقع بنجاح! ⚡";
            controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: msg })));
          }

          controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "حدث خطأ أثناء المعالجة" })));
          controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
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
    console.error("barq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
