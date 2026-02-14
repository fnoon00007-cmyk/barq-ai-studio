import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Wrap raw JSX content into a proper React component */
function wrapAsReactComponent(fileName: string, rawContent: string): string {
  const baseName = fileName.replace(/\.(tsx|jsx|html)$/, "");
  
  // If it already has imports/exports, return as-is
  if (rawContent.includes("import ") && rawContent.includes("export ")) {
    return rawContent;
  }

  // Clean the content but keep JSX intact
  let content = rawContent.trim();
  
  // Remove any stray import/export lines that aren't complete
  content = content
    .replace(/^import\s+.*$/gm, "")
    .replace(/^export\s+(default\s+)?/gm, "")
    .trim();

  return `import React from 'react';

export default function ${baseName}() {
  return (
    ${content}
  );
}`;
}

/** Generate proper App.tsx that imports and renders all components */
function generateAppTsx(componentNames: string[]): string {
  const imports = componentNames
    .filter(n => n !== "App" && n !== "styles")
    .map(n => `import ${n} from './${n}';`)
    .join("\n");

  const components = componentNames
    .filter(n => n !== "App" && n !== "styles")
    .map(n => `      <${n} />`)
    .join("\n");

  return `import React from 'react';
${imports}
import './styles.css';

export default function App() {
  return (
    <div dir="rtl" lang="ar" style={{ fontFamily: "'Cairo', sans-serif" }}>
${components}
    </div>
  );
}`;
}

/** Order components in logical website section order */
function getComponentOrder(name: string): number {
  const orderMap: Record<string, number> = {
    Header: 0, Navbar: 0, Nav: 0,
    Hero: 1, Banner: 1,
    Services: 2, Features: 2,
    About: 3, AboutUs: 3,
    Products: 4, Menu: 4, Portfolio: 4, Gallery: 4,
    Testimonials: 5, Reviews: 5,
    Team: 6, Stats: 6, Pricing: 6,
    Contact: 7, ContactUs: 7, CTA: 7,
    Footer: 8,
  };
  return orderMap[name] ?? 5;
}

/** Generate all scaffold files */
function generateScaffoldFiles(projectName: string) {
  const packageJson = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
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

  const indexHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};`;

  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
    },
    include: ["src"],
  };

  const gitignore = `node_modules
