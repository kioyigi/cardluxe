import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Card catalog data
const CARD_CATALOG_RAW = `Alakazam||1
Blastoise||2
Chansey||3
Charizard||4
Clefairy||5
Gyarados||6
Hitmonchan||7
Machamp||8
Magneton||9
Mewtwo||10
Nidoking||11
Ninetales||12
Poliwrath||13
Raichu||14
Venusaur||15
Zapdos||16
Beedrill||17
Dragonair||18
Dugtrio||19
Electabuzz||20
Electrode||21
Pidgeotto||22
Arcanine||23
Charmeleon||24
Dewgong||25
Dratini||26
Farfetch'd||27
Growlithe||28
Haunter||29
Ivysaur||30
Jynx||31
Kadabra||32
Kakuna||33
Machoke||34
Magikarp||35
Magmar||36
Nidorino||37
Poliwhirl||38
Porygon||39
Raticate||40
Seel||41
Wartortle||42
Abra||43
Bulbasaur||44
Caterpie||45
Charmander||46
Diglett||47
Doduo||48
Drowzee||49
Gastly||50
Koffing||51
Machop||52
Magnemite||53
Metapod||54
Nidoran♂||55
Onix||56
Pidgey||57
Pikachu||58
Poliwag||59
Ponyta||60
Rattata||61
Sandshrew||62
Squirtle||63
Starmie||64
Staryu||65
Tangela||66
Voltorb||67
Vulpix||68
Weedle||69
Clefairy Doll||70
Computer Search||71
Devolution Spray||72
Impostor Professor Oak||73
Item Finder||74
Lass||75
Pokémon Breeder||76
Pokémon Trader||77
Scoop Up||78
Super Energy Removal||79
Defender||80
Energy Retrieval||81
Full Heal||82
Maintenance||83
PlusPower||84
Pokémon Center||85
Pokémon Flute||86
Pokédex||87
Professor Oak||88
Revive||89
Super Potion||90
Bill||91
Energy Removal||92
Gust of Wind||93
Potion||94
Switch||95
Double Colorless Energy||96
Fighting Energy||97
Fire Energy||98
Grass Energy||99
Lightning Energy||100
Psychic Energy||101
Water Energy||102`;

// Valid card types
const VALID_TYPES = [
  'VMAX', 'VSTAR', 'V', 'EX', 'ex', 'GX', 'TAG TEAM', 'MEGA', 
  'LV.X', 'BREAK', 'PRIME', 'LEGEND', 'SP', 'Tera', 'Radiant', 
  'Shining', 'Amazing Rare', 'Ultra Beast', 'Promo', 'Trainer Gallery'
];

// Valid Pokémon names (subset for testing - full list would be loaded)
const VALID_POKEMON_NAMES = [
  'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard',
  'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie', 'Metapod', 'Butterfree',
  'Weedle', 'Kakuna', 'Beedrill', 'Pidgey', 'Pidgeotto', 'Pidgeot',
  'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Ekans', 'Arbok',
  'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Nidoran F', 'Nidorina',
  'Nidoqueen', 'Nidoran M', 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable',
  'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat',
  'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Venonat',
  'Venomoth', 'Diglett', 'Dugtrio', 'Meowth', 'Persian', 'Psyduck',
  'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag',
  'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam', 'Machop',
  'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool',
  'Tentacruel', 'Geodude', 'Graveler', 'Golem', 'Ponyta', 'Rapidash',
  'Slowpoke', 'Slowbro', 'Magnemite', 'Magneton', 'Farfetchd', 'Doduo',
  'Dodrio', 'Seel', 'Dewgong', 'Grimer', 'Muk', 'Shellder',
  'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Onix', 'Drowzee',
  'Hypno', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Exeggcute',
  'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Lickitung',
  'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey', 'Tangela',
  'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Staryu',
  'Starmie', 'Mr Mime', 'Scyther', 'Jynx', 'Electabuzz', 'Magmar',
  'Pinsir', 'Tauros', 'Magikarp', 'Gyarados', 'Lapras', 'Ditto',
  'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon', 'Omanyte',
  'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Snorlax', 'Articuno',
  'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite', 'Mewtwo', 'Mew',
  'Maractus', 'Shuckle', 'Toedscruel', 'Shadow Rider Calyrex', 'Moltres Zapdos Articuno'
];

// Grading/slab keywords (RAW-only filter)
const GRADING_KEYWORDS = [
  'psa', 'psa10', 'psa 10', 'bgs', 'bgs9.5', 'bgs 9.5', 'cgc', 'cgc10', 'cgc 10',
  'sgc', 'sgc10', 'sgc 10', 'beckett', 'graded', 'grade', 'gem mint', 'pristine',
  'slab', 'slabbed', 'encased', 'cert', 'certified', 'subgrade', 'subgrades',
  'population', 'pop report'
];

