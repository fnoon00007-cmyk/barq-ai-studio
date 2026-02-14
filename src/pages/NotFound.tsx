import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-3 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">الصفحة غير موجودة</p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          الرجوع للرئيسية ⚡
        </button>
      </div>
    </div>
  );
};

export default NotFound;
