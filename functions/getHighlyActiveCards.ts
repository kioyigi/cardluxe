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
  'psa', 'psa10', 'psa 10', 'bgs', 'bgs9.5', 'bgs 9.5', 'cgc', 'cgc10', 'cgc 10', 
  'sgc', 'sgc10', 'sgc 10', 'beckett', 'graded', 'grade', 'gem mint', 'pristine', 
  'slab', 'slabbed', 'encased', 'cert', 'certified', 'subgrade', 'subgrades', 
  'population', 'pop report'
];

const JUNK_EXCLUDE_KEYWORDS = [
  'lot', 'bundle', 'bulk', 'collection', 'set of', 'x4', 'x10', 'multiple',
  'choose', 'pick', 'select', 'your choice', 'pack', 'booster', 'box', 'etb', 
  'tin', 'case', 'proxy', 'custom', 'replica', 'reprint', 'random', 'mystery',
  'code', 'digital', 'sleeves', 'toploader', 'handmade', 'per order', 
  'in stock', 'japanese', 'korean', 'chinese', 's chinese', 'binder', 'deck', 'playmat'
];

const STOP_WORDS = [
  'rare', 'ultra rare', 'secret rare', 'hyper rare', 'double rare', 
  'illustration rare', 'special illustration rare', 'ir', 'sir', 'sr', 
  'ur', 'hr', 'ar', 'ultra', 'secret', 'hyper', 'double', 'illustration', 'special',
  'holo', 'reverse', 'full art', 'alt art', 'promo', 'mint', 'nm', 'lp', 'mp', 
  'hp', 'dmg', 'damaged', 'pokemon', 'pokémon', 'card', 'tcg', 'lot', 'bundle', 'choose'
];

const CARD_TYPES = [
  'VMAX', 'VSTAR', 'V', 'EX', 'ex', 'GX', 'TAG TEAM', 'MEGA', 
  'LV.X', 'BREAK', 'PRIME', 'LEGEND', 'SP', 'Tera', 'Radiant', 
  'Shining', 'Amazing Rare', 'Ultra Beast', 'Promo', 'Trainer Gallery'
];

