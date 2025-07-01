import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { getErrorMessage, getErrorCode, isNetworkError } from '../../utils/errors';

interface ErrorMessageProps {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'card' | 'toast';
  showDetails?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title,
  message,
  onRetry,
  onDismiss,
  variant = 'card',
  showDetails = false,
}) => {
  const errorMessage = message || (error ? getErrorMessage(error) : 'An error occurred');
  const errorCode = error ? getErrorCode(error) : undefined;
  const isNetwork = error ? isNetworkError(error) : false;

  const getIcon = () => {
    if (isNetwork) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getTitle = () => {
    if (title) return title;
    if (isNetwork) return 'Connection Error';
    return 'Error';
  };

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        {getIcon()}
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-blue-600 hover:text-blue-700 underline ml-2"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 relative">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-red-800">{getTitle()}</h4>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            {errorCode && showDetails && (
              <p className="text-red-600 text-xs mt-1">Code: {errorCode}</p>
            )}
          </div>
        </div>
        {onRetry && (
          <div className="mt-3">
            <button
              onClick={onRetry}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{errorMessage}</p>

      {errorCode && showDetails && (
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <p className="text-sm font-medium text-gray-700">Error Code</p>
          <p className="text-sm text-gray-600">{errorCode}</p>
        </div>
      )}

      {import.meta.env.DEV && error instanceof Error && showDetails && (
        <details className="mb-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Stack Trace (Development)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32 bg-gray-50 p-2 rounded">
            {error.stack}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};