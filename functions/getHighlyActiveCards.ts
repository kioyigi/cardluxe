import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SEED_QUERIES = [
  'pokemon single card',
  'pokemon alt art',
  'pokemon illustration rare',
  'pokemon secret rare',
  'pokemon trainer full art',
  'pokemon ex',
  'pokemon v',
  'pokemon vmax',
  'pokemon vstar',
  'pokemon charizard',
  'pokemon pikachu'
];

const GRADING_KEYWORDS = [
  'psa', 'bgs', 'cgc', 'sgc', 'graded', 'slab', 'gem mint',
  '9.5', '10', 'pop report', 'beckett', 'encapsulated'
];

const EXCLUDE_KEYWORDS = [
  'lot', 'bundle', 'set of', 'choose', 'choose your', 'random', 'mystery',
  'pack', 'booster', 'box', 'case', 'etb', 'code', 'digital', 'proxy',
  'custom', 'reprint', 'replica', 'sleeves', 'toploader', 'handmade',
  'per order', 'in stock', 'japanese', 'korean', 'chinese', 's chinese',
  'binder', 'deck', 'playmat'
];

const CONDITION_FLUFF = [
  'nm', 'lp', 'mp', 'hp', 'damaged', 'mint', 'near', 'played',
  'authentic', 'rare', 'vintage', 'holo', 'reverse', 'tcg',
  'pokemon', 'card', 'holofoil'
];

function hasGradingKeyword(title) {
  const lower = title.toLowerCase();
  return GRADING_KEYWORDS.some(kw => lower.includes(kw));
}

function hasExcludeKeyword(title) {
  const lower = title.toLowerCase();
  return EXCLUDE_KEYWORDS.some(kw => lower.includes(kw));
}

function normalizeTitle(title) {
  let normalized = title.toLowerCase();
  normalized = normalized.replace(/[^\w\s\/]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  const words = normalized.split(' ');
  const filtered = words.filter(word => !CONDITION_FLUFF.includes(word));
  
  return filtered.join(' ');
}

function extractAndValidateCardNumber(title) {
  const pattern = /\b\d{1,3}\/\d{2,3}\b/g;
  const matches = title.match(pattern);
  
  // CRITICAL: Only accept if EXACTLY ONE card number pattern found
  if (matches && matches.length === 1) {
    return matches[0];
  }
  
  return null;
}

function extractPokemonName(normalizedTitle, cardNumber) {
  let text = normalizedTitle;
  
  if (cardNumber) {
    text = text.replace(cardNumber.replace('/', '\\/'), '');
  }
  
  const words = text.split(' ').filter(w => w.length > 0);
  
  const cardTypes = ['ex', 'vmax', 'vstar', 'mega', 'gx', 'v', 'break', 'lvx', 'lv x', 'tag team', 'full art', 'alt art', 'illustration'];
  const stopWords = ['the', 'and', 'or', 'edition', 'series'];
  
  let pokemonName = '';
  let cardType = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (cardTypes.includes(word)) {
      cardType = word;
      break;
    }
    
    if (!stopWords.includes(word) && pokemonName.split(' ').length < 2) {
      pokemonName += (pokemonName ? ' ' : '') + word;
    }
  }
  
  if (cardType) {
    return `${pokemonName} ${cardType}`.trim();
  }
  
  return pokemonName.trim();
}

function generateCardKey(title) {
  const cardNumber = extractAndValidateCardNumber(title);
  
  // CRITICAL: Reject if no valid single card number
  if (!cardNumber) {
    return null;
  }
  
  const normalized = normalizeTitle(title);
  const pokemonName = extractPokemonName(normalized, cardNumber);
  
  return `${pokemonName}|${cardNumber}`;
}

async function getEbayToken() {
  const appId = Deno.env.get('EBAY_APP_ID');
  const certId = Deno.env.get('EBAY_CERT_ID');
  
  const credentials = btoa(`${appId}:${certId}`);
  
  const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
  });
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function searchEbay(accessToken, query, limit = 200) {
  const results = [];
  let offset = 0;
  const perPage = 50;
  
  while (results.length < limit) {
    const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', perPage);
    url.searchParams.set('offset', offset);
    url.searchParams.set('category_ids', '183454');
    url.searchParams.set('filter', 'price:[1..10000],priceCurrency:USD,conditions:{USED|NEW}');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });
    
    if (!response.ok) break;
    
    const data = await response.json();
    if (!data.itemSummaries || data.itemSummaries.length === 0) break;
    
    results.push(...data.itemSummaries);
    offset += perPage;
    
    if (results.length >= limit || !data.next) break;
  }
  
  return results;
}

