import { ParsedStrategy } from '@/lib/strategy-engine';

interface ParsedStrategyCardProps {
  strategy: ParsedStrategy;
  onActivate: () => void;
  onStop: () => void;
  isActive: boolean;
}

export default function ParsedStrategyCard({ strategy, onActivate, onStop, isActive }: ParsedStrategyCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl border-2 border-nexus-primary/30">
      <h2 className="text-2xl font-bold mb-4">🎯 Parsed Strategy</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Strategy Name</p>
          <p className="text-lg font-semibold">{strategy.name}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Asset</p>
          <p className="text-lg font-semibold text-nexus-primary">{strategy.asset}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Entry Condition</p>
            <div className="mt-2 p-3 bg-green-400/10 rounded-lg border border-green-400/30">
              <p className="text-sm">
                {strategy.entry.indicator && <span className="font-semibold">{strategy.entry.indicator}</span>}
                {' '}{strategy.entry.condition} {strategy.entry.value}
                {strategy.entry.timeframe && <span className="text-xs text-gray-500"> ({strategy.entry.timeframe})</span>}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Exit Condition</p>
            <div className="mt-2 p-3 bg-red-400/10 rounded-lg border border-red-400/30">
              <p className="text-sm">
                {strategy.exit.indicator && <span className="font-semibold">{strategy.exit.indicator}</span>}
                {' '}{strategy.exit.condition} {strategy.exit.value}
                {strategy.exit.timeframe && <span className="text-xs text-gray-500"> ({strategy.exit.timeframe})</span>}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Max Position</p>
            <p className="text-lg font-semibold">${strategy.maxPosition.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Execution Type</p>
            <p className="text-lg font-semibold capitalize">{strategy.executionType}</p>
          </div>
        </div>
        
        {(strategy.stopLoss || strategy.takeProfit) && (
          <div className="grid grid-cols-2 gap-4">
            {strategy.stopLoss && (
              <div>
                <p className="text-sm text-gray-400">Stop Loss</p>
                <p className="text-lg font-semibold text-red-400">{strategy.stopLoss}%</p>
              </div>
            )}
            
            {strategy.takeProfit && (
              <div>
                <p className="text-sm text-gray-400">Take Profit</p>
                <p className="text-lg font-semibold text-green-400">{strategy.takeProfit}%</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex gap-3">
        {!isActive ? (
          <button
            onClick={onActivate}
            className="flex-1 py-3 gradient-primary text-black font-semibold rounded-lg hover:opacity-90 transition glow-primary"
          >
            ▶ Activate Strategy
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
          >
            ⏸ Stop Strategy
          </button>
        )}
      </div>
    </div>
  );
}
