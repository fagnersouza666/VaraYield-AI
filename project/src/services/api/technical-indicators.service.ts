export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSIIndicator {
  value: number;
  signal: 'oversold' | 'overbought' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  recommendation: 'buy' | 'sell' | 'hold';
}

export interface MACDIndicator {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | 'none';
  recommendation: 'buy' | 'sell' | 'hold';
}

export interface VolumeAnalysis {
  currentVolume: number;
  averageVolume: number;
  volumeRatio: number;
  spike: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: 'enter' | 'exit' | 'monitor';
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  position: 'above_upper' | 'below_lower' | 'within_bands';
  squeeze: boolean;
  recommendation: 'buy' | 'sell' | 'hold';
}

export interface TechnicalAnalysis {
  poolAddress: string;
  poolName: string;
  timestamp: number;
  rsi: RSIIndicator;
  macd: MACDIndicator;
  volume: VolumeAnalysis;
  bollingerBands: BollingerBands;
  overallSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface TechnicalIndicatorsService {
  analyzePools(poolAddresses: string[]): Promise<TechnicalAnalysis[]>;
  getHistoricalData(poolAddress: string, period: '1h' | '4h' | '1d' | '7d'): Promise<PriceData[]>;
  calculateRSI(prices: number[], period?: number): RSIIndicator;
  calculateMACD(prices: number[]): MACDIndicator;
  analyzeVolume(volumeData: number[]): VolumeAnalysis;
  calculateBollingerBands(prices: number[], period?: number, stdDev?: number): BollingerBands;
  getOptimalEntryExit(analysis: TechnicalAnalysis): { entry: number; exit: number; stopLoss: number };
}

export class HttpTechnicalIndicatorsService implements TechnicalIndicatorsService {
  constructor(private baseUrl: string) {}

  async analyzePools(poolAddresses: string[]): Promise<TechnicalAnalysis[]> {
    const analyses: TechnicalAnalysis[] = [];

    for (const poolAddress of poolAddresses) {
      const historicalData = await this.getHistoricalData(poolAddress, '1d');
      const closes = historicalData.map(d => d.close);
      const volumes = historicalData.map(d => d.volume);

      const rsi = this.calculateRSI(closes);
      const macd = this.calculateMACD(closes);
      const volume = this.analyzeVolume(volumes);
      const bollingerBands = this.calculateBollingerBands(closes);

      const overallSignal = this.calculateOverallSignal(rsi, macd, volume, bollingerBands);
      const confidence = this.calculateConfidence(rsi, macd, volume);

      const analysis: TechnicalAnalysis = {
        poolAddress,
        poolName: this.getPoolName(poolAddress),
        timestamp: Date.now(),
        rsi,
        macd,
        volume,
        bollingerBands,
        overallSignal,
        confidence
      };

      // Adiciona pontos de entrada/saída se sinal for forte
      if (overallSignal === 'strong_buy' || overallSignal === 'buy') {
        const optimal = this.getOptimalEntryExit(analysis);
        analysis.entryPrice = optimal.entry;
        analysis.exitPrice = optimal.exit;
        analysis.stopLoss = optimal.stopLoss;
        analysis.takeProfit = optimal.exit;
      }

      analyses.push(analysis);
    }

    return analyses;
  }

