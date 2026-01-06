import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuctionCard from '@/components/auction/AuctionCard';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Gavel, Clock, Calendar, Trophy, Flame, History } from 'lucide-react';

export default function Auctions() {
  const [activeTab, setActiveTab] = useState('active');

  // Fetch active auctions
  const { data: activeAuctions = [], isLoading: loadingActive } = useQuery({
    queryKey: ['auctions', 'active'],
    queryFn: () => base44.entities.AuctionItem.filter({ status: 'active' }, 'auction_end'),
    initialData: [],
  });

  // Fetch upcoming auctions
  const { data: upcomingAuctions = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ['auctions', 'upcoming'],
    queryFn: () => base44.entities.AuctionItem.filter({ status: 'upcoming' }, 'auction_start'),
    initialData: [],
  });

  // Fetch ended auctions
  const { data: endedAuctions = [], isLoading: loadingEnded } = useQuery({
    queryKey: ['auctions', 'ended'],
    queryFn: () => base44.entities.AuctionItem.filter({ status: 'ended' }, '-auction_end', 20),
    initialData: [],
  });

  // Calculate next auction date (biweekly)
  const getNextAuctionDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(18, 0, 0, 0);
    
    // If within 2 weeks, return that Sunday
    return nextSunday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderAuctionGrid = (auctions, loading) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      );
    }

    if (auctions.length === 0) {
      return (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Gavel className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400 text-lg mb-2">No auctions available</p>
          <p className="text-zinc-500">Check back soon for our next biweekly auction!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {auctions.map((item, index) => (
          <AuctionCard key={item.id} item={item} index={index} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6">
            <Gavel className="h-4 w-4" />
            Biweekly Live Auctions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Card Auctions
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Bid on exclusive and rare Pokémon cards. Our auctions run every two weeks with new inventory.
          </p>
        </motion.div>

        {/* Next Auction Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 mb-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Next Auction Starts</p>
                <p className="text-white text-xl font-semibold">{getNextAuctionDate()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-6 border-l border-amber-500/20">
                <p className="text-3xl font-bold text-amber-400">{activeAuctions.length}</p>
                <p className="text-zinc-500 text-sm">Active</p>
              </div>
              <div className="text-center px-6 border-l border-amber-500/20">
                <p className="text-3xl font-bold text-white">{upcomingAuctions.length}</p>
                <p className="text-zinc-500 text-sm">Upcoming</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Flame, label: 'Hot Auctions', value: activeAuctions.filter(a => a.bid_count > 5).length, color: 'text-red-400' },
            { icon: Clock, label: 'Ending Soon', value: activeAuctions.filter(a => new Date(a.auction_end) - Date.now() < 3600000).length, color: 'text-amber-400' },
            { icon: Trophy, label: 'Total Bids', value: activeAuctions.reduce((sum, a) => sum + (a.bid_count || 0), 0), color: 'text-emerald-400' },
            { icon: History, label: 'Past Auctions', value: endedAuctions.length, color: 'text-purple-400' },
          ].map((stat, index) => (
            <div key={index} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="active"
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg py-3"
            >
              <Flame className="h-4 w-4 mr-2" />
              Active
              {activeAuctions.length > 0 && (
                <Badge className="ml-2 bg-amber-600/50 text-white">{activeAuctions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg py-3"
            >
              <Clock className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="ended"
              className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg py-3"
            >
              <History className="h-4 w-4 mr-2" />
              Ended
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {renderAuctionGrid(activeAuctions, loadingActive)}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {renderAuctionGrid(upcomingAuctions, loadingUpcoming)}
          </TabsContent>

          <TabsContent value="ended" className="mt-0">
            {renderAuctionGrid(endedAuctions, loadingEnded)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}