async function fetchTCGdexImage(cardName, cardNumber) {
  try {
    // Search TCGdex for the card
    const searchUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(cardName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const cards = await response.json();
    if (!cards || cards.length === 0) return null;
    
    // Find exact match by card number if available
    let matchedCard = null;
    if (cardNumber) {
      matchedCard = cards.find(card => 
        card.localId === cardNumber.split('/')[0] || 
        card.id?.includes(cardNumber.replace('/', '-'))
      );
    }
    
    // Fallback to first result if no exact match
    if (!matchedCard) matchedCard = cards[0];
    
    return {
      tcgdex_card_id: matchedCard.id,
      tcgdex_image_url: matchedCard.image ? `${matchedCard.image}/high.webp` : null
    };
  } catch (error) {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const accessToken = await getEbayToken();
    const cardMap = new Map();
    const now = new Date().toISOString();
    
    // Get previous snapshots for growth rate
    const previousSnapshots = await base44.asServiceRole.entities.Snapshot.filter({}, '-timestamp', 10000);
    const previousMap = new Map();
    previousSnapshots.forEach(snap => {
      previousMap.set(snap.card_key, snap.frequency_count || 0);
    });
    
    // Sample from multiple seed queries
    for (const seedQuery of SEED_QUERIES) {
      const listings = await searchEbay(accessToken, seedQuery, 200);
      
      for (const item of listings) {
        const title = item.title || '';
        
        if (hasGradingKeyword(title) || hasExcludeKeyword(title)) continue;
        if (!item.price?.value) continue;
        
        const cardKey = generateCardKey(title);
        
        // CRITICAL: Skip if no valid single card number detected
        if (!cardKey) continue;
        
        const price = parseFloat(item.price.value);
        const isAuction = item.buyingOptions?.includes('AUCTION') || false;
        
        if (!cardMap.has(cardKey)) {
          const cardNumber = extractAndValidateCardNumber(title);
          const normalized = normalizeTitle(title);
          const pokemonName = extractPokemonName(normalized, cardNumber);
          
          cardMap.set(cardKey, {
            card_key: cardKey,
            card_name: pokemonName,
            card_number: cardNumber,
            frequency_count: 0,
            auction_count: 0,
            total_count: 0,
            sampled_prices: [],
            search_url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(pokemonName + ' ' + cardNumber)}&_sacat=183454`
          });
        }
        
        const card = cardMap.get(cardKey);
        card.frequency_count++;
        card.total_count++;
        if (isAuction) card.auction_count++;
        if (card.sampled_prices.length < 10) {
          card.sampled_prices.push(price);
        }
      }
    }
    
    // Calculate auction ratios and prepare for storage
    const snapshots = [];
    for (const [cardKey, data] of cardMap.entries()) {
      const auctionRatio = data.total_count > 0 ? (data.auction_count / data.total_count) : 0;
      const previousFrequency = previousMap.get(cardKey) || 0;
      
      // Fetch TCGdex image
      const tcgdexData = await fetchTCGdexImage(data.card_name, data.card_number);
      
      snapshots.push({
        timestamp: now,
        card_key: data.card_key,
        card_name: data.card_name,
        card_number: data.card_number,
        frequency_count: data.frequency_count,
        auction_ratio: auctionRatio,
        sampled_prices: data.sampled_prices,
        search_url: data.search_url,
        previous_frequency: previousFrequency,
        tcgdex_card_id: tcgdexData?.tcgdex_card_id || null,
        tcgdex_image_url: tcgdexData?.tcgdex_image_url || null
      });
    }
    
    // Clear old snapshots (keep last 2 cycles for growth comparison)
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24);
    const oldSnapshots = await base44.asServiceRole.entities.Snapshot.filter({}, '-timestamp');
    for (const snap of oldSnapshots) {
      if (new Date(snap.timestamp) < cutoffDate) {
        await base44.asServiceRole.entities.Snapshot.delete(snap.id);
      }
    }
    
    // Bulk insert new snapshots
    if (snapshots.length > 0) {
      await base44.asServiceRole.entities.Snapshot.bulkCreate(snapshots);
    }
    
    return Response.json({ 
      success: true, 
      cards_discovered: snapshots.length,
      timestamp: now
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});