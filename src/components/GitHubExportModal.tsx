import { useState, useEffect } from "react";
import { githubExportAction } from "@/lib/barq-api";
import { VFSFile } from "@/hooks/useVFS";
import { toast } from "sonner";
import {
  Github,
  Plus,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileCode,
  FolderTree,
  ArrowLeft,
  RefreshCw,
  Lock,
  Globe,
  X,
  AlertTriangle,
  WifiOff,
  ShieldAlert,
} from "lucide-react";

interface GitHubExportModalProps {
  open: boolean;
  onClose: () => void;
  githubToken: string;
  files: VFSFile[];
  projectTitle: string;
}

interface GitHubRepo {
  full_name: string;
  name: string;
  private: boolean;
}

type ExportStep = "choose" | "new-repo" | "existing-repo" | "exporting" | "done";

/** Map error messages to user-friendly Arabic messages */
function getErrorDetails(error: string): { message: string; icon: React.ReactNode; suggestion: string } {
  if (error.includes("Failed to fetch") || error.includes("فشل الاتصال") || error.includes("NetworkError")) {
    return {
      message: "لا يمكن الاتصال بالخادم",
      icon: <WifiOff className="h-5 w-5" />,
      suggestion: "تحقق من اتصالك بالإنترنت وحاول مرة أخرى",
    };
  }
  if (error.includes("401") || error.includes("Bad credentials") || error.includes("token")) {
    return {
      message: "انتهت صلاحية ربط GitHub",
      icon: <ShieldAlert className="h-5 w-5" />,
      suggestion: "أعد ربط حسابك بـ GitHub وحاول مرة أخرى",
    };
  }
  if (error.includes("422") || error.includes("already exists") || error.includes("name already")) {
    return {
      message: "اسم المستودع موجود بالفعل",
      icon: <AlertTriangle className="h-5 w-5" />,
      suggestion: "اختر اسم مختلف للمستودع أو استخدم مستودع موجود",
    };
  }
  if (error.includes("403") || error.includes("forbidden")) {
    return {
      message: "ليس لديك صلاحية لهذه العملية",
      icon: <ShieldAlert className="h-5 w-5" />,
      suggestion: "تأكد أن حسابك لديه صلاحيات الكتابة على المستودع",
    };
  }
  return {
    message: error || "حدث خطأ غير متوقع",
    icon: <AlertTriangle className="h-5 w-5" />,
    suggestion: "حاول مرة أخرى أو تواصل مع الدعم الفني",
  };
}

