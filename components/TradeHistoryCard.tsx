import { Trade } from '@/lib/strategy-engine';

interface TradeHistoryCardProps {
  trades: Trade[];
}

export default function TradeHistoryCard({ trades }: TradeHistoryCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">📜 Trade History</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {trades.slice().reverse().map((trade, idx) => (
          <div
            key={trade.id}
            className={`p-4 rounded-lg border ${
              trade.type === 'buy'
                ? 'bg-green-400/10 border-green-400/30'
                : 'bg-red-400/10 border-red-400/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {trade.type === 'buy' ? '🟢 BUY' : '🔴 SELL'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Price</p>
                <p className="font-semibold">${trade.price.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="font-semibold">{trade.amount.toFixed(4)}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Value</p>
                <p className="font-semibold">${trade.value.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Status</p>
                <p className="font-semibold text-green-400 capitalize">{trade.status}</p>
              </div>
            </div>
            
            {trade.txSignature && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500">TX: {trade.txSignature.slice(0, 8)}...{trade.txSignature.slice(-8)}</p>
              </div>
            )}
          </div>
        ))}
        
        {trades.length === 0 && (
          <p className="text-center text-gray-500 py-8">No trades yet</p>
        )}
      </div>
    </div>
  );
}
