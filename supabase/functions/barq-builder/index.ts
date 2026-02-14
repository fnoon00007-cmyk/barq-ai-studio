import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30; // Builder has a lower daily limit

const BUILDER_SYSTEM_PROMPT = `أنت "برق" ⚡ — مهندس أكواد React خبير في Barq AI.

## شخصيتك:
- تتكلم باللهجة السعودية بشكل طبيعي ومحترف.
- دقيق، فعال، وتنتج أكواد نظيفة وموديلية (React, Tailwind CSS, shadcn/ui).
- تستخدم إيموجي باعتدال ⚡🚀✨.

## مهمتك:
تنفيذ خطة البناء التي يقدمها المخطط (Planner) وتحويلها إلى عمليات VFS (إنشاء، تعديل، حذف ملفات).

## ⛔ قواعد صارمة:
1. **الالتزام بالخطة**: اتبع الـ `dependency_graph` بدقة لتحديد الملفات التي يجب إنشاؤها أو تعديلها.
2. **التعديل الجزئي**: عند تعديل ملف موجود، قم بتطبيق التغييرات المطلوبة فقط (diffs) بدلاً من إعادة كتابة الملف بأكمله.
3. **البنية الموديلية**: استخدم مكونات React و Tailwind CSS و shadcn/ui.
4. **الإنتاجية**: الكود يجب أن يكون جاهزًا للإنتاج (production-ready).
5. **لا ترد بأي نص عادي**: يجب أن يكون كل رد عبارة عن استدعاء أداة `apply_vfs_operations`.

## الأداة المتاحة:

**`apply_vfs_operations`**:
- **الوصف**: تطبق مجموعة من عمليات نظام الملفات الافتراضي (VFS) على المشروع.
- **الاستخدام**: استدعِ هذه الأداة لتنفيذ إنشاء، تعديل، أو حذف الملفات.
- **المعاملات (Parameters)**:
  - `operations`: مصفوفة من الكائنات، كل كائن يمثل عملية VFS.
    - `path`: مسار الملف (مثال: `src/components/Button.tsx`).
    - `action`: نوع العملية (`create`, `update`, `delete`).
    - `content`: محتوى الملف (مطلوب لـ `create` و `update`).

## مثال على الاستخدام:

المستخدم يطلب إضافة زر جديد.

1. المخطط يرسل `build_prompt` و `dependency_graph` يوضح إنشاء `src/components/MyButton.tsx` وتعديل `src/App.tsx`.
2. أنت تستدعي `apply_vfs_operations` مرتين:
   - الأولى لإنشاء `MyButton.tsx` بمحتواه.
   - الثانية لتعديل `App.tsx` لإضافة استيراد `MyButton` واستخدامه.

`;

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
    p_function_type: "builder",
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
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { build_prompt, dependencyGraph, existingFiles } = await req.json();
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) throw new Error("GROQ_API_KEY is not configured");

    const groqRequestBody = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: BUILDER_SYSTEM_PROMPT },
        { role: "user", content: `الخطة:
${build_prompt}

مخطط الاعتماديات:
${JSON.stringify(dependencyGraph, null, 2)}

الملفات الموجودة حالياً:
${JSON.stringify(existingFiles, null, 2)}

الآن، نفذ الخطة باستخدام `apply_vfs_operations`.` },
      ],
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "apply_vfs_operations",
            description: "تطبيق مجموعة من عمليات نظام الملفات الافتراضي (VFS) على المشروع.",
            parameters: {
              type: "object",
              properties: {
                operations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string", description: "مسار الملف" },
                      action: { type: "string", enum: ["create", "update", "delete"], description: "نوع العملية" },
                      content: { type: "string", description: "محتوى الملف (مطلوب لـ create و update)" },
                    },
                    required: ["path", "action"],
                  },
                },
              },
              required: ["operations"],
            },
          },
        },
      ],
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: groqRequestBody,
      }
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        console.error("Groq API Error:", errorBody);
        return new Response(JSON.stringify({ error: errorBody.error?.message || "حدث خطأ في الاتصال بالذكاء الاصطناعي" }), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
                // Builder should not stream text content, only VFS operations
                // This part should ideally not be reached if the builder strictly uses the tool
                console.warn("Builder streamed text content unexpectedly:", delta.content);
              }
            }
          }

          if (isToolCall) {
            const toolCallData = JSON.parse(toolCallArgs);
            for (const op of toolCallData.operations) {
                controller.enqueue(
                    encoder.encode(
                        sseEvent({
                            event: "file_start",
                            path: op.path,
                            action: op.action,
                        })
                    )
                );
                controller.enqueue(
                    encoder.encode(
                        sseEvent({
                            event: "file_chunk",
                            path: op.path,
                            content: op.content || "",
                            action: op.action,
                        })
                    )
                );
            }
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
