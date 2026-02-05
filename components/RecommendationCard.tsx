import { RebalanceRecommendation } from '@/lib/defi-engine';

interface RecommendationCardProps {
  recommendation: RebalanceRecommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const apyGain = recommendation.to.apy - recommendation.from.apy;

  return (
    <div className="gradient-card p-6 rounded-xl border-2 border-nexus-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-nexus-primary/20 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Rebalance Opportunity</h3>
            <p className="text-sm text-gray-400">AI-recommended</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-400">+{apyGain.toFixed(1)}%</p>
          <p className="text-xs text-gray-400">APY gain</p>
        </div>
      </div>

      <div className="bg-nexus-card/50 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-400">From</p>
            <p className="font-medium">{recommendation.from.protocol}</p>
            <p className="text-sm text-gray-500">{recommendation.from.pool}</p>
          </div>
          <div className="text-center px-4">
            <span className="text-2xl">→</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">To</p>
            <p className="font-medium">{recommendation.to.protocol}</p>
            <p className="text-sm text-gray-500">{recommendation.to.pool}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Amount to move</span>
            <span className="text-white">{recommendation.amount.toFixed(2)} tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Expected annual gain</span>
            <span className="text-green-400 font-medium">${recommendation.expectedGain.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        💡 {recommendation.reasoning}
      </p>

      <div className="flex gap-3">
        <button className="flex-1 py-3 gradient-primary text-black font-semibold rounded-lg hover:opacity-90 transition glow-primary">
          Execute Rebalance
        </button>
        <button className="px-6 py-3 bg-nexus-card hover:bg-gray-800 rounded-lg transition">
          Dismiss
        </button>
      </div>
    </div>
  );
}
