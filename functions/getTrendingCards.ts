import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CSV_URL = 'https://raw.githubusercontent.com/kioyigi/cardluxe/refs/heads/main/Static/tcgdex_en_avg1_daily_min15.csv';

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
}

async function fetchTCGdexCard(tcgdexId) {
  try {
    const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${tcgdexId}`);
    if (!response.ok) return null;
    
    const card = await response.json();
    return {
      name: card.name || '',
      rarity: card.rarity || 'Unknown',
      types: card.types || [],
      category: card.category || '',
      image: card.image ? `${card.image}/high.webp` : null
    };
  } catch (error) {
    console.error(`Error fetching TCGdex card ${tcgdexId}:`, error);
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
    
    // Fetch CSV from GitHub
    const csvResponse = await fetch(CSV_URL);
    if (!csvResponse.ok) {
      return Response.json({ error: 'Failed to fetch CSV' }, { status: 500 });
    }
    
    const csvText = await csvResponse.text();
    const csvData = parseCSV(csvText);
    
    // Sort by avg1_usd descending
    csvData.sort((a, b) => parseFloat(b.avg1_usd) - parseFloat(a.avg1_usd));
    
    // Clear old trending cards
    const oldCards = await base44.asServiceRole.entities.TrendingCard.filter({});
    for (const card of oldCards) {
      await base44.asServiceRole.entities.TrendingCard.delete(card.id);
    }
    
    // Process each card and fetch from TCGdex
    const trendingCards = [];
    const now = new Date().toISOString();
    
    for (let i = 0; i < Math.min(csvData.length, 500); i++) {
      const row = csvData[i];
      const tcgdexId = row.tcgdex_id;
      const activityScore = parseFloat(row.avg1_usd);
      
      // Fetch full card data from TCGdex
      const tcgdexCard = await fetchTCGdexCard(tcgdexId);
      
      if (tcgdexCard) {
        trendingCards.push({
          tcgdex_id: tcgdexId,
          card_name: tcgdexCard.name,
          card_number: row.number,
          card_type: tcgdexCard.category,
          card_rarity: tcgdexCard.rarity,
          card_image: tcgdexCard.image,
          activity_score: activityScore,
          card_price: activityScore, // Using avg1_usd as price
          rank: i + 1,
          last_updated: now
        });
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Bulk insert trending cards
    if (trendingCards.length > 0) {
      await base44.asServiceRole.entities.TrendingCard.bulkCreate(trendingCards);
    }
    
    return Response.json({
      success: true,
      cards_processed: trendingCards.length,
      timestamp: now
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});