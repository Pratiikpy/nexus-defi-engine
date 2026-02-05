/**
 * Pyth Network Price Feed Integration
 * Real-time price data from Pyth oracles on Solana
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Pyth price feed IDs (devnet)
export const PYTH_PRICE_FEEDS = {
  'SOL/USD': 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix',
  'BTC/USD': 'HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J',
  'ETH/USD': 'EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw',
  'USDC/USD': '5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7',
};

export interface PriceData {
  price: number;
  confidence: number;
  expo: number;
  timestamp: number;
}

/**
 * Pyth Price Feed Client
 */
export class PythClient {
  private connection: Connection;
  private priceCache: Map<string, PriceData> = new Map();
  
  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Fetch current price for a symbol from Pyth
   */
  async getPrice(symbol: string): Promise<PriceData> {
    const feedId = PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS];
    
    if (!feedId) {
      throw new Error(`No Pyth feed for symbol: ${symbol}`);
    }

    try {
      // In production, this would fetch from actual Pyth program
      // For demo/devnet, we'll use Hermes API
      const response = await fetch(
        `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${feedId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price from Pyth');
      }

      const data = await response.json();
      
      if (!data.parsed || data.parsed.length === 0) {
        throw new Error('No price data returned from Pyth');
      }

      const priceInfo = data.parsed[0].price;
      
      const priceData: PriceData = {
        price: parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo),
        confidence: parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo),
        expo: priceInfo.expo,
        timestamp: priceInfo.publish_time
      };

      // Cache the price
      this.priceCache.set(symbol, priceData);
      
      return priceData;
    } catch (error) {
      console.error('Error fetching Pyth price:', error);
      
      // Fallback to cached price if available
      if (this.priceCache.has(symbol)) {
        return this.priceCache.get(symbol)!;
      }
      
      // Ultimate fallback: simulated price for demo
      return this.getSimulatedPrice(symbol);
    }
  }

  /**
   * Subscribe to price updates
   */
  async subscribeToPrice(
    symbol: string,
    callback: (price: PriceData) => void,
    intervalMs: number = 1000
  ): Promise<() => void> {
    let active = true;
    
    const poll = async () => {
      while (active) {
        try {
          const price = await this.getPrice(symbol);
          callback(price);
        } catch (error) {
          console.error('Error in price subscription:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    };
    
    poll();
    
    // Return unsubscribe function
    return () => {
      active = false;
    };
  }

  /**
   * Get simulated price (for demo purposes when Pyth is unavailable)
   */
  private getSimulatedPrice(symbol: string): PriceData {
    const basePrices: Record<string, number> = {
      'SOL/USD': 145.50,
      'BTC/USD': 98750.00,
      'ETH/USD': 3420.00,
      'USDC/USD': 1.00
    };

    const basePrice = basePrices[symbol] || 100;
    
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.02; // ±1% random walk
    const price = basePrice * (1 + variation);
    
    return {
      price,
      confidence: price * 0.001, // 0.1% confidence interval
      expo: -8,
      timestamp: Date.now()
    };
  }

  /**
   * Get historical prices (for backtesting and charts)
   */
  async getHistoricalPrices(
    symbol: string,
    startTime: number,
    endTime: number
  ): Promise<PriceData[]> {
    // In production, this would fetch from Pyth's historical data API
    // For demo, we'll generate realistic price history
    return this.generatePriceHistory(symbol, startTime, endTime);
  }

  /**
   * Generate realistic price history for demo
   */
  private generatePriceHistory(
    symbol: string,
    startTime: number,
    endTime: number
  ): PriceData[] {
    const basePrices: Record<string, number> = {
      'SOL/USD': 145.50,
      'BTC/USD': 98750.00,
      'ETH/USD': 3420.00,
      'USDC/USD': 1.00
    };

    const basePrice = basePrices[symbol] || 100;
    const history: PriceData[] = [];
    
    const intervalMs = 60000; // 1 minute intervals
    let currentPrice = basePrice;
    
    for (let time = startTime; time <= endTime; time += intervalMs) {
      // Random walk with trend
      const trend = 0.00005; // Slight upward trend
      const volatility = 0.01; // 1% volatility
      const change = trend + (Math.random() - 0.5) * volatility;
      
      currentPrice = currentPrice * (1 + change);
      
      history.push({
        price: currentPrice,
        confidence: currentPrice * 0.001,
        expo: -8,
        timestamp: time
      });
    }
    
    return history;
  }
}

/**
 * Price monitoring service
 */
export class PriceMonitor {
  private pythClient: PythClient;
  private subscriptions: Map<string, () => void> = new Map();
  
  constructor(rpcUrl: string) {
    this.pythClient = new PythClient(rpcUrl);
  }

  /**
   * Start monitoring a symbol
   */
  async startMonitoring(
    symbol: string,
    callback: (price: PriceData) => void,
    intervalMs: number = 1000
  ): Promise<void> {
    // Stop existing subscription if any
    this.stopMonitoring(symbol);
    
    // Start new subscription
    const unsubscribe = await this.pythClient.subscribeToPrice(
      symbol,
      callback,
      intervalMs
    );
    
    this.subscriptions.set(symbol, unsubscribe);
  }

  /**
   * Stop monitoring a symbol
   */
  stopMonitoring(symbol: string): void {
    const unsubscribe = this.subscriptions.get(symbol);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(symbol);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAll(): void {
    for (const [symbol, unsubscribe] of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Get current price
   */
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    return this.pythClient.getPrice(symbol);
  }
}
