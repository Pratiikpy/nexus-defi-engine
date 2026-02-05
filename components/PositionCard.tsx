import { Position } from '@/lib/defi-engine';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{position.protocol}</h3>
          <p className="text-gray-400 text-sm">{position.pool}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-nexus-primary">{position.apy.toFixed(1)}%</p>
          <p className="text-gray-400 text-xs">APY</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount</span>
          <span className="text-white font-medium">{position.amount} tokens</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Value</span>
          <span className="text-white font-medium">${position.value.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Daily Earnings</span>
          <span className="text-green-400 font-medium">
            ${((position.value * position.apy) / 365 / 100).toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 bg-nexus-card hover:bg-gray-800 rounded-lg transition">
          Withdraw
        </button>
        <button className="flex-1 py-2 bg-nexus-card hover:bg-gray-800 rounded-lg transition">
          Add More
        </button>
      </div>
    </div>
  );
}
