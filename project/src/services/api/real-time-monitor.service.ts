export interface MarketEvent {
  id: string;
  type: 'price_spike' | 'volume_surge' | 'liquidity_drop' | 'apy_change' | 'new_pool';
  severity: 'info' | 'warning' | 'critical';
  poolAddress: string;
  poolName: string;
  oldValue?: number;
  newValue: number;
  changePercent: number;
  timestamp: number;
  message: string;
  actionable: boolean;
}

export interface PerformanceMetrics {
  totalTransactions: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
  totalVolume: number;
  totalFees: number;
  profitLoss: number;
  timestamp: number;
}

export interface SystemHealth {
  rpcStatus: 'healthy' | 'degraded' | 'down';
  averageResponseTime: number;
  activeConnections: number;
  errorCount: number;
  lastSuccessfulCall: number;
  endpointMetrics: Array<{
    endpoint: string;
    status: 'online' | 'offline';
    latency: number;
    successRate: number;
  }>;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: ('console' | 'webhook' | 'telegram' | 'discord')[];
  severityThreshold: 'info' | 'warning' | 'critical';
  webhookUrl?: string;
  telegramConfig?: {
    botToken: string;
    chatId: string;
  };
  discordConfig?: {
    webhookUrl: string;
  };
}

export interface RealTimeMonitorService {
  startMonitoring(): void;
  stopMonitoring(): void;
  getMarketEvents(since?: number): Promise<MarketEvent[]>;
  getPerformanceMetrics(): Promise<PerformanceMetrics>;
  getSystemHealth(): Promise<SystemHealth>;
  subscribeToEvents(callback: (event: MarketEvent) => void): () => void;
  configureNotifications(config: NotificationConfig): void;
}

export class HttpRealTimeMonitorService implements RealTimeMonitorService {
  private isMonitoring = false;
  private eventListeners: ((event: MarketEvent) => void)[] = [];
  private marketEvents: MarketEvent[] = [];
  private performanceMetrics: PerformanceMetrics;
  private notificationConfig: NotificationConfig = {
    enabled: true,
    channels: ['console'],
    severityThreshold: 'warning'
  };
  private monitoringInterval?: NodeJS.Timeout;

  constructor(private baseUrl: string) {
    this.performanceMetrics = this.initializeMetrics();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚀 Iniciando monitoramento em tempo real...');
    
    // Monitora eventos de mercado a cada 5 segundos (inspirado no bot HFT)
    this.monitoringInterval = setInterval(() => {
      this.checkMarketEvents();
    }, 5000);
    
    // Monitora métricas de performance a cada 30 segundos
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️ Monitoramento parado');
  }

