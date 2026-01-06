import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, Clock, Users, Gavel, AlertCircle,
  CheckCircle2, Trophy, TrendingUp, Heart
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuctionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const auctionId = urlParams.get('id');
  
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  // Fetch auction details
  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const auctions = await base44.entities.AuctionItem.filter({ id: auctionId });
      return auctions[0];
    },
    enabled: !!auctionId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch bids for this auction
  const { data: bids = [] } = useQuery({
    queryKey: ['bids', auctionId],
    queryFn: () => base44.entities.Bid.filter({ auction_item_id: auctionId }, '-created_date', 20),
    enabled: !!auctionId,
    refetchInterval: 5000,
  });

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (amount) => {
      // Create the bid
      await base44.entities.Bid.create({
        auction_item_id: auctionId,
        bidder_email: user.email,
        bidder_name: user.full_name,
        amount: amount,
        is_winning: true
      });

      // Update auction current price and bid count
      await base44.entities.AuctionItem.update(auctionId, {
        current_price: amount,
        bid_count: (auction.bid_count || 0) + 1
      });

      // Mark previous winning bid as not winning
      const previousBids = await base44.entities.Bid.filter({ 
        auction_item_id: auctionId, 
        is_winning: true 
      });
      for (const bid of previousBids) {
        if (bid.bidder_email !== user.email) {
          await base44.entities.Bid.update(bid.id, { is_winning: false });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['bids', auctionId] });
      setBidAmount('');
      toast.success('Bid placed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to place bid. Please try again.');
    }
  });

  // Countdown timer
  useEffect(() => {
    if (!auction) return;

    const calculateTimeLeft = () => {
      const end = new Date(auction.auction_end).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsUrgent(diff < 1000 * 60 * 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const handlePlaceBid = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = (auction.current_price || auction.starting_price) + 1;

    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    placeBidMutation.mutate(amount);
  };

  const conditionLabels = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    excellent: 'Excellent',
    good: 'Good',
    played: 'Played',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[2.5/3.5] bg-zinc-800/50 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 bg-zinc-800/50 rounded-lg w-3/4 animate-pulse" />
              <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-4">Auction not found</p>
          <Link to={createPageUrl("Auctions")}>
            <Button variant="outline" className="border-zinc-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Auctions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = auction.current_price || auction.starting_price;
  const minNextBid = currentPrice + 1;
  const isActive = auction.status === 'active' && new Date(auction.auction_end) > new Date();

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back button */}
        <Link 
          to={createPageUrl("Auctions")}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Card Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="sticky top-8">
              <div className="relative aspect-[2.5/3.5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                {auction.card_image ? (
                  <img
                    src={auction.card_image}
                    alt={auction.card_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-500">{auction.card_name}</span>
                  </div>
                )}
              </div>

              {/* View Card Details */}
              <Link 
                to={createPageUrl("CardDetail") + `?cardId=${auction.card_id}`}
                className="block mt-4"
              >
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                  View Card Details
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Auction Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isUrgent && isActive && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    Ending Soon!
                  </Badge>
                )}
                {auction.condition && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {conditionLabels[auction.condition]}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {auction.card_name}
              </h1>
              <p className="text-zinc-400">{auction.card_set}</p>
            </div>

            {/* Timer */}
            <div className={`rounded-xl p-6 ${isUrgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-zinc-900/50 border border-zinc-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`h-5 w-5 ${isUrgent ? 'text-red-400' : 'text-zinc-400'}`} />
                <span className="text-zinc-400">Time Remaining</span>
              </div>
              <p className={`text-3xl font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Ends {format(new Date(auction.auction_end), "PPp")}
              </p>
            </div>

            {/* Current Bid */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Current Bid</p>
                  <p className="text-4xl font-bold text-amber-400">
                    ${currentPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Total Bids</p>
                  <p className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-zinc-400" />
                    {auction.bid_count || 0}
                  </p>
                </div>
              </div>

              {auction.buy_now_price && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm mb-1">Buy Now Price</p>
                  <p className="text-xl font-semibold text-emerald-400">
                    ${auction.buy_now_price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Bidding Section */}
            {isActive ? (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-white font-semibold mb-4">Place Your Bid</h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <Input
                      type="number"
                      min={minNextBid}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={minNextBid.toFixed(2)}
                      className="pl-8 bg-zinc-800 border-zinc-700 text-white text-lg h-12"
                    />
                  </div>
                  <Button
                    onClick={handlePlaceBid}
                    disabled={placeBidMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 font-semibold px-8 h-12"
                  >
                    <Gavel className="h-5 w-5 mr-2" />
                    {placeBidMutation.isPending ? 'Placing...' : 'Place Bid'}
                  </Button>
                </div>
                <p className="text-zinc-500 text-sm mt-3">
                  Minimum bid: ${minNextBid.toFixed(2)}
                </p>

                {auction.buy_now_price && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Buy Now for ${auction.buy_now_price.toFixed(2)}
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-amber-400 mb-4" />
                <p className="text-white text-xl font-semibold mb-2">Auction Ended</p>
                <p className="text-zinc-400">
                  Final price: <span className="text-amber-400 font-bold">${currentPrice.toFixed(2)}</span>
                </p>
              </div>
            )}

            {/* Bid History */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold">Bid History</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {bids.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    No bids yet. Be the first to bid!
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {bids.map((bid, index) => (
                      <div key={bid.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {index === 0 && (
                            <Trophy className="h-5 w-5 text-amber-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {bid.bidder_name || bid.bidder_email.split('@')[0]}
                            </p>
                            <p className="text-zinc-500 text-sm">
                              {format(new Date(bid.created_date), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold ${index === 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                          ${bid.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}