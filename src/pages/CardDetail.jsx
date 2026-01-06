import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceHistoryChart from '@/components/price/PriceHistoryChart';
import SoldListings from '@/components/price/SoldListings';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, Share2, TrendingUp, Gavel, 
  Package, Star, Zap, Shield, Droplet, Flame, Leaf
} from 'lucide-react';

export default function CardDetail() {
  const [searchParams] = useSearchParams();
  const urlCardId = searchParams.get('cardId');
  const storedCardId = sessionStorage.getItem('currentCardId');
  const cardSource = sessionStorage.getItem('cardSource');
  const storedCard = sessionStorage.getItem('currentCard');
  const cardId = urlCardId || storedCardId;
  
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [user, setUser] = useState(null);
  const [isEbayCard, setIsEbayCard] = useState(false);

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

  // Fetch card details from TCGdex or use stored eBay card
  useEffect(() => {
    if (!cardId) {
      setCard(null);
      setLoading(false);
      return;
    }
    
    const fetchCard = async () => {
      setLoading(true);
      
      // Check if it's an eBay card
      if (cardSource === 'ebay' && storedCard) {
        try {
          const ebayCard = JSON.parse(storedCard);
          setCard(ebayCard);
          setIsEbayCard(true);
          setLoading(false);
        } catch (error) {
          setCard(null);
          setLoading(false);
        }
        return;
      }
      
      // Fetch from TCGdex
      try {
        let response = await fetch(`https://api.tcgdex.net/v2/en/cards/${cardId}`);
        
        if (!response.ok && cardId.includes('-')) {
          const [setId, localId] = cardId.split('-');
          response = await fetch(`https://api.tcgdex.net/v2/en/sets/${setId}/${localId}`);
        }
        
        if (!response.ok) {
          setCard(null);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setCard(data);
        setIsEbayCard(false);
        setLoading(false);
      } catch (error) {
        setCard(null);
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId, cardSource, storedCard]);

  // Fetch sold listings for this card (only for TCGdex cards)
  const { data: soldListings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['soldListings', cardId],
    queryFn: async () => {
      try {
        return await base44.entities.SoldListing.filter({ card_id: cardId }, '-sale_date', 10);
      } catch (error) {
        return [];
      }
    },
    enabled: !!cardId && !!card && !isEbayCard,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Check if in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user || !cardId || !card) return;
      try {
        const items = await base44.entities.WatchlistItem.filter({ 
          user_email: user.email, 
          card_id: cardId 
        });
        setInWatchlist(items.length > 0);
      } catch (error) {
        setInWatchlist(false);
      }
    };
    checkWatchlist();
  }, [user?.email, cardId, card]);

  const priceHistoryData = soldListings.map(listing => ({
    date: listing.sale_date,
    price: listing.sale_price
  })).reverse();

  const toggleWatchlist = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    if (inWatchlist) {
      const items = await base44.entities.WatchlistItem.filter({ 
        user_email: user.email, 
        card_id: cardId 
      });
      if (items.length > 0) {
        await base44.entities.WatchlistItem.delete(items[0].id);
      }
    } else {
      await base44.entities.WatchlistItem.create({
        user_email: user.email,
        card_id: cardId,
        card_name: card?.name,
        card_image: card?.image + '/high.webp',
        card_set: card?.set?.name
      });
    }
    setInWatchlist(!inWatchlist);
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Fire': <Flame className="h-4 w-4" />,
      'Water': <Droplet className="h-4 w-4" />,
      'Grass': <Leaf className="h-4 w-4" />,
      'Electric': <Zap className="h-4 w-4" />,
      'Psychic': <Star className="h-4 w-4" />,
      'Fighting': <Shield className="h-4 w-4" />,
    };
    return icons[type] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[2.5/3.5] bg-zinc-800/50 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 bg-zinc-800/50 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-zinc-800/50 rounded-lg w-1/2 animate-pulse" />
              <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-4">Card not found</p>
          <Link to={createPageUrl("Cards")}>
            <Button variant="outline" className="border-zinc-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cards
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <Link 
          to={createPageUrl("Cards")}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="sticky top-8">
              <div className="relative aspect-[2.5/3.5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                {card.image ? (
                  <img
                    src={isEbayCard ? card.image : card.image + "/high.webp"}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-500">{card.name}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {card.name}
                  </h1>
                  {!isEbayCard && (
                    <p className="text-zinc-400">
                      {card.set?.name} • #{card.localId}
                    </p>
                  )}
                  {isEbayCard && card.price && (
                    <p className="text-2xl font-bold text-amber-400 mt-2">
                      ${card.price.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleWatchlist}
                    className={`border-zinc-700 ${inWatchlist ? 'text-red-400 border-red-400/50' : 'text-zinc-400'} hover:text-red-400`}
                  >
                    <Heart className={`h-5 w-5 ${inWatchlist ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isEbayCard && card.rarity && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {card.rarity}
                  </Badge>
                )}
                {!isEbayCard && card.types?.map(type => (
                  <Badge key={type} variant="outline" className="border-zinc-700 text-zinc-300">
                    {getTypeIcon(type)}
                    <span className="ml-1">{type}</span>
                  </Badge>
                ))}
                {!isEbayCard && card.hp && (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                    {card.hp} HP
                  </Badge>
                )}
                {isEbayCard && card.condition && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {card.condition}
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-white font-semibold mb-4">
                {isEbayCard ? 'Listing Details' : 'Card Details'}
              </h3>
              {!isEbayCard && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Set</p>
                    <p className="text-white">{card.set?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Card Number</p>
                    <p className="text-white">{card.localId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Rarity</p>
                    <p className="text-white">{card.rarity || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Illustrator</p>
                    <p className="text-white">{card.illustrator || 'Unknown'}</p>
                  </div>
                </div>
              )}
              {isEbayCard && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Price</p>
                    <p className="text-white">${card.price?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Condition</p>
                    <p className="text-white">{card.condition || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Currency</p>
                    <p className="text-white">{card.currency || 'USD'}</p>
                  </div>
                </div>
              )}
            </div>

            {!isEbayCard && card.attacks && card.attacks.length > 0 && (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-white font-semibold mb-4">Attacks</h3>
                <div className="space-y-4">
                  {card.attacks.map((attack, index) => (
                    <div key={index} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{attack.name}</span>
                        {attack.damage && (
                          <span className="text-amber-400 font-bold">{attack.damage}</span>
                        )}
                      </div>
                      {attack.effect && (
                        <p className="text-zinc-400 text-sm">{attack.effect}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isEbayCard && (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="w-full bg-zinc-800/50 rounded-none border-b border-zinc-800 p-0 h-auto">
                    <TabsTrigger 
                      value="history" 
                      className="flex-1 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Price History
                    </TabsTrigger>
                    <TabsTrigger 
                      value="listings"
                      className="flex-1 py-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-amber-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Recent Sales
                    </TabsTrigger>
                  </TabsList>
                  <div className="p-6">
                    <TabsContent value="history" className="mt-0">
                      <PriceHistoryChart data={priceHistoryData} loading={loadingListings} />
                    </TabsContent>
                    <TabsContent value="listings" className="mt-0">
                      <SoldListings listings={soldListings} loading={loadingListings} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
            {isEbayCard && (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <p className="text-zinc-400 text-center py-8">
                  Price history and sales data are only available for TCGdex cards.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {isEbayCard && card.buyItNowUrl ? (
                <a href={card.buyItNowUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 font-semibold py-6 rounded-xl">
                    <Package className="h-5 w-5 mr-2" />
                    Buy on eBay
                  </Button>
                </a>
              ) : (
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 font-semibold py-6 rounded-xl">
                  <Package className="h-5 w-5 mr-2" />
                  Shop Now
                </Button>
              )}
              {!isEbayCard && (
                <Link to={createPageUrl("Auctions")} className="flex-1">
                  <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 py-6 rounded-xl">
                    <Gavel className="h-5 w-5 mr-2" />
                    View Auctions
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}