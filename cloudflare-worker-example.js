/**
 * Cloudflare Worker proxy for MongoDB Atlas Data API.
 * Secrets (Worker Settings → Variables & Secrets):
 * - DATA_API_BASE (e.g., https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1/action)
 * - DATA_API_KEY
 * - DATA_SOURCE (cluster name)
 * - DATABASE (e.g., statsdonkey)
 * - SNAP_COLLECTION (e.g., tenant_snapshots)
 * - PLAYERS_COLLECTION (e.g., players_public)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const origin = url.origin;
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'content-type' };

    if (request.method === 'OPTIONS') {
      return new Response('', { status: 204, headers: cors });
    }

    try {
      if (request.method === 'POST' && type === 'upsertPlayerPublic') {
        const body = await request.json();
        const doc = {
          _id: body.id,
          id: body.id,
          first: body.first,
          last: body.last,
          number: body.number || '',
          positions: Array.isArray(body.positions) ? body.positions : [],
          spnRank: body.spnRank || '',
          nsaRank: body.nsaRank || '',
          updatedAt: new Date().toISOString()
        };
        const res = await fetch(env.DATA_API_BASE + '/updateOne', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': env.DATA_API_KEY },
          body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE,
            collection: env.PLAYERS_COLLECTION,
            filter: { _id: doc._id },
            update: { $set: doc },
            upsert: true
          })
        });
        const txt = await res.text();
        return new Response(txt, { status: res.status, headers: cors });
      }

      if (request.method === 'GET' && type === 'getPlayerPublicById') {
        const id = url.searchParams.get('id');
        const res = await fetch(env.DATA_API_BASE + '/findOne', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': env.DATA_API_KEY },
          body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE,
            collection: env.PLAYERS_COLLECTION,
            filter: { _id: id },
            projection: { _id: 0, id: 1, first: 1, last: 1, number: 1, positions: 1, spnRank: 1, nsaRank: 1 }
          })
        });
        const result = await res.json();
        return new Response(JSON.stringify(result.document || null), { status: 200, headers: cors });
      }

      if (request.method === 'GET' && type === 'searchPlayersByName') {
        const q = url.searchParams.get('q') || '';
        const regex = { $regex: q, $options: 'i' };
        const res = await fetch(env.DATA_API_BASE + '/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': env.DATA_API_KEY },
          body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE,
            collection: env.PLAYERS_COLLECTION,
            filter: { $or: [ { first: regex }, { last: regex } ] },
            limit: 10,
            projection: { _id: 0, id: 1, first: 1, last: 1, number: 1, positions: 1, spnRank: 1, nsaRank: 1 }
          })
        });
        const result = await res.json();
        return new Response(JSON.stringify(result.documents || []), { status: 200, headers: cors });
      }

      // Full snapshot replace (optional)
      if (request.method === 'POST' && type === null) {
        const body = await request.json();
        const doc = { _id: 'argos_demo', payload: body.data, updatedAt: new Date().toISOString() };
        const res = await fetch(env.DATA_API_BASE + '/replaceOne', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': env.DATA_API_KEY },
          body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE,
            collection: env.SNAP_COLLECTION,
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
          })
        });
        const txt = await res.text();
        return new Response(txt, { status: res.status, headers: cors });
      }

      return new Response('Not found', { status: 404, headers: cors });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
    }
  }
};
