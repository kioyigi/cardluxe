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

async function fetchTCGdexCardDetails(tcgdexId) {
  try {
    const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${tcgdexId}`);
    if (!response.ok) return null;
    
    const card = await response.json();
    
    return {
      name: card.name || '',
      types: card.types || [],
      rarity: card.rarity || 'Unknown',
      imageUrl: card.image ? `${card.image}/high.webp` : null,
      hp: card.hp || null,
      category: card.category || null
    };
  } catch (error) {
    console.error(`Failed to fetch TCGdex data for ${tcgdexId}:`, error.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('Fetching CSV from GitHub...');
    const csvResponse = await fetch(CSV_URL);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
    }
    
    const csvText = await csvResponse.text();
    const csvData = parseCSV(csvText);
    
    console.log(`Parsed ${csvData.length} cards from CSV`);
    
    // Sort by avg1_usd descending
    csvData.sort((a, b) => parseFloat(b.avg1_usd) - parseFloat(a.avg1_usd));
    
    // Clear existing trending cards
    console.log('Clearing old trending cards...');
    const oldCards = await base44.asServiceRole.entities.TrendingCard.filter({});
    for (const card of oldCards) {
      await base44.asServiceRole.entities.TrendingCard.delete(card.id);
    }
    
    console.log('Processing top cards and fetching TCGdex details...');
    const trendingCards = [];
    const now = new Date().toISOString();
    
    // Process top 100 cards (or adjust limit as needed)
    const topCards = csvData.slice(0, 100);
    
    for (let i = 0; i < topCards.length; i++) {
      const row = topCards[i];
      const tcgdexId = row.tcgdex_id;
      const activityScore = parseFloat(row.avg1_usd);
      
      if (!tcgdexId || isNaN(activityScore)) continue;
      
      console.log(`Processing card ${i + 1}/${topCards.length}: ${tcgdexId}`);
      
      // Fetch detailed card info from TCGdex
      const cardDetails = await fetchTCGdexCardDetails(tcgdexId);
      
      if (!cardDetails) {
        console.log(`Skipping ${tcgdexId} - failed to fetch details`);
        continue;
      }
      
      const trendingCard = {
        tcgdex_id: tcgdexId,
        card_name: cardDetails.name,
        card_number: row.number || '',
        card_type: cardDetails.category || '',
        card_rarity: cardDetails.rarity,
        card_image_url: cardDetails.imageUrl,
        activity_score: activityScore,
        card_price: activityScore, // Using avg1_usd as the price indicator
        rank: i + 1,
        last_updated: now
      };
      
      trendingCards.push(trendingCard);
      
      // Small delay to avoid rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Bulk insert trending cards
    console.log(`Inserting ${trendingCards.length} trending cards...`);
    if (trendingCards.length > 0) {
      await base44.asServiceRole.entities.TrendingCard.bulkCreate(trendingCards);
    }
    
    return Response.json({
      success: true,
      cards_processed: trendingCards.length,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});