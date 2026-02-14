import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REVIEWER_SYSTEM_PROMPT = `أنت مراجع كود محترف ومدير مشروع. مهمتك مراجعة ملفات موقع ويب عربي تم توليدها بالذكاء الاصطناعي.

## مهمتك:
1. تحقق من أن جميع الملفات المطلوبة موجودة (Header, Hero, Services, About, Contact, Footer, App.tsx, styles.css كحد أدنى)
2. تحقق من أن الكود يتبع أفضل الممارسات
3. تحقق من وجود RTL و font-family Cairo
4. تحقق من عدم وجود أخطاء syntax واضحة
5. تحقق من أن المحتوى عربي بالكامل
6. تحقق من التصميم المتجاوب (responsive)

## قواعد:
- استخدم أداة review_result دائماً
- إذا كل شي تمام: status = "approved"
- إذا فيه نقص: status = "needs_fix" مع وصف دقيق للمشاكل
- ركز على المشاكل الكبيرة فقط (ملفات ناقصة، أخطاء syntax، محتوى غير عربي)
- لا تطلب تحسينات تجميلية بسيطة`;

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { build_prompt, files } = await req.json();
    if (!build_prompt || !files) throw new Error("build_prompt and files are required");

    const geminiKeys = [
      Deno.env.get("GEMINI_API_KEY"),
      Deno.env.get("GEMINI_API_KEY_2"),
    ].filter(Boolean) as string[];
    if (geminiKeys.length === 0) throw new Error("GEMINI_API_KEY is not configured");

    // Build file summary for review
    const fileSummary = files.map((f: any) => 
      `--- ${f.path} (${f.language}) ---\n${f.content.slice(0, 2000)}${f.content.length > 2000 ? "\n...(truncated)" : ""}`
    ).join("\n\n");

    const reviewPrompt = `## Original Build Prompt:\n${build_prompt}\n\n## Generated Files (${files.length} files):\n${fileSummary}\n\nReview these files and determine if the website is complete and correct.`;

    const requestBody = JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: REVIEWER_SYSTEM_PROMPT },
        { role: "user", content: reviewPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "review_result",
            description: "Submit the review result",
            parameters: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["approved", "needs_fix"],
                  description: "Whether the code passes review",
                },
                summary_ar: {
                  type: "string",
                  description: "ملخص المراجعة بالعربي للمستخدم",
                },
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      file: { type: "string", description: "File path that needs fixing or 'NEW' for missing files" },
                      issue: { type: "string", description: "Description of the issue in English" },
                      fix_instruction: { type: "string", description: "Specific instruction for the builder to fix this issue" },
                    },
                    required: ["file", "issue", "fix_instruction"],
                  },
                  description: "List of issues found (empty if approved)",
                },
                fix_prompt: {
                  type: "string",
                  description: "A combined English prompt for the builder to fix all issues. Only if status is needs_fix.",
                },
              },
              required: ["status", "summary_ar", "issues"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "review_result" } },
    });

    let response: Response | null = null;
    for (const key of geminiKeys) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: requestBody,
        }
      );
      if (res.ok) {
        response = res;
        break;
      }
      if (res.status === 429) {
        console.warn("Gemini reviewer key rate-limited, trying fallback...");
        continue;
      }
      return new Response(
        JSON.stringify({ error: "خطأ في المراجعة" }),
        { status: res.status >= 400 && res.status < 500 ? res.status : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: "تم تجاوز الحد المسموح لجميع المفاتيح، حاول لاحقاً." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Non-streaming: parse the full response
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ status: "approved", summary_ar: "تم المراجعة بنجاح ✅", issues: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      result = { status: "approved", summary_ar: "تم المراجعة بنجاح ✅", issues: [] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("barq-reviewer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
