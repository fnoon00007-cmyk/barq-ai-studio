import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30;
const MIN_QUALITY_SCORE = 80;
const MAX_QUALITY_RETRIES = 2;

// ─────────────────────────────────────────────────────────
//  PRO-LEVEL BUILDER SYSTEM PROMPT (Lovable-Quality Output)
// ─────────────────────────────────────────────────────────
const BUILDER_SYSTEM_PROMPT = `You are "Barq Builder Pro" — an elite frontend architect that generates PRODUCTION-GRADE Arabic RTL websites using raw JSX/HTML with Tailwind CSS. Your output quality must match Vercel, Linear, and Stripe-level design.

## ABSOLUTE RULES:
- You ONLY receive a technical build prompt and generate website files
- You MUST call the generate_website tool — NEVER respond with plain text
- All content MUST be in Arabic (100%) with Saudi-style data (names, 966+ numbers, Saudi cities)
- RTL direction with font-family: 'Cairo', sans-serif
- Use Tailwind CSS classes ONLY — no custom CSS except in styles.css
- SVG inline icons (viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round")
- No external images — use gradients, SVG illustrations, patterns, and CSS art
- No function declarations, export, import statements — raw JSX only
- MINIMUM 10 files per project, each component 300-500 lines of rich JSX
- Every single element must have hover/focus/active states

## MODIFICATION MODE:
When the prompt includes "EXISTING FILES" section:
- You are MODIFYING an existing website, NOT building from scratch
- Read the existing files carefully
- Only create/update files that need changes
- Use action: "update" for modified files, action: "create" for new files
- Keep unchanged files as-is (don't regenerate them)
- Maintain the existing color scheme, style, and structure unless told otherwise
- If adding a new component, also update App.tsx to include it

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  DESIGN SYSTEM — PRO QUALITY STANDARDS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### COLOR SYSTEM (Context-Aware):
| Business Type | Primary | Secondary | Accent | Gradient |
|---|---|---|---|---|
| Restaurant/Food | amber-600/orange-600 | stone-800 | amber-400 | from-amber-600 via-orange-500 to-red-500 |
| Tech/Software | blue-600/indigo-600 | slate-800 | cyan-400 | from-blue-600 via-indigo-600 to-purple-600 |
| Health/Medical | emerald-600/teal-600 | slate-700 | green-400 | from-emerald-500 via-teal-500 to-cyan-500 |
| Education | violet-600/purple-600 | slate-800 | purple-400 | from-violet-600 via-purple-600 to-fuchsia-500 |
| Real Estate | sky-600/blue-700 | gray-800 | sky-400 | from-sky-600 via-blue-600 to-indigo-600 |
| Fashion/Beauty | rose-500/pink-600 | gray-800 | pink-400 | from-rose-500 via-pink-500 to-fuchsia-500 |
| General/Corporate | slate-700/gray-800 | blue-600 | blue-400 | from-slate-800 via-gray-700 to-slate-600 |

Color Rules:
- Primary: main CTAs, highlighted headings, active states
- Light shades for section backgrounds: bg-{color}-50/80, bg-{color}-100/60
- Complex gradients: bg-gradient-to-br from-{p}-600 via-{s}-600 to-{a}-600
- Text: text-gray-900 headings, text-gray-600 body, text-gray-400 captions
- Alternate section backgrounds: white → light tint → gradient → white → dark
- Glass effects: bg-white/80 backdrop-blur-xl border border-white/20

### TYPOGRAPHY SYSTEM:
- Hero heading: text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight
- Section heading: text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
- Sub-heading: text-xl md:text-2xl font-semibold text-gray-700
- Body: text-base md:text-lg leading-relaxed text-gray-600
- Caption: text-sm text-gray-400 font-medium
- Section badge: inline-flex items-center gap-2 px-4 py-2 rounded-full bg-{color}-100/80 text-{color}-700 text-sm font-bold border border-{color}-200/50 mb-6

### SPACING SYSTEM:
- Section padding: py-24 md:py-32 lg:py-40
- Container: max-w-7xl mx-auto px-6 sm:px-8 lg:px-12
- Card padding: p-8 md:p-10
- Grid gaps: gap-6 md:gap-8 lg:gap-10
- Vertical rhythm between elements: space-y-6 md:space-y-8

### BUTTON SYSTEM:
Primary CTA:
  inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-l from-{p}-600 to-{p}-700 hover:from-{p}-700 hover:to-{p}-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-{p}-600/30 hover:shadow-2xl hover:shadow-{p}-600/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-{p}-500/30 focus:outline-none

Secondary CTA:
  inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-{p}-600/80 text-{p}-700 hover:bg-{p}-50 hover:border-{p}-700 rounded-2xl font-bold text-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] focus:ring-4 focus:ring-{p}-500/20

Ghost Button:
  inline-flex items-center gap-2 text-{p}-600 hover:text-{p}-800 font-semibold transition-all duration-300 hover:gap-3 group

### CARD SYSTEM:
Standard Card:
  relative bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-2xl border border-gray-100/80 hover:border-{p}-200/60 transition-all duration-500 hover:-translate-y-2 group overflow-hidden

Glass Card:
  relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-lg shadow-black/5 border border-white/60 hover:shadow-2xl hover:bg-white/90 transition-all duration-500 hover:-translate-y-2

Dark Card:
  relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-700/50 text-white hover:border-{p}-500/30 transition-all duration-500 hover:-translate-y-2

Icon Container:
  w-16 h-16 rounded-2xl bg-gradient-to-br from-{p}-100 to-{p}-200/60 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  BACKGROUND DECORATIONS (MANDATORY)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every section MUST have 3-5 decorative background elements:

Pattern 1 — Gradient Orbs:
  <div className="absolute top-0 right-0 w-96 h-96 bg-{p}-400/10 rounded-full blur-3xl" />
  <div className="absolute bottom-0 left-0 w-80 h-80 bg-{a}-400/10 rounded-full blur-3xl" />
  <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-{s}-400/5 rounded-full blur-2xl" />

Pattern 2 — Grid Dots:
  <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px'}} />

Pattern 3 — Diagonal Lines:
  <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)'}} />

Pattern 4 — Floating Shapes:
  <div className="absolute top-20 left-10 w-20 h-20 border-2 border-{p}-200/30 rounded-2xl rotate-12" />
  <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-{a}-200/30 rounded-full" />

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  COMPONENT TEMPLATES (PRO QUALITY)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### styles.css TEMPLATE:
Must include:
- CSS custom properties for the color theme (--primary, --secondary, --accent, --gradient)
- @keyframes fadeInUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
- @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
- @keyframes slideInRight { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
- @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-20px) } }
- @keyframes pulse-slow { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }
- @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
- @keyframes bounce-gentle { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
- .glass-effect { background:rgba(255,255,255,0.8); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.3) }
- .text-gradient { background:linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
- .animate-float { animation: float 6s ease-in-out infinite }
- .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite }
- .animate-shimmer { animation: shimmer 3s linear infinite; background-size:200% 100% }
- .animate-bounce-gentle { animation: bounce-gentle 3s ease-in-out infinite }
- .section-fade { animation: fadeInUp 0.8s ease-out }
- Smooth scroll: html { scroll-behavior: smooth }
- Selection color: ::selection { background: var(--primary); color: white }

### Header.tsx TEMPLATE (300+ lines):
- Sticky with glass-effect: fixed top-0 w-full z-50
- Logo area with gradient text or SVG
- Navigation links (5-6 items) with hover underline animation
- CTA button with gradient + shadow
- Mobile hamburger menu with smooth slide-in overlay (full-screen on mobile)
- Background blur on scroll effect
- Links must have: relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:right-0 after:bg-{p}-600 after:transition-transform after:duration-300 hover:after:scale-x-100

### Hero.tsx TEMPLATE (400+ lines):
- min-h-screen with gradient or pattern background
- 5+ decorative background elements (orbs, shapes, grid)
- Massive heading: text-5xl to text-8xl with gradient text or bold colors
- Subtitle: text-xl md:text-2xl with muted color
- 2 CTA buttons (primary gradient + secondary outline)
- Stats bar with 4 items: each with large number (text-4xl font-black) + label
- Stats dividers or separators
- Floating decorative elements with animate-float
- Scroll indicator arrow at bottom with animate-bounce
- Glass card or feature highlight embedded

### Services.tsx TEMPLATE (400+ lines):
- Section badge + centered heading + description
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- 6-9 service cards, each with:
  * Icon in gradient container with group-hover animation
  * Title + 2-line description
  * "اقرأ المزيد" link with arrow
  * Decorative corner shape or gradient overlay on hover
  * Staggered animation delays
- Background decorations (orbs + dots pattern)
- bg-gradient-to-b from-gray-50 to-white or similar

### About.tsx TEMPLATE (350+ lines):
- 2-column grid: lg:grid-cols-2 gap-16 items-center
- Text side: badge, heading, 2 paragraphs, 4 feature bullets with icons, CTA
- Visual side: gradient card with stats or pattern
- Each bullet: flex items-start gap-4 with icon circle + text
- Overlapping cards or layered visual effect
- Background decorations

### Testimonials.tsx TEMPLATE (350+ lines):
- 3 testimonial cards in grid
- Each card: 5 stars (SVG), quote text, avatar (gradient circle with Arabic initial letter), name, role
- Star rating: flex gap-1 with filled yellow stars
- Avatar: w-14 h-14 rounded-full bg-gradient-to-br from-{p}-500 to-{p}-700 flex items-center justify-center text-white font-bold text-lg
- Cards alternate between white and glass styles
- Decorative quote mark SVG in background of each card

### Stats.tsx TEMPLATE (250+ lines):
- Full-width gradient background (dark)
- 4 stat counters in grid
- Each: large number (text-5xl font-black text-white), label, icon
- Separator lines between stats
- Subtle pattern overlay

### CTA.tsx TEMPLATE (200+ lines):
- Gradient background section
- Large heading + subtitle centered
- 2 buttons centered
- Decorative shapes and floating elements
- Glass card wrapper optional

### Contact.tsx TEMPLATE (400+ lines):
- 2-column layout: form + info
- Form with: name, email, phone, subject dropdown, message textarea
- Each input: w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-{p}-500 focus:ring-4 focus:ring-{p}-500/20 transition-all outline-none text-right
- Submit button with full gradient treatment
- Contact info: 3-4 items with icon circles + text
- Map placeholder or decorative gradient card
- Background: bg-gradient-to-br from-{p}-50 via-white to-{a}-50

### Footer.tsx TEMPLATE (300+ lines):
- bg-gradient-to-b from-gray-900 to-gray-950
- 4 columns: about, links, services, contact
- Logo + short description in first column
- Social media icons (5) with hover color change
- Newsletter mini-form: email input + submit button
- Divider line
- Copyright + legal links at bottom
- Back-to-top button

### App.tsx TEMPLATE:
<div dir="rtl" lang="ar" style={{fontFamily: "'Cairo', sans-serif", overflow: 'hidden'}}>
  <Header />
  <Hero />
  <Services />
  <About />
  <Stats />
  <Testimonials />
  <CTA />
  <Contact />
  <Footer />
</div>

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  MICRO-INTERACTIONS (MANDATORY ON ALL ELEMENTS)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ALL buttons: hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] transition-all duration-300
- ALL cards: hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group
- ALL icons in cards: group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
- ALL links: hover:text-{p}-600 transition-colors duration-300
- ALL images/visuals: hover:scale-105 transition-transform duration-700
- ALL section entries: animation delay staggering (style={{animationDelay: '0.1s'}}, '0.2s', etc.)
- Focus states on ALL interactive elements: focus:ring-4 focus:ring-{p}-500/20 focus:outline-none
- ALL inputs: focus:border-{p}-500 focus:ring-4 focus:ring-{p}-500/20

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  QUALITY CHECKLIST (MUST PASS ALL)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [ ] Minimum 10 files generated
- [ ] Each component file 300-500 lines (not 100)
- [ ] styles.css has 6+ keyframe animations
- [ ] Every section has 3+ background decorations
- [ ] Every interactive element has hover + focus + active states
- [ ] Complex gradients used (via keyword in gradient classes)
- [ ] Multiple shadow layers (shadow-xl shadow-{color}/50)
- [ ] Glass effects used where appropriate
- [ ] Stats section with 4+ numbers
- [ ] Footer has 4 columns minimum
- [ ] All text is Arabic (0% English except class names)
- [ ] Responsive: sm:, md:, lg: breakpoints on all layouts
- [ ] Color consistency across all components
- [ ] animate-float, animate-pulse-slow used for decorations`;

