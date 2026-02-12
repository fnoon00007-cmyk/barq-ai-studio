import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "برق" — مهندس ذكاء اصطناعي متخصص في بناء مواقع ويب عربية احترافية.

## قواعد صارمة:
- كل المحتوى يجب أن يكون بالعربية (RTL).
- استخدم خط Cairo دائماً.
- صمم بأسلوب سعودي عصري يراعي الثقافة المحلية.
- استخدم Tailwind CSS للتنسيق.
- الكود يجب أن يكون JSX صالح يمكن عرضه مباشرة.

## مهمتك:
عند استلام طلب المستخدم، يجب أن تنشئ موقع ويب كامل. أجب دائماً باستخدام الأداة generate_website.

## إرشادات التصميم:
- استخدم ألوان جذابة ومتناسقة مع هوية المشروع.
- أضف أقسام: Header, Hero, Features, About, Footer كحد أدنى.
- اجعل التصميم متجاوب (responsive).
- استخدم أيقونات SVG inline عند الحاجة.
- أضف محتوى واقعي باللغة العربية مناسب لنوع المشروع.
- لا تستخدم import أو require - اكتب كل شيء inline.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_website",
                description:
                  "Generate a complete Arabic website with thinking steps and file operations",
                parameters: {
                  type: "object",
                  properties: {
                    thought_process: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "خطوات التفكير بالعربية، مثل: تحليل هوية المشروع، هيكلة الصفحات، اختيار الألوان",
                    },
                    design_personality: {
                      type: "string",
                      enum: ["formal", "creative", "minimalist", "bold"],
                      description: "شخصية التصميم المناسبة لنوع المشروع",
                    },
                    vfs_operations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          path: { type: "string", description: "اسم الملف مثل App.tsx" },
                          action: {
                            type: "string",
                            enum: ["create", "update"],
                          },
                          content: {
                            type: "string",
                            description: "محتوى الملف - JSX/CSS كامل",
                          },
                          language: {
                            type: "string",
                            enum: ["tsx", "css", "html"],
                          },
                        },
                        required: ["path", "action", "content", "language"],
                      },
                      description: "عمليات نظام الملفات الافتراضي",
                    },
                    user_message: {
                      type: "string",
                      description: "ملخص التغييرات بالعربية للمستخدم",
                    },
                    css_variables: {
                      type: "object",
                      properties: {
                        primary_color: { type: "string" },
                        secondary_color: { type: "string" },
                        border_radius: { type: "string" },
                        font_style: { type: "string" },
                      },
                      description: "متغيرات CSS الديناميكية لمنع التكرار",
                    },
                  },
                  required: [
                    "thought_process",
                    "design_personality",
                    "vfs_operations",
                    "user_message",
                  ],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_website" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول مرة أخرى لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لحسابك." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "لم يتم استلام رد صالح من الذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ error: "خطأ في تحليل رد الذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation: ensure required fields exist
    if (!result.vfs_operations || !Array.isArray(result.vfs_operations)) {
      return new Response(
        JSON.stringify({ error: "رد غير صالح: لا توجد عمليات ملفات" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("barq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