  async getHistoricalData(poolAddress: string, period: '1h' | '4h' | '1d' | '7d'): Promise<PriceData[]> {
    // Simula dados históricos realistas - em produção viria de APIs como CoinGecko/Jupiter
    const periods = {
      '1h': 24, // 24 horas
      '4h': 168, // 7 dias em períodos de 4h
      '1d': 30, // 30 dias
      '7d': 12 // 12 semanas
    };

    const dataPoints = periods[period];
    const data: PriceData[] = [];
    let basePrice = Math.random() * 100 + 10; // $10-$110

    for (let i = dataPoints; i >= 0; i--) {
      const timeMultiplier = {
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };

      const timestamp = Date.now() - (i * timeMultiplier[period]);
      
      // Simula movimento de preço realístico com tendência
      const volatility = 0.05; // 5% de volatilidade
      const trend = Math.sin(i / 10) * 0.02; // Tendência cíclica
      const randomChange = (Math.random() - 0.5) * volatility;
      
      basePrice = basePrice * (1 + trend + randomChange);
      
      const high = basePrice * (1 + Math.random() * 0.02);
      const low = basePrice * (1 - Math.random() * 0.02);
      const open = i === dataPoints ? basePrice : data[data.length - 1]?.close || basePrice;
      const close = basePrice;
      const volume = Math.random() * 1000000 + 100000; // $100K - $1.1M

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
    }

    return data.reverse();
  }

  calculateRSI(prices: number[], period: number = 14): RSIIndicator {
    if (prices.length < period + 1) {
      return {
        value: 50,
        signal: 'neutral',
        strength: 'weak',
        recommendation: 'hold'
      };
    }

    const gains: number[] = [];
    const losses: number[] = [];

    // Calcula ganhos e perdas
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Média móvel dos ganhos e perdas
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Interpretação baseada no bot HFT
    let signal: RSIIndicator['signal'];
    let strength: RSIIndicator['strength'];
    let recommendation: RSIIndicator['recommendation'];

    if (rsi <= 25) { // Oversold threshold do bot HFT
      signal = 'oversold';
      strength = rsi <= 20 ? 'strong' : 'moderate';
      recommendation = 'buy';
    } else if (rsi >= 85) { // Overbought threshold do bot HFT
      signal = 'overbought';
      strength = rsi >= 90 ? 'strong' : 'moderate';
      recommendation = 'sell';
    } else {
      signal = 'neutral';
      strength = 'weak';
      recommendation = 'hold';
    }

    return { value: rsi, signal, strength, recommendation };
  }

  calculateMACD(prices: number[]): MACDIndicator {
    if (prices.length < 26) {
      return {
        macd: 0,
        signal: 0,
        histogram: 0,
        crossover: 'none',
        recommendation: 'hold'
      };
    }

    // EMA calculation helper
    const calculateEMA = (data: number[], period: number): number[] => {
      const multiplier = 2 / (period + 1);
      const ema: number[] = [data[0]];
      
      for (let i = 1; i < data.length; i++) {
        ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
      }
      
      return ema;
    };

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    
    // MACD line
    const macdLine: number[] = [];
    for (let i = 0; i < ema12.length; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }

    // Signal line (EMA of MACD)
    const signalLine = calculateEMA(macdLine, 9);
    
    const currentMACD = macdLine[macdLine.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];
    const histogram = currentMACD - currentSignal;
    
    // Detecta crossover (como no bot HFT)
    const prevMACD = macdLine[macdLine.length - 2] || 0;
    const prevSignal = signalLine[signalLine.length - 2] || 0;
    
    let crossover: MACDIndicator['crossover'] = 'none';
    let recommendation: MACDIndicator['recommendation'] = 'hold';
    
    if (prevMACD <= prevSignal && currentMACD > currentSignal) {
      crossover = 'bullish';
      recommendation = 'buy';
    } else if (prevMACD >= prevSignal && currentMACD < currentSignal) {
      crossover = 'bearish';
      recommendation = 'sell';
    }

    return {
      macd: currentMACD,
      signal: currentSignal,
      histogram,
      crossover,
      recommendation
    };
  }

  analyzeVolume(volumeData: number[]): VolumeAnalysis {
    if (volumeData.length < 2) {
      return {
        currentVolume: 0,
        averageVolume: 0,
        volumeRatio: 1,
        spike: false,
        trend: 'stable',
        recommendation: 'monitor'
      };
    }

    const currentVolume = volumeData[volumeData.length - 1];
    const averageVolume = volumeData.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumeData.length);
    const volumeRatio = currentVolume / averageVolume;
    
