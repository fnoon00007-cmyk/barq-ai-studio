import { VFSFile } from "@/hooks/v2/useVFS";
import { Globe, AlertTriangle } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";

interface PreviewPanelProps {
  files: VFSFile[];
  device: "desktop" | "tablet" | "mobile";
}

// Basic Error Boundary component for the iframe
const ErrorBoundaryCode = `
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo: errorInfo });
    window.parent.postMessage({ type: "PREVIEW_ERROR", error: error.message, componentStack: errorInfo.componentStack }, "*");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "20px", backgroundColor: "#ffe0e0", border: "1px solid #ffb3b3", borderRadius: "8px",
          color: "#cc0000", fontFamily: "sans-serif", textAlign: "center", margin: "20px"
        }}>
          <h2>⚠️ خطأ في معاينة React</h2>
          <p>حدث خطأ أثناء عرض المكونات. يرجى مراجعة الكود.</p>
          {/* <details style={{ whiteSpace: "pre-wrap", textAlign: "left", marginTop: "10px" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details> */}
        </div>
      );
    }
    return this.props.children;
  }
}
`;

// Function to generate the full HTML for the iframe
function generateIframeHTML(files: VFSFile[]): string {
  const cssFile = files.find((f) => f.language === "css" || f.name.endsWith(".css"));
  const cssContent = cssFile?.content || "";

  // Filter out non-React files for direct execution
  const reactFiles = files.filter(f => f.language === "tsx" || f.name.endsWith(".tsx"));

  // Combine all React component code into a single string
  // This is a simplified approach. A real bundler would be more robust.
  const reactCode = reactFiles.map(file => {
    // Basic attempt to make component code runnable
    let content = file.content;
    // Remove imports/exports for direct eval in iframe context
    content = content.replace(/^(import|export)\s+.*$/gm, "");
    // If it's a default export function, make it a global variable
    const defaultExportMatch = content.match(/export\s+default\s+(function|const)\s+(\w+)/);
    if (defaultExportMatch) {
      content = content.replace(defaultExportMatch[0], `window.${defaultExportMatch[2]} = ${defaultExportMatch[1]} ${defaultExportMatch[2]}`);
    } else {
      // Try to find a named export and make it global
      const namedExportMatch = content.match(/export\s+(function|const)\s+(\w+)/);
      if (namedExportMatch) {
        content = content.replace(namedExportMatch[0], `window.${namedExportMatch[2]} = ${namedExportMatch[1]} ${namedExportMatch[2]}`);
      }
    }
    return content;
  }).join("\n\n");

  // Find the main App component or assume the first one is the main one
  const appComponent = reactFiles.find(f => f.name.includes("App.tsx")) || reactFiles[0];
  const appComponentName = appComponent ? appComponent.name.replace(/\.(tsx|jsx)$/, "") : "";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; direction: rtl; overflow-x: hidden; }
    img { max-width: 100%; height: auto; }
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${ErrorBoundaryCode}

    // Make React and ReactDOM globally available within the Babel scope
    const React = window.React;
    const ReactDOM = window.ReactDOM;

    // Dynamically created components from VFS
    ${reactCode}

    // Main application component to render
    function AppWrapper() {
      // Attempt to render the main component, or a placeholder
      const MainComponent = window.${appComponentName} || (() => <div>لا يوجد مكون رئيسي للعرض.</div>);
      return (
        <ErrorBoundary>
          <MainComponent />
        </ErrorBoundary>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<AppWrapper />);
  </script>
</body>
</html>`;
}

export function PreviewPanel({ files, device }: PreviewPanelProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [componentStack, setComponentStack] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === "PREVIEW_ERROR") {
      setHasError(true);
      setErrorMessage(event.data.error);
      setComponentStack(event.data.componentStack);
      // TODO: Send error to AI for suggested fix
      console.error("Preview Error Caught:", event.data.error, event.data.componentStack);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, [handleIframeMessage]);

  const previewHTML = useMemo(() => {
    setHasError(false);
    setErrorMessage(null);
    setComponentStack(null);
    if (files.length === 0) return null;
    try {
      return generateIframeHTML(files);
    } catch (err: any) {
      setHasError(true);
      setErrorMessage(err.message || "خطأ غير متوقع أثناء توليد HTML المعاينة.");
      return null;
    }
  }, [files]);

  const deviceWidth = useMemo(() => {
    switch (device) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      case "desktop": return "100%";
      default: return "100%";
    }
  }, [device]);

  const deviceHeight = useMemo(() => {
    switch (device) {
      case "mobile": return "667px";
      case "tablet": return "1024px";
      case "desktop": return "100%";
      default: return "100%";
    }
  }, [device]);

  if (!previewHTML && !hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Globe className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">معاينة الموقع</h2>
        <p className="text-base text-muted-foreground max-w-sm">
          ابدأ محادثة مع برق وسيظهر الموقع هنا مباشرة ⚡
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-100">
      {hasError ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive/50" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">خطأ في المعاينة</h2>
          <p className="text-base text-muted-foreground max-w-sm">
            {errorMessage || "تعذّر بناء المعاينة. حاول تعديل الملفات أو إعادة البناء."}
          </p>
          {componentStack && (
            <details className="mt-4 text-xs text-left text-muted-foreground max-w-md overflow-auto bg-gray-50 p-3 rounded-md">
              <summary>تفاصيل الخطأ</summary>
              <pre className="whitespace-pre-wrap break-all"><code>{componentStack}</code></pre>
            </details>
          )}
          {/* TODO: Add AI fix suggestion button here */}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          srcDoc={previewHTML!}
          className="border-0 shadow-lg rounded-lg bg-white transition-all duration-300 ease-in-out"
          style={{ width: deviceWidth, height: deviceHeight }}
          sandbox="allow-scripts allow-same-origin"
          title="معاينة الموقع"
        />
      )}
    </div>
  );
}
