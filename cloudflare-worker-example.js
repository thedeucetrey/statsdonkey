/**
 * Cloudflare Worker proxy for MongoDB Atlas Data API.
 * Add Secrets in Worker Settings:
 * - DATA_API_URL (action endpoint, e.g., replaceOne)
 * - DATA_API_KEY
 * - DATA_SOURCE (cluster name)
 * - DATABASE (e.g., statsdonkey)
 * - COLLECTION (e.g., tenant_snapshots)
 */
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const origin = new URL(request.url).origin;
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'content-type' };

    try {
      const body = await request.json();
      const doc = { _id: 'argos_demo', payload: body.data, updatedAt: new Date().toISOString() };

      const res = await fetch(env.DATA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': env.DATA_API_KEY },
        body: JSON.stringify({
          dataSource: env.DATA_SOURCE,
          database: env.DATABASE,
          collection: env.COLLECTION,
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        })
      });

      return new Response(await res.text(), { status: res.status, headers: cors });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
    }
  }
};