    // Spike detection similar to HFT bot
    const spike = volumeRatio > 2.0; // Volume 2x above average
    
    // Trend analysis
    const recentVolumes = volumeData.slice(-5);
    const isIncreasing = recentVolumes.every((vol, i) => i === 0 || vol >= recentVolumes[i - 1]);
    const isDecreasing = recentVolumes.every((vol, i) => i === 0 || vol <= recentVolumes[i - 1]);
    
    let trend: VolumeAnalysis['trend'];
    let recommendation: VolumeAnalysis['recommendation'];
    
    if (isIncreasing && volumeRatio > 1.5) {
      trend = 'increasing';
      recommendation = 'enter'; // High volume + increasing = good entry signal
    } else if (isDecreasing && volumeRatio < 0.5) {
      trend = 'decreasing';
      recommendation = 'exit'; // Low volume = potential exit
    } else {
      trend = 'stable';
      recommendation = 'monitor';
    }

    return {
      currentVolume,
      averageVolume,
      volumeRatio,
      spike,
      trend,
      recommendation
    };
  }

  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): BollingerBands {
    if (prices.length < period) {
      const price = prices[prices.length - 1] || 0;
      return {
        upper: price * 1.02,
        middle: price,
        lower: price * 0.98,
        position: 'within_bands',
        squeeze: false,
        recommendation: 'hold'
      };
    }

    const recentPrices = prices.slice(-period);
    const middle = recentPrices.reduce((a, b) => a + b, 0) / period;
    
    // Standard deviation
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    const upper = middle + (standardDeviation * stdDev);
    const lower = middle - (standardDeviation * stdDev);
    const currentPrice = prices[prices.length - 1];
    
    let position: BollingerBands['position'];
    let recommendation: BollingerBands['recommendation'];
    
    if (currentPrice > upper) {
      position = 'above_upper';
      recommendation = 'sell'; // Price above upper band = overbought
    } else if (currentPrice < lower) {
      position = 'below_lower';
      recommendation = 'buy'; // Price below lower band = oversold
    } else {
      position = 'within_bands';
      recommendation = 'hold';
    }
    
    // Bollinger Squeeze detection
    const bandWidth = (upper - lower) / middle;
    const squeeze = bandWidth < 0.1; // Band width less than 10% = squeeze

    return {
      upper,
      middle,
      lower,
      position,
      squeeze,
      recommendation
    };
  }

  getOptimalEntryExit(analysis: TechnicalAnalysis): { entry: number; exit: number; stopLoss: number } {
    const currentPrice = 100; // Simulated current price
    
    // Entry baseado na análise combinada
    let entryMultiplier = 1.0;
    if (analysis.rsi.recommendation === 'buy') entryMultiplier -= 0.02;
    if (analysis.macd.recommendation === 'buy') entryMultiplier -= 0.01;
    if (analysis.volume.recommendation === 'enter') entryMultiplier -= 0.01;
    
    const entry = currentPrice * entryMultiplier;
    
    // Exit baseado no nível de confiança
    const exitMultiplier = 1 + (analysis.confidence / 100) * 0.2; // 0-20% profit target
    const exit = entry * exitMultiplier;
    
    // Stop loss dinâmico (similar ao bot HFT: -3% to -10%)
    const riskMultiplier = analysis.confidence < 70 ? 0.1 : 0.05; // Higher risk if low confidence
    const stopLoss = entry * (1 - riskMultiplier);
    
    return { entry, exit, stopLoss };
  }

  private calculateOverallSignal(
    rsi: RSIIndicator,
    macd: MACDIndicator,
    volume: VolumeAnalysis,
    bb: BollingerBands
  ): TechnicalAnalysis['overallSignal'] {
    const signals = [rsi.recommendation, macd.recommendation, volume.recommendation, bb.recommendation];
    const buySignals = signals.filter(s => s === 'buy').length;
    const sellSignals = signals.filter(s => s === 'sell').length;
    
    if (buySignals >= 3) return 'strong_buy';
    if (buySignals >= 2) return 'buy';
    if (sellSignals >= 3) return 'strong_sell';
    if (sellSignals >= 2) return 'sell';
    
    return 'hold';
  }

  private calculateConfidence(rsi: RSIIndicator, macd: MACDIndicator, volume: VolumeAnalysis): number {
    let confidence = 50; // Base confidence
    
    // RSI confidence
    if (rsi.strength === 'strong') confidence += 20;
    else if (rsi.strength === 'moderate') confidence += 10;
    
    // MACD confidence
    if (macd.crossover !== 'none') confidence += 15;
    
    // Volume confidence
    if (volume.spike) confidence += 15;
    else if (volume.trend !== 'stable') confidence += 5;
    
    return Math.min(100, Math.max(0, confidence));
  }

  private getPoolName(poolAddress: string): string {
    // Mock pool names
    const pools = ['SOL-USDC', 'RAY-SOL', 'mSOL-SOL', 'USDC-USDT', 'SRM-SOL'];
    return pools[Math.floor(Math.random() * pools.length)];
  }
}

