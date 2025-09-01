let SYNC_ENDPOINT = '';
(async ()=>{
  try {
    const res = await fetch('sync-config.json', { cache: 'no-cache' });
    if (res.ok) { const cfg = await res.json(); if (cfg.SYNC_ENDPOINT) SYNC_ENDPOINT = cfg.SYNC_ENDPOINT; }
  } catch {}
})();

async function trySync(payload){
  const enabled = localStorage.getItem('sd_cloud_sync') === '1';
  if (!enabled || !SYNC_ENDPOINT) return;
  try {
    await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'fullReplace', data: payload })
    });
  } catch (e){ console.warn('Sync failed (non-blocking):', e); }
}

async function upsertPlayerPublic(pub){
  const enabled = localStorage.getItem('sd_cloud_sync') === '1';
  if (!enabled || !SYNC_ENDPOINT) return;
  try {
    await fetch(SYNC_ENDPOINT + '?type=upsertPlayerPublic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pub)
    });
  } catch (e){ console.warn('Player upsert failed:', e); }
}

async function getPlayerPublicById(id){
  if (!SYNC_ENDPOINT) { throw new Error('No sync endpoint configured'); }
  const res = await fetch(SYNC_ENDPOINT + '?type=getPlayerPublicById&id=' + encodeURIComponent(id), { method:'GET' });
  if (!res.ok) return null;
  return await res.json();
}

// New: name search (first/last regex on public directory)
async function searchPlayersByName(q){
  if (!SYNC_ENDPOINT) return [];
  const res = await fetch(SYNC_ENDPOINT + '?type=searchPlayersByName&q=' + encodeURIComponent(q), { method: 'GET' });
  if (!res.ok) return [];
  return await res.json();
}
