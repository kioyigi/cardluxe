import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PriceHistoryChart({ data, loading }) {
  if (loading) {
    return (
      <div className="h-64 bg-zinc-800/50 rounded-xl animate-pulse" />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
        <p className="text-zinc-500">No price history available yet</p>
      </div>
    );
  }

  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(1) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-zinc-400 text-xs mb-1">
            {format(new Date(label), 'MMM d, yyyy')}
          </p>
          <p className="text-amber-400 font-bold">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {priceChange > 0 ? (
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          ) : priceChange < 0 ? (
            <TrendingDown className="h-5 w-5 text-red-400" />
          ) : (
            <Minus className="h-5 w-5 text-zinc-400" />
          )}
          <span className={`font-medium ${
            priceChange > 0 ? 'text-emerald-400' : priceChange < 0 ? 'text-red-400' : 'text-zinc-400'
          }`}>
            {priceChange >= 0 ? '+' : ''}{percentChange}%
          </span>
        </div>
        <span className="text-zinc-500 text-sm">
          Last {data.length} sales
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              stroke="#71717a"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              stroke="#71717a"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}