// Comprehensive list of all set names and IDs from TCGdex
const ALL_SET_IDENTIFIERS = [
  // Set IDs
  '2011bw', '2012bw', '2014xy', '2015xy', '2016xy', '2017sm', '2018sm', '2019sm', '2021swsh',
  'a1', 'a1a', 'a2', 'a2a', 'a2b', 'a3', 'a3a', 'a3b', 'a4', 'a4a', 'b1', 'b1a', 'p-a',
  'base1', 'base2', 'base3', 'base4', 'base5', 'basep', 'bog',
  'bw1', 'bw10', 'bw11', 'bw2', 'bw3', 'bw4', 'bw5', 'bw6', 'bw7', 'bw8', 'bw9', 'bwp',
  'cel25', 'col1', 'dc1', 'det1',
  'dp1', 'dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp7', 'dpp', 'dv1',
  'ecard1', 'ecard2', 'ecard3',
  'ex1', 'ex2', 'ex3', 'ex4', 'ex5', 'ex5.5', 'ex6', 'ex7', 'ex8', 'ex9', 'ex10', 'ex11', 'ex12', 'ex13', 'ex14', 'ex15', 'ex16', 'exu',
  'fut2020', 'g1', 'gym1', 'gym2',
  'hgss1', 'hgss2', 'hgss3', 'hgss4', 'hgssp',
  'jumbo', 'lc', 'me01', 'me02', 'mep',
  'neo1', 'neo2', 'neo3', 'neo4', 'np',
  'pl1', 'pl2', 'pl3', 'pl4',
  'pop1', 'pop2', 'pop3', 'pop4', 'pop5', 'pop6', 'pop7', 'pop8', 'pop9',
  'rc', 'ru1', 'si1',
  'sm1', 'sm2', 'sm3', 'sm3.5', 'sm4', 'sm5', 'sm6', 'sm7', 'sm7.5', 'sm8', 'sm9', 'sm10', 'sm11', 'sm115', 'sm12', 'sma', 'smp',
  'sp',
  'sv01', 'sv02', 'sv03', 'sv03.5', 'sv04', 'sv04.5', 'sv05', 'sv06', 'sv06.5', 'sv07', 'sv08', 'sv08.5', 'sv09', 'sv10', 'sv10.5b', 'sv10.5w', 'svp',
  'swsh1', 'swsh2', 'swsh3', 'swsh3.5', 'swsh4', 'swsh4.5', 'swsh5', 'swsh6', 'swsh7', 'swsh8', 'swsh9', 'swsh10', 'swsh10.5', 'swsh11', 'swsh12', 'swsh12.5', 'swshp',
  'wp', 'xy0', 'xy1', 'xy2', 'xy3', 'xy4', 'xy5', 'xy6', 'xy7', 'xy8', 'xy9', 'xy10', 'xy11', 'xy12', 'xya', 'xyp',
  // Full set names
  "Macdonald's Collection", "Genetic Apex", "Mythical Island", "Space-Time Smackdown",
  "Triumphant Light", "Shining Revelry", "Celestial Guardians", "Extradimensional Crisis",
  "Eevee Grove", "Wisdom of Sea and Sky", "Secluded Springs", "Mega Rising", "Crimson Blaze",
  "Promos-A", "Base Set", "Jungle", "Fossil", "Team Rocket", "Wizards Black Star Promos",
  "Best of game", "Black & White", "Plasma Blast", "Legendary Treasures", "Emerging Powers",
  "Noble Victories", "Next Destinies", "Dark Explorers", "Dragons Exalted", "Boundaries Crossed",
  "Plasma Storm", "Plasma Freeze", "BW Black Star Promos", "Celebrations", "Call of Legends",
  "Double Crisis", "Detective Pikachu", "Diamond & Pearl", "Mysterious Treasures", "Secret Wonders",
  "Great Encounters", "Majestic Dawn", "Legends Awakened", "Stormfront", "DP Black Star Promos",
  "Dragon Vault", "Expedition Base Set", "Aquapolis", "Skyridge", "Ruby & Sapphire",
  "Unseen Forces", "Delta Species", "Legend Maker", "Holon Phantoms", "Crystal Guardians",
  "Dragon Frontiers", "Power Keepers", "Sandstorm", "Dragon", "Team Magma vs Team Aqua",
  "Hidden Legends", "Poké Card Creator Pack", "FireRed & LeafGreen", "Team Rocket Returns",
  "Deoxys", "Emerald", "Unseen Forces Unown Collection", "Pokémon Futsal", "Generations",
  "Gym Heroes", "Gym Challenge", "HeartGold SoulSilver", "Unleashed", "Undaunted", "Triumphant",
  "HGSS Black Star Promos", "Jumbo cards", "Legendary Collection", "Mega Evolution",
  "Phantasmal Flames", "MEP Black Star Promos", "Neo Genesis", "Neo Discovery", "Neo Revelation",
  "Neo Destiny", "Nintendo Black Star Promos", "Platinum", "Rising Rivals", "Supreme Victors",
  "Arceus", "POP Series", "Radiant Collection", "Pokémon Rumble", "Southern Islands",
  "Sun & Moon", "Unbroken Bonds", "Unified Minds", "Hidden Fates", "Cosmic Eclipse",
  "Guardians Rising", "Burning Shadows", "Shining Legends", "Crimson Invasion", "Ultra Prism",
  "Forbidden Light", "Celestial Storm", "Dragon Majesty", "Lost Thunder", "Team Up",
  "Yellow A Alternate", "SM Black Star Promos", "Sample", "Scarlet & Violet", "Paldea Evolved",
  "Obsidian Flames", "Paradox Rift", "Paldean Fates", "Temporal Forces", "Twilight Masquerade",
  "Shrouded Fable", "Stellar Crown", "Surging Sparks", "Prismatic Evolutions", "Journey Together",
  "Destined Rivals", "Black Bolt", "White Flare", "SVP Black Star Promos", "Sword & Shield",
  "Astral Radiance", "Pokémon GO", "Lost Origin", "Silver Tempest", "Crown Zenith",
  "Rebel Clash", "Darkness Ablaze", "Champion's Path", "Vivid Voltage", "Shining Fates",
  "Battle Styles", "Chilling Reign", "Evolving Skies", "Fusion Strike", "Brilliant Stars",
  "SWSH Black Star Promos", "BW trainer Kit", "DP trainer Kit", "EX trainer Kit",
  "HS trainer Kit", "SM trainer Kit", "XY trainer Kit", "W Promotional", "Kalos Starter Set",
  "Fates Collide", "Steam Siege", "Evolutions", "Flashfire", "Furious Fists", "Phantom Forces",
  "Primal Clash", "Roaring Skies", "Ancient Origins", "BREAKthrough", "BREAKpoint",
  "Yello A Alternate", "XY Black Star Promos", "Excadrill", "Zoroark", "Lucario", "Manaphy",
  "Latias", "Latios", "Minun", "Plusle", "Gyarados", "Raichu", "Lycanroc", "Alolan Raichu",
  "Bisharp", "Noivern", "Pikachu Libre", "Suicune", "Sylveon", "Wigglytuff"
];

