const clientPromise = require('./_mongo');
const { readJson, cors } = require('./_util');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const DB_NAME = process.env.DB_NAME || 'statsdonkey';

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    if (req.method === 'GET') {
      const name = (req.query && req.query.name) || 'Argos';
      const doc = await db.collection('teams').findOne({ name }, { projection: { _id: 0 } });
      if (doc) return res.status(200).json(doc);
      return res.status(200).json({ team: { name }, roster: [], schedule: [], stats: {} });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const payload = body && body.data ? body.data : body;
      const name = (payload && payload.team && payload.team.name) || 'Argos';

      const doc = {
        name,
        team: { name, logo: (payload.team && payload.team.logo) || '' },
        roster: Array.isArray(payload.roster) ? payload.roster : [],
        schedule: Array.isArray(payload.schedule) ? payload.schedule : [],
        stats: (payload.stats && typeof payload.stats === 'object') ? payload.stats : {},
        updatedAt: new Date().toISOString(),
      };

      await db.collection('teams').updateOne({ name }, { $set: doc }, { upsert: true });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};

