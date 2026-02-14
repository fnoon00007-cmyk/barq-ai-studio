import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30;

const BUILDER_SYSTEM_PROMPT = `You are "Barq Builder" — a professional frontend engineer that generates and MODIFIES Arabic RTL websites using raw JSX/HTML with Tailwind CSS.

## CRITICAL RULES:
- You ONLY receive a technical build prompt and generate website files
- You MUST call the generate_website tool — never respond with plain text
- All content must be in Arabic (100%)
- RTL direction with font-family: 'Cairo', sans-serif
- Use Tailwind CSS classes only
- SVG inline icons (viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2")
- No external images — use gradients/SVG/colors instead
- No function declarations, export, import statements — raw JSX only
- Saudi-style content (Saudi names, addresses, 966+ numbers)
- Responsive design: use sm:, md:, lg: breakpoints

## MODIFICATION MODE:
When the prompt includes "EXISTING FILES" section:
- You are MODIFYING an existing website, NOT building from scratch
- Read the existing files carefully
- Only create/update files that need changes
- Use action: "update" for modified files, action: "create" for new files
- Keep unchanged files as-is (don't regenerate them)
- Maintain the existing color scheme, style, and structure unless told otherwise
- If adding a new component, also update App.tsx to include it

## COLOR SYSTEM:
Choose a cohesive palette based on business type:
| Type | Primary | Secondary | Accent |
|---|---|---|---|
| Restaurant/Food | amber-600/orange-600 | stone-800 | amber-400 |
| Tech/Software | blue-600/indigo-600 | slate-800 | cyan-400 |
| Health/Medical | emerald-600/teal-600 | slate-700 | green-400 |
| Education | violet-600/purple-600 | slate-800 | purple-400 |
| Real Estate | sky-600/blue-700 | gray-800 | sky-400 |
| Fashion/Beauty | rose-500/pink-600 | gray-800 | pink-400 |
| General/Corporate | slate-700/gray-800 | blue-600 | blue-400 |

Color rules:
- Primary for main buttons and highlighted headings
- Light shades for backgrounds: bg-{color}-50, bg-{color}-100
- Gradients: bg-gradient-to-br from-{primary}-600 to-{primary}-800
- Text: text-gray-900 for headings, text-gray-600 for paragraphs
- Alternate section backgrounds: white → light gray → colored → white

## SPACING & TYPOGRAPHY:
- Section padding: py-20 md:py-28 lg:py-32
- Container: max-w-7xl mx-auto px-6 md:px-8 lg:px-12
- Hero heading: text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight
- Section headings: text-3xl md:text-4xl font-bold (centered with badge above)
- Paragraphs: text-base md:text-lg leading-relaxed
- Section badge: <span class="inline-block px-4 py-1.5 rounded-full bg-{color}-100 text-{color}-700 text-sm font-semibold mb-4">Label</span>

## BUTTONS:
- Primary: px-8 py-4 bg-{primary}-600 hover:bg-{primary}-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-{primary}-600/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5
- Secondary: px-8 py-4 border-2 border-{primary}-600 text-{primary}-600 hover:bg-{primary}-50 rounded-xl font-bold text-lg transition-all duration-300

## CARDS:
- bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-{primary}-200 transition-all duration-300 hover:-translate-y-1
- Icon container: <div class="w-14 h-14 rounded-xl bg-{color}-100 flex items-center justify-center mb-5">

## REQUIRED FILES (for new builds, minimum 6):

### 1. styles.css
CSS variables, animations (fadeInUp, fadeIn, slideInRight), glass-effect, text-gradient classes.

### 2. Header.tsx
Sticky nav with logo, links, CTA button, mobile hamburger menu. glass-effect border-b.

### 3. Hero.tsx
min-h-[90vh], gradient or light background with decorative shapes, large heading, subtitle, 2 buttons, stats section (3-4 numbers).

### 4. Services.tsx
Badge + centered heading, 3-column grid of cards with icons, bg-gray-50.

### 5. About.tsx
2-column layout: text side with bullet points + visual side with gradient/pattern.

### 6. Testimonials.tsx (optional but recommended)
3 testimonial cards with star ratings, avatar placeholder (gradient circle with initial), name + role.

### 7. Contact.tsx
Gradient background or light with white form card, contact info with icons.

### 8. Footer.tsx
bg-gray-900, 3-4 columns, social icons, copyright.

### 9. App.tsx
Main assembly file wrapping all components in: <div dir="rtl" lang="ar" style={{fontFamily: 'Cairo, sans-serif'}}>

## QUALITY:
- Vercel/Stripe level design quality with Arabic identity
- Each section visually distinct from the previous
- Smooth transitions: transition-all duration-300
- Professional shadows and rounded corners
- Generous spacing — never cramped
- Hero must be the "wow factor"`;

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
    p_function_type: "builder",
    p_daily_limit: DAILY_LIMIT,
  });

  if (!allowed) {
    return new Response(JSON.stringify({ error: "تم تجاوز الحد اليومي للبناء. حاول بكرة! ⚡" }), {
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

    const { build_prompt, existing_files } = await req.json();
    if (!build_prompt) throw new Error("build_prompt is required");

    let fullPrompt = build_prompt;
    if (existing_files && Array.isArray(existing_files) && existing_files.length > 0) {
      const filesContext = existing_files
        .map((f: any) => `--- ${f.path} ---\n${f.content.slice(0, 3000)}${f.content.length > 3000 ? "\n...(truncated)" : ""}`)
        .join("\n\n");
      fullPrompt += `\n\n## EXISTING FILES (modify these, don't rebuild from scratch):\n${filesContext}`;
    }

    const groqKeys = [
      Deno.env.get("GROQ_API_KEY"),
      Deno.env.get("GROQ_API_KEY_2"),
      Deno.env.get("GROQ_API_KEY_3"),
    ].filter(Boolean) as string[];
    if (groqKeys.length === 0) throw new Error("GROQ_API_KEY is not configured");

    const requestBody = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: BUILDER_SYSTEM_PROMPT },
        { role: "user", content: fullPrompt },
      ],
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "generate_website",
            description:
              "Generate the website files based on the build prompt. Create at least 6 separate files.",
            parameters: {
              type: "object",
              properties: {
                thought_process: {
                  type: "array",
                  items: { type: "string" },
                  description: "4-6 thinking steps in Arabic describing the build plan",
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
      tool_choice: { type: "function", function: { name: "generate_website" } },
    });

    let response: Response | null = null;
    for (const key of groqKeys) {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
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
        console.warn("Groq key rate-limited, trying fallback...");
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

    if (!response) {
      return new Response(
        JSON.stringify({ error: "تم تجاوز الحد المسموح لجميع المفاتيح، حاول لاحقاً." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let toolCallArgs = "";
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
                const tc = delta.tool_calls[0];
                if (tc?.function?.arguments) {
                  toolCallArgs += tc.function.arguments;
                }
                continue;
              }

              if (delta.content) {
                controller.enqueue(
                  encoder.encode(
                    sseEvent({ event: "message_delta", content: delta.content })
                  )
                );
              }
            }
          }

          if (toolCallArgs) {
            let result: any;
            try {
              result = JSON.parse(toolCallArgs);
            } catch {
              controller.enqueue(
                encoder.encode(
                  sseEvent({
                    event: "message_delta",
                    content: "عذراً، حدث خطأ في بناء الموقع. حاول مرة ثانية.",
                  })
                )
              );
              controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
              controller.close();
              return;
            }

            if (result.thought_process?.length) {
              controller.enqueue(
                encoder.encode(sseEvent({ event: "thinking_start" }))
              );
              for (const step of result.thought_process) {
                controller.enqueue(
                  encoder.encode(sseEvent({ event: "thinking_step", step }))
                );
              }
            }

            if (result.vfs_operations?.length) {
              for (const op of result.vfs_operations) {
                controller.enqueue(
                  encoder.encode(
                    sseEvent({
                      event: "file_start",
                      path: op.path,
                      action: op.action,
                      language: op.language,
                    })
                  )
                );
                controller.enqueue(
                  encoder.encode(
                    sseEvent({
                      event: "file_done",
                      path: op.path,
                      content: op.content,
                    })
                  )
                );
              }
            }

            const msg = result.user_message || "تم بناء الموقع بنجاح! ⚡";
            controller.enqueue(
              encoder.encode(sseEvent({ event: "message_delta", content: msg }))
            );
          }

          controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.enqueue(
            encoder.encode(
              sseEvent({ event: "message_delta", content: "حدث خطأ أثناء البناء" })
            )
          );
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
    console.error("barq-builder error:", e);
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