// Canonical card type matching (order matters - longest first for matching)
const CANONICAL_TYPES = [
  'TAG TEAM', 'VMAX', 'VSTAR', 'MEGA', 'LV.X', 'BREAK', 'PRIME', 
  'LEGEND', 'GX', 'EX', 'ex', 'V', 'SP'
];

// Build card catalog lookup (localId -> entries)
function buildCardCatalog() {
  const catalog = new Map();
  const rawData = `Pikachu||58
Charizard||4
Blastoise||2
Venusaur||15
Mewtwo||10
Raichu||14
Alakazam||1
Gyarados||6
Dragonite||4
Gengar||5
Mew||8
Snorlax||11
Lapras||10
Articuno||2
Zapdos||15
Moltres||12
Eevee||51
Vaporeon||12
Jolteon||4
Flareon||3
Machamp||8
Hitmonchan||7
Scyther||10
Electabuzz||20
Magmar||36
Jynx||31
Mr. Mime||6`;

  const lines = rawData.trim().split('\n');
  for (const line of lines) {
    const parts = line.split('||');
    if (parts.length >= 3) {
      const name = parts[0].trim();
      const type = parts[1].trim();
      const localId = parts[2].trim();
      
      if (!catalog.has(localId)) {
        catalog.set(localId, []);
      }
      catalog.get(localId).push({ name, type, localId });
    }
  }
  return catalog;
}

const CARD_CATALOG = buildCardCatalog();

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
  
  return normalized;
}

function extractAndValidateCardNumber(title) {
  const pattern = /\b\d{1,3}\/\d{2,3}\b/g;
  const matches = title.match(pattern);
  
  // Return first valid card number pattern found
  if (matches && matches.length > 0) {
    return matches[0];
  }
  
  return null;
}

