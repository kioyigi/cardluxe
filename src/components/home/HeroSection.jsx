import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gavel } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
      
      {/* Floating cards decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-32 h-44 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-xl blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[15%] w-28 h-40 bg-gradient-to-br from-purple-400/20 to-purple-600/10 rounded-xl blur-sm"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-[20%] w-24 h-36 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 rounded-xl blur-sm"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Premium Trading Card Marketplace
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Collect.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Trade.
            </span>{' '}
            Win.
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10">
            The ultimate destination for Pokémon card collectors. 
            Browse thousands of cards, join live auctions, and build your dream collection.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl("Cards")}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40"
              >
                Browse Cards
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl("Auctions")}>
              <Button 
                size="lg"
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-6 text-lg rounded-full"
              >
                <Gavel className="mr-2 h-5 w-5" />
                Live Auctions
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: '10K+', label: 'Cards Listed' },
            { value: 'Biweekly', label: 'Live Auctions' },
            { value: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}