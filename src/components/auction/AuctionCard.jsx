import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Clock, Flame, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function AuctionCard({ item, index = 0 }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(item.auction_end).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsUrgent(diff < 1000 * 60 * 60); // Less than 1 hour

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [item.auction_end]);

  const conditionColors = {
    mint: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    near_mint: 'bg-green-500/20 text-green-400 border-green-500/30',
    excellent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    good: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    played: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={createPageUrl("AuctionDetail") + `?id=${item.id}`}>
        <div className="group relative bg-zinc-900/80 rounded-2xl border border-zinc-800 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
          {/* Urgent badge */}
          {isUrgent && item.status === 'active' && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                Ending Soon
              </Badge>
            </div>
          )}

          {/* Card image */}
          <div className="aspect-[2.5/3.5] relative overflow-hidden">
            {item.card_image ? (
              <img
                src={item.card_image}
                alt={item.card_name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-500">{item.card_name}</span>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Info section */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-white font-semibold truncate">{item.card_name}</h3>
              <p className="text-zinc-500 text-sm truncate">{item.card_set}</p>
            </div>

            {/* Condition & Bids */}
            <div className="flex items-center gap-2">
              {item.condition && (
                <Badge variant="outline" className={conditionColors[item.condition]}>
                  {item.condition.replace('_', ' ')}
                </Badge>
              )}
              <div className="flex items-center text-zinc-400 text-sm">
                <Users className="h-3 w-3 mr-1" />
                {item.bid_count || 0} bids
              </div>
            </div>

            {/* Price & Time */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div>
                <p className="text-zinc-500 text-xs">Current Bid</p>
                <p className="text-amber-400 font-bold text-lg">
                  ${(item.current_price || item.starting_price).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs">Time Left</p>
                <p className={`font-medium ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                  <Clock className="h-3 w-3 inline mr-1" />
                  {timeLeft}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}