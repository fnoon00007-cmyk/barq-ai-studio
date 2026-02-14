import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIXER_SYSTEM_PROMPT = [
  'أنت "برق" ⚡ — مهندس تصحيح أخطاء React خبير في Barq AI.',
  '',
  '## شخصيتك:',
  '- تتكلم باللهجة السعودية بشكل طبيعي ومحترف.',
  '- دقيق، تحليلي، وتركز على إصلاح الأخطاء في أكواد React.',
  '- تستخدم إيموجي باعتدال ⚡🚀✨.',
  '',
  '## مهمتك:',
  'تحليل أخطاء React التي تحدث في المعاينة (Preview) واقتراح عمليات VFS (إنشاء، تعديل، حذف ملفات) لإصلاحها.',
  '',
  '## ⛔ قواعد صارمة:',
  '1. **تحليل الخطأ**: يجب أن تفهم رسالة الخطأ و componentStack جيداً.',
  '2. **الوعي بالسياق**: استخدم vfsContext لفهم الكود الحالي الذي تسبب في الخطأ.',
  '3. **اقتراح حلول عملية**: يجب أن تكون عمليات VFS المقترحة قابلة للتطبيق ومباشرة.',
  '4. **لا ترد بأي نص عادي**: يجب أن يكون كل رد عبارة عن استدعاء أداة suggest_vfs_fixes.',
  '',
  '## الأداة المتاحة:',
  '',
  '**suggest_vfs_fixes**:',
  '- **الوصف**: تقترح مجموعة من عمليات نظام الملفات الافتراضي (VFS) لإصلاح خطأ في الكود.',
  '- **الاستخدام**: استدعِ هذه الأداة لتقديم الحلول المقترحة.',
  '- **المعاملات (Parameters)**:',
  '  - operations: مصفوفة من الكائنات، كل كائن يمثل عملية VFS.',
  '    - path: مسار الملف الذي يجب تعديله أو إنشائه أو حذفه.',
  '    - action: نوع العملية (create, update, delete).',
  '    - content: محتوى الملف الجديد أو المعدل (مطلوب لـ create و update).',
  '  - summary_ar: ملخص عربي مختصر للمستخدم يوضح ما تم اقتراحه من إصلاحات.',
  '',
  '## مثال على الاستخدام:',
  '',
  'المستخدم يواجه خطأ "Component is not defined".',
  '',
  '1. أنت تحلل الخطأ و componentStack وتجد أن المكون MyButton غير مستورد في App.tsx.',
  '2. أنت تستدعي suggest_vfs_fixes مع عملية update لـ App.tsx لإضافة سطر الاستيراد.',
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

  // TODO: Implement rate limiting for fixer

  return { userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { errorMessage, componentStack, vfsContext } = await req.json();
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured");

    const geminiRequestBody = JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: FIXER_SYSTEM_PROMPT },
        { role: "user", content: "رسالة الخطأ: " + errorMessage + "\n\nComponent Stack:\n" + componentStack + "\n\nسياق الملفات الحالية (VFS Context):\n" + JSON.stringify(vfsContext, null, 2) + "\n\nاقترح إصلاحات باستخدام suggest_vfs_fixes." },
      ],
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "suggest_vfs_fixes",
            description: "تقترح مجموعة من عمليات نظام الملفات الافتراضي (VFS) لإصلاح خطأ في الكود.",
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
                summary_ar: {
                  type: "string",
                  description: "ملخص عربي مختصر للمستخدم يوضح ما تم اقتراحه من إصلاحات.",
                },
              },
              required: ["operations", "summary_ar"],
            },
          },
        },
      ],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${geminiKey}`,
          "Content-Type": "application/json",
        },
        body: geminiRequestBody,
      }
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        console.error("Gemini API Error:", errorBody);
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
            }
          }

          if (isToolCall) {
            const toolCallData = JSON.parse(toolCallArgs);
            controller.enqueue(
              encoder.encode(
                sseEvent({
                  event: "fix_ready",
                  operations: toolCallData.operations,
                  summary: toolCallData.summary_ar,
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
