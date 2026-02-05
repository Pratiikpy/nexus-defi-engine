import { PriceData } from '@/lib/pyth-integration';
import { useEffect, useRef } from 'react';

interface LivePriceCardProps {
  asset: string;
  currentPrice: PriceData | null;
  priceHistory: number[];
}

export default function LivePriceCard({ asset, currentPrice, priceHistory }: LivePriceCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || priceHistory.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions
    const padding = 20;
    const width = canvas.width - (padding * 2);
    const height = canvas.height - (padding * 2);
    
    // Find min/max for scaling
    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);
    const priceRange = maxPrice - minPrice || 1;
    
    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = '#14F195';
    ctx.lineWidth = 2;
    
    priceHistory.forEach((price, i) => {
      const x = padding + (i / (priceHistory.length - 1)) * width;
      const y = padding + height - ((price - minPrice) / priceRange) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw current price dot
    const lastX = padding + width;
    const lastY = padding + height - ((priceHistory[priceHistory.length - 1] - minPrice) / priceRange) * height;
    
    ctx.beginPath();
    ctx.fillStyle = '#14F195';
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    
  }, [priceHistory]);
  
  const priceChange = priceHistory.length >= 2 
    ? ((priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0]) * 100
    : 0;
  
  return (
    <div className="gradient-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📈 Live Price</h2>
        <div className="text-right">
          <p className="text-sm text-gray-400">{asset}</p>
          <p className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-4xl font-bold text-nexus-primary">
          ${currentPrice?.price.toFixed(2) || '--'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Updated: {currentPrice ? new Date(currentPrice.timestamp).toLocaleTimeString() : '--'}
        </p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="w-full h-48 bg-nexus-card/50 rounded-lg"
      />
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400">Min</p>
          <p className="text-sm font-semibold">
            ${priceHistory.length > 0 ? Math.min(...priceHistory).toFixed(2) : '--'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Max</p>
          <p className="text-sm font-semibold">
            ${priceHistory.length > 0 ? Math.max(...priceHistory).toFixed(2) : '--'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Avg</p>
          <p className="text-sm font-semibold">
            ${priceHistory.length > 0 ? (priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length).toFixed(2) : '--'}
          </p>
        </div>
      </div>
    </div>
  );
}
