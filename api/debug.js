const clientPromise = require('./_mongo');
const { cors } = require('./_util');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const raw = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.DB_NAME || '').trim();

  let parsed = {};
  try {
    const u = new URL(raw);
    parsed = {
      protocol: u.protocol,
      host: u.host,
      username: decodeURIComponent(u.username || ''),
      passwordPresent: !!u.password,
      pathname: u.pathname,
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