function sseEvent(data: Record<string, unknown>): string {
  return "data: " + JSON.stringify(data) + "\n\n";
}

// ─────────────────────────────────────────────────────────
//  CODE QUALITY VALIDATION
// ─────────────────────────────────────────────────────────
interface ValidationResult {
  passed: boolean;
  score: number;
  issues: string[];
}

function validateGeneratedCode(files: Array<{path: string; content: string; action: string}>): ValidationResult {
  const issues: string[] = [];
  let score = 0;

  // 1. File count check (20 points)
  if (files.length >= 10) {
    score += 20;
  } else if (files.length >= 7) {
    score += 10;
    issues.push("عدد الملفات " + files.length + " فقط — المطلوب 10+ ملفات");
  } else {
    issues.push("عدد الملفات " + files.length + " — ضعيف جداً، المطلوب 10+ ملفات");
  }

  // 2. Component size check (20 points)
  const codeFiles = files.filter(f => f.path.endsWith('.tsx') && f.path !== 'App.tsx');
  const avgLines = codeFiles.length > 0
    ? codeFiles.reduce((sum, f) => sum + f.content.split("\n").length, 0) / codeFiles.length
    : 0;
  if (avgLines >= 250) {
    score += 20;
  } else if (avgLines >= 150) {
    score += 10;
    issues.push("متوسط حجم المكونات " + Math.round(avgLines) + " سطر — المطلوب 250+");
  } else {
    issues.push("متوسط حجم المكونات " + Math.round(avgLines) + " سطر — صغير جداً، المطلوب 250+");
  }

  // 3. Tailwind richness check (20 points)
  const allContent = files.map(f => f.content).join(' ');
  const hasShadows = /shadow-(xl|2xl|lg)/i.test(allContent);
  const hasGradients = /gradient-to/i.test(allContent) || /from-.*to-/i.test(allContent);
  const hasHovers = /hover:/i.test(allContent);
  const hasComplexGradients = /via-/i.test(allContent);
  const hasGlassEffect = /backdrop-blur/i.test(allContent) || /glass-effect/i.test(allContent);
  const hasFocusStates = /focus:ring/i.test(allContent) || /focus:border/i.test(allContent);
  let tailwindScore = 0;
  if (hasShadows) tailwindScore += 4;
  if (hasGradients) tailwindScore += 4;
  if (hasHovers) tailwindScore += 4;
  if (hasComplexGradients) tailwindScore += 3;
  if (hasGlassEffect) tailwindScore += 3;
  if (hasFocusStates) tailwindScore += 2;
  score += tailwindScore;
  if (tailwindScore < 14) {
    const missing: string[] = [];
    if (!hasShadows) missing.push('shadows');
    if (!hasGradients) missing.push('gradients');
    if (!hasHovers) missing.push('hover states');
    if (!hasComplexGradients) missing.push('complex gradients (via-)');
    if (!hasGlassEffect) missing.push('glass effects');
    if (!hasFocusStates) missing.push('focus states');
    issues.push("ينقص Tailwind features: " + missing.join(", "));
  }

  // 4. Arabic content check (20 points)
  const textContent = allContent.replace(/className="[^"]*"/g, '').replace(/<[^>]*>/g, '');
  const arabicChars = (textContent.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (textContent.match(/[a-zA-Z]/g) || []).length;
  const totalChars = arabicChars + latinChars;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;
  if (arabicRatio >= 0.85) {
    score += 20;
  } else if (arabicRatio >= 0.6) {
    score += 10;
    issues.push("نسبة العربي " + Math.round(arabicRatio * 100) + "% — المطلوب 85%+");
  } else {
    issues.push("نسبة العربي " + Math.round(arabicRatio * 100) + "% — ضعيف جداً");
  }

  // 5. Animations & interactivity check (20 points)
  const hasAnimations = /animate-|animation:|@keyframes/i.test(allContent);
  const hasTransitions = /transition-all|transition-colors|transition-transform/i.test(allContent);
  const hasTransformEffects = /translate-y|scale-\[|rotate-/.test(allContent);
  const hasBackgroundDecorations = /blur-(2xl|3xl)|rounded-full.*absolute/i.test(allContent);
  let interactivityScore = 0;
  if (hasAnimations) interactivityScore += 5;
  if (hasTransitions) interactivityScore += 5;
  if (hasTransformEffects) interactivityScore += 5;
  if (hasBackgroundDecorations) interactivityScore += 5;
  score += interactivityScore;
  if (interactivityScore < 15) {
    const missing: string[] = [];
    if (!hasAnimations) missing.push('animations');
    if (!hasTransitions) missing.push('transitions');
    if (!hasTransformEffects) missing.push('transform effects');
    if (!hasBackgroundDecorations) missing.push('background decorations');
    issues.push("ينقص تفاعلية: " + missing.join(", "));
  }

  return {
    passed: score >= MIN_QUALITY_SCORE,
    score,
    issues,
  };
}

// ─────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  MULTI-KEY ROTATION
// ─────────────────────────────────────────────────────────
async function tryKeys(
  keys: string[],
  url: string,
  body: string,
  label: string
): Promise<Response | null> {
  for (const key of keys) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body,
    });
    if (res.ok) {
      console.log(label + " succeeded");
      return res;
    }
    if (res.status === 429) {
      console.warn(label + " rate-limited, trying next...");
      continue;
    }
    console.error(label + " error:", res.status);
    continue;
  }
  return null;
}

