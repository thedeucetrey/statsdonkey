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