function toTitleCase(str) {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

function extractLocalIdAndType(title) {
  const normalized = title.toLowerCase();
  
  // Extract fraction localId (###/###)
  const fractionPattern = /\b(\d{1,3})\s*\/\s*\d{2,3}\b/;
  const fractionMatch = title.match(fractionPattern);
  
  let localId = null;
  let fullFraction = null;
  
  if (fractionMatch) {
    localId = fractionMatch[1]; // Left side
    fullFraction = fractionMatch[0];
  } else {
    // Try single numeric (only if no fraction exists)
    const singleNumPattern = /\b(\d{1,3})\b/g;
    const numMatches = title.match(singleNumPattern);
    if (numMatches && numMatches.length === 1) {
      localId = numMatches[0];
    }
  }
  
  // Extract variant/type (longest match first)
  let extractedType = null;
  for (const type of CANONICAL_TYPES) {
    const regex = new RegExp(`\\b${type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalized)) {
      extractedType = type;
      break;
    }
  }
  
  return { localId, fullFraction, extractedType };
}

function matchCardFromCatalog(title, localId, extractedType) {
  if (!localId || !CARD_CATALOG.has(localId)) {
    return null;
  }
  
  const candidates = CARD_CATALOG.get(localId);
  if (candidates.length === 0) return null;
  
  const titleLower = title.toLowerCase();
  const titleTokens = titleLower.split(/\s+/);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    let score = 0;
    
    // Name overlap scoring
    const nameLower = candidate.name.toLowerCase();
    if (titleLower.includes(nameLower)) {
      score += 10;
    } else {
      // Token-based match
      const nameTokens = nameLower.split(/\s+/);
      for (const token of nameTokens) {
        if (titleTokens.includes(token)) {
          score += 2;
        }
      }
    }
    
    // Type preference
    if (extractedType && candidate.type) {
      if (candidate.type.toLowerCase() === extractedType.toLowerCase()) {
        score += 5;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  // Confidence gate: require minimum score
  if (bestScore < 5) {
    return null;
  }
  
  return bestMatch;
}

function formatDisplayName(cardName, cardType, localId) {
  if (!cardName) return '';
  
  // Clean name: remove any embedded card numbers and variant tokens
  let cleanName = cardName;
  cleanName = cleanName.replace(/\b\d{1,3}\s*\/\s*\d{2,3}\b/g, '').trim();
  
  // Remove variant tokens from name
  for (const type of CANONICAL_TYPES) {
    const regex = new RegExp(`\\b${type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleanName = cleanName.replace(regex, '').trim();
  }
  
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  
  // Build canonical display: Name Type LocalId
  const parts = [cleanName];
  
  if (cardType) {
    parts.push(cardType);
  }
  
  if (localId) {
    parts.push(localId);
  }
  
  return parts.join(' | ');
}

function parseCard(title) {
  // Extract localId and type from title
  const { localId, fullFraction, extractedType } = extractLocalIdAndType(title);
  
  if (!localId) {
    return null; // No valid card number found
  }
  
  // Try matching against catalog
  const catalogMatch = matchCardFromCatalog(title, localId, extractedType);
  
  if (catalogMatch) {
    // Use catalog data
    const displayName = formatDisplayName(
      catalogMatch.name, 
      extractedType || catalogMatch.type, 
      fullFraction || localId
    );
    
    return {
      cardName: catalogMatch.name,
      cardType: extractedType || catalogMatch.type,
      localId: fullFraction || localId,
      displayName,
      cardKey: `${catalogMatch.name}|${extractedType || catalogMatch.type}|${localId}`
    };
  }
  
  // Fallback: no catalog match, return null (better than wrong data)
  return null;
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

async function fetchTCGdexImage(baseName, variant, cardNumber, ebayTitle) {
  try {
    if (!cardNumber || !baseName) return null;
    
    // Parse localId from card number (e.g., "013/094" -> "013")
    const localId = cardNumber.split('/')[0];
    
    // Build search name (baseName + variant if present)
    const searchName = variant ? `${baseName} ${variant}` : baseName;
    
    // Search TCGdex by card name
    const searchUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) return null;
    
    const cards = await response.json();
    if (!cards || cards.length === 0) return null;
    
    // Filter cards by localId
    const matchingCards = cards.filter(card => card.localId === localId);
    
    if (matchingCards.length === 0) return null;
    
    // If exactly one match, return it
    if (matchingCards.length === 1) {
      const card = matchingCards[0];
      return {
        tcgdex_card_id: card.id,
        tcgdex_image_url: `${card.image}/high.webp`
      };
    }
    
    // Multiple matches - use set name overlap to find best match
    const ebayTitleLower = ebayTitle.toLowerCase();
    const ebayTokens = ebayTitleLower.split(/\s+/);
    
    let bestMatch = null;
    let bestOverlapScore = 0;
    
    for (const card of matchingCards) {
      if (!card.set?.name) continue;
      
      const setNameLower = card.set.name.toLowerCase();
      const setTokens = setNameLower.split(/\s+/);
      
      // Count overlapping tokens
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
    
    // Only return if we have a confident match (at least one overlapping token)
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
        
        // RAW-ONLY: Filter graded/slab listings first
        if (hasGradingKeyword(title)) continue;
        if (hasExcludeKeyword(title)) continue;
        if (!item.price?.value) continue;
        
        // Parse card using catalog matching
        const parsed = parseCard(title);
        
        // Skip if no valid match found
        if (!parsed) continue;
        
        const price = parseFloat(item.price.value);
        const isAuction = item.buyingOptions?.includes('AUCTION') || false;
        
        if (!cardMap.has(parsed.cardKey)) {
          cardMap.set(parsed.cardKey, {
            card_key: parsed.cardKey,
            card_name: parsed.displayName,
            card_number: parsed.localId,
            card_base_name: parsed.cardName,
            card_type: parsed.cardType,
            frequency_count: 0,
            auction_count: 0,
            total_count: 0,
            sampled_prices: [],
            search_url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(parsed.cardName + ' ' + (parsed.cardType || '') + ' ' + parsed.localId)}&_sacat=183454`,
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
      
      // Fetch TCGdex image - pass original title for set matching
      const originalTitle = Array.from(cardMap.entries())
        .find(([key, val]) => key === cardKey)?.[1]?.original_title || '';
      
      // Use parsed card data for TCGdex search
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