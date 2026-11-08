import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class KidsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown issue encountered',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Kids Phonics Bus caught an error:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center">
            <div className="text-6xl mb-4 animate-bounce">🚌💨</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              Hold On Tight, Explorer!
            </h2>
            <p className="text-slate-600 mb-6 font-medium text-sm">
              The London Bus took a quick pit stop to tune up the microphones and horns!
            </p>
            <button
              onClick={this.handleRestart}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base flex items-center justify-center gap-2"
            >
              <span>Keep Exploring!</span>
              <span className="text-xl">⭐</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <KidsErrorBoundary>
    <App />
  </KidsErrorBoundary>
);
