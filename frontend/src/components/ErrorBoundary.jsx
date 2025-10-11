import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      // Efficient default fallback UI, no prop-based UI
      return React.createElement('div', { className: 'bg-red-100 text-red-700 p-4 rounded-lg' },
        React.createElement('h2', { className: 'font-bold mb-2' }, 'Something went wrong.'),
        React.createElement('p', null, 'There was a problem loading this section. Please try again later.'),
        error ? React.createElement('pre', { className: 'text-xs mt-2' }, error.toString()) : null
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
