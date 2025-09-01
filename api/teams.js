const clientPromise = require('./_mongo');

module.exports = async (req, res) => {
  // CORS for your GitHub Pages origin
  res.setHeader('Access-Control-Allow-Origin', 'https://thedeucetrey.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const DB_NAME = process.env.DB_NAME || 'statsdonkey';

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (req.method === 'GET') {
      const name = (req.query.name || 'Argos');
      const doc = await db.collection('teams').findOne({ name });
      if (doc) { delete doc._id; return res.status(200).json(doc); }
      return res.status(200).json({ team: { name }, roster: [], schedule: [], stats: {} });
    }

    if (req.method === 'POST') {
      const payload = req.body && req.body.data ? req.body.data : req.body;
      const name = payload?.team?.name || 'Argos';
      const doc = {
        name,
        team: { name, logo: payload?.team?.logo || '' },
        roster: Array.isArray(payload?.roster) ? payload.roster : [],
        schedule: Array.isArray(payload?.schedule) ? payload.schedule : [],
        stats: payload?.stats && typeof payload.stats === 'object' ? payload.stats : {},
        updatedAt: new Date().toISOString(),
      };
      await db.collection('teams').updateOne({ name }, { $set: doc }, { upsert: true });
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
