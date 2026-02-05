/**
 * SolFlow Strategy Engine
 * Natural language trading strategy parser and executor
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Strategy data structures
export interface ParsedStrategy {
  name: string;
  asset: string; // e.g., "SOL/USDC"
  entry: StrategyCondition;
  exit: StrategyCondition;
  maxPosition: number; // USD value
  riskPercent: number; // % of portfolio
  executionType: 'market' | 'limit';
  stopLoss?: number; // percentage
  takeProfit?: number; // percentage
}

export interface StrategyCondition {
  type: 'price' | 'indicator' | 'time' | 'volume';
  indicator?: 'RSI' | 'MACD' | 'BB' | 'SMA' | 'EMA';
  condition: '<' | '>' | '=' | 'crosses_above' | 'crosses_below';
  value: number;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
}

export interface Trade {
  id: string;
  strategy: string;
  timestamp: number;
  type: 'buy' | 'sell';
  asset: string;
  price: number;
  amount: number;
  value: number;
  txSignature?: string;
  status: 'pending' | 'executed' | 'failed';
}

export interface StrategyPerformance {
  strategyName: string;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  averageTrade: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

/**
 * Natural Language Strategy Parser
 * Converts plain English into executable trading strategies
 */
export class StrategyParser {
  /**
   * Parse natural language strategy into structured format
   */
  parseStrategy(input: string): ParsedStrategy {
    const normalized = input.toLowerCase();
    
    // Extract asset pair
    const asset = this.extractAsset(normalized);
    
    // Extract entry conditions
    const entry = this.extractCondition(normalized, 'entry');
    
    // Extract exit conditions
    const exit = this.extractCondition(normalized, 'exit');
    
    // Extract position sizing
    const maxPosition = this.extractMaxPosition(normalized);
    const riskPercent = this.extractRiskPercent(normalized);
    
    // Extract stop loss / take profit
    const stopLoss = this.extractStopLoss(normalized);
    const takeProfit = this.extractTakeProfit(normalized);
    
    // Determine execution type
    const executionType = normalized.includes('limit') ? 'limit' : 'market';
    
    return {
      name: this.generateStrategyName(input),
      asset,
      entry,
      exit,
      maxPosition,
      riskPercent,
      executionType,
      stopLoss,
      takeProfit
    };
  }

  private extractAsset(input: string): string {
    // Common asset patterns
    if (input.includes('sol')) return 'SOL/USDC';
    if (input.includes('btc') || input.includes('bitcoin')) return 'BTC/USD';
    if (input.includes('eth') || input.includes('ethereum')) return 'ETH/USD';
    return 'SOL/USDC'; // default
  }

  private extractCondition(input: string, phase: 'entry' | 'exit'): StrategyCondition {
    // RSI patterns
    if (input.includes('rsi')) {
      const rsiMatch = input.match(/rsi\s*(?:below|<|less than)\s*(\d+)/i) ||
                      input.match(/rsi\s*(?:above|>|greater than)\s*(\d+)/i) ||
                      input.match(/rsi\s*(?:crosses?)\s*(\d+)/i);
      
      if (rsiMatch) {
        const value = parseInt(rsiMatch[1]);
        const condition = input.includes('below') || input.includes('<') ? '<' :
                         input.includes('above') || input.includes('>') ? '>' :
                         input.includes('crosses') ? 'crosses_above' : '>';
        
        return {
          type: 'indicator',
          indicator: 'RSI',
          condition: condition as any,
          value,
          timeframe: '15m'
        };
      }
    }
    
    // Price patterns
    if (input.includes('price') || input.includes('drops') || input.includes('rises')) {
      const priceMatch = input.match(/(\d+)%/);
      if (priceMatch) {
        const value = parseInt(priceMatch[1]);
        const condition = input.includes('drop') || input.includes('below') ? '<' : '>';
        
        return {
          type: 'price',
          condition: condition as any,
          value,
          timeframe: '15m'
        };
      }
    }
    
    // MACD patterns
    if (input.includes('macd')) {
      return {
        type: 'indicator',
        indicator: 'MACD',
        condition: 'crosses_above',
        value: 0,
        timeframe: '1h'
      };
    }
    
    // Bollinger Bands
    if (input.includes('bollinger') || input.includes('bb')) {
      const condition = input.includes('upper') ? '>' : '<';
      return {
        type: 'indicator',
        indicator: 'BB',
        condition: condition as any,
        value: input.includes('upper') ? 2 : -2, // standard deviations
        timeframe: '1h'
      };
    }
    
    // Default: simple price threshold
    return {
      type: 'price',
      condition: phase === 'entry' ? '<' : '>',
      value: 100,
      timeframe: '15m'
    };
  }