  async getMarketEvents(since?: number): Promise<MarketEvent[]> {
    if (since) {
      return this.marketEvents.filter(event => event.timestamp >= since);
    }
    return [...this.marketEvents];
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  async getSystemHealth(): Promise<SystemHealth> {
    // Simula verificação de saúde do sistema
    // Em implementação real, verificaria RPC endpoints, conexões WebSocket, etc.
    
    const now = Date.now();
    const rpcStatuses = ['healthy', 'degraded', 'down'] as const;
    const randomStatus = rpcStatuses[Math.floor(Math.random() * rpcStatuses.length)];
    
    return {
      rpcStatus: randomStatus,
      averageResponseTime: Math.random() * 500 + 50, // 50-550ms
      activeConnections: Math.floor(Math.random() * 10) + 1,
      errorCount: Math.floor(Math.random() * 5),
      lastSuccessfulCall: now - Math.random() * 10000, // Últimos 10s
      endpointMetrics: [
        {
          endpoint: 'https://api.mainnet-beta.solana.com',
          status: Math.random() > 0.2 ? 'online' : 'offline',
          latency: Math.random() * 200 + 50,
          successRate: Math.random() * 20 + 80 // 80-100%
        },
        {
          endpoint: 'https://rpc.ankr.com/solana',
          status: Math.random() > 0.1 ? 'online' : 'offline',
          latency: Math.random() * 300 + 100,
          successRate: Math.random() * 30 + 70 // 70-100%
        }
      ]
    };
  }

  subscribeToEvents(callback: (event: MarketEvent) => void): () => void {
    this.eventListeners.push(callback);
    
    // Retorna função para cancelar a inscrição
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  configureNotifications(config: NotificationConfig): void {
    this.notificationConfig = { ...config };
    console.log('🔔 Configurações de notificação atualizadas:', config);
  }

  private checkMarketEvents(): void {
    // Simula detecção de eventos baseado nos padrões do bot HFT
    
    // 1. Spike de volume (similar ao bot HFT que detecta volume spikes)
    if (Math.random() > 0.85) {
      const event: MarketEvent = {
        id: `vol_spike_${Date.now()}`,
        type: 'volume_surge',
        severity: 'warning',
        poolAddress: 'pool_sol_usdc',
        poolName: 'SOL-USDC',
        newValue: Math.random() * 10000000 + 5000000, // $5M - $15M
        changePercent: Math.random() * 200 + 50, // +50% to +250%
        timestamp: Date.now(),
        message: 'Volume spike detectado - possível oportunidade de arbitragem',
        actionable: true
      };
      
      this.addEvent(event);
    }
    
    // 2. Mudança significativa de APY
    if (Math.random() > 0.9) {
      const oldAPY = 12.5;
      const newAPY = oldAPY + (Math.random() - 0.5) * 5; // ±2.5%
      const changePercent = ((newAPY - oldAPY) / oldAPY) * 100;
      
      const event: MarketEvent = {
        id: `apy_change_${Date.now()}`,
        type: 'apy_change',
        severity: Math.abs(changePercent) > 20 ? 'critical' : 'warning',
        poolAddress: 'pool_ray_sol',
        poolName: 'RAY-SOL',
        oldValue: oldAPY,
        newValue: newAPY,
        changePercent: changePercent,
        timestamp: Date.now(),
        message: `APY mudou ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
        actionable: true
      };
      
      this.addEvent(event);
    }
    
    // 3. Queda de liquidez crítica
    if (Math.random() > 0.95) {
      const event: MarketEvent = {
        id: `liq_drop_${Date.now()}`,
        type: 'liquidity_drop',
        severity: 'critical',
        poolAddress: 'pool_msol_sol',
        poolName: 'mSOL-SOL',
        newValue: Math.random() * 1000000 + 500000, // $0.5M - $1.5M
        changePercent: -(Math.random() * 50 + 30), // -30% to -80%
        timestamp: Date.now(),
        message: 'Liquidez crítica - considere exit da posição',
        actionable: true
      };
      
      this.addEvent(event);
    }
  }

  private addEvent(event: MarketEvent): void {
    this.marketEvents.push(event);
    
    // Mantém apenas os últimos 100 eventos
    if (this.marketEvents.length > 100) {
      this.marketEvents = this.marketEvents.slice(-100);
    }
    
    // Notifica listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
    
    // Envia notificação se configurado
    this.sendNotification(event);
  }

  private sendNotification(event: MarketEvent): void {
    if (!this.notificationConfig.enabled) return;
    
    const severityLevels = { info: 0, warning: 1, critical: 2 };
    const eventLevel = severityLevels[event.severity];
    const thresholdLevel = severityLevels[this.notificationConfig.severityThreshold];
    
    if (eventLevel < thresholdLevel) return;
    
    this.notificationConfig.channels.forEach(channel => {
      switch (channel) {
        case 'console':
          this.sendConsoleNotification(event);
          break;
        case 'webhook':
          this.sendWebhookNotification(event);
          break;
        case 'telegram':
          this.sendTelegramNotification(event);
          break;
        case 'discord':
          this.sendDiscordNotification(event);
          break;
      }
    });
  }

  private sendConsoleNotification(event: MarketEvent): void {
    const emoji = event.severity === 'critical' ? '🚨' : event.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${event.severity.toUpperCase()}] ${event.poolName}: ${event.message}`);
  }

  private async sendWebhookNotification(event: MarketEvent): Promise<void> {
    if (!this.notificationConfig.webhookUrl) return;
    
    try {
      await fetch(this.notificationConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: event.type,
          severity: event.severity,
          pool: event.poolName,
          message: event.message,
          timestamp: event.timestamp,
          actionable: event.actionable
        })
      });
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
    }
  }

  private async sendTelegramNotification(event: MarketEvent): Promise<void> {
    const config = this.notificationConfig.telegramConfig;
    if (!config) return;
    
    const emoji = event.severity === 'critical' ? '🚨' : '⚠️';
    const message = `${emoji} *VaraYield Alert*\n\n` +
      `Pool: ${event.poolName}\n` +
      `Type: ${event.type}\n` +
      `Message: ${event.message}\n` +
      `Time: ${new Date(event.timestamp).toLocaleString()}`;
    
    try {
      await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Erro ao enviar Telegram:', error);
    }
  }

  private async sendDiscordNotification(event: MarketEvent): Promise<void> {
    const config = this.notificationConfig.discordConfig;
    if (!config) return;
    
    const color = event.severity === 'critical' ? 15158332 : // Vermelho
                  event.severity === 'warning' ? 15105570 : // Laranja
                  3447003; // Azul
    
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `VaraYield Alert - ${event.poolName}`,
            description: event.message,
            color: color,
            fields: [
              { name: 'Type', value: event.type, inline: true },
              { name: 'Severity', value: event.severity, inline: true },
              { name: 'Actionable', value: event.actionable ? 'Yes' : 'No', inline: true }
            ],
            timestamp: new Date(event.timestamp).toISOString()
          }]
        })
      });
    } catch (error) {
      console.error('Erro ao enviar Discord:', error);
    }
  }

  private updatePerformanceMetrics(): void {
    // Simula atualização de métricas baseado nos padrões do bot HFT
    this.performanceMetrics = {
      totalTransactions: this.performanceMetrics.totalTransactions + Math.floor(Math.random() * 10),
      successRate: Math.random() * 10 + 90, // 90-100%
      averageLatency: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 5, // 0-5%
      totalVolume: this.performanceMetrics.totalVolume + (Math.random() * 100000),
      totalFees: this.performanceMetrics.totalFees + (Math.random() * 100),
      profitLoss: this.performanceMetrics.profitLoss + (Math.random() - 0.3) * 1000, // Slight positive bias
      timestamp: Date.now()
    };
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      totalTransactions: 0,
      successRate: 100,
      averageLatency: 100,
      errorRate: 0,
      totalVolume: 0,
      totalFees: 0,
      profitLoss: 0,
      timestamp: Date.now()
    };
  }
}