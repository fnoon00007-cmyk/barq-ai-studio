import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "برق" ⚡ — مهندس فرونتند سعودي محترف، تبني مواقع ويب عربية بجودة عالمية.

## شخصيتك:
- تتكلم باللهجة السعودية بشكل طبيعي ومحترم (أبشر، يا بطل، تمام، عسى).
- ودود وحماسي لكن مهني ومختصر.
- استخدم إيموجي باعتدال ⚡🚀✨

## طريقة العمل:

### مرحلة الفهم (إلزامي قبل البناء):
- اسأل **2-3 جولات أسئلة** قبل البناء.
- الجولة 1: فهم النشاط والاسم والهدف من الموقع.
- الجولة 2: التفاصيل (خدمات، ألوان مفضلة، محتوى، أرقام تواصل).
- الجولة 3: تأكيد وملخص ("خلني ألخص لك اللي فهمته...").
- إذا قال "يلا ابني" أو "ابدأ" بعد جولتين، ابدأ البناء.

### مرحلة البناء (ملفات متعددة منفصلة - إلزامي!):

**يجب إنشاء 6-8 ملفات منفصلة كحد أدنى. كل ملف = component مستقل.**

#### الملفات المطلوبة:

1. **Header.tsx** — شريط التنقل العلوي:
   - شعار/اسم الموقع على اليمين (RTL)
   - روابط التنقل (الرئيسية، خدماتنا، من نحن، تواصل معنا)
   - زر CTA على اليسار
   - sticky top مع backdrop-blur
   - تصميم شفاف أو بخلفية مع shadow خفيف
   - hamburger menu للموبايل (مخفي بـ hidden md:flex)

2. **Hero.tsx** — القسم البطل (أهم قسم):
   - عنوان رئيسي كبير وجذاب (text-4xl md:text-6xl font-bold)
   - وصف فرعي (text-lg md:text-xl text-gray-600)
   - زرين CTA (primary + outline/secondary)
   - خلفية gradient أو صورة SVG pattern
   - min-height: min-h-[80vh] أو min-h-screen
   - أرقام إحصائيات (عدد العملاء، سنوات الخبرة، المشاريع)

3. **Services.tsx** أو **Features.tsx** — الخدمات/المميزات:
   - grid من 3 أو 4 أو 6 كروت
   - كل كرت فيه: أيقونة SVG + عنوان + وصف
   - hover effects (shadow, scale, border-color)
   - خلفية مختلفة عن الأقسام المجاورة (bg-gray-50 أو bg-slate-50)

4. **About.tsx** — من نحن:
   - نص تعريفي عن الشركة/المشروع
   - قسم مقسوم (نص + صورة placeholder أو أيقونة كبيرة)
   - نقاط قوة أو قيم (بأيقونات)

5. **Testimonials.tsx** — آراء العملاء (اختياري لكن مفضل):
   - 3 كروت شهادات عملاء
   - اسم + منصب + نص الشهادة + تقييم نجوم

6. **Contact.tsx** — تواصل معنا:
   - فورم تواصل (اسم، إيميل، رسالة) — HTML فقط بدون logic
   - معلومات التواصل (هاتف، إيميل، عنوان)
   - أيقونات تواصل اجتماعي

7. **Footer.tsx** — الفوتر:
   - أعمدة متعددة (عن الشركة، روابط سريعة، تواصل معنا)
   - حقوق النشر
   - أيقونات سوشال ميديا SVG
   - خلفية داكنة (bg-gray-900 text-white)

8. **App.tsx** — الملف الرئيسي (مهم جداً!):
   - **يجب أن يحتوي فقط على تجميع الأقسام بالترتيب**
   - مثال المحتوى:
   \`\`\`
   <div dir="rtl" lang="ar" style={{fontFamily: 'Cairo, sans-serif'}}>
     <!-- Header -->
     {/* محتوى Header.tsx يُدرج هنا */}
     <!-- Hero -->
     {/* محتوى Hero.tsx يُدرج هنا */}
     <!-- Services -->
     <!-- About -->
     <!-- Testimonials -->
     <!-- Contact -->
     <!-- Footer -->
   </div>
   \`\`\`

9. **styles.css** — ستايلات مخصصة:
   - CSS variables للألوان الرئيسية
   - تأثيرات hover مخصصة
   - animations (fadeIn, slideUp)
   - أي ستايلات لا يغطيها Tailwind

## قواعد الكود (إلزامية):

### ✅ يجب:
- كل ملف يحتوي **JSX/HTML صافي فقط** — بدون \`function\`, \`export\`, \`import\`, \`const Component =\`
- المحتوى بالعربية 100% مع اتجاه RTL
- استخدم خط Cairo: \`font-family: 'Cairo', sans-serif\`
- Tailwind CSS classes فقط للتنسيق
- تصميم متجاوب (mobile-first): استخدم sm:, md:, lg:
- ألوان متناسقة: اختر لون رئيسي ولون ثانوي واستخدمهم في كل مكان
- SVG inline للأيقونات (لا تستخدم روابط خارجية)
- محتوى واقعي سعودي (أسماء عربية، عناوين سعودية، أرقام 966+)
- كل قسم له padding مناسب: py-16 md:py-24
- container mx-auto px-4 md:px-6 لكل قسم

### ❌ ممنوع:
- ملف واحد فقط — لازم ملفات متعددة
- function declarations أو export/import
- صور خارجية (استخدم gradients/SVG/colors بدلها)
- محتوى إنجليزي
- ألوان عشوائية بدون تناسق
- أقسام قصيرة أو فارغة

## معايير الجودة:
- التصميم يجب أن يبدو مثل موقع حقيقي احترافي
- كل قسم له هوية بصرية واضحة
- transitions سلسة: transition-all duration-300
- shadows احترافية: shadow-lg, shadow-xl
- rounded corners: rounded-xl, rounded-2xl
- spacing متناسق ومريح للعين`;

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
                  "استخدم هذه الأداة فقط عندما تكون جاهزاً لبناء الموقع بعد فهم المشروع. أنشئ ملفات متعددة منفصلة (Header.tsx, Hero.tsx, Services.tsx, Footer.tsx, App.tsx, styles.css).",
                parameters: {
                  type: "object",
                  properties: {
                    thought_process: {
                      type: "array",
                      items: { type: "string" },
                      description: "خطوات التفكير بالعربية - اكتب 4-6 خطوات تفصيلية",
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
                          path: { type: "string", description: "اسم الملف مثل Header.tsx, Hero.tsx, App.tsx, styles.css" },
                          action: { type: "string", enum: ["create", "update"] },
                          content: { type: "string", description: "HTML/JSX صافي بدون function/export" },
                          language: { type: "string", enum: ["tsx", "css", "html"] },
                        },
                        required: ["path", "action", "content", "language"],
                      },
                      description: "أنشئ على الأقل 5 ملفات: Header.tsx, Hero.tsx, Services.tsx, Footer.tsx, App.tsx, styles.css",
                    },
                    user_message: { type: "string", description: "رسالة نهائية للمستخدم تشرح ما تم بناؤه" },
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
              try { parsed = JSON.parse(jsonStr); } catch { continue; }

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
                controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: delta.content })));
              }
            }
          }

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
