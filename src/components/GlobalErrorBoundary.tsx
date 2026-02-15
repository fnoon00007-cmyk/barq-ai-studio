import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[GlobalErrorBoundary]", error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || "" });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{
            background: "hsl(0 0% 2%)",
            color: "hsl(0 0% 95%)",
            fontFamily: "'Cairo', sans-serif",
            direction: "rtl",
          }}
        >
          <div className="max-w-md w-full text-center space-y-6">
            <div
              className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(0 84% 60% / 0.15)", border: "1px solid hsl(0 84% 60% / 0.3)" }}
            >
              <AlertTriangle style={{ width: 40, height: 40, color: "hsl(0 84% 60%)" }} />
            </div>

            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                حدث خطأ غير متوقع 😔
              </h1>
              <p style={{ fontSize: "0.875rem", color: "hsl(0 0% 55%)", lineHeight: 1.7 }}>
                نعتذر عن هذا الخلل. فريقنا يعمل على تحسين الاستقرار باستمرار.
                يمكنك إعادة تحميل الصفحة أو العودة للرئيسية.
              </p>
            </div>

            {this.state.error && (
              <div
                style={{
                  background: "hsl(0 84% 60% / 0.08)",
                  border: "1px solid hsl(0 84% 60% / 0.2)",
                  borderRadius: 12,
                  padding: 12,
                  direction: "ltr",
                  textAlign: "left",
                }}
              >
                <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "hsl(0 84% 70%)", wordBreak: "break-all" }}>
                  {this.state.error.message.slice(0, 300)}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: "hsl(205 100% 55%)",
                  color: "hsl(0 0% 0%)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <RefreshCw style={{ width: 16, height: 16 }} />
                إعادة تحميل
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: "hsl(0 0% 10%)",
                  color: "hsl(0 0% 90%)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "1px solid hsl(0 0% 15%)",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <Home style={{ width: 16, height: 16 }} />
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
