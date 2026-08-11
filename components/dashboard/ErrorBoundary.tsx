'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Dashboard:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] brutal-card p-8 m-6 flex flex-col items-center justify-center text-center bg-[#ffdad6] text-[#93000a] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-6xl mb-4">warning</span>
          <h2 className="font-black text-2xl uppercase tracking-tight mb-2">Terjadi Kendala Komponen Dashboard</h2>
          <p className="font-jetbrains text-xs max-w-md mb-6 bg-white/80 p-3 border-2 border-black text-black">
            {this.state.error?.message || 'Terdapat kesalahan pada tampilan dashboard.'}
          </p>
          <button
            onClick={this.handleReset}
            className="bg-black text-white px-6 py-3 font-bold uppercase text-sm brutalist-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#008080] transition-all cursor-pointer"
          >
            🔄 Muat Ulang Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
