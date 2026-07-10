import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // In a real app, we might log this to a service like Sentry
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <h2 className="card-title" style={{ color: 'var(--danger)', fontSize: 'var(--font-2xl)' }}>
              Something went wrong.
            </h2>
            <p className="card-subtitle" style={{ margin: 'var(--space-4) 0' }}>
              An unexpected error occurred in the application.
            </p>
            {this.state.error && (
              <pre style={{ background: 'var(--bg-hover)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', textAlign: 'left', overflowX: 'auto', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