// Junk/non-single listings
const JUNK_KEYWORDS = [
  'lot', 'bundle', 'bulk', 'collection', 'set of', 'x4', 'x10', 'multiple',
  'choose', 'pick', 'select', 'your choice', 'pack', 'booster', 'box', 'etb',
  'tin', 'case', 'proxy', 'custom', 'replica', 'reprint', 'random', 'mystery',
  'code', 'digital', 'sleeves', 'toploader', 'handmade', 'per order',
  'in stock', 'japanese', 'korean', 'chinese', 's chinese', 'binder', 'deck', 'playmat'
];

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

// Build catalog lookup (localId -> card entries)
function buildCatalog() {
  const catalog = new Map();
  const lines = CARD_CATALOG_RAW.trim().split('\n');
  
  for (const line of lines) {
    const parts = line.split('||');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const type = parts[1] ? parts[1].trim() : '';
      const localId = parts[2] ? parts[2].trim() : parts[1].trim();
      
      if (!catalog.has(localId)) {
        catalog.set(localId, []);
      }
      catalog.get(localId).push({ name, type, localId });
    }
  }
  
  return catalog;
}

const CARD_CATALOG = buildCatalog();

function hasKeyword(title, keywords) {
  const lower = title.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

// Extract card number (prioritize fractions)
function extractCardNumber(title) {
  // Fraction pattern (###/###)
  const fractionPattern = /\b(\d{1,3})\s*\/\s*(\d{2,3})\b/g;
  const fractionMatches = [...title.matchAll(fractionPattern)];
  
  // Special patterns (TG##, RC##, H##)
  const specialPattern = /\b(TG|RC|H)(\d{1,2})\b/gi;
  const specialMatches = [...title.matchAll(specialPattern)];
  
  // Single number
  const singlePattern = /\b(\d{1,3})\b/g;
  const singleMatches = [...title.matchAll(singlePattern)];
  
  // Check ambiguity
  if (fractionMatches.length > 1 || specialMatches.length > 1) {
    return null; // Ambiguous
  }
  
  if (fractionMatches.length === 1) {
    return {
      leftNumber: fractionMatches[0][1],
      fullNumber: fractionMatches[0][0]
    };
  }
  
  if (specialMatches.length === 1) {
    const full = specialMatches[0][0];
    return {
      leftNumber: specialMatches[0][1] + specialMatches[0][2],
      fullNumber: full
    };
  }
  
  if (singleMatches.length === 1) {
    const num = singleMatches[0][1];
    return {
      leftNumber: num,
      fullNumber: num
    };
  }
  
  if (singleMatches.length > 1) {
    return null; // Ambiguous
  }
  
  return null;
}

// Extract Pokémon name from title (whitelist-only)
function extractPokemonName(title) {
  const titleLower = title.toLowerCase();
  
  for (const name of VALID_POKEMON_NAMES) {
    const nameLower = name.toLowerCase();
    const regex = new RegExp(`\\b${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(titleLower)) {
      return name;
    }
  }
  
  return null;
}

// Extract card type from title (whitelist-only)
function extractCardType(title) {
  const titleLower = title.toLowerCase();
  
  // Longest match first
  for (const type of VALID_TYPES) {
    const typeLower = type.toLowerCase();
    const regex = new RegExp(`\\b${typeLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(titleLower)) {
      return type;
    }
  }
  
  return null;
}

// Match card to catalog
function matchToCatalog(pokemonName, cardType, leftNumber) {
  if (!leftNumber || !CARD_CATALOG.has(leftNumber)) {
    return null;
  }
  
  const candidates = CARD_CATALOG.get(leftNumber);
  if (candidates.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  let secondBestScore = 0;
  
  for (const candidate of candidates) {
    let score = 0;
    
    // +10 if name matches
    if (pokemonName && candidate.name.toLowerCase() === pokemonName.toLowerCase()) {
      score += 10;
    }
    
    // +8 if type matches
    if (cardType && candidate.type && candidate.type.toLowerCase() === cardType.toLowerCase()) {
      score += 8;
    }
    
    // +5 if name is substring match
    if (pokemonName && candidate.name.toLowerCase().includes(pokemonName.toLowerCase())) {
      score += 5;
    }
    
    if (score > bestScore) {
      secondBestScore = bestScore;
      bestScore = score;
      bestMatch = candidate;
    } else if (score > secondBestScore) {
      secondBestScore = score;
    }
  }
  
  // Confidence gate
  const THRESHOLD = 8;
  const MARGIN = 3;
  
  if (bestScore < THRESHOLD || (bestScore - secondBestScore) < MARGIN) {
    return null;
  }
  
  return bestMatch;
}

// Format canonical display name
function formatCanonicalName(catalogCard, extractedType, fullNumber) {
  const name = catalogCard.name;
  const type = extractedType || catalogCard.type || 'UNKNOWN';
  const number = fullNumber;
  
  return `${name}|${type}|${number}`;
}

// Parse eBay listing title
function parseListingTitle(title) {
  // Extract card number first (anchor)
  const cardNumber = extractCardNumber(title);
  if (!cardNumber) return null;
  
  // Extract Pokémon name (whitelist)
  const pokemonName = extractPokemonName(title);
  if (!pokemonName) return null;
  
  // Extract card type (whitelist)
  const cardType = extractCardType(title);
  
  // Match to catalog
  const catalogMatch = matchToCatalog(pokemonName, cardType, cardNumber.leftNumber);
  if (!catalogMatch) return null;
  
  // Format canonical display
  const displayName = formatCanonicalName(catalogMatch, cardType, cardNumber.fullNumber);
  
  return {
    displayName,
    cardKey: displayName,
    pokemonName: catalogMatch.name,
    cardType: cardType || catalogMatch.type,
    cardNumber: cardNumber.fullNumber
  };
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

async function fetchTCGdexImage(pokemonName, cardType, cardNumber, ebayTitle) {
  try {
    if (!cardNumber || !pokemonName) return null;
    
    const localId = cardNumber.split('/')[0];
    const searchName = cardType ? `${pokemonName} ${cardType}` : pokemonName;
    
    const searchUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const cards = await response.json();
    if (!cards || cards.length === 0) return null;
    
    const matchingCards = cards.filter(card => card.localId === localId);
    
    if (matchingCards.length === 0) return null;
    
    if (matchingCards.length === 1) {
      const card = matchingCards[0];
      return {
        tcgdex_card_id: card.id,
        tcgdex_image_url: `${card.image}/high.webp`
      };
    }
    
    // Multiple matches - use set name overlap
    const ebayTitleLower = ebayTitle.toLowerCase();
    const ebayTokens = ebayTitleLower.split(/\s+/);
    
    let bestMatch = null;
    let bestOverlapScore = 0;
    
    for (const card of matchingCards) {
      if (!card.set?.name) continue;
      
      const setNameLower = card.set.name.toLowerCase();
      const setTokens = setNameLower.split(/\s+/);
      
      let overlapScore = 0;
      for (const token of setTokens) {
        if (ebayTokens.includes(token)) {
          overlapScore++;
        }
      }
      
      if (overlapScore > bestOverlapScore) {
        bestOverlapScore = overlapScore;
        bestMatch = card;
      }
    }
    
    if (bestMatch && bestOverlapScore > 0) {
      return {
        tcgdex_card_id: bestMatch.id,
        tcgdex_image_url: `${bestMatch.image}/high.webp`
      };
    }
    
    return null;
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
        
        // RAW-ONLY: Filter graded/slab listings
        if (hasKeyword(title, GRADING_KEYWORDS)) continue;
        // Filter junk listings
        if (hasKeyword(title, JUNK_KEYWORDS)) continue;
        if (!item.price?.value) continue;
        
        // Parse card using whitelist-based matching
        const parsed = parseListingTitle(title);
        
        // Skip if no valid match found
        if (!parsed) continue;
        
        const price = parseFloat(item.price.value);
        const isAuction = item.buyingOptions?.includes('AUCTION') || false;
        
        if (!cardMap.has(parsed.cardKey)) {
          cardMap.set(parsed.cardKey, {
            card_key: parsed.cardKey,
            card_name: parsed.displayName,
            card_number: parsed.cardNumber,
            card_base_name: parsed.pokemonName,
            card_type: parsed.cardType,
            frequency_count: 0,
            auction_count: 0,
            total_count: 0,
            sampled_prices: [],
            search_url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(parsed.pokemonName + ' ' + (parsed.cardType || '') + ' ' + parsed.cardNumber)}&_sacat=183454`,
            original_title: title
          });
        }
        
        const card = cardMap.get(parsed.cardKey);
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
      
      const originalTitle = data.original_title || '';
      
      const tcgdexData = await fetchTCGdexImage(
        data.card_base_name || '',
        data.card_type || '',
        data.card_number,
        originalTitle
      );
      
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
    
    // Clear old snapshots (keep last 24 hours for growth comparison)
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