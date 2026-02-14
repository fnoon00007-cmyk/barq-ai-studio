import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, repo_name, files, repo_full_name } = await req.json();
    const GITHUB_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
    const GITHUB_CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      throw new Error("GitHub OAuth credentials not configured");
    }

    // Action: get_auth_url - Return GitHub OAuth URL
    if (action === "get_auth_url") {
      const state = crypto.randomUUID();
      const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&state=${state}`;
      return new Response(JSON.stringify({ url, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: exchange_code - Exchange auth code for access token
    if (action === "exchange_code") {
      if (!code) throw new Error("code is required");

      const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResp.json();
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      return new Response(JSON.stringify({ access_token: tokenData.access_token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: create_repo - Create a new GitHub repo
    if (action === "create_repo") {
      if (!repo_name) throw new Error("repo_name is required");
      const token = req.headers.get("x-github-token");
      if (!token) throw new Error("GitHub token required");

      const repoResp = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "BarqAI",
        },
        body: JSON.stringify({
          name: repo_name,
          description: `موقع تم إنشاؤه بواسطة Barq AI ⚡`,
          private: false,
          auto_init: true,
        }),
      });

      const repoData = await repoResp.json();
      if (!repoResp.ok) {
        throw new Error(repoData.message || "Failed to create repo");
      }

      return new Response(JSON.stringify({ repo: repoData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: push_files - Push VFS files to a GitHub repo
    if (action === "push_files") {
      if (!repo_full_name || !files) throw new Error("repo_full_name and files are required");
      const token = req.headers.get("x-github-token");
      if (!token) throw new Error("GitHub token required");

      const ghHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "BarqAI",
      };

      // Get default branch ref
      const refResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/ref/heads/main`, {
        headers: ghHeaders,
      });
      
      let baseSha: string;
      if (refResp.ok) {
        const refData = await refResp.json();
        baseSha = refData.object.sha;
      } else {
        // Try master branch
        const masterResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/ref/heads/master`, {
          headers: ghHeaders,
        });
        if (!masterResp.ok) throw new Error("Could not find default branch");
        const masterData = await masterResp.json();
        baseSha = masterData.object.sha;
      }

      // Get base tree
      const commitResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/commits/${baseSha}`, {
        headers: ghHeaders,
      });
      const commitData = await commitResp.json();
      const baseTreeSha = commitData.tree.sha;

      // Create blobs for each file
      const treeItems = [];
      for (const file of files) {
        const blobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
          method: "POST",
          headers: ghHeaders,
          body: JSON.stringify({
            content: file.content,
            encoding: "utf-8",
          }),
        });
        const blobData = await blobResp.json();
        
        // Map VFS paths to project structure
        const filePath = file.path || file.name;
        const ext = filePath.endsWith(".css") ? "css" : "tsx";
        const srcPath = filePath.startsWith("src/") ? filePath : `src/components/${filePath}`;
        
        treeItems.push({
          path: srcPath,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        });
      }

      // Add package.json
      const packageJson = {
        name: repo_full_name.split("/")[1],
        private: true,
        version: "0.0.1",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          "@types/react": "^18.3.0",
          "@types/react-dom": "^18.3.0",
          "@vitejs/plugin-react": "^4.3.0",
          autoprefixer: "^10.4.19",
          postcss: "^8.4.38",
          tailwindcss: "^3.4.0",
          typescript: "^5.5.0",
          vite: "^5.4.0",
        },
      };

      const pkgBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: JSON.stringify(packageJson, null, 2), encoding: "utf-8" }),
      });
      const pkgBlobData = await pkgBlobResp.json();
      treeItems.push({ path: "package.json", mode: "100644", type: "blob", sha: pkgBlobData.sha });

      // Add index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${repo_full_name.split("/")[1]}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

      const htmlBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: indexHtml, encoding: "utf-8" }),
      });
      const htmlBlobData = await htmlBlobResp.json();
      treeItems.push({ path: "index.html", mode: "100644", type: "blob", sha: htmlBlobData.sha });

      // Add main.tsx
      const mainTsx = `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './components/App';\nimport './components/styles.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`;
      const mainBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: mainTsx, encoding: "utf-8" }),
      });
      const mainBlobData = await mainBlobResp.json();
      treeItems.push({ path: "src/main.tsx", mode: "100644", type: "blob", sha: mainBlobData.sha });

      // Add vite.config.ts
      const viteConfig = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`;
      const viteBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: viteConfig, encoding: "utf-8" }),
      });
      const viteBlobData = await viteBlobResp.json();
      treeItems.push({ path: "vite.config.ts", mode: "100644", type: "blob", sha: viteBlobData.sha });

      // Add tailwind.config.js
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: { extend: {} },\n  plugins: [],\n};`;
      const twBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: tailwindConfig, encoding: "utf-8" }),
      });
      const twBlobData = await twBlobResp.json();
      treeItems.push({ path: "tailwind.config.js", mode: "100644", type: "blob", sha: twBlobData.sha });

      // Add postcss.config.js
      const postcssConfig = `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};`;
      const pcBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: postcssConfig, encoding: "utf-8" }),
      });
      const pcBlobData = await pcBlobResp.json();
      treeItems.push({ path: "postcss.config.js", mode: "100644", type: "blob", sha: pcBlobData.sha });

      // Add tsconfig.json
      const tsconfig = `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "lib": ["ES2020", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "skipLibCheck": true,\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "jsx": "react-jsx",\n    "strict": true\n  },\n  "include": ["src"]\n}`;
      const tsBlobResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ content: tsconfig, encoding: "utf-8" }),
      });
      const tsBlobData = await tsBlobResp.json();
      treeItems.push({ path: "tsconfig.json", mode: "100644", type: "blob", sha: tsBlobData.sha });

      // Create tree
      const treeResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/trees`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
      });
      const treeData = await treeResp.json();

      // Create commit
      const newCommitResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/commits`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({
          message: "⚡ Initial commit from Barq AI",
          tree: treeData.sha,
          parents: [baseSha],
        }),
      });
      const newCommitData = await newCommitResp.json();

      // Update ref
      await fetch(`https://api.github.com/repos/${repo_full_name}/git/refs/heads/main`, {
        method: "PATCH",
        headers: ghHeaders,
        body: JSON.stringify({ sha: newCommitData.sha }),
      });

      return new Response(
        JSON.stringify({ success: true, commit_sha: newCommitData.sha }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: list_repos - List user's repos
    if (action === "list_repos") {
      const token = req.headers.get("x-github-token");
      if (!token) throw new Error("GitHub token required");

      const reposResp = await fetch("https://api.github.com/user/repos?sort=updated&per_page=20", {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "BarqAI",
        },
      });
      const repos = await reposResp.json();

      return new Response(
        JSON.stringify({ repos: repos.map((r: any) => ({ full_name: r.full_name, name: r.name, private: r.private })) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("github-export error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
