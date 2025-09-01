// statsdonkey/api/debug.js
const clientPromise = require('./_mongo');

module.exports = async (req, res) => {
  // CORS (debug: allow all so you can hit from anywhere)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Safely summarize env vars (no secrets exposed)
  const raw = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.DB_NAME || '').trim();

  let parsed = {};
  try {
    const u = new URL(raw);
    parsed = {
      protocol: u.protocol,                // should be "mongodb+srv:"
      host: u.host,                        // e.g., "thedeucetrey.fk0rckg.mongodb.net"
      username: decodeURIComponent(u.username || ''),
      passwordPresent: !!u.password,
      pathname: u.pathname,                // usually "/"
      searchParams: {
        retryWrites: u.searchParams.get('retryWrites'),
        w: u.searchParams.get('w'),
        appName: u.searchParams.get('appName')
      }
    };
  } catch (e) {
    parsed = { parseError: String(e.message || e) };
  }

  const info = {
    envPresent: { MONGODB_URI: !!raw, DB_NAME: !!dbName },
    dbName,
    url: parsed
  };

  // Try a real connection/ping
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return res.status(200).json({ ok: true, info });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      info,
      name: e.name,
      code: e.code,
      codeName: e.codeName,
      message: String(e.message || e)
    });
  }
};
