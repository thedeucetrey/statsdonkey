// CORS + robust JSON body parsing
module.exports.readJson = async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise(resolve => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
};

module.exports.cors = function cors(res) {
  // While debugging you can leave '*' here.
  // When stable, change to 'https://thedeucetrey.github.io'.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};
