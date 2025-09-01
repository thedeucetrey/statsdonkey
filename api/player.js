const clientPromise = require('./_mongo');
const { readJson, cors } = require('./_util');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const DB_NAME = process.env.DB_NAME || 'statsdonkey';

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const players = db.collection('players');

    if (req.method === 'GET') {
      const q = (req.query && (req.query.q || req.query.id)) ? req.query : {};
      if (q.id) {
        const doc = await players.findOne({ id: q.id }, { projection: { _id: 0 } });
        return res.status(200).json(doc || null);
      }
      if (q.q) {
        const results = await players.find({
          $or: [
            { first: { $regex: q.q, $options: 'i' } },
            { last:  { $regex: q.q, $options: 'i' } }
          ]
        }, { projection: { _id: 0 } }).limit(10).toArray();
        return res.status(200).json(results);
      }
      return res.status(400).json({ ok: false, error: 'Provide id or q' });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const { id, first, last, number, positions, spnRank, nsaRank } = body || {};
      if (!id || !first || !last) return res.status(400).json({ ok:false, error:'id, first, last required' });
      await players.updateOne(
        { id },
        { $set: { id, first, last, number, positions, spnRank, nsaRank, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e.message||e) });
  }
};