export function GitHubExportModal({
  open,
  onClose,
  githubToken,
  files,
  projectTitle,
}: GitHubExportModalProps) {
  const [step, setStep] = useState<ExportStep>("choose");
  const [repoName, setRepoName] = useState(
    projectTitle.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, "").toLowerCase() || "barq-project"
  );
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportedRepo, setExportedRepo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<string>("");

  useEffect(() => {
    if (open) {
      setStep("choose");
      setError(null);
      setExportedRepo(null);
      setExportProgress("");
    }
  }, [open]);

  const loadRepos = async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const { repos: data } = await githubExportAction("list_repos", {}, githubToken);
      setRepos(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل المستودعات");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleExport = async (mode: "new" | "existing") => {
    setStep("exporting");
    setExporting(true);
    setError(null);

    try {
      let repoFullName: string;

      if (mode === "new") {
        setExportProgress("جاري إنشاء المستودع...");
        const { repo } = await githubExportAction("create_repo", { repo_name: repoName }, githubToken);
        repoFullName = repo.full_name;
        setExportProgress("تم إنشاء المستودع، جاري التجهيز...");
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        if (!selectedRepo) throw new Error("اختر مستودع أولاً");
        repoFullName = selectedRepo;
      }

      setExportProgress("جاري رفع الملفات...");
      const vfsFiles = files.map((f) => ({
        path: f.name,
        content: f.content,
        language: f.language,
      }));

      await githubExportAction("push_files", { repo_full_name: repoFullName, files: vfsFiles }, githubToken);
      setExportedRepo(repoFullName);
      setStep("done");
      toast.success("تم تصدير المشروع لـ GitHub بنجاح! ⚡");
    } catch (err: any) {
      setError(err.message || "فشل التصدير");
      setStep("choose");
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };

  if (!open) return null;

  const scaffoldFiles = [
    "package.json", "index.html", "vite.config.ts", "tailwind.config.js",
    "postcss.config.js", "tsconfig.json", "src/main.tsx", "src/index.css",
    ".gitignore", "README.md",
  ];
  const totalFiles = files.length + scaffoldFiles.length;

  const errorDetails = error ? getErrorDetails(error) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => !exporting && onClose()}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            {step !== "choose" && step !== "done" && !exporting && (
              <button onClick={() => setStep("choose")} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Github className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">تصدير لـ GitHub</h3>
              <p className="text-xs text-muted-foreground">
                {step === "choose" && "اختر طريقة التصدير"}
                {step === "new-repo" && "إنشاء مستودع جديد"}
                {step === "existing-repo" && "اختر مستودع موجود"}
                {step === "exporting" && "جاري التصدير..."}
                {step === "done" && "تم التصدير بنجاح!"}
              </p>
            </div>
          </div>
          {!exporting && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Error with details */}
        {errorDetails && (
          <div className="mx-4 sm:mx-6 mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              {errorDetails.icon}
              <span className="text-sm font-bold">{errorDetails.message}</span>
            </div>
            <p className="text-xs text-destructive/80">{errorDetails.suggestion}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-destructive/60 hover:text-destructive underline transition-colors"
            >
              إخفاء
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Step: Choose */}
          {step === "choose" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border mb-4">
                <FolderTree className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">ملفات المشروع</p>
                  <p className="text-xs text-muted-foreground">
                    {files.length} مكوّن + {scaffoldFiles.length} ملف إعداد = {totalFiles} ملف إجمالي
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">{totalFiles}</span>
                </div>
              </div>

              <button
                onClick={() => setStep("new-repo")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary hover:bg-muted hover:border-primary/30 transition-all text-right group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">مستودع جديد</p>
                  <p className="text-xs text-muted-foreground">إنشاء مستودع جديد ورفع جميع الملفات</p>
                </div>
              </button>

              <button
                onClick={() => { setStep("existing-repo"); loadRepos(); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary hover:bg-muted hover:border-accent/30 transition-all text-right group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <ExternalLink className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">مستودع موجود</p>
                  <p className="text-xs text-muted-foreground">رفع الملفات لمستودع موجود</p>
                </div>
              </button>

              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  عرض قائمة الملفات ({totalFiles})
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1 pr-2">
                  {files.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="font-mono truncate" dir="ltr">src/components/{f.name}</span>
                    </div>
                  ))}
                  {scaffoldFiles.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="font-mono truncate" dir="ltr">{f}</span>
                      <span className="text-[10px] text-primary/60">تلقائي</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Step: New Repo */}
          {step === "new-repo" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">اسم المستودع</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 transition-colors"
                  dir="ltr"
                  placeholder="my-website"
                />
                <p className="text-xs text-muted-foreground mt-1.5" dir="ltr">
                  github.com/your-username/{repoName || "..."}
                </p>
              </div>

              <button
                onClick={() => handleExport("new")}
                disabled={!repoName.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Github className="h-4 w-4" />
                إنشاء وتصدير
              </button>
            </div>
          )}

          {/* Step: Existing Repo */}
          {step === "existing-repo" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-foreground">مستودعاتك</p>
                <button onClick={loadRepos} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <RefreshCw className={`h-3 w-3 ${loadingRepos ? "animate-spin" : ""}`} />
                  تحديث
                </button>
              </div>

              {loadingRepos ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">جاري تحميل المستودعات...</p>
                </div>
              ) : repos.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Github className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">لا توجد مستودعات</p>
                  <p className="text-xs text-muted-foreground/60">أنشئ مستودع جديد بدلاً من ذلك</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {repos.map((repo) => (
                    <button
                      key={repo.full_name}
                      onClick={() => setSelectedRepo(repo.full_name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                        selectedRepo === repo.full_name
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:bg-muted"
                      }`}
                    >
                      {repo.private ? (
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate" dir="ltr">{repo.full_name}</p>
                      </div>
                      {selectedRepo === repo.full_name && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedRepo && (
                <button
                  onClick={() => handleExport("existing")}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                >
                  <Github className="h-4 w-4" />
                  تصدير إلى {selectedRepo.split("/")[1]}
                </button>
              )}
            </div>
          )}

          {/* Step: Exporting with progress */}
          {step === "exporting" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Github className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-foreground">جاري تصدير {totalFiles} ملف...</p>
                {exportProgress && (
                  <p className="text-xs text-primary animate-pulse">{exportProgress}</p>
                )}
                <p className="text-xs text-muted-foreground">يرجى عدم إغلاق الصفحة</p>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && exportedRepo && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg mb-1">تم التصدير بنجاح! ⚡</p>
                <p className="text-sm text-muted-foreground">تم رفع {totalFiles} ملف إلى المستودع</p>
              </div>
              <a
                href={`https://github.com/${exportedRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Github className="h-4 w-4" />
                فتح المستودع
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
