import { useState, useCallback, useEffect } from "react";
import { githubExportAction } from "@/lib/barq-api";
import { VFSFile } from "@/hooks/useVFS";
import { toast } from "sonner";

export function useGitHubExport(files: VFSFile[], projectTitle: string) {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [showGithubExport, setShowGithubExport] = useState(false);
  const [githubExporting, setGithubExporting] = useState(false);

  // GitHub OAuth callback handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && !githubToken) {
      githubExportAction("exchange_code", { code }).then((data) => {
        if (data.access_token) {
          setGithubToken(data.access_token);
          setShowGithubExport(true);
          toast.success("تم ربط GitHub بنجاح! ⚡");
          window.history.replaceState({}, "", window.location.pathname);
        }
      }).catch((err) => {
        toast.error("فشل ربط GitHub: " + err.message);
      });
    }
  }, []);

  const handleGithubExport = useCallback(async (mode: "new" | "existing", repoName?: string) => {
    if (!githubToken || files.length === 0) return;
    setGithubExporting(true);

    try {
      let repoFullName: string;

      if (mode === "new") {
        const name = repoName || projectTitle.replace(/\s+/g, "-").toLowerCase();
        const { repo } = await githubExportAction("create_repo", { repo_name: name }, githubToken);
        repoFullName = repo.full_name;
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        repoFullName = repoName!;
      }

      const vfsFiles = files.map((f) => ({
        path: f.name,
        content: f.content,
        language: f.language,
      }));

      await githubExportAction("push_files", { repo_full_name: repoFullName, files: vfsFiles }, githubToken);
      toast.success("تم تصدير المشروع لـ GitHub بنجاح! ⚡");
      window.open(`https://github.com/${repoFullName}`, "_blank");
      setShowGithubExport(false);
    } catch (err: any) {
      toast.error(err.message || "فشل التصدير");
    } finally {
      setGithubExporting(false);
    }
  }, [githubToken, files, projectTitle]);

  const handleConnectGithub = useCallback(async () => {
    try {
      const { url } = await githubExportAction("get_auth_url");
      window.location.href = url;
    } catch (err: any) {
      toast.error("فشل الاتصال بـ GitHub: " + err.message);
    }
  }, []);

  return {
    githubToken,
    showGithubExport,
    setShowGithubExport,
    githubExporting,
    handleGithubExport,
    handleConnectGithub,
  };
}
