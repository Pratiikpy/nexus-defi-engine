interface StrategyInputCardProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  examples: string[];
}

export default function StrategyInputCard({ value, onChange, onParse, examples }: StrategyInputCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">📝 Describe Your Strategy</h2>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: Buy SOL when RSI drops below 30, sell when it crosses 70, max position $500"
        className="w-full h-32 px-4 py-3 bg-nexus-card text-white rounded-lg border border-gray-700 focus:border-nexus-primary focus:outline-none resize-none"
      />
      
      <button
        onClick={onParse}
        className="w-full mt-4 py-3 gradient-primary text-black font-semibold rounded-lg hover:opacity-90 transition glow-primary"
      >
        Parse Strategy
      </button>
      
      <div className="mt-6">
        <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => onChange(example)}
              className="w-full text-left px-4 py-2 bg-nexus-card hover:bg-gray-800 rounded-lg text-sm text-gray-300 transition"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