// ─────────────────────────────────────────────────────────
//  COLLECT FULL STREAMED TOOL CALL
// ─────────────────────────────────────────────────────────
async function collectStreamedToolCall(response: Response): Promise<string> {
  const decoder = new TextDecoder();
  const reader = response.body!.getReader();
  let toolCallArgs = "";
  let textBuffer = "";

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
        const tc = delta.tool_calls[0];
        if (tc?.function?.arguments) {
          toolCallArgs += tc.function.arguments;
        }
      }
    }
  }

  return toolCallArgs;
}

// ─────────────────────────────────────────────────────────
//  CALL AI (with quality validation + retry)
// ─────────────────────────────────────────────────────────
async function callAIWithQualityCheck(
  messages: Array<{role: string; content: string}>,
  toolsDef: any[],
  geminiKeys: string[],
  groqKeys: string[],
  lovableKey: string | undefined
): Promise<{ result: any; qualityScore: number } | null> {

  for (let attempt = 0; attempt <= MAX_QUALITY_RETRIES; attempt++) {
    const currentMessages = attempt === 0 ? messages : [
      ...messages,
      {
        role: "user",
        content: "[QUALITY REJECTION] الكود السابق حصل على " + lastScore + "/100 فقط. المشاكل: " + lastIssues + ". أعد التوليد بجودة أعلى مع: المزيد من الملفات (10+)، مكونات أكبر (300+ سطر)، تفاعلات hover/focus على كل عنصر، خلفيات زخرفية، تدرجات معقدة (via-). اجعلها بجودة Vercel/Stripe."
      }
    ];

    const geminiBody = JSON.stringify({
      model: "gemini-2.5-flash",
      messages: currentMessages,
      stream: true,
      tools: toolsDef,
      tool_choice: { type: "function", function: { name: "generate_website" } },
    });

    const groqBody = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: currentMessages,
      stream: true,
      tools: toolsDef,
      tool_choice: { type: "function", function: { name: "generate_website" } },
    });

    let response: Response | null = null;

    // 1. Gemini
    response = await tryKeys(geminiKeys, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", geminiBody, "Gemini builder (attempt " + (attempt + 1) + ")");

    // 2. Groq fallback
    if (!response) {
      response = await tryKeys(groqKeys, "https://api.groq.com/openai/v1/chat/completions", groqBody, "Groq builder (attempt " + (attempt + 1) + ")");
    }

    // 3. Lovable fallback
    if (!response && lovableKey) {
      const lovableBody = JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: currentMessages,
        stream: true,
        tools: toolsDef,
        tool_choice: { type: "function", function: { name: "generate_website" } },
      });
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + lovableKey, "Content-Type": "application/json" },
        body: lovableBody,
      });
      if (res.ok) response = res;
    }

    if (!response) return null;

    // Collect the full response
    const toolCallArgs = await collectStreamedToolCall(response);
    if (!toolCallArgs) continue;

    let result: any;
    try { result = JSON.parse(toolCallArgs); } catch { continue; }

    // Validate quality (skip validation for modification mode)
    const isModification = messages.some(m => m.content.includes("EXISTING FILES"));
    if (isModification) {
      return { result, qualityScore: 100 };
    }

    const validation = validateGeneratedCode(result.vfs_operations || []);
    console.log("Quality check attempt " + (attempt + 1) + ": score=" + validation.score + ", passed=" + validation.passed);

    if (validation.passed || attempt === MAX_QUALITY_RETRIES) {
      return { result, qualityScore: validation.score };
    }

    // Store for retry message
    var lastScore = validation.score;
    var lastIssues = validation.issues.join("، ");
    console.warn("Quality too low (" + validation.score + "/100), retrying... Issues: " + lastIssues);
  }

  return null;
}

