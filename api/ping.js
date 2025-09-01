const clientPromise = require('./_mongo');
const { cors } = require('./_util');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
