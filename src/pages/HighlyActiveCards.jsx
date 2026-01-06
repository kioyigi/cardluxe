import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Flame, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

function calculateActivityScore(card) {
  const frequencyScore = Math.log(1 + (card.frequency_count || 0));
  
  const growthRate = card.previous_frequency > 0
    ? (card.frequency_count - card.previous_frequency) / card.previous_frequency
    : card.frequency_count > 0 ? 1 : 0;
  
  let priceSpread = 0;
  if (card.sampled_prices && card.sampled_prices.length >= 3) {
    const sorted = [...card.sampled_prices].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const median = sorted[Math.floor(sorted.length / 2)];
    const iqr = q3 - q1;
    priceSpread = median > 0 ? iqr / median : 0;
  }
  
  return frequencyScore + (1.2 * growthRate) + (0.3 * priceSpread);
}

function calculateMedianPrice(prices) {
  if (!prices || prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export default function HighlyActiveCards() {
  const queryClient = useQueryClient();
  const { data: snapshots = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['highly-active-cards'],
    queryFn: () => base44.entities.Snapshot.filter({}, '-timestamp', 5000),
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });

  const rankedCards = useMemo(() => {
    const latestTimestamp = snapshots[0]?.timestamp;
    if (!latestTimestamp) return [];
    
    const latestCards = snapshots.filter(s => s.timestamp === latestTimestamp);
    
    const cardsWithScores = latestCards.map(card => ({
      ...card,
      activityScore: calculateActivityScore(card),
      medianPrice: calculateMedianPrice(card.sampled_prices),
      growthRate: card.previous_frequency > 0
        ? ((card.frequency_count - card.previous_frequency) / card.previous_frequency) * 100
        : card.frequency_count > 0 ? 100 : 0
    }));
    
    return cardsWithScores
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 500);
  }, [snapshots]);

  const lastUpdated = snapshots[0]?.timestamp 
    ? new Date(snapshots[0].timestamp).toLocaleString()
    : 'Never';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <h1 className="text-4xl font-bold text-white">Highly Active Raw Cards</h1>
              </div>
              <p className="text-zinc-400">
                Top {rankedCards.length} most active raw Pokémon cards on the market
              </p>
            </div>
            <Button
              onClick={async () => {
                await base44.functions.invoke('getHighlyActiveCards');
                queryClient.invalidateQueries({ queryKey: ['highly-active-cards'] });
              }}
              disabled={isFetching}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-zinc-500">Last Updated: </span>
              <span className="text-white">{lastUpdated}</span>
            </div>
            <div>
              <span className="text-zinc-500">Cards Tracked: </span>
              <span className="text-white">{rankedCards.length}</span>
            </div>
          </div>
        </motion.div>

        {rankedCards.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <Flame className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg mb-2">No market data available yet</p>
            <p className="text-zinc-500">The system will collect data automatically every 6 hours</p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-zinc-400 font-semibold text-sm">Rank</th>
                    <th className="px-6 py-4 text-left text-zinc-400 font-semibold text-sm w-16"></th>
                    <th className="px-6 py-4 text-left text-zinc-400 font-semibold text-sm">Card</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Activity</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Frequency</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">24h Change</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Median Price</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Auction %</th>
                    <th className="px-6 py-4 text-right text-zinc-400 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCards.map((card, index) => (
                    <motion.tr
                      key={card.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <Flame className={`h-4 w-4 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-orange-500' :
                              'text-red-500'
                            }`} />
                          )}
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
                          {card.tcgdex_image_url ? (
                            <img 
                              src={card.tcgdex_image_url} 
                              alt={card.card_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-zinc-600 text-xs">No img</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">
                            {card.card_name} {card.card_number}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {card.activityScore.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-semibold">
                        {card.frequency_count}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {card.growthRate !== 0 ? (
                          <div className={`flex items-center justify-center gap-1 ${
                            card.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {card.growthRate > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-semibold">
                              {Math.abs(card.growthRate).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-white font-semibold">
                        ${card.medianPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-zinc-400">
                          {(card.auction_ratio * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={card.search_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            eBay
                          </Button>
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}