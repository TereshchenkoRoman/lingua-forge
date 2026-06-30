import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section role="alert" aria-live="assertive">
          <h1>Something went wrong</h1>
          <p>
            We&apos;re sorry — an unexpected error occurred. Please try refreshing the
            page.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}