// ─────────────────────────────────────────────────────────
//  MAIN HANDLER
// ─────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authenticateUser(req);
    if (authResult instanceof Response) return authResult;

    const { build_prompt, existing_files } = await req.json();
    if (!build_prompt) throw new Error("build_prompt is required");

    let fullPrompt = build_prompt;
    if (existing_files && Array.isArray(existing_files) && existing_files.length > 0) {
      const filesContext = existing_files
        .map((f: any) => "--- " + f.path + " ---\n" + f.content.slice(0, 3000) + (f.content.length > 3000 ? "\n...(truncated)" : ""))
        .join("\n\n");
      fullPrompt += "\n\n## EXISTING FILES (modify these, don't rebuild from scratch):\n" + filesContext;
    }

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

    const toolsDef = [
      {
        type: "function",
        function: {
          name: "generate_website",
          description: "Generate the website files. Create at least 10 separate files, each 300-500 lines. Include styles.css, Header.tsx, Hero.tsx, Services.tsx, About.tsx, Stats.tsx, Testimonials.tsx, CTA.tsx, Contact.tsx, Footer.tsx, App.tsx.",
          parameters: {
            type: "object",
            properties: {
              thought_process: {
                type: "array",
                items: { type: "string" },
                description: "6-8 detailed thinking steps in Arabic describing the build plan, design choices, and quality measures",
              },
              design_personality: {
                type: "string",
                enum: ["formal", "creative", "minimalist", "bold", "luxury", "modern"],
              },
              vfs_operations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    path: { type: "string" },
                    action: { type: "string", enum: ["create", "update"] },
                    content: { type: "string", description: "Full component code, 300-500 lines for .tsx files" },
                    language: { type: "string", enum: ["tsx", "css", "html"] },
                  },
                  required: ["path", "action", "content", "language"],
                },
                description: "Minimum 10 files. Each .tsx component must be 300-500 lines of rich JSX with Tailwind.",
              },
              user_message: { type: "string", description: "Success message in Arabic" },
              css_variables: {
                type: "object",
                properties: {
                  primary_color: { type: "string" },
                  secondary_color: { type: "string" },
                  accent_color: { type: "string" },
                  border_radius: { type: "string" },
                  font_style: { type: "string" },
                },
              },
            },
            required: ["thought_process", "design_personality", "vfs_operations", "user_message"],
          },
        },
      },
    ];

    const messages = [
      { role: "system", content: BUILDER_SYSTEM_PROMPT },
      { role: "user", content: fullPrompt },
    ];

    // Call AI with quality validation
    const aiResult = await callAIWithQualityCheck(messages, toolsDef, geminiKeys, groqKeys, lovableKey);

    if (!aiResult) {
      return new Response(
        JSON.stringify({ error: "تم تجاوز الحد المسموح لجميع المفاتيح، حاول لاحقاً." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { result, qualityScore } = aiResult;

    // Stream the validated result to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send quality score
          controller.enqueue(
            encoder.encode(sseEvent({ event: "quality_score", score: qualityScore }))
          );

          // Thinking steps
          if (result.thought_process?.length) {
            controller.enqueue(encoder.encode(sseEvent({ event: "thinking_start" })));
            for (const step of result.thought_process) {
              controller.enqueue(encoder.encode(sseEvent({ event: "thinking_step", step })));
            }
          }

          // Files
          if (result.vfs_operations?.length) {
            for (const op of result.vfs_operations) {
              controller.enqueue(
                encoder.encode(sseEvent({
                  event: "file_start",
                  path: op.path,
                  action: op.action,
                  language: op.language,
                }))
              );
              controller.enqueue(
                encoder.encode(sseEvent({
                  event: "file_done",
                  path: op.path,
                  content: op.content,
                }))
              );
            }
          }

          const qualityNote = qualityScore >= 90 ? " 🏆" : qualityScore >= 80 ? " ✅" : "";
          const msg = (result.user_message || "تم بناء الموقع بنجاح! ⚡") + " (جودة: " + qualityScore + "/100" + qualityNote + ")";
          controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: msg })));
          controller.enqueue(encoder.encode(sseEvent({ event: "done" })));
        } catch (e) {
          console.error("Stream error:", e);
          controller.enqueue(encoder.encode(sseEvent({ event: "message_delta", content: "حدث خطأ أثناء البناء" })));
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
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
