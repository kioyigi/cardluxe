// This function has been deprecated and replaced by getTrendingCards.js
// Please use getTrendingCards instead

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  return Response.json({ 
    error: 'This function is deprecated. Use getTrendingCards instead.' 
  }, { status: 410 });
});