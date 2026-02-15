import React from "react";
import { AlertCircle, RefreshCw, Wrench, Loader2 } from "lucide-react";

interface PreviewErrorBoundaryProps {
  children: React.ReactNode;
  onFixError?: (errorMessage: string, componentStack: string) => void;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
  isFixing: boolean;
}

export class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      componentStack: "",
      isFixing: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PreviewErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[PreviewErrorBoundary]", error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack || "" });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, componentStack: "", isFixing: false });
  };

  handleAutoFix = () => {
    const { error, componentStack } = this.state;
    if (!error || !this.props.onFixError) return;

    this.setState({ isFixing: true });
    this.props.onFixError(error.message, componentStack);

    // Reset after triggering fix
    setTimeout(() => {
      this.setState({ hasError: false, error: null, componentStack: "", isFixing: false });
    }, 2000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">خطأ في المعاينة</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              حدث خطأ أثناء عرض المعاينة. يمكنك المحاولة مرة أخرى أو استخدام الإصلاح التلقائي.
            </p>
          </div>

          {this.state.error && (
            <div className="max-w-md w-full bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-right" dir="ltr">
              <p className="text-xs font-mono text-destructive/80 break-all">
                {this.state.error.message.slice(0, 200)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>

            {this.props.onFixError && (
              <button
                onClick={this.handleAutoFix}
                disabled={this.state.isFixing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {this.state.isFixing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wrench className="h-4 w-4" />
                )}
                {this.state.isFixing ? "جارٍ الإصلاح..." : "إصلاح تلقائي ⚡"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
