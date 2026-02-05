interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

export default function StatsCard({ title, value, change, positive }: StatsCardProps) {
  return (
    <div className="gradient-card p-6 rounded-xl">
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </p>
    </div>
  );
}
