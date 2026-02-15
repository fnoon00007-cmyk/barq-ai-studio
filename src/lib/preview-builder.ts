import { VFSFile } from "@/hooks/useVFS";

/**
 * Converts JSX content to valid HTML by:
 * 1. Stripping imports/exports/function wrappers
 * 2. Converting className → class
 * 3. Removing event handlers (onClick, onChange, etc.)
 * 4. Cleaning JSX expressions
 * 5. Converting style={{...}} to inline style strings
 */
function jsxToHTML(content: string): string {
  let html = content;

  // Strip import lines
  html = html.replace(/^import\s+.*$/gm, "");

  // Strip export lines
  html = html.replace(/^export\s+(default\s+)?/gm, "");

  // Try to extract the return(...) content
  const returnMatch = html.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) {
    html = returnMatch[1];
  } else {
    // Strip function declarations
    html = html.replace(/^(export\s+default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/gm, "");
    // Strip const arrow functions
    html = html.replace(/^const\s+\w+\s*=\s*(\([^)]*\)|)\s*=>\s*\{?/gm, "");
  }

  // Remove JSX comments {/* ... */}
  html = html.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // Convert className="..." to class="..."
  html = html.replace(/className=/g, "class=");

  // Convert style={{ key: value }} to style="key: value"
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

  // Remove event handlers: onClick={...}, onChange={...}, onSubmit={...}, etc.
  html = html.replace(/\s+on[A-Z]\w*=\{[^}]*\}/g, "");
  // Handle multi-line event handlers
  html = html.replace(/\s+on[A-Z]\w*=\{[^}]*\{[^}]*\}[^}]*\}/g, "");

  // Remove ref={...}
  html = html.replace(/\s+ref=\{[^}]*\}/g, "");

  // Remove key={...}
  html = html.replace(/\s+key=\{[^}]*\}/g, "");

  // Convert {`template literals`} to plain text
  html = html.replace(/\{`([^`]*)`\}/g, "$1");

  // Convert {"string"} to string
  html = html.replace(/\{"([^"]*)"\}/g, "$1");
  html = html.replace(/\{'([^']*)'\}/g, "$1");

  // Remove remaining JSX expressions like {variable} or {fn()} but keep content inside template literals
  // Be careful not to remove too much — only remove simple {expressions}
  html = html.replace(/\{[a-zA-Z_$][\w$.]*(?:\?\.[\w$]+)*\}/g, "");

  // Remove ternary/conditional expressions {condition ? a : b}
  html = html.replace(/\{[^{}]*\?[^{}]*:[^{}]*\}/g, "");

  // Remove .map() blocks {items.map(...)}
  html = html.replace(/\{[\w.]+\.map\([^)]*\)\s*=>\s*\([\s\S]*?\)\s*\)\}/g, "");
  html = html.replace(/\{[\w.]+\.map\([\s\S]*?\)\}/g, "");

  // Remove && conditional renders {condition && <div>...</div>}
  html = html.replace(/\{[\w.!]+\s*&&\s*/g, "");

  // Clean up remaining curly braces that are JSX artifacts (not CSS)
  // Only remove { and } that appear to be JSX wrappers, not inside style/class attributes
  html = html.replace(/(?<!=["'])\{(?![\s\S]*?:[\s\S]*?\})/g, "");

  // Remove dangling closing braces from stripped expressions
  html = html.replace(/^\s*\}\s*$/gm, "");

  // Convert JSX self-closing components to empty strings (unknown components)
  html = html.replace(/<[A-Z]\w+\s*\/>/g, "");

  // Remove React fragments
  html = html.replace(/<>/g, "");
  html = html.replace(/<\/>/g, "");

  // Clean up excessive whitespace
  html = html.replace(/\n{3,}/g, "\n\n");

  return html.trim();
}

/**
 * Gets the component name from a file name.
 */
function getComponentName(fileName: string): string {
  const base = fileName.split("/").pop() || fileName;
  return base.replace(/\.(tsx|jsx|ts|js)$/, "");
}

/**
 * Builds a full preview HTML by assembling all VFS files.
 */
export function buildPreviewHTML(files: VFSFile[]): string | null {
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

  // Find App.tsx (the main skeleton)
  const appFile = componentFiles.find((f) => getComponentName(f.name) === "App");

  let bodyHTML: string;

  if (appFile) {
    bodyHTML = jsxToHTML(appFile.content);

    // Build a map of component name -> converted HTML
    const componentMap = new Map<string, string>();
    for (const file of componentFiles) {
      const name = getComponentName(file.name);
      if (name === "App") continue;
      componentMap.set(name, jsxToHTML(file.content));
    }

    // Replace self-closing tags like <Header /> or <Header/>
    for (const [name, html] of componentMap) {
      const selfClosingRegex = new RegExp(`<${name}\\s*/?>`, "g");
      bodyHTML = bodyHTML.replace(selfClosingRegex, html);
    }

    // Replace open/close tags like <Header>...</Header>
    for (const [name, html] of componentMap) {
      const blockRegex = new RegExp(`<${name}[^>]*>[\\s\\S]*?</${name}>`, "g");
      bodyHTML = bodyHTML.replace(blockRegex, html);
    }
  } else {
    // No App.tsx — concatenate all components in order
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
