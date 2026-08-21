import React from 'react';
import srkrLogo from '../assets/srkr_logo.jpg';
import csiLogo from '../assets/csi_logo_v2.jpeg';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PORTAL CRASH] Captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-bg text-cyber-ink flex flex-col items-center justify-center p-6 font-sans">
          
          {/* Header Logos */}
          <div className="absolute top-8 left-0 right-0 flex justify-center items-center gap-6 px-4">
            <div className="bg-white shadow-sm px-3 py-1.5 rounded-lg border border-cyber-border flex items-center">
              <img src={srkrLogo} alt="SRKR Engineering College Logo" className="h-6 w-auto object-contain" />
            </div>
            <div className="bg-white shadow-sm p-1.5 rounded-full border border-cyber-border flex items-center">
              <img src={csiLogo} alt="CSI Logo" className="h-7 w-7 object-contain rounded-full" />
            </div>
          </div>
          
          {/* Error Message Box */}
          <div className="max-w-md w-full text-center space-y-6 bg-cyber-card border border-red-200 p-8 rounded-xl shadow-2xl">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-cyber-live rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              !
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-cyber-ink font-display">Portal Encountered an Error</h1>
              <p className="text-sm text-cyber-muted">
                The HACK 'N' CLASH live dashboard experienced an unexpected rendering error.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-cyber-border p-3 rounded text-left text-xs font-mono text-cyber-live overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-cyber-live hover:bg-rose-700 text-white rounded-lg font-semibold tracking-wide transition-all shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
            >
              Reload Portal
            </button>
          </div>

          <div className="absolute bottom-8 text-xs text-cyber-muted font-mono">
            SRKREC CSI Student Branch &bull; 2026
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
