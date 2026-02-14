import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">شروط الاستخدام</h1>
        <p className="text-sm text-muted-foreground mb-10">آخر تحديث: 14 فبراير 2026</p>

        <div className="space-y-8 text-secondary-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. قبول الشروط</h2>
            <p>باستخدامك لمنصة برق Ai (barqai.site)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. وصف الخدمة</h2>
            <p>برق Ai هو منشئ مواقع ويب يعمل بالذكاء الاصطناعي، يتيح للمستخدمين إنشاء مواقع ويب احترافية من خلال المحادثة باللغة العربية. تشمل الخدمة:</p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>إنشاء مواقع ويب كاملة (Frontend و Backend).</li>
              <li>تصدير المشاريع وربطها مع GitHub.</li>
              <li>تخزين وإدارة المشاريع.</li>
              <li>تخصيص الهوية التجارية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. حسابات المستخدمين</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>يجب أن تكون بياناتك دقيقة وحديثة.</li>
              <li>أنت مسؤول عن الحفاظ على أمان حسابك وكلمة مرورك.</li>
              <li>يجب ألا يقل عمرك عن 13 سنة لاستخدام المنصة.</li>
              <li>يحق لنا تعليق أو إلغاء حسابك عند مخالفة الشروط.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. الملكية الفكرية</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong className="text-foreground">محتواك:</strong> تحتفظ بملكية جميع المواقع والمحتوى الذي تنشئه عبر المنصة.</li>
              <li><strong className="text-foreground">منصتنا:</strong> جميع حقوق الملكية الفكرية لمنصة برق Ai محفوظة لنا.</li>
              <li>يُمنح لك ترخيص غير حصري لاستخدام الأكواد المُولّدة في مشاريعك الخاصة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. الاستخدام المقبول</h2>
            <p>يُحظر استخدام المنصة في:</p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>إنشاء محتوى غير قانوني أو ضار أو مسيء.</li>
              <li>انتهاك حقوق الملكية الفكرية للآخرين.</li>
              <li>محاولة اختراق أو تعطيل المنصة.</li>
              <li>استخدام المنصة لأغراض احتيالية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. الباقات والدفع</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الباقة المجانية متاحة مع قيود محددة.</li>
              <li>الاشتراكات المدفوعة تُجدد تلقائياً ما لم يتم إلغاؤها.</li>
              <li>نحتفظ بحق تعديل الأسعار مع إشعار مسبق.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. إخلاء المسؤولية</h2>
            <p>تُقدم المنصة "كما هي" دون ضمانات صريحة أو ضمنية. لا نضمن أن الخدمة ستكون متاحة بشكل متواصل أو خالية من الأخطاء. لن نكون مسؤولين عن أي أضرار ناتجة عن استخدام المنصة.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. التعديلات</h2>
            <p>نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعارك بالتغييرات الجوهرية. استمرارك في استخدام المنصة بعد التعديل يُعتبر قبولاً للشروط الجديدة.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. القانون المعمول به</h2>
            <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتكون المحاكم السعودية المختصة هي المرجع لحل أي نزاعات.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. التواصل</h2>
            <p>لأي استفسارات حول شروط الاستخدام، تواصل معنا عبر: <a href="mailto:support@barqai.site" className="text-primary hover:underline" dir="ltr">support@barqai.site</a></p>
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
