import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Bug, 
  Filter, 
  Download, 
  Trash2, 
  Check,
  RefreshCw,
  Search,
  Calendar,
  BarChart3
} from 'lucide-react';
import { errorLogger, ErrorLog, ErrorCategory } from '../../services/error-logger.service';

const ErrorDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filters, setFilters] = useState({
    level: '' as ErrorLog['level'] | '',
    category: '' as ErrorCategory | '',
    resolved: '' as 'true' | 'false' | '',
    search: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Subscribe to new logs
  useEffect(() => {
    const unsubscribe = errorLogger.subscribe((newLog) => {
      if (autoRefresh) {
        setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep only 100 most recent
      }
    });

    // Initial load
    setLogs(errorLogger.getLogs({ limit: 100 }));

    return unsubscribe;
  }, [autoRefresh]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(errorLogger.getLogs({ limit: 100 }));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }
    if (filters.resolved === 'true') {
      filtered = filtered.filter(log => log.resolved);
    }
    if (filters.resolved === 'false') {
      filtered = filtered.filter(log => !log.resolved);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        log.context?.component?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [logs, filters]);

  // Statistics
  const stats = useMemo(() => {
    return errorLogger.getStats();
  }, [logs]);

  const handleResolveError = (id: string) => {
    errorLogger.resolveError(id);
    setLogs(prev => prev.map(log => 
      log.id === id ? { ...log, resolved: true } : log
    ));
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all logs? This cannot be undone.')) {
      errorLogger.clearLogs();
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    const data = errorLogger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vara-yield-errors-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug': return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: ErrorCategory) => {
    const colors: Record<ErrorCategory, string> = {
      RPC_ERROR: 'bg-red-100 text-red-800',
      WALLET_ERROR: 'bg-purple-100 text-purple-800',
      NETWORK_ERROR: 'bg-orange-100 text-orange-800',
      API_ERROR: 'bg-yellow-100 text-yellow-800',
      VALIDATION_ERROR: 'bg-blue-100 text-blue-800',
      RATE_LIMIT: 'bg-red-100 text-red-800',
      TIMEOUT: 'bg-gray-100 text-gray-800',
      PARSING_ERROR: 'bg-indigo-100 text-indigo-800',
      UNKNOWN_ERROR: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bug className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-xl font-semibold text-white">Error Dashboard</h2>
          <div className="ml-4 flex items-center">
            <RefreshCw 
              className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin text-green-500' : 'text-gray-500'}`} 
            />
            <label className="text-sm text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-1"
              />
              Auto-refresh
            </label>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportLogs}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleClearLogs}
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-300">Total Logs</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{stats.byLevel.error}</div>
          <div className="text-sm text-gray-300">Errors</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.byLevel.warn}</div>
          <div className="text-sm text-gray-300">Warnings</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
          <div className="text-sm text-gray-300">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Filter className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="font-medium text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
            >
              <option value="">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
            >
              <option value="">All Categories</option>
              <option value="RPC_ERROR">RPC Error</option>
              <option value="WALLET_ERROR">Wallet Error</option>
              <option value="NETWORK_ERROR">Network Error</option>
              <option value="API_ERROR">API Error</option>
              <option value="RATE_LIMIT">Rate Limit</option>
              <option value="TIMEOUT">Timeout</option>
              <option value="PARSING_ERROR">Parsing Error</option>
              <option value="VALIDATION_ERROR">Validation Error</option>
              <option value="UNKNOWN_ERROR">Unknown Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Status</label>
            <select
              value={filters.resolved}
              onChange={(e) => setFilters(prev => ({ ...prev, resolved: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
            >
              <option value="">All Status</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search logs..."
                className="w-full pl-10 pr-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-600">
          <h3 className="font-medium text-white">
            Recent Logs ({filteredLogs.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs found matching the current filters.</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    log.resolved 
                      ? 'bg-gray-800/50 border-l-green-500' 
                      : log.level === 'error' 
                        ? 'bg-red-900/20 border-l-red-500'
                        : log.level === 'warn'
                          ? 'bg-yellow-900/20 border-l-yellow-500'
                          : 'bg-gray-800 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getLevelIcon(log.level)}
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(log.category)}`}>
                          {log.category.replace('_', ' ')}
                        </span>
                        {log.context?.component && (
                          <span className="ml-2 px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                            {log.context.component}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-white text-sm mb-2">
                        {log.message}
                      </div>
                      
                      {log.details && (
                        <details className="text-xs text-gray-300">
                          <summary className="cursor-pointer hover:text-white">Details</summary>
                          <pre className="mt-2 p-2 bg-gray-900 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      
                      {log.context && Object.keys(log.context).length > 1 && (
                        <div className="mt-2 text-xs text-gray-400">
                          {log.context.rpcEndpoint && (
                            <div>RPC: {log.context.rpcEndpoint}</div>
                          )}
                          {log.context.walletAddress && (
                            <div>Wallet: {log.context.walletAddress.slice(0, 8)}...</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      {!log.resolved && (
                        <button
                          onClick={() => handleResolveError(log.id)}
                          className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDashboard;