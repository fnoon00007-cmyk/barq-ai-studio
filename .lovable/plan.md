
# تحويل باكند الذكاء الاصطناعي من Lovable AI إلى Groq

## ملخص التغييرات

تغيير واحد بسيط: استبدال Lovable AI Gateway بـ Groq API في الـ Edge Function، مع إضافة مفتاح GROQ_API_KEY كـ secret.

## الخطوات

### 1. إضافة GROQ_API_KEY كـ Secret
- طلب المفتاح من المستخدم عبر أداة add_secret

### 2. تعديل `supabase/functions/barq-chat/index.ts`
- تغيير الـ URL من `https://ai.gateway.lovable.dev/v1/chat/completions` إلى `https://api.groq.com/openai/v1/chat/completions`
- تغيير الـ API Key من `LOVABLE_API_KEY` إلى `GROQ_API_KEY`
- تغيير الموديل إلى موديل Groq مناسب (مثل `llama-3.3-70b-versatile` أو `mixtral-8x7b-32768`)
- باقي الكود يبقى كما هو لأن Groq متوافق مع OpenAI API

### 3. تعديل `src/lib/barq-api.ts`
- لا يحتاج تغيير (يستدعي الـ Edge Function فقط)

## التفاصيل التقنية

التغيير في الـ Edge Function محدود بسطرين فقط:

```text
// قبل:
Authorization: Bearer ${LOVABLE_API_KEY}
URL: https://ai.gateway.lovable.dev/v1/chat/completions
model: "google/gemini-3-flash-preview"

// بعد:
Authorization: Bearer ${GROQ_API_KEY}
URL: https://api.groq.com/openai/v1/chat/completions
model: "llama-3.3-70b-versatile"
```

لا تغييرات على الفرونتند - كل شيء يمر عبر الـ Edge Function.
