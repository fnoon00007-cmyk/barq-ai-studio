
# تطوير محرك الذكاء الاصطناعي ليعمل مثل Lovable.dev

## الوضع الحالي (المشاكل)

1. الرد يجي كامل دفعة واحدة (لا يوجد streaming)
2. ملف واحد فقط (App.tsx) - لا يدعم مشاريع متعددة الملفات
3. محرك التفكير يعرض كـ component منفصل وليس داخل المحادثة
4. لا يوجد عرض للملفات المتأثرة بعد البناء
5. System Prompt بسيط جداً مقارنة بـ Lovable

---

## المرحلة 1: تحويل الباكند إلى Streaming

### تعديل `supabase/functions/barq-chat/index.ts`
- تحويل من non-streaming إلى **streaming SSE** (Server-Sent Events)
- إرسال التوكنات حرف بحرف للفرونتند
- التعامل مع tool_calls في وضع الـ streaming (Groq يدعم streaming tool calls)
- إرسال أحداث مخصصة:
  - `thinking_start` - بداية التفكير
  - `thinking_step` - كل خطوة تفكير
  - `file_start` - بداية إنشاء ملف
  - `file_delta` - محتوى الملف (حرف بحرف)
  - `file_done` - اكتمال الملف
  - `message_delta` - رسالة للمستخدم
  - `done` - اكتمال كل شيء

### مثال على تدفق الأحداث:
```text
data: {"event":"thinking_start"}
data: {"event":"thinking_step","step":"تحليل المتطلبات..."}
data: {"event":"thinking_step","step":"تصميم الهيكل..."}
data: {"event":"file_start","path":"App.tsx","action":"create"}
data: {"event":"file_delta","content":"<div className=\"min-h-screen\">"}
data: {"event":"file_delta","content":"  <header>...</header>"}
data: {"event":"file_done","path":"App.tsx"}
data: {"event":"file_start","path":"styles.css","action":"create"}
data: {"event":"file_done","path":"styles.css"}
data: {"event":"message_delta","content":"تم بناء موقعك"}
data: {"event":"done"}
```

---

## المرحلة 2: تحديث الفرونتند للـ Streaming

### تعديل `src/lib/barq-api.ts`
- إضافة دالة `streamBarqAI()` جديدة بدل `callBarqAI()`
- تقرأ SSE line-by-line وتنادي callbacks لكل نوع حدث:
  - `onThinkingStep(step)` - عرض خطوة تفكير
  - `onFileStart(path)` - بداية ملف
  - `onFileDelta(content)` - محتوى ملف
  - `onFileDone(path)` - اكتمال ملف
  - `onMessageDelta(text)` - رسالة نصية
  - `onDone()` - اكتمال

### تعديل `src/pages/BuilderPage.tsx`
- استبدال `callBarqAI` بـ `streamBarqAI`
- عرض رسالة المساعد تتكون حرف بحرف (مثل ChatGPT/Lovable)
- عرض خطوات التفكير مباشرة أثناء البث
- عرض الملفات المتأثرة بعد كل عملية بناء (مثل Lovable يعرض "Files edited: ...")
- دعم إلغاء الطلب (AbortController)

---

## المرحلة 3: تحسين محرك التفكير

### تعديل `src/components/ThinkingEngine.tsx`
- عرض خطوات التفكير **داخل فقاعة الرسالة** (وليس كـ component منفصل)
- إضافة قسم "الملفات المتأثرة" بعد الخطوات
- Collapsible/قابل للطي بعد اكتمال البناء (مثل Lovable)

### تعديل `src/hooks/useVFS.ts`
- إضافة `ChatMessage.affectedFiles` لتتبع الملفات المتأثرة بكل رسالة
- دعم ملفات متعددة (components, pages, styles)

---

## المرحلة 4: تحسين System Prompt

### تعديل الـ System Prompt في Edge Function
- توجيه الذكاء الاصطناعي لإنتاج ملفات متعددة (Header.tsx, Hero.tsx, Footer.tsx, App.tsx, styles.css)
- تحسين جودة الكود المولد (components منفصلة)
- إضافة توجيهات للتصميم المتجاوب
- دعم التعديل التدريجي (update) وليس فقط الإنشاء من الصفر

---

## التفاصيل التقنية

### الملفات المتأثرة:

| الملف | نوع التغيير |
|---|---|
| `supabase/functions/barq-chat/index.ts` | إعادة كتابة - streaming SSE + أحداث مخصصة |
| `src/lib/barq-api.ts` | إعادة كتابة - streaming client مع callbacks |
| `src/pages/BuilderPage.tsx` | تحديث كبير - streaming UI + عرض ملفات |
| `src/components/ThinkingEngine.tsx` | تحديث - inline + collapsible + ملفات متأثرة |
| `src/hooks/useVFS.ts` | تحديث - إضافة affectedFiles للرسائل |

### المكتبات المطلوبة:
- لا مكتبات جديدة (SSE parsing يدوي مثل ما يسوي Lovable)

### التدفق الجديد:

```text
المستخدم يرسل رسالة
        |
        v
BuilderPage -> streamBarqAI() -> Edge Function
        |                              |
        |                    Groq API (streaming)
        |                              |
        |                    Parse tool_calls
        |                              |
        |                    Send SSE events
        |                              |
        v                              v
onThinkingStep() -----> عرض خطوة في الشات
onFileStart() -------> عرض "جاري إنشاء App.tsx..."
onFileDelta() -------> تحديث VFS + عرض في المعاينة
onFileDone() --------> علامة اكتمال الملف
onMessageDelta() ----> عرض رسالة حرف بحرف
onDone() ------------> اكتمال + عرض ملخص الملفات
```

### ترتيب التنفيذ:
1. تحديث `src/hooks/useVFS.ts` (إضافة affectedFiles)
2. تعديل `supabase/functions/barq-chat/index.ts` (streaming SSE)
3. إعادة كتابة `src/lib/barq-api.ts` (streaming client)
4. تحديث `src/components/ThinkingEngine.tsx` (inline + collapsible)
5. تحديث `src/pages/BuilderPage.tsx` (streaming UI)
6. Deploy + اختبار
