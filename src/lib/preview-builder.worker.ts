// preview-builder.worker.ts
// Web Worker for offloading preview HTML generation from the main thread.

import type { VFSFile } from "@/hooks/useVFS";

/**
 * Converts JSX content to valid HTML.
 */
function jsxToHTML(content: string): string {
  let html = content;

  html = html.replace(/^import\s+.*$/gm, "");
  html = html.replace(/^export\s+(default\s+)?/gm, "");

  const returnMatch = html.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) {
    html = returnMatch[1];
  } else {
    html = html.replace(/^(export\s+default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/gm, "");
    html = html.replace(/^const\s+\w+\s*=\s*(\([^)]*\)|)\s*=>\s*\{?/gm, "");
  }

  html = html.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  html = html.replace(/className=/g, "class=");

  html = html.replace(/style=\{\{([^}]*)\}\}/g, (_match, styleContent: string) => {
    const cssString = styleContent
      .split(",")
      .map((pair: string) => {
        const [key, ...valueParts] = pair.split(":");
        if (!key || valueParts.length === 0) return "";
        const cssProp = key.trim().replace(/['"]/g, "").replace(/([A-Z])/g, "-$1").toLowerCase();
        const cssVal = valueParts.join(":").trim().replace(/['"]/g, "");
        return `${cssProp}: ${cssVal}`;
      })
      .filter(Boolean)
      .join("; ");
    return `style="${cssString}"`;
  });

  html = html.replace(/\s+on[A-Z]\w*=\{[^}]*\}/g, "");
  html = html.replace(/\s+on[A-Z]\w*=\{[^}]*\{[^}]*\}[^}]*\}/g, "");
  html = html.replace(/\s+ref=\{[^}]*\}/g, "");
  html = html.replace(/\s+key=\{[^}]*\}/g, "");
  html = html.replace(/\{`([^`]*)`\}/g, "$1");
  html = html.replace(/\{"([^"]*)"\}/g, "$1");
  html = html.replace(/\{'([^']*)'\}/g, "$1");
  html = html.replace(/\{[a-zA-Z_$][\w$.]*(?:\?\.[\w$]+)*\}/g, "");
  html = html.replace(/\{[^{}]*\?[^{}]*:[^{}]*\}/g, "");
  html = html.replace(/\{[\w.]+\.map\([^)]*\)\s*=>\s*\([\s\S]*?\)\s*\)\}/g, "");
  html = html.replace(/\{[\w.]+\.map\([\s\S]*?\)\}/g, "");
  html = html.replace(/\{[\w.!]+\s*&&\s*/g, "");
  html = html.replace(/(?<!=["'])\{(?![\s\S]*?:[\s\S]*?\})/g, "");
  html = html.replace(/^\s*\}\s*$/gm, "");
  html = html.replace(/<[A-Z]\w+\s*\/>/g, "");
  html = html.replace(/<>/g, "");
  html = html.replace(/<\/>/g, "");
  html = html.replace(/\n{3,}/g, "\n\n");

  return html.trim();
}

function getComponentName(fileName: string): string {
  const base = fileName.split("/").pop() || fileName;
  return base.replace(/\.(tsx|jsx|ts|js)$/, "");
}

function buildPreviewHTML(files: VFSFile[]): string | null {
  if (files.length === 0) return null;

  const cssFiles = files.filter((f) => f.language === "css" || f.name.endsWith(".css"));
  const componentFiles = files.filter(
    (f) =>
      f.language === "tsx" ||
      f.language === "jsx" ||
      f.name.endsWith(".tsx") ||
      f.name.endsWith(".jsx") ||
      f.language === "html"
  );

  if (componentFiles.length === 0) return null;

  const cssContent = cssFiles.map((f) => f.content).join("\n");
  const appFile = componentFiles.find((f) => getComponentName(f.name) === "App");

  let bodyHTML: string;

  if (appFile) {
    bodyHTML = jsxToHTML(appFile.content);
    const componentMap = new Map<string, string>();
    for (const file of componentFiles) {
      const name = getComponentName(file.name);
      if (name === "App") continue;
      componentMap.set(name, jsxToHTML(file.content));
    }

    for (const [name, html] of componentMap) {
      const selfClosingRegex = new RegExp(`<${name}\\s*/?>`, "g");
      bodyHTML = bodyHTML.replace(selfClosingRegex, html);
    }

    for (const [name, html] of componentMap) {
      const blockRegex = new RegExp(`<${name}[^>]*>[\\s\\S]*?</${name}>`, "g");
      bodyHTML = bodyHTML.replace(blockRegex, html);
    }
  } else {
    const orderedNames = ["Header", "Navbar", "Nav", "Hero", "Banner"];
    const footerNames = ["Footer", "CTA", "Contact", "ContactForm"];

    const used = new Set<string>();
    const parts: string[] = [];

    for (const priority of orderedNames) {
      const file = componentFiles.find(
        (f) => getComponentName(f.name).toLowerCase() === priority.toLowerCase()
      );
      if (file) {
        parts.push(jsxToHTML(file.content));
        used.add(file.name);
      }
    }

    for (const file of componentFiles) {
      const name = getComponentName(file.name);
      if (used.has(file.name)) continue;
      if (footerNames.some((fn) => name.toLowerCase() === fn.toLowerCase())) continue;
      parts.push(jsxToHTML(file.content));
      used.add(file.name);
    }

    for (const priority of footerNames) {
      const file = componentFiles.find(
        (f) => getComponentName(f.name).toLowerCase() === priority.toLowerCase()
      );
      if (file && !used.has(file.name)) {
        parts.push(jsxToHTML(file.content));
      }
    }

    bodyHTML = parts.join("\n");
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwindcss.config = {
      theme: { extend: { fontFamily: { cairo: ['Cairo', 'sans-serif'] } } }
    }
  <\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; direction: rtl; overflow-x: hidden; }
    ${cssContent}
  </style>
</head>
<body>
  ${bodyHTML}
</body>
</html>`;
}

// Worker message handler
self.onmessage = (e: MessageEvent) => {
  const { id, files } = e.data;
  try {
    const html = buildPreviewHTML(files);
    self.postMessage({ id, html, error: null });
  } catch (err: any) {
    self.postMessage({ id, html: null, error: err.message });
  }
};