  private extractMaxPosition(input: string): number {
    const match = input.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 500; // default $500
  }

  private extractRiskPercent(input: string): number {
    const match = input.match(/(\d+)%\s*(?:of|risk)/i);
    return match ? parseInt(match[1]) : 10; // default 10%
  }

  private extractStopLoss(input: string): number | undefined {
    const match = input.match(/stop\s*loss\s*(?:at\s*)?(\d+)%/i);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractTakeProfit(input: string): number | undefined {
    const match = input.match(/(?:take\s*profit|sell\s*when\s*up)\s*(?:at\s*)?(\d+)%/i);
    return match ? parseInt(match[1]) : undefined;
  }

  private generateStrategyName(input: string): string {
    const asset = this.extractAsset(input.toLowerCase());
    const assetSymbol = asset.split('/')[0];
    
    if (input.toLowerCase().includes('rsi')) {
      return `${assetSymbol} RSI Strategy`;
    }
    if (input.toLowerCase().includes('macd')) {
      return `${assetSymbol} MACD Strategy`;
    }
    if (input.toLowerCase().includes('bollinger')) {
      return `${assetSymbol} BB Strategy`;
    }
    if (input.toLowerCase().includes('dca') || input.toLowerCase().includes('dollar cost')) {
      return `${assetSymbol} DCA Strategy`;
    }
    
    return `${assetSymbol} Custom Strategy`;
  }
}

/**
 * Technical Indicator Calculator
 */
export class IndicatorCalculator {
  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // not enough data
    
    const recentPrices = prices.slice(-period - 1);
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < recentPrices.length; i++) {
      const change = recentPrices[i] - recentPrices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return Math.round(rsi * 100) / 100;
  }

  /**
   * Calculate Simple Moving Average
   */
  calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average
   */
  calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // For signal line, we'd need to calculate EMA of MACD values
    // Simplified: using a constant signal for demo
    const signal = macd * 0.9;
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    
    // Calculate standard deviation
    const squaredDiffs = recentPrices.map(p => Math.pow(p - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(variance);
    
    return {
      upper: sma + (sd * stdDev),
      middle: sma,
      lower: sma - (sd * stdDev)
    };
  }
}

/**
 * Strategy Executor
 * Monitors conditions and executes trades
 */
export class StrategyExecutor {
  private connection: Connection;
  private calculator: IndicatorCalculator;
  private priceHistory: Map<string, number[]> = new Map();
  
  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.calculator = new IndicatorCalculator();
  }

