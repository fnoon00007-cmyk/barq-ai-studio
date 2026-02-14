import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">برق Ai</span>
          </button>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">سياسة الخصوصية</h1>
        <p className="text-sm text-muted-foreground mb-10">آخر تحديث: 14 فبراير 2026</p>

        <div className="space-y-8 text-secondary-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. مقدمة</h2>
            <p>مرحباً بك في برق Ai (barqai.site). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيف نجمع معلوماتك ونستخدمها ونحميها عند استخدامك لمنصتنا.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong className="text-foreground">معلومات الحساب:</strong> البريد الإلكتروني، الاسم، وصورة الملف الشخصي عند التسجيل.</li>
              <li><strong className="text-foreground">بيانات المشاريع:</strong> المواقع والملفات التي تقوم بإنشائها عبر المنصة.</li>
              <li><strong className="text-foreground">بيانات الاستخدام:</strong> معلومات حول كيفية تفاعلك مع المنصة لتحسين الخدمة.</li>
              <li><strong className="text-foreground">بيانات تقنية:</strong> نوع المتصفح، عنوان IP، ونوع الجهاز.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>تقديم خدمات المنصة وتشغيلها.</li>
              <li>تحسين وتطوير المنصة والميزات الجديدة.</li>
              <li>التواصل معك بخصوص حسابك أو تحديثات الخدمة.</li>
              <li>حماية المنصة من الاستخدام غير المشروع.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. مشاركة المعلومات</h2>
            <p>لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة.</li>
              <li>عند الحاجة للامتثال للقوانين أو الأوامر القضائية.</li>
              <li>لحماية حقوقنا وسلامة مستخدمينا.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. أمان البيانات</h2>
            <p>نستخدم إجراءات أمنية تقنية وإدارية لحماية بياناتك، بما في ذلك التشفير والمصادقة الآمنة. ومع ذلك، لا يمكن ضمان أمان نقل البيانات عبر الإنترنت بنسبة 100%.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. حقوقك</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الوصول إلى بياناتك الشخصية وتحديثها.</li>
              <li>طلب حذف حسابك وبياناتك.</li>
              <li>إلغاء الاشتراك في الرسائل التسويقية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. التواصل معنا</h2>
            <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، تواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@barqai.site" className="text-primary hover:underline" dir="ltr">support@barqai.site</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026{" "}
          <a href="https://barqai.site" className="text-primary hover:underline">Barq Ai</a>
          {" "}- جميع الحقوق محفوظة ⚡
        </p>
      </footer>
    </div>
  );
}
