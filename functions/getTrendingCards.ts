import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch CSV from GitHub
    const csvUrl = 'https://raw.githubusercontent.com/kioyigi/cardluxe/refs/heads/main/Static/tcgdex_en_avg1_daily_min15.csv';
    const csvResponse = await fetch(csvUrl);
    
    if (!csvResponse.ok) {
      return Response.json({ error: 'Failed to fetch CSV from GitHub' }, { status: 500 });
    }

    const csvText = await csvResponse.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Parse CSV
    const cards = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      if (row.tcgdex_id && row.avg1_usd) {
        cards.push({
          tcgdex_id: row.tcgdex_id,
          name: row.name,
          number: row.number,
          avg1_usd: parseFloat(row.avg1_usd)
        });
      }
    }

    // Sort by avg1_usd descending
    cards.sort((a, b) => b.avg1_usd - a.avg1_usd);

    // Clear existing trending cards
    const existingCards = await base44.asServiceRole.entities.TrendingCard.filter({});
    for (const card of existingCards) {
      await base44.asServiceRole.entities.TrendingCard.delete(card.id);
    }

    // Fetch details from TCGdex and store
    const now = new Date().toISOString();
    let processed = 0;
    
    for (const card of cards) {
      try {
        // Fetch card details from TCGdex
        const tcgdexUrl = `https://api.tcgdex.net/v2/en/cards/${card.tcgdex_id}`;
        const tcgdexResponse = await fetch(tcgdexUrl);
        
        if (!tcgdexResponse.ok) {
          continue;
        }
        
        const tcgdexData = await tcgdexResponse.json();
        
        // Create trending card record
        await base44.asServiceRole.entities.TrendingCard.create({
          tcgdex_id: card.tcgdex_id,
          card_name: tcgdexData.name || card.name,
          card_number: card.number,
          card_type: tcgdexData.category || '',
          card_rarity: tcgdexData.rarity || 'Unknown',
          card_image: tcgdexData.image ? `${tcgdexData.image}/high.webp` : '',
          activity_score: card.avg1_usd,
          card_price_usd: card.avg1_usd,
          last_updated: now
        });
        
        processed++;
        
        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing card ${card.tcgdex_id}:`, error.message);
      }
    }

    return Response.json({
      success: true,
      cards_processed: processed,
      total_cards: cards.length,
      timestamp: now
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});