  /**
   * Check if strategy conditions are met
   */
  checkCondition(
    condition: StrategyCondition,
    currentPrice: number,
    priceHistory: number[]
  ): boolean {
    if (condition.type === 'price') {
      // Simple price comparison
      const change = ((currentPrice - priceHistory[priceHistory.length - 2]) / priceHistory[priceHistory.length - 2]) * 100;
      
      switch (condition.condition) {
        case '<':
          return change < -condition.value;
        case '>':
          return change > condition.value;
        default:
          return false;
      }
    }
    
    if (condition.type === 'indicator') {
      switch (condition.indicator) {
        case 'RSI': {
          const rsi = this.calculator.calculateRSI(priceHistory);
          
          switch (condition.condition) {
            case '<':
              return rsi < condition.value;
            case '>':
              return rsi > condition.value;
            case 'crosses_above':
              const prevRSI = this.calculator.calculateRSI(priceHistory.slice(0, -1));
              return prevRSI < condition.value && rsi > condition.value;
            case 'crosses_below':
              const prevRSI2 = this.calculator.calculateRSI(priceHistory.slice(0, -1));
              return prevRSI2 > condition.value && rsi < condition.value;
            default:
              return false;
          }
        }
        
        case 'MACD': {
          const macd = this.calculator.calculateMACD(priceHistory);
          return macd.histogram > 0; // Simplified: MACD above signal
        }
        
        case 'BB': {
          const bb = this.calculator.calculateBollingerBands(priceHistory);
          
          if (condition.value > 0) {
            // Upper band
            return currentPrice > bb.upper;
          } else {
            // Lower band
            return currentPrice < bb.lower;
          }
        }
        
        default:
          return false;
      }
    }
    
    return false;
  }

  /**
   * Update price history for an asset
   */
  updatePriceHistory(asset: string, price: number): void {
    if (!this.priceHistory.has(asset)) {
      this.priceHistory.set(asset, []);
    }
    
    const history = this.priceHistory.get(asset)!;
    history.push(price);
    
    // Keep last 200 prices
    if (history.length > 200) {
      history.shift();
    }
  }

  /**
   * Get price history for an asset
   */
  getPriceHistory(asset: string): number[] {
    return this.priceHistory.get(asset) || [];
  }
}

/**
 * P&L Tracker
 * Calculates and tracks strategy performance
 */
export class PnLTracker {
  private trades: Map<string, Trade[]> = new Map();
  
  /**
   * Record a trade
   */
  recordTrade(trade: Trade): void {
    if (!this.trades.has(trade.strategy)) {
      this.trades.set(trade.strategy, []);
    }
    
    this.trades.get(trade.strategy)!.push(trade);
  }

  /**
   * Calculate strategy performance
   */
  calculatePerformance(strategyName: string): StrategyPerformance {
    const trades = this.trades.get(strategyName) || [];
    
    if (trades.length === 0) {
      return {
        strategyName,
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        averageTrade: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      };
    }
    
    // Calculate P&L
    let totalPnL = 0;
    let wins = 0;
    const tradePnLs: number[] = [];
    
    for (let i = 0; i < trades.length; i += 2) {
      if (i + 1 >= trades.length) break; // Need buy + sell pair
      
      const buy = trades[i];
      const sell = trades[i + 1];
      
      if (buy.type === 'buy' && sell.type === 'sell') {
        const pnl = (sell.price - buy.price) * buy.amount;
        totalPnL += pnl;
        tradePnLs.push(pnl);
        
        if (pnl > 0) wins++;
      }
    }
    
    const completedTrades = Math.floor(trades.length / 2);
    const winRate = completedTrades > 0 ? (wins / completedTrades) * 100 : 0;
    const averageTrade = completedTrades > 0 ? totalPnL / completedTrades : 0;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 0;
    
    for (const pnl of tradePnLs) {
      cumulative += pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = ((peak - cumulative) / Math.max(peak, 1)) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = averageTrade;
    const returns = tradePnLs;
    const stdDev = returns.length > 0 ? this.calculateStdDev(returns) : 1;
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    
    return {
      strategyName,
      totalTrades: trades.length,
      winRate,
      totalPnL,
      totalPnLPercent: (totalPnL / (trades[0]?.value || 1)) * 100,
      averageTrade,
      maxDrawdown,
      sharpeRatio
    };
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get all trades for a strategy
   */
  getTrades(strategyName: string): Trade[] {
    return this.trades.get(strategyName) || [];
  }
}
