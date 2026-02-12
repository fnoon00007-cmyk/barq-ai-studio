import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Upload, Save, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function BrandSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1E90FF");
  const [secondaryColor, setSecondaryColor] = useState("#FFD700");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [brandRes, profileRes] = await Promise.all([
      supabase.from("brand_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    if (brandRes.data) {
      setBrandName(brandRes.data.brand_name || "");
      setPrimaryColor(brandRes.data.primary_color || "#1E90FF");
      setSecondaryColor(brandRes.data.secondary_color || "#FFD700");
      setLogoUrl(brandRes.data.logo_url);
    }
    if (profileRes.data) {
      setDisplayName(profileRes.data.display_name || "");
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("خطأ في رفع الشعار");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("brand-assets")
      .getPublicUrl(path);

    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("تم رفع الشعار بنجاح ⚡");
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [brandRes, profileRes] = await Promise.all([
      supabase.from("brand_profiles").update({
        brand_name: brandName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
      }).eq("user_id", user.id),
      supabase.from("profiles").update({
        display_name: displayName,
      }).eq("user_id", user.id),
    ]);

    if (brandRes.error || profileRes.error) {
      toast.error("خطأ في حفظ الإعدادات");
    } else {
      toast.success("تم حفظ الإعدادات بنجاح ⚡");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">إعدادات الحساب</h1>
      <p className="text-sm text-muted-foreground mb-8">
        عدّل معلوماتك الشخصية وهوية علامتك التجارية
      </p>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">الملف الشخصي</h2>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">الاسم</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Brand Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-accent" />
          <h2 className="font-bold text-foreground">هوية العلامة التجارية</h2>
        </div>

        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">الشعار</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <span className="text-sm px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-muted transition-colors inline-flex items-center gap-2">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {uploading ? "جاري الرفع..." : "رفع شعار"}
                </span>
              </label>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">اسم العلامة التجارية</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: شركة برق"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">اللون الأساسي</label>
              <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground font-mono" dir="ltr">{primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">اللون الثانوي</label>
              <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground font-mono" dir="ltr">{secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </div>
  );
}
