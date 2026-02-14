import { VFSFile } from "@/hooks/useVFS";

/**
 * Extracts the JSX body from a React component file.
 * Strips imports, exports, function wrappers, and returns the inner JSX.
 */
function extractJSXBody(content: string): string {
  let jsx = content;

  // Strip import lines
  jsx = jsx.replace(/^import\s+.*$/gm, "");

  // Try to extract the return(...) content
  const returnMatch = jsx.match(/return\s*\(\s*([\s\S]*)\s*\)\s*;?\s*\}?\s*$/);
  if (returnMatch) {
    jsx = returnMatch[1];
  }

  // Strip remaining export lines
  jsx = jsx.replace(/^export\s+.*$/gm, "");

  // Strip function declarations (e.g., "export default function Header() {" or "function Header() {")
  jsx = jsx.replace(/^(export\s+default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/gm, "");

  // Strip const arrow functions (e.g., "const Header = () => {")
  jsx = jsx.replace(/^const\s+\w+\s*=\s*(\([^)]*\)|)\s*=>\s*\{?/gm, "");

  return jsx.trim();
}

/**
 * Gets the component name from a file name.
 * e.g., "Header.tsx" -> "Header", "src/components/Hero.tsx" -> "Hero"
 */
function getComponentName(fileName: string): string {
  const base = fileName.split("/").pop() || fileName;
  return base.replace(/\.(tsx|jsx|ts|js)$/, "");
}

/**
 * Builds a full preview HTML by assembling all VFS files.
 * Replaces component tags like <Header /> with actual component content.
 * Falls back to concatenating all components if no App.tsx skeleton exists.
 */
export function buildPreviewHTML(files: VFSFile[]): string | null {
  if (files.length === 0) return null;

  // Separate CSS and component files
  const cssFiles = files.filter((f) => f.language === "css" || f.name.endsWith(".css"));
  const componentFiles = files.filter((f) => f.language === "tsx" || f.language === "jsx" || f.name.endsWith(".tsx") || f.name.endsWith(".jsx") || f.language === "html");

  if (componentFiles.length === 0) return null;

  const cssContent = cssFiles.map((f) => f.content).join("\n");

  // Find App.tsx (the main skeleton)
  const appFile = componentFiles.find((f) => getComponentName(f.name) === "App");

  let bodyHTML: string;

  if (appFile) {
    // Extract JSX from App.tsx
    bodyHTML = extractJSXBody(appFile.content);

    // Build a map of component name -> extracted JSX
    const componentMap = new Map<string, string>();
    for (const file of componentFiles) {
      const name = getComponentName(file.name);
      if (name === "App") continue;
      componentMap.set(name, extractJSXBody(file.content));
    }

    // Replace self-closing tags like <Header /> or <Header/>
    for (const [name, jsx] of componentMap) {
      const selfClosingRegex = new RegExp(`<${name}\\s*/?>`, "g");
      bodyHTML = bodyHTML.replace(selfClosingRegex, jsx);
    }

    // Replace open/close tags like <Header>...</Header>
    for (const [name, jsx] of componentMap) {
      const blockRegex = new RegExp(`<${name}[^>]*>[\\s\\S]*?</${name}>`, "g");
      bodyHTML = bodyHTML.replace(blockRegex, jsx);
    }
  } else {
    // No App.tsx — concatenate all components in order
    const orderedNames = ["Header", "Navbar", "Nav", "Hero", "Banner"];
    const footerNames = ["Footer", "CTA", "Contact", "ContactForm"];

    const used = new Set<string>();
    const parts: string[] = [];

    // Add header-like components first
    for (const priority of orderedNames) {
      const file = componentFiles.find((f) => getComponentName(f.name).toLowerCase() === priority.toLowerCase());
      if (file) {
        parts.push(extractJSXBody(file.content));
        used.add(file.name);
      }
    }

    // Add remaining (non-footer) components
    for (const file of componentFiles) {
      const name = getComponentName(file.name);
      if (used.has(file.name)) continue;
      if (footerNames.some((fn) => name.toLowerCase() === fn.toLowerCase())) continue;
      parts.push(extractJSXBody(file.content));
      used.add(file.name);
    }

    // Add footer-like components last
    for (const priority of footerNames) {
      const file = componentFiles.find((f) => getComponentName(f.name).toLowerCase() === priority.toLowerCase());
      if (file && !used.has(file.name)) {
        parts.push(extractJSXBody(file.content));
      }
    }

    bodyHTML = parts.join("\n");
  }

  // Clean up any remaining JSX artifacts
  // Remove {` and `} template literal wrappers that might remain
  // Remove className references to JS variables like {styles.xxx}
  bodyHTML = bodyHTML.replace(/\{\/\*[\s\S]*?\*\/\}/g, ""); // Remove JSX comments

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
