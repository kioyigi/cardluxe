import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import CardGrid from '@/components/cards/CardGrid';
import AuctionCard from '@/components/auction/AuctionCard';

export default function Home() {
  const [featuredCards, setFeaturedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // Fetch active auctions
  const { data: auctions = [], isLoading: loadingAuctions } = useQuery({
    queryKey: ['activeAuctions'],
    queryFn: () => base44.entities.AuctionItem.filter(
      { status: 'active' },
      'auction_end',
      6
    ),
    initialData: [],
  });

  // Fetch featured cards from TCGdex
  useEffect(() => {
    const fetchFeaturedCards = async () => {
      try {
        // Fetch cards from a popular set
        const response = await fetch('https://api.tcgdex.net/v2/en/sets/swsh1/');
        const set = await response.json();
        
        if (set.cards) {
          // Get first 10 cards with images
          const cardsWithImages = set.cards.slice(0, 10);
          setFeaturedCards(cardsWithImages);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchFeaturedCards();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <HeroSection />

      {/* Featured Cards */}
      <FeaturedSection
        title="Featured Cards"
        subtitle="Discover rare and valuable cards from the latest sets"
        linkText="View All Cards"
        linkUrl={createPageUrl("Cards")}
      >
        <CardGrid cards={featuredCards} loading={loadingCards} />
      </FeaturedSection>

      {/* Live Auctions */}
      {(auctions.length > 0 || loadingAuctions) && (
        <FeaturedSection
          title="Live Auctions"
          subtitle="Bid on exclusive cards in our biweekly auctions"
          linkText="View All Auctions"
          linkUrl={createPageUrl("Auctions")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAuctions ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-800/50 rounded-2xl animate-pulse" />
              ))
            ) : (
              auctions.map((item, index) => (
                <AuctionCard key={item.id} item={item} index={index} />
              ))
            )}
          </div>
        </FeaturedSection>
      )}

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-zinc-950 to-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Start your collection journey in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Discover',
                description: 'Explore thousands of Pokémon cards from every set. Filter by rarity, type, and more.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                step: '02',
                title: 'Bid or Buy',
                description: 'Join our biweekly auctions or purchase directly from our curated shop inventory.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                title: 'Build Your Collection',
                description: 'Track your collection, monitor prices, and sell when the time is right.',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" 
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
                <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-colors">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${item.gradient} text-transparent bg-clip-text`}>
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-4 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Collecting?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of collectors and traders. Create your account and start building your dream collection today.
              </p>
              <a 
                href={createPageUrl("Cards")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-full hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
              >
                Start Browsing
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}