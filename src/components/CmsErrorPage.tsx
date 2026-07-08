import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CmsErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CMS Admin system uncaught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative z-10">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">Administrative Module Crash</h1>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
                An unexpected javascript crash occurred within this panel workspace. See system details below:
              </p>
              <div className="bg-[#050505] border border-white/5 p-4 rounded-xl text-left overflow-x-auto max-h-32 text-[10px] font-mono text-indigo-300">
                {this.state.error?.stack || this.state.error?.toString() || 'Unknown runtime error'}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft size={14} /> Go Back
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-600/10"
              >
                <RefreshCcw size={14} /> Reload Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
