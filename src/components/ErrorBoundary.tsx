import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public declare props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Niewychwycony błąd aplikacji:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#2E3440] text-[#ECEFF4] flex items-center justify-center p-6 font-sans">
          <div className="bg-[#3B4252] border border-[#4C566A] rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold mb-2 text-white">Wystąpił nieoczekiwany problem</h1>
            <p className="text-xs text-[#D8DEE9] mb-6">
              Aplikacja napotkała błąd podczas ładowania widoku. Możesz natychmiast odświeżyć stronę lub zresetować dane podręczne symulatora.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Odśwież stronę
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Zresetuj dane i odśwież
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