// Mock service for development
export class MockTechnicalIndicatorsService implements TechnicalIndicatorsService {
  async analyzePools(poolAddresses: string[]): Promise<TechnicalAnalysis[]> {
    return poolAddresses.map(address => ({
      poolAddress: address,
      poolName: 'SOL-USDC',
      timestamp: Date.now(),
      rsi: {
        value: 45,
        signal: 'neutral',
        strength: 'moderate',
        recommendation: 'hold'
      },
      macd: {
        macd: 0.5,
        signal: 0.3,
        histogram: 0.2,
        crossover: 'bullish',
        recommendation: 'buy'
      },
      volume: {
        currentVolume: 2500000,
        averageVolume: 1800000,
        volumeRatio: 1.39,
        spike: false,
        trend: 'increasing',
        recommendation: 'enter'
      },
      bollingerBands: {
        upper: 105,
        middle: 100,
        lower: 95,
        position: 'within_bands',
        squeeze: false,
        recommendation: 'hold'
      },
      overallSignal: 'buy',
      confidence: 75,
      entryPrice: 98.5,
      exitPrice: 110.2,
      stopLoss: 93.1,
      takeProfit: 110.2
    }));
  }

  async getHistoricalData(poolAddress: string, period: '1h' | '4h' | '1d' | '7d'): Promise<PriceData[]> {
    // Returns mock historical data
    return Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
      open: 95 + Math.random() * 10,
      high: 100 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 97 + Math.random() * 6,
      volume: 1000000 + Math.random() * 2000000
    })).reverse();
  }

  calculateRSI(prices: number[], period?: number): RSIIndicator {
    return {
      value: 45,
      signal: 'neutral',
      strength: 'moderate',
      recommendation: 'hold'
    };
  }

  calculateMACD(prices: number[]): MACDIndicator {
    return {
      macd: 0.5,
      signal: 0.3,
      histogram: 0.2,
      crossover: 'bullish',
      recommendation: 'buy'
    };
  }

  analyzeVolume(volumeData: number[]): VolumeAnalysis {
    return {
      currentVolume: 2500000,
      averageVolume: 1800000,
      volumeRatio: 1.39,
      spike: false,
      trend: 'increasing',
      recommendation: 'enter'
    };
  }

  calculateBollingerBands(prices: number[], period?: number, stdDev?: number): BollingerBands {
    return {
      upper: 105,
      middle: 100,
      lower: 95,
      position: 'within_bands',
      squeeze: false,
      recommendation: 'hold'
    };
  }

  getOptimalEntryExit(analysis: TechnicalAnalysis): { entry: number; exit: number; stopLoss: number } {
    return {
      entry: 98.5,
      exit: 110.2,
      stopLoss: 93.1
    };
  }
}