import React from 'react';
import { format } from 'date-fns';
import { ExternalLink, ShoppingBag, Gavel, Store } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function SoldListings({ listings, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-zinc-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
        <p className="text-zinc-500">No recent sales found</p>
        <p className="text-zinc-600 text-sm mt-1">
          Sales data will appear here once connected to eBay API
        </p>
      </div>
    );
  }

  const sourceIcons = {
    ebay: <ShoppingBag className="h-4 w-4" />,
    shop: <Store className="h-4 w-4" />,
    auction: <Gavel className="h-4 w-4" />,
  };

  const sourceColors = {
    ebay: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shop: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    auction: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="space-y-3">
      {listings.map((listing, index) => (
        <div 
          key={listing.id || index}
          className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
        >
          <div className="flex gap-4">
            {/* Image */}
            {listing.image_url && (
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                <img 
                  src={listing.image_url} 
                  alt={listing.listing_title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">
                    {listing.listing_title || 'Card Sale'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={sourceColors[listing.source]}>
                      {sourceIcons[listing.source]}
                      <span className="ml-1 capitalize">{listing.source}</span>
                    </Badge>
                    {listing.condition && (
                      <span className="text-zinc-500 text-sm">{listing.condition}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 font-bold text-lg">
                    ${listing.sale_price.toFixed(2)}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    {format(new Date(listing.sale_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {listing.external_id && listing.source === 'ebay' && (
                <a 
                  href={`https://www.ebay.com/itm/${listing.external_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-amber-400 text-sm mt-2 transition-colors"
                >
                  View on eBay
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}