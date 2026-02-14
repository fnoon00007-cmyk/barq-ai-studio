import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type View = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in (handles OAuth callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/builder", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني ✉️");
        setView("login");
      } else if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح ⚡");
        navigate("/builder");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد ⚡");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://barqai.site/auth",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تسجيل الدخول بحساب Google");
      setLoading(false);
    }
  };

  const title = view === "login" ? "تسجيل الدخول" : view === "signup" ? "إنشاء حساب جديد" : "استعادة كلمة المرور";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Zap className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">برق Ai</h1>
          <p className="text-sm text-muted-foreground mt-1">منشئ المواقع الذكي ⚡</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 text-center">{title}</h2>

          {/* Google Sign In */}
          {view !== "forgot" && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-secondary border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-4"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                الدخول بحساب Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">أو</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "signup" && (
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="الاسم"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                dir="ltr"
                required
              />
            </div>

            {view !== "forgot" && (
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {view === "login" ? "دخول" : view === "signup" ? "إنشاء حساب" : "إرسال رابط الاستعادة"}
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center">
            {view === "login" && (
              <>
                <button
                  onClick={() => setView("forgot")}
                  className="text-xs text-primary hover:underline transition-colors block w-full"
                >
                  نسيت كلمة المرور؟
                </button>
                <button
                  onClick={() => setView("signup")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ما عندك حساب؟ سجّل الآن
                </button>
              </>
            )}
            {view === "signup" && (
              <button
                onClick={() => setView("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                عندك حساب؟ سجّل دخول
              </button>
            )}
            {view === "forgot" && (
              <button
                onClick={() => setView("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                الرجوع لتسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
