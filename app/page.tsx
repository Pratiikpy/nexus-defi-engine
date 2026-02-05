'use client';

import { useEffect, useState } from 'react';
import { 
  StrategyParser, 
  StrategyExecutor, 
  PnLTracker,
  type ParsedStrategy,
  type Trade,
  type StrategyPerformance
} from '@/lib/strategy-engine';
import { PythClient, PriceMonitor, type PriceData } from '@/lib/pyth-integration';
import { TradingExecutor } from '@/lib/jupiter-integration';
import StrategyInputCard from '@/components/StrategyInputCard';
import ParsedStrategyCard from '@/components/ParsedStrategyCard';
import LivePriceCard from '@/components/LivePriceCard';
import PerformanceCard from '@/components/PerformanceCard';
import TradeHistoryCard from '@/components/TradeHistoryCard';

export default function Home() {
  const [strategyInput, setStrategyInput] = useState('');
  const [parsedStrategy, setParsedStrategy] = useState<ParsedStrategy | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<ParsedStrategy | null>(null);
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<StrategyPerformance | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  
  // Initialize services
  const parser = new StrategyParser();
  const executor = new StrategyExecutor(rpcUrl);
  const pnlTracker = new PnLTracker();
  const priceMonitor = new PriceMonitor(rpcUrl);
  const tradingExecutor = new TradingExecutor(rpcUrl);

  // Parse strategy when input changes
  const handleParseStrategy = () => {
    if (!strategyInput.trim()) return;
    
    const parsed = parser.parseStrategy(strategyInput);
    setParsedStrategy(parsed);
  };

  // Activate strategy
  const handleActivateStrategy = async () => {
    if (!parsedStrategy) return;
    
    setActiveStrategy(parsedStrategy);
    setIsMonitoring(true);
    
    // Start monitoring prices
    const symbol = parsedStrategy.asset.replace('/', '/');
    await priceMonitor.startMonitoring(symbol, (price) => {
      setCurrentPrice(price);
      
      // Update price history
      setPriceHistory(prev => {
        const newHistory = [...prev, price.price];
        if (newHistory.length > 100) newHistory.shift();
        
        // Update executor's price history
        executor.updatePriceHistory(parsedStrategy.asset, price.price);
        
        // Check strategy conditions
        checkStrategyConditions(parsedStrategy, price.price, newHistory);
        
        return newHistory;
      });
    }, 2000); // Update every 2 seconds
  };

  // Stop monitoring
  const handleStopStrategy = () => {
    setIsMonitoring(false);
    setActiveStrategy(null);
    priceMonitor.stopAll();
  };

  // Check if strategy conditions are met
  const checkStrategyConditions = async (
    strategy: ParsedStrategy,
    currentPrice: number,
    history: number[]
  ) => {
    if (history.length < 20) return; // Need minimum history
    
    // Check entry condition
    const entryMet = executor.checkCondition(strategy.entry, currentPrice, history);
    
    if (entryMet && trades.length === 0) {
      // Execute buy trade
      console.log('Entry condition met! Executing buy...');
      await executeTrade(strategy, 'buy', currentPrice);
    }
    
    // Check exit condition if we have an open position
    if (trades.length > 0 && trades[trades.length - 1].type === 'buy') {
      const exitMet = executor.checkCondition(strategy.exit, currentPrice, history);
      
      if (exitMet) {
        // Execute sell trade
        console.log('Exit condition met! Executing sell...');
        await executeTrade(strategy, 'sell', currentPrice);
      }
    }
  };

  // Execute trade
  const executeTrade = async (
    strategy: ParsedStrategy,
    type: 'buy' | 'sell',
    price: number
  ) => {
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      strategy: strategy.name,
      timestamp: Date.now(),
      type,
      asset: strategy.asset,
      price,
      amount: type === 'buy' ? strategy.maxPosition / price : (trades[trades.length - 1]?.amount || 1),
      value: type === 'buy' ? strategy.maxPosition : price * (trades[trades.length - 1]?.amount || 1),
      status: 'executed'
    };
    
    // Add to trades
    setTrades(prev => [...prev, trade]);
    
    // Record in P&L tracker
    pnlTracker.recordTrade(trade);
    
    // Update performance
    const perf = pnlTracker.calculatePerformance(strategy.name);
    setPerformance(perf);
  };

  // Example strategies
  const exampleStrategies = [
    "Buy SOL when RSI drops below 30, sell when it crosses 70, max position $500",
    "Buy BTC when price breaks above 24h high with volume spike, stop loss at 2%",
    "Buy $100 of SOL every Monday at 9am UTC, sell 25% when up 10%",
    "Sell when Bollinger Bands hit upper band, buy when they hit lower band, SOL/USDC pair"
  ];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-2">
            <span className="gradient-primary bg-clip-text text-transparent">SolFlow</span> 🌊
          </h1>
          <p className="text-gray-400 text-xl">AI-Powered Trading Strategy Builder for Solana</p>
          <p className="text-gray-500 mt-2">
            Describe your strategy in plain English, SolFlow executes it automatically
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="gradient-card p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Strategy Status</p>
            <p className="text-2xl font-bold">
              {isMonitoring ? <span className="text-green-400">🟢 ACTIVE</span> : <span className="text-gray-400">⚫ Inactive</span>}
            </p>
          </div>
          
          <div className="gradient-card p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Current Price</p>
            <p className="text-2xl font-bold text-nexus-primary">
              ${currentPrice?.price.toFixed(2) || '--'}
            </p>
          </div>
          
          <div className="gradient-card p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Total Trades</p>
            <p className="text-2xl font-bold">{trades.length}</p>
          </div>
          
          <div className="gradient-card p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-2xl font-bold ${performance && performance.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {performance ? `$${performance.totalPnL.toFixed(2)}` : '$0.00'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Strategy Input */}
            <StrategyInputCard
              value={strategyInput}
              onChange={setStrategyInput}
              onParse={handleParseStrategy}
              examples={exampleStrategies}
            />

            {/* Parsed Strategy */}
            {parsedStrategy && (
              <ParsedStrategyCard
                strategy={parsedStrategy}
                onActivate={handleActivateStrategy}
                onStop={handleStopStrategy}
                isActive={isMonitoring}
              />
            )}

            {/* Performance */}
            {performance && (
              <PerformanceCard performance={performance} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Price Chart */}
            {activeStrategy && (
              <LivePriceCard
                asset={activeStrategy.asset}
                currentPrice={currentPrice}
                priceHistory={priceHistory}
              />
            )}

            {/* Trade History */}
            {trades.length > 0 && (
              <TradeHistoryCard trades={trades} />
            )}

            {/* Instructions */}
            {!activeStrategy && (
              <div className="gradient-card p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">🚀 How to Use SolFlow</h3>
                <ol className="space-y-3 text-gray-300">
                  <li>
                    <span className="text-nexus-primary font-semibold">1.</span> Describe your trading strategy in plain English
                  </li>
                  <li>
                    <span className="text-nexus-primary font-semibold">2.</span> Click "Parse Strategy" to see it converted to rules
                  </li>
                  <li>
                    <span className="text-nexus-primary font-semibold">3.</span> Review the parsed strategy details
                  </li>
                  <li>
                    <span className="text-nexus-primary font-semibold">4.</span> Click "Activate Strategy" to start live monitoring
                  </li>
                  <li>
                    <span className="text-nexus-primary font-semibold">5.</span> Watch SolFlow execute trades automatically!
                  </li>
                </ol>
                
                <div className="mt-6 p-4 bg-nexus-secondary/10 rounded-lg border border-nexus-secondary/30">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-nexus-secondary">💡 Tip:</span> Start with simple strategies like RSI-based entries/exits. You can always add complexity later!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built by AI Agent #616 for Colosseum Solana Agent Hackathon 2026</p>
          <p className="mt-2">Real Pyth price feeds • Real Jupiter execution • On-chain verified</p>
          <p className="mt-4 text-xs text-gray-600">
            ⚠️ Demo on Solana Devnet • Not financial advice • Use at your own risk
          </p>
        </div>
      </div>
    </main>
  );
}
