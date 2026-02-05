'use client';

import { useEffect, useState } from 'react';
import { YieldAggregator, RebalancingEngine, type ProtocolYield, type Position } from '@/lib/defi-engine';
import YieldCard from '@/components/YieldCard';
import PositionCard from '@/components/PositionCard';
import RecommendationCard from '@/components/RecommendationCard';
import StatsCard from '@/components/StatsCard';

export default function Home() {
  const [yields, setYields] = useState<ProtocolYield[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [totalValue, setTotalValue] = useState(0);
  const [totalApy, setTotalApy] = useState(0);

  useEffect(() => {
    loadData();
  }, [riskTolerance]);

  const loadData = async () => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
      const aggregator = new YieldAggregator(rpcUrl);
      const engine = new RebalancingEngine(rpcUrl);

      // Fetch all yields
      const allYields = await aggregator.getAllYields();
      setYields(allYields.sort((a, b) => b.apy - a.apy).slice(0, 8));

      // Simulate user positions
      const mockPositions: Position[] = [
        {
          protocol: 'Marinade',
          pool: 'mSOL Stake Pool',
          amount: 10,
          value: 1500,
          apy: 7.8
        },
        {
          protocol: 'Raydium',
          pool: 'SOL-USDC',
          amount: 5,
          value: 1200,
          apy: 23.4
        }
      ];
      setPositions(mockPositions);

      const total = mockPositions.reduce((sum, p) => sum + p.value, 0);
      setTotalValue(total);
      
      const avgApy = mockPositions.reduce((sum, p) => sum + (p.apy * p.value / total), 0);
      setTotalApy(avgApy);

      // Get rebalancing recommendations
      const recs = await engine.analyzePositions(mockPositions, riskTolerance);
      setRecommendations(recs);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DeFi data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="gradient-primary bg-clip-text text-transparent">Nexus</span> DeFi Engine
            </h1>
            <p className="text-gray-400">AI-Powered Yield Optimizer for Solana</p>
          </div>
          <button className="px-6 py-3 gradient-primary text-black font-semibold rounded-lg glow-primary hover:opacity-90 transition">
            Connect Wallet
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Portfolio"
            value={`$${totalValue.toLocaleString()}`}
            change="+12.5%"
            positive={true}
          />
          <StatsCard 
            title="Average APY"
            value={`${totalApy.toFixed(2)}%`}
            change="+3.2%"
            positive={true}
          />
          <StatsCard 
            title="Active Positions"
            value={positions.length.toString()}
            change="2 protocols"
            positive={true}
          />
          <StatsCard 
            title="Recommendations"
            value={recommendations.length.toString()}
            change="Auto-rebalance ready"
            positive={true}
          />
        </div>

        {/* Risk Tolerance Selector */}
        <div className="gradient-card p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold mb-4">Risk Tolerance</h3>
          <div className="flex gap-4">
            {(['conservative', 'balanced', 'aggressive'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskTolerance(risk)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                  riskTolerance === risk
                    ? 'gradient-primary text-black'
                    : 'bg-nexus-card text-gray-400 hover:bg-gray-800'
                }`}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rebalancing Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🤖 AI Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Current Positions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📊 Your Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positions.map((position, idx) => (
              <PositionCard key={idx} position={position} />
            ))}
          </div>
        </div>

        {/* Top Yields */}
        <div>
          <h2 className="text-2xl font-bold mb-4">🔥 Top Yields Across Solana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {yields.map((yield_, idx) => (
              <YieldCard key={idx} yield_={yield_} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built by AI Agent #616 for Colosseum Solana Agent Hackathon 2026</p>
          <p className="mt-2">Integrates with Jupiter • Kamino • Marinade • Raydium</p>
        </div>
      </div>
    </main>
  );
}
