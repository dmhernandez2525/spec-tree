'use client';

/**
 * Error Boundary
 *
 * F1.1.6 - Error Boundary Implementation
 *
 * A React error boundary that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI instead of crashing the entire app.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback, ErrorFallbackProps } from './ErrorFallback';

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Custom fallback render function */
  fallbackRender?: (props: ErrorFallbackProps) => ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback when reset is triggered */
  onReset?: () => void;
  /** Show stack trace in development */
  showStackTrace?: boolean;
  /** Allow error reporting */
  enableReporting?: boolean;
  /** Custom report error handler */
  onReportError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Section name for context */
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary component
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // In a real application, this would send to an error tracking service
    // like Sentry, LogRocket, Bugsnag, etc.
    try {
      console.error('[Error Tracking]', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        section: this.props.sectionName,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    } catch (e) {
      // Fail silently to not cause more errors
      console.error('Failed to log error:', e);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  handleReportError = (): void => {
    const { error, errorInfo } = this.state;
    if (error && errorInfo) {
      this.props.onReportError?.(error, errorInfo);
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      fallbackRender,
      showStackTrace = process.env.NODE_ENV === 'development',
      enableReporting = true,
      sectionName,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use custom fallback render if provided
      if (fallbackRender) {
        return fallbackRender({
          error,
          errorInfo,
          resetErrorBoundary: this.handleReset,
          showStackTrace,
          enableReporting,
          onReportError: this.handleReportError,
          sectionName,
        });
      }

      // Use default fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.handleReset}
          showStackTrace={showStackTrace}
          enableReporting={enableReporting}
          onReportError={this.handleReportError}
          sectionName={sectionName}
        />
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
