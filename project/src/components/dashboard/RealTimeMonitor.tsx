import React, { useState, useCallback } from 'react';
import { AlertTriangle, Activity, TrendingUp, TrendingDown, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MarketEvent, PerformanceMetrics, SystemHealth } from '../../services/api/real-time-monitor.service';

interface RealTimeMonitorProps {
  onEventAction?: (event: MarketEvent) => void;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ onEventAction }) => {
  const [events] = useState<MarketEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const isConnected = false; // Não conectado a dados reais ainda

  const handleEventAction = useCallback((event: MarketEvent) => {
    if (onEventAction) {
      onEventAction(event);
    }
  }, [onEventAction]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.severity === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <TrendingDown className="h-4 w-4" />;
      case 'info': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Status do Sistema */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monitor em Tempo Real</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600">Conectado</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-600">Aguardando conexão</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Métricas de Performance - Sem dados reais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Transações</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando dados</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Taxa de Sucesso</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando dados</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Latência Média</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando dados</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">P&L</div>
            <div className="text-xs text-gray-400 mt-1">Aguardando dados</div>
          </div>
        </div>

        {/* Status dos Endpoints - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">RPC Endpoints</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>--ms</span>
              <span>--%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">WebSocket</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>--ms</span>
              <span>--%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Eventos */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Eventos de Mercado</h3>
          <div className="flex space-x-2">
            {['all', 'critical', 'warning', 'info'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterType === 'all' ? 'Todos' : filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Eventos - Vazia por não ter dados reais */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h4 className="text-lg font-medium mb-2">Aguardando Dados em Tempo Real</h4>
            <p className="text-sm">O sistema de monitoramento será conectado a dados reais em breve</p>
            <div className="mt-4 text-xs text-gray-400">
              • Eventos de mercado<br/>
              • Alertas de volatilidade<br/>
              • Mudanças de APY<br/>
              • Spikes de volume
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};