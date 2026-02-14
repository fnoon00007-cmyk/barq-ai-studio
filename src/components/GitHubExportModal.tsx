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

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("choose");
      setError(null);
      setExportedRepo(null);
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
        const { repo } = await githubExportAction("create_repo", { repo_name: repoName }, githubToken);
        repoFullName = repo.full_name;
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        if (!selectedRepo) throw new Error("اختر مستودع أولاً");
        repoFullName = selectedRepo;
      }

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
    }
  };

  if (!open) return null;

  const scaffoldFiles = [
    "package.json", "index.html", "vite.config.ts", "tailwind.config.js",
    "postcss.config.js", "tsconfig.json", "src/main.tsx", "src/index.css",
    ".gitignore", "README.md",
  ];
  const totalFiles = files.length + scaffoldFiles.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !exporting && onClose()}>
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step !== "choose" && step !== "done" && (
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

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step: Choose */}
          {step === "choose" && (
            <div className="space-y-3">
              {/* File summary */}
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

              {/* Files list expandable */}
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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : repos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا توجد مستودعات</p>
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

          {/* Step: Exporting */}
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
              <div className="text-center">
                <p className="font-bold text-foreground mb-1">جاري تصدير {totalFiles} ملف...</p>
                <p className="text-xs text-muted-foreground">يتم إنشاء الملفات ورفعها لـ GitHub</p>
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
