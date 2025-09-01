const clientPromise = require('./_mongo');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://thedeucetrey.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const DB_NAME = process.env.DB_NAME || 'statsdonkey';

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const players = db.collection('players');

    if (req.method === 'GET') {
      const { id, q } = req.query || {};
      if (id) {
        const doc = await players.findOne({ id });
        if (doc) delete doc._id;
        return res.status(200).json(doc || null);
      }
      if (q) {
        const results = await players.find({
          $or: [
            { first: { $regex: q, $options: 'i' } },
            { last:  { $regex: q, $options: 'i' } }
          ]
        }, { projection: { _id: 0 } }).limit(10).toArray();
        return res.status(200).json(results);
      }
      return res.status(400).json({ ok: false, error: 'Provide id or q' });
    }

    if (req.method === 'POST') {
      const { id, first, last, number, positions, spnRank, nsaRank } = req.body || {};
      if (!id || !first || !last) return res.status(400).json({ ok:false, error:'id, first, last required' });
      await players.updateOne(
        { id },
        { $set: { id, first, last, number, positions, spnRank, nsaRank, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ ok:false, error:'Method Not Allowed' });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
};
