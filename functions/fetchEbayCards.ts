import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const APP_ID = Deno.env.get("EBAY_APP_ID");
    const CERT_ID = Deno.env.get("EBAY_CERT_ID");

    // Get OAuth token
    const credentials = btoa(`${APP_ID}:${CERT_ID}`);
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch cards from eBay
    const allCards = [];
    const seenTitles = new Set();
    let offset = 0;
    const limit = 200; // eBay max per request

    while (allCards.length < 2000 && offset < 10000) {
      const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=pokemon+card&sort=price&limit=${limit}&offset=${offset}&category_ids=183454&filter=conditionIds:{1000|1500|2000|2500|3000}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      });

      const data = await response.json();
      
      if (!data.itemSummaries || data.itemSummaries.length === 0) break;

      for (const item of data.itemSummaries) {
        // Skip duplicates based on title
        const normalizedTitle = item.title?.toLowerCase().trim();
        if (seenTitles.has(normalizedTitle)) continue;
        seenTitles.add(normalizedTitle);

        // Only include items with valid prices
        if (item.price?.value) {
          allCards.push({
            id: item.itemId,
            name: item.title,
            price: parseFloat(item.price.value),
            currency: item.price.currency,
            image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl,
            condition: item.condition,
            buyItNowUrl: item.itemWebUrl,
            seller: item.seller?.username
          });
        }

        if (allCards.length >= 2000) break;
      }

      offset += limit;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sort by price descending and take top 2000
    const topCards = allCards
      .sort((a, b) => b.price - a.price)
      .slice(0, 2000);

    return Response.json({ cards: topCards });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});