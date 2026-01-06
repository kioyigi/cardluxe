import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CardGrid({ cards, loading }) {
  const navigate = useNavigate();

  const handleCardClick = (cardId) => {
    // Store in sessionStorage as backup
    sessionStorage.setItem('currentCardId', cardId);
    const url = `${createPageUrl("CardDetail")}?cardId=${encodeURIComponent(cardId)}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array(20).fill(0).map((_, i) => (
          <div key={i} className="aspect-[2.5/3.5] bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
        >
          <div
            onClick={() => handleCardClick(card.id)}
            className="group block cursor-pointer"
          >
            <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {card.image ? (
                <img
                  src={card.image + "/high.webp"}
                  alt={card.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <span className="text-zinc-500 text-xs text-center px-2">{card.name}</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <p className="text-white text-sm font-medium truncate">{card.name}</p>
                {card.set && (
                  <p className="text-zinc-400 text-xs truncate">{card.set.name}</p>
                )}
              </div>

              {card.rarity && (
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm ${
                    card.rarity === 'Rare Holo' || card.rarity === 'Rare Holo EX' || card.rarity === 'Rare Holo GX' 
                      ? 'bg-amber-500/80 text-black' 
                      : card.rarity === 'Common' 
                        ? 'bg-zinc-600/80 text-white'
                        : 'bg-purple-500/80 text-white'
                  }`}>
                    {card.rarity}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}