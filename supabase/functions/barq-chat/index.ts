import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "برق" ⚡ — مساعد ذكي متخصص في بناء مواقع ويب عربية احترافية.

## طريقة العمل:
أنت تعمل على مرحلتين:

### المرحلة الأولى: الفهم والحوار
- عندما يرسل المستخدم طلباً عاماً (مثل "أريد موقع مطعم")، لا تبدأ البناء فوراً.
- اسأله أسئلة لفهم المشروع بشكل أعمق: اسم المشروع، الألوان المفضلة، الأقسام المطلوبة، نوع النشاط التجاري، الجمهور المستهدف.
- كن ودوداً ومختصراً. اسأل 2-3 أسئلة في كل رد.
- استخدم إيموجي ⚡ لتكون المحادثة حيوية.

### المرحلة الثانية: البناء
- عندما تشعر أنك فهمت المشروع جيداً (بعد 2-3 رسائل حوار)، أو إذا قال المستخدم "ابدأ البناء" أو "يلا ابني"، استخدم أداة generate_website.
- أو إذا كان الطلب مفصلاً بما يكفي من البداية.

## قواعد عامة:
- تحدث دائماً بالعربية بلهجة سعودية مهنية.
- كن مختصراً وواضحاً.
- لا تكتب كود إلا عند استخدام أداة generate_website.

## إرشادات البناء (عند استخدام الأداة):
- كل المحتوى بالعربية (RTL) مع خط Cairo.
- تصميم سعودي عصري يراعي الثقافة المحلية.
- استخدم Tailwind CSS.
- أقسام أساسية: Header, Hero, Features, About, Footer.
- محتوى واقعي مناسب لنوع المشروع.
- تصميم متجاوب (responsive).
- لا تستخدم import أو require - كل شيء inline.
- استخدم أيقونات SVG inline عند الحاجة.`;

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
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لحسابك." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    // Case 1: AI chose to use tool (generate website)
    if (choice?.tool_calls?.[0]) {
      const toolCall = choice.tool_calls[0];
      let result;
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch {
        return new Response(
          JSON.stringify({ error: "خطأ في تحليل رد الذكاء الاصطناعي" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!result.vfs_operations || !Array.isArray(result.vfs_operations)) {
        return new Response(
          JSON.stringify({ error: "رد غير صالح" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ type: "generation", ...result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Case 2: AI responded with text (conversational)
    return new Response(
      JSON.stringify({ type: "conversation", message: choice?.content || "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("barq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
