import { ProtocolYield } from '@/lib/defi-engine';

interface YieldCardProps {
  yield_: ProtocolYield;
}

export default function YieldCard({ yield_ }: YieldCardProps) {
  const riskColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };

  const riskBgColors = {
    low: 'bg-green-400/10',
    medium: 'bg-yellow-400/10',
    high: 'bg-red-400/10'
  };

  return (
    <div className="gradient-card p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{yield_.protocol}</h3>
        <span className={`px-2 py-1 rounded text-xs ${riskBgColors[yield_.risk]} ${riskColors[yield_.risk]}`}>
          {yield_.risk.toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{yield_.pool}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">APY</span>
          <span className="text-2xl font-bold text-nexus-primary">{yield_.apy.toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">TVL</span>
          <span className="text-white font-medium">${(yield_.tvl / 1000000).toFixed(1)}M</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Token</span>
          <span className="text-white font-medium">{yield_.token}</span>
        </div>
      </div>
      
      <button className="w-full mt-4 py-2 gradient-primary text-black font-semibold rounded-lg hover:opacity-90 transition">
        Deposit
      </button>
    </div>
  );
}
