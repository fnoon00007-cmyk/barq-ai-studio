# خطة تطوير BARQ: نظام القوالب الاحترافية (Template-Based Customization)

## الهدف
تحويل BARQ من "بناء من الصفر" إلى "تخصيص قوالب جاهزة" لتسريع البناء من ~6 دقائق إلى ~30-60 ثانية.

## المعمارية

### التخزين: ملفات ثابتة في الكود (`src/templates/`)
كل قالب = ملف TypeScript يصدر مصفوفة VFSFile[] مع كود احترافي كامل.

### سير العمل الجديد
1. **المستخدم يختار قالب** → كود القالب يتحمل فوراً من `src/templates/`
2. **المخطط (Planner)** → يحلل طلب المستخدم، يختار أقرب قالب، يحدد التعديلات
3. **المنفذ (Builder)** → استدعاء AI واحد لتخصيص النصوص/الألوان/المحتوى فقط
4. **النتيجة** → موقع احترافي في 30-60 ثانية

### القوالب الـ 12
1. `restaurant-premium` - مطعم فاخر
2. `clinic-advanced` - عيادة طبية
3. `realestate-pro` - عقارات احترافي
4. `ecommerce-full` - متجر إلكتروني
5. `law-firm` - مكتب محاماة
6. `salon-spa` - صالون تجميل
7. `gym-fitness` - نادي رياضي
8. `tech-startup` - شركة برمجيات
9. `education` - أكاديمية تعليمية
10. `photography` - مصور فوتوغرافي
11. `consulting` - شركة استشارات
12. `portfolio` - موقع شخصي

## مراحل التنفيذ

### المرحلة 1: البنية التحتية + أول قالب
- [x] كتابة الخطة
- [ ] إنشاء `src/lib/template-registry.ts`
- [ ] إنشاء `src/templates/restaurant-premium.ts`
- [ ] تحديث `barq-planner` — أداة `customize_template`
- [ ] تحديث `barq-build-worker` — وضع template customization
- [ ] تحديث `barq-chat` — التعامل مع تخصيص القوالب
- [ ] تحديث `useBuildEngine.ts` — مسار القوالب
- [ ] تحديث `barq-api.ts` — دوال القوالب
- [ ] تحديث `TemplatesPage.tsx` — تحميل مباشر

### المرحلة 2: القوالب 2-6
- [ ] clinic-advanced, realestate-pro, ecommerce-full, law-firm, salon-spa

### المرحلة 3: القوالب 7-12
- [ ] gym-fitness, tech-startup, education, photography, consulting, portfolio

### المرحلة 4: أدوات الإدارة
- [ ] صفحة بناء القوالب (admin only)
- [ ] نظام معاينة القوالب
- [ ] تحليلات القوالب

## الملفات المتأثرة
- **جديد**: `src/templates/restaurant-premium.ts` + باقي القوالب
- **جديد**: `src/lib/template-registry.ts`
- **تعديل**: `src/lib/templates-data.ts` (إضافة hasFullTemplate)
- **تعديل**: `supabase/functions/barq-planner/index.ts`
- **تعديل**: `supabase/functions/barq-build-worker/index.ts`
- **تعديل**: `supabase/functions/barq-chat/index.ts`
- **تعديل**: `src/hooks/v2/useBuildEngine.ts`
- **تعديل**: `src/lib/barq-api.ts`
- **تعديل**: `src/pages/TemplatesPage.tsx`