dist
.env
.env.local
*.log
.DS_Store`;

  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}`;

  const readme = `# ${projectName}

> موقع تم إنشاؤه بواسطة [Barq AI](https://barqai.site) ⚡

## التشغيل

\`\`\`bash
npm install
npm run dev
\`\`\`

## البناء

\`\`\`bash
npm run build
\`\`\`

## التقنيات

- React 18
- TypeScript
- Tailwind CSS
- Vite
`;

  return {
    "package.json": JSON.stringify(packageJson, null, 2),
    "index.html": indexHtml,
    "src/main.tsx": mainTsx,
    "vite.config.ts": viteConfig,
    "tailwind.config.js": tailwindConfig,
    "postcss.config.js": postcssConfig,
    "tsconfig.json": JSON.stringify(tsconfig, null, 2),
    ".gitignore": gitignore,
    "src/index.css": indexCss,
    "README.md": readme,
  };
}

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

    // Action: get_auth_url
    if (action === "get_auth_url") {
      const state = crypto.randomUUID();
      const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&state=${state}`;
      return new Response(JSON.stringify({ url, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: exchange_code
    if (action === "exchange_code") {
      if (!code) throw new Error("code is required");
      const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
      });
      const tokenData = await tokenResp.json();
      if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
      return new Response(JSON.stringify({ access_token: tokenData.access_token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: create_repo
    if (action === "create_repo") {
      if (!repo_name) throw new Error("repo_name is required");
      const token = req.headers.get("x-github-token");
      if (!token) throw new Error("GitHub token required");

      const repoResp = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "BarqAI" },
        body: JSON.stringify({ name: repo_name, description: `موقع تم إنشاؤه بواسطة Barq AI ⚡`, private: false, auto_init: true }),
      });
      const repoData = await repoResp.json();
      if (!repoResp.ok) throw new Error(repoData.message || "Failed to create repo");
      return new Response(JSON.stringify({ repo: repoData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: push_files — Full project scaffold + properly wrapped React components
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
      const refResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/ref/heads/main`, { headers: ghHeaders });
      let baseSha: string;
      if (refResp.ok) {
        baseSha = (await refResp.json()).object.sha;
      } else {
        const masterResp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/ref/heads/master`, { headers: ghHeaders });
        if (!masterResp.ok) throw new Error("Could not find default branch");
        baseSha = (await masterResp.json()).object.sha;
      }

      // Get base tree
      const commitData = await (await fetch(`https://api.github.com/repos/${repo_full_name}/git/commits/${baseSha}`, { headers: ghHeaders })).json();
      const baseTreeSha = commitData.tree.sha;

      const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

      async function createBlob(content: string): Promise<string> {
        const resp = await fetch(`https://api.github.com/repos/${repo_full_name}/git/blobs`, {
          method: "POST",
          headers: ghHeaders,
          body: JSON.stringify({ content, encoding: "utf-8" }),
        });
        return (await resp.json()).sha;
      }

      // 1. Process VFS component files — wrap raw JSX as proper React components
      const componentNames: string[] = [];
      const cssFiles: { name: string; content: string }[] = [];

      // Sort files by component order
      const sortedFiles = [...files].sort((a: any, b: any) => {
        const nameA = (a.path || a.name).replace(/\.(tsx|jsx|css|html)$/, "");
        const nameB = (b.path || b.name).replace(/\.(tsx|jsx|css|html)$/, "");
        return getComponentOrder(nameA) - getComponentOrder(nameB);
      });

      for (const file of sortedFiles) {
        const filePath = file.path || file.name;
        const ext = filePath.match(/\.(tsx|jsx|css|html)$/)?.[0] || ".tsx";

        if (ext === ".css") {
          cssFiles.push({ name: filePath, content: file.content });
          const sha = await createBlob(file.content);
          treeItems.push({ path: `src/components/${filePath}`, mode: "100644", type: "blob", sha });
          continue;
        }

        const baseName = filePath.replace(/\.(tsx|jsx|html)$/, "");
        componentNames.push(baseName);

        // Skip App.tsx — we'll generate our own
        if (baseName === "App") continue;

        const wrappedContent = wrapAsReactComponent(filePath, file.content);
        const sha = await createBlob(wrappedContent);
        treeItems.push({ path: `src/components/${baseName}.tsx`, mode: "100644", type: "blob", sha });
      }

      // 2. Generate App.tsx with proper imports
      const appContent = generateAppTsx(componentNames);
      const appSha = await createBlob(appContent);
      treeItems.push({ path: "src/components/App.tsx", mode: "100644", type: "blob", sha: appSha });

      // 3. Generate all scaffold files
      const projectName = repo_full_name.split("/")[1] || "barq-project";
      const scaffoldFiles = generateScaffoldFiles(projectName);

      // Update main.tsx to also import index.css
      scaffoldFiles["src/main.tsx"] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';
${cssFiles.length > 0 ? cssFiles.map(f => `import './components/${f.name}';`).join("\n") : ""}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

      for (const [path, content] of Object.entries(scaffoldFiles)) {
        const sha = await createBlob(content);
        treeItems.push({ path, mode: "100644", type: "blob", sha });
      }

      // 4. Create tree, commit, and push
      const treeData = await (await fetch(`https://api.github.com/repos/${repo_full_name}/git/trees`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
      })).json();

      const newCommitData = await (await fetch(`https://api.github.com/repos/${repo_full_name}/git/commits`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify({ message: "⚡ Initial commit from Barq AI", tree: treeData.sha, parents: [baseSha] }),
      })).json();

      await fetch(`https://api.github.com/repos/${repo_full_name}/git/refs/heads/main`, {
        method: "PATCH",
        headers: ghHeaders,
        body: JSON.stringify({ sha: newCommitData.sha }),
      });

      return new Response(
        JSON.stringify({
          success: true,
          commit_sha: newCommitData.sha,
          files_count: treeItems.length,
          scaffold_files: Object.keys(scaffoldFiles),
          component_files: componentNames,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: list_repos
    if (action === "list_repos") {
      const token = req.headers.get("x-github-token");
      if (!token) throw new Error("GitHub token required");
      const reposResp = await fetch("https://api.github.com/user/repos?sort=updated&per_page=20", {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "BarqAI" },
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
