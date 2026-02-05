import { StrategyPerformance } from '@/lib/strategy-engine';

interface PerformanceCardProps {
  performance: StrategyPerformance;
}

export default function PerformanceCard({ performance }: PerformanceCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">📊 Performance Metrics</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-2xl font-bold">{performance.totalTrades}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Win Rate</p>
            <p className="text-2xl font-bold text-nexus-primary">{performance.winRate.toFixed(1)}%</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Total P&L</p>
          <p className={`text-3xl font-bold ${performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${performance.totalPnL.toFixed(2)}
            <span className="text-lg ml-2">
              ({performance.totalPnLPercent >= 0 ? '+' : ''}{performance.totalPnLPercent.toFixed(2)}%)
            </span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Avg Trade</p>
            <p className={`text-xl font-semibold ${performance.averageTrade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${performance.averageTrade.toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Max Drawdown</p>
            <p className="text-xl font-semibold text-red-400">
              {performance.maxDrawdown.toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Sharpe Ratio</p>
          <p className="text-xl font-semibold text-nexus-primary">
            {performance.sharpeRatio.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
