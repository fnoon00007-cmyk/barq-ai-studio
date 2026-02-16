# خطة تطوير BARQ: نظام القوالب الاحترافية (Template-Based Customization)

## الهدف
تحويل BARQ من "بناء من الصفر" إلى "تخصيص قوالب جاهزة" لتسريع البناء من ~6 دقائق إلى ~30-60 ثانية.

## المعمارية

### التخزين: ملفات ثابتة في الكود (`src/templates/`)
كل قالب = ملف TypeScript يصدر مصفوفة VFSFile[] مع كود احترافي كامل.

### سير العمل الجديد
1. **المستخدم يكتب طلبه** → المخطط يحلل ويختار القالب
2. **المخطط (Planner)** → يستدعي `customize_template` مع template_id + modifications
3. **Frontend** → يحمل ملفات القالب من `src/templates/` ويرسلها لـ barq-chat
4. **المنفذ (Builder/Chat)** → AI يخصص النصوص/الألوان/المحتوى فقط
5. **النتيجة** → موقع احترافي في 30-60 ثانية

### القوالب الـ 12
1. `restaurant-luxury` - مطعم فاخر
2. `medical-clinic` - عيادة طبية
3. `real-estate-agency` - عقارات
4. `ecommerce-store` - متجر إلكتروني
5. `law-firm` - مكتب محاماة
6. `beauty-salon` - صالون تجميل
7. `gym-fitness` - نادي رياضي
8. `tech-company` - شركة برمجيات
9. `education-academy` - أكاديمية تعليمية
10. `photography-portfolio` - مصور فوتوغرافي
11. `consulting-firm` - شركة استشارات
12. `personal-portfolio` - موقع شخصي

## مراحل التنفيذ

### المرحلة 1: البنية التحتية + أول قالب ✅
- [x] كتابة الخطة
- [x] إنشاء `src/lib/template-registry.ts`
- [x] إنشاء `src/templates/restaurant-premium.ts`
- [x] تحديث `barq-planner` — أداة `customize_template` بدل `prepare_build_prompt`
- [x] تحديث `barq-chat` — وضع template customization + modification mode
- [x] تحديث `barq-build-worker` — بناء قالب في pass واحد
- [x] تحديث `useBuildEngine.ts` — مسار القوالب مع loadTemplateFiles
- [x] تحديث `barq-api.ts` — إضافة `streamBarqTemplateCustomize`
- [ ] تحديث `TemplatesPage.tsx` — تحميل مباشر

### المرحلة 2: القوالب 2-6
- [x] medical-clinic ✅
- [x] ecommerce-store ✅
- [x] real-estate-agency, law-firm, beauty-salon ✅

### المرحلة 3: القوالب 7-12 ✅
- [x] gym-fitness, tech-company, education-academy, photography-portfolio, consulting-firm, personal-portfolio ✅

### المرحلة 4: أدوات الإدارة
- [ ] صفحة بناء القوالب (admin only)
- [ ] نظام معاينة القوالب

## الملفات المتأثرة
- **جديد**: `src/templates/restaurant-premium.ts` + باقي القوالب
- **جديد**: `src/lib/template-registry.ts`
- **تعديل**: `src/lib/templates-data.ts`
- **تعديل**: `supabase/functions/barq-planner/index.ts` ← customize_template tool
- **تعديل**: `supabase/functions/barq-chat/index.ts` ← template_files mode
- **تعديل**: `supabase/functions/barq-build-worker/index.ts` ← single-pass template
- **تعديل**: `src/hooks/useBuildEngine.ts` ← template loading + customization flow
- **تعديل**: `src/lib/barq-api.ts` ← streamBarqTemplateCustomize
