import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  User, Heart, Gavel, Clock, Trophy, 
  Eye, LogOut, Settings, Bell
} from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch user's watchlist
  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist', user?.email],
    queryFn: () => base44.entities.WatchlistItem.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Fetch user's bids
  const { data: userBids = [] } = useQuery({
    queryKey: ['userBids', user?.email],
    queryFn: () => base44.entities.Bid.filter({ bidder_email: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  // Fetch auctions for those bids
  const { data: bidAuctions = [] } = useQuery({
    queryKey: ['bidAuctions', userBids],
    queryFn: async () => {
      const auctionIds = [...new Set(userBids.map(b => b.auction_item_id))];
      const auctions = [];
      for (const id of auctionIds.slice(0, 20)) {
        const [auction] = await base44.entities.AuctionItem.filter({ id });
        if (auction) auctions.push(auction);
      }
      return auctions;
    },
    enabled: userBids.length > 0,
  });

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Home"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats
  const winningBids = userBids.filter(b => b.is_winning);
  const totalBidAmount = userBids.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-black">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.full_name || 'Collector'}</h1>
                <p className="text-zinc-400">{user.email}</p>
                <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-400">
                  {user.role === 'admin' ? 'Admin' : 'Collector'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Heart, label: 'Watchlist', value: watchlist.length, color: 'text-red-400' },
              { icon: Gavel, label: 'Total Bids', value: userBids.length, color: 'text-amber-400' },
              { icon: Trophy, label: 'Winning', value: winningBids.length, color: 'text-emerald-400' },
              { icon: Eye, label: 'Watching', value: watchlist.length, color: 'text-purple-400' },
            ].map((stat, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="watchlist"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg px-6 py-3"
            >
              <Heart className="h-4 w-4 mr-2" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger 
              value="bids"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg px-6 py-3"
            >
              <Gavel className="h-4 w-4 mr-2" />
              My Bids
            </TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            {watchlist.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Heart className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400 text-lg mb-2">Your watchlist is empty</p>
                <p className="text-zinc-500 mb-6">Start adding cards to track their prices</p>
                <Link to={createPageUrl("Cards")}>
                  <Button className="bg-amber-500 text-black hover:bg-amber-400">
                    Browse Cards
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlist.map((item) => (
                  <Link 
                    key={item.id} 
                    to={createPageUrl("CardDetail") + `?cardId=${item.card_id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all">
                      {item.card_image ? (
                        <img
                          src={item.card_image}
                          alt={item.card_name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <span className="text-zinc-500 text-xs text-center px-2">{item.card_name}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <p className="text-white text-sm font-medium truncate">{item.card_name}</p>
                        {item.card_set && (
                          <p className="text-zinc-400 text-xs truncate">{item.card_set}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids">
            {userBids.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Gavel className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400 text-lg mb-2">No bids yet</p>
                <p className="text-zinc-500 mb-6">Join an auction to start bidding</p>
                <Link to={createPageUrl("Auctions")}>
                  <Button className="bg-amber-500 text-black hover:bg-amber-400">
                    View Auctions
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userBids.map((bid) => {
                  const auction = bidAuctions.find(a => a.id === bid.auction_item_id);
                  return (
                    <Link 
                      key={bid.id}
                      to={createPageUrl("AuctionDetail") + `?id=${bid.auction_item_id}`}
                    >
                      <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {auction?.card_image && (
                              <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                <img 
                                  src={auction.card_image} 
                                  alt={auction.card_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium truncate">
                                  {auction?.card_name || 'Auction Item'}
                                </h3>
                                {bid.is_winning && (
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Winning
                                  </Badge>
                                )}
                              </div>
                              <p className="text-zinc-500 text-sm">
                                {format(new Date(bid.created_date), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-zinc-500 text-sm">Your Bid</p>
                              <p className={`text-xl font-bold ${bid.is_winning ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                ${bid.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}