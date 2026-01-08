import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Flame, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

export default function HighlyActiveCards() {
  const queryClient = useQueryClient();
  const { data: trendingCards = [], isLoading, isFetching } = useQuery({
    queryKey: ['trending-cards'],
    queryFn: () => base44.entities.TrendingCard.list('rank', 500),
    initialData: [],
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!isLoading && trendingCards.length === 0) {
      base44.functions.invoke('getTrendingCards').then(() => {
        queryClient.invalidateQueries({ queryKey: ['trending-cards'] });
      }).catch(err => {
        console.error('Failed to fetch trending cards:', err);
      });
    }
  }, [isLoading, trendingCards.length, queryClient]);

  const lastUpdated = trendingCards[0]?.last_updated 
    ? new Date(trendingCards[0].last_updated).toLocaleString()
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
                <h1 className="text-4xl font-bold text-white">Trending Cards</h1>
              </div>
              <p className="text-zinc-400">
                Top {trendingCards.length} trending Pokémon cards ranked by market activity
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await base44.functions.invoke('getTrendingCards');
                  queryClient.invalidateQueries({ queryKey: ['trending-cards'] });
                } catch (err) {
                  console.error('Failed to refresh:', err);
                }
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
              <span className="text-white">{trendingCards.length}</span>
            </div>
          </div>
        </motion.div>

        {trendingCards.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <Flame className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg mb-2">No trending data available yet</p>
            <p className="text-zinc-500">Click refresh to fetch the latest trending cards</p>
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
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Type</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Rarity</th>
                    <th className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">Price</th>
                    <th className="px-6 py-4 text-right text-zinc-400 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingCards.map((card, index) => (
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
                          <span className="text-white font-bold">{card.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
                          {card.card_image_url ? (
                            <img 
                              src={card.card_image_url} 
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
                          <p className="text-white font-medium">{card.card_name}</p>
                          <p className="text-zinc-500 text-sm">#{card.card_number}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                          {card.card_type || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {card.card_rarity || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center text-white font-semibold">
                        ${card.card_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`https://www.tcgdex.net/cards/${card.tcgdex_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
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