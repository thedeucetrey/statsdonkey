// ========== Simple Auth & Local Storage ==========
const AUTH_KEY = 'sd_auth_v1';
const DATA_KEY = 'sd_data_v1';

const defaultUser = { username: 'Argos', password: '1234' }; // DEMO ONLY (do not use in production)
const defaultData = {
  team: { name: 'Argos', logo: '' },       // logo is dataURL
  roster: [],                               // [{id,first,last,number,positions[]}] 
  schedule: [],                             // [{id,date,opponent,time,location}]
  stats: {}                                 // per-player future rollups
};

function loadAuth(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }catch{ return null; } }
function saveAuth(obj){ localStorage.setItem(AUTH_KEY, JSON.stringify(obj)); }
function clearAuth(){ localStorage.removeItem(AUTH_KEY); }

function loadData(){
  try{
    const v = JSON.parse(localStorage.getItem(DATA_KEY));
    if (v) return v;
  }catch{}
  localStorage.setItem(DATA_KEY, JSON.stringify(defaultData));
  return JSON.parse(localStorage.getItem(DATA_KEY));
}
function saveData(d){ localStorage.setItem(DATA_KEY, JSON.stringify(d)); }

// ========== DOM helpers ==========
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function formatDate(s){ try{ return new Date(s + 'T00:00:00').toLocaleDateString(); }catch{ return s; }}

// ========== Login / Logout ==========
function onLogin(){
  const u = $('#login-user').value.trim();
  const p = $('#login-pass').value;
  if (u === defaultUser.username && p === defaultUser.password){
    saveAuth({ user: u, at: Date.now() });
    $('#login-error').classList.add('hidden');
    route();
  } else {
    $('#login-error').classList.remove('hidden');
  }
}
function onLogout(){
  clearAuth();
  route();
}

// ========== Team Profile ==========
function initTeam(){
  const data = loadData();
  $('#team-name').value = data.team.name || '';
  const img = $('#logo-preview');
  img.src = data.team.logo || '';
  img.style.display = data.team.logo ? 'block' : 'none';
}

function onSaveTeam(){
  const data = loadData();
  data.team.name = $('#team-name').value.trim() || 'Team';
  saveData(data);
  alert('Team profile saved.');
}

function onLogoUpload(ev){
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = loadData();
    data.team.logo = reader.result; // data URL
    saveData(data);
    initTeam();
  };
  reader.readAsDataURL(file);
}

// ========== CSV helpers ==========
function parseCSV(text){
  // RFC4180-ish parser supporting quotes and commas
  const rows = [];
  let i=0, field='', row=[], inQuotes=false;
  while(i < text.length){
    const c = text[i];
    if (inQuotes){
      if (c === '"'){
        if (text[i+1] === '"'){ field += '"'; i+=2; continue; }
        inQuotes = false; i++; continue;
      } else { field += c; i++; continue; }
    } else {
      if (c === '"'){ inQuotes = true; i++; continue; }
      if (c === ','){ row.push(field.trim()); field=''; i++; continue; }
      if (c === '\n' || c === '\r'){
        // handle \r\n, \n, \r
        // push row only if something present
        if (field.length || row.length){ row.push(field.trim()); rows.push(row); }
        field=''; row=[];
        // consume possible \r\n pair
        if (c==='\r' && text[i+1]==='\n') i+=2; else i++;
        continue;
      }
      field += c; i++; continue;
    }
  }
  if (field.length || row.length){ row.push(field.trim()); rows.push(row); }
  return rows;
}

function csvToObjects(text){
  const rows = parseCSV(text).filter(r => r.length && r.some(x=>x!==''));
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.toLowerCase());
  return rows.slice(1).map(r => {
    const obj = {};
    for (let i=0;i<headers.length;i++) obj[headers[i]] = (r[i] ?? '').trim();
    return obj;
  });
}

function downloadText(filename, text){
  const blob = new Blob([text], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

// ========== Roster upload ==========
function onRosterUpload(){
  const f = $('#roster-file').files && $('#roster-file').files[0];
  if (!f) return alert('Choose a CSV file first');
  const reader = new FileReader();
  reader.onload = () => {
    const items = csvToObjects(String(reader.result));
    const data = loadData();
    for (const it of items){
      const id = crypto.randomUUID();
      const positions = (it.positions || '').split(/\s*,\s*/).filter(Boolean);
      data.roster.push({
        id,
        first: it.first || '',
        last: it.last || '',
        number: it.number ? Number(it.number) : undefined,
        positions
      });
    }
    saveData(data);
    renderRosterTable();
    renderStatsTable();
  };
  reader.readAsText(f);
}

function renderRosterTable(){
  const data = loadData();
  $('#roster-count').textContent = data.roster.length ? (data.roster.length + ' players') : 'No players yet';
  const rows = data.roster.map(p => `<tr><td>${p.first}</td><td>${p.last}</td><td>${p.number||''}</td><td>${(p.positions||[]).join(', ')}</td></tr>`).join('');
  $('#tbl-roster').innerHTML = '<thead><tr><th>First</th><th>Last</th><th>#</th><th>Positions</th></tr></thead><tbody>' + rows + '</tbody>';
}

function onRosterTemplate(){
  const text = 'first,last,number,positions\nJane,Doe,12,SS,3B\nJohn,Smith,7,OF';
  downloadText('roster-template.csv', text);
}

// ========== Schedule upload ==========
function onScheduleUpload(){
  const f = $('#schedule-file').files && $('#schedule-file').files[0];
  if (!f) return alert('Choose a CSV file first');
  const reader = new FileReader();
  reader.onload = () => {
    const items = csvToObjects(String(reader.result));
    const data = loadData();
    for (const it of items){
      const id = crypto.randomUUID();
      data.schedule.push({
        id,
        date: it.date || '',
        opponent: it.opponent || '',
        time: it.time || '',
        location: it.location || ''
      });
    }
    saveData(data);
    renderScheduleTable();
  };
  reader.readAsText(f);
}

function renderScheduleTable(){
  const data = loadData();
  $('#schedule-count').textContent = data.schedule.length ? (data.schedule.length + ' games') : 'No games yet';
  const rows = data.schedule
    .sort((a,b)=> String(a.date).localeCompare(String(b.date)))
    .map(g => `<tr><td>${formatDate(g.date)}</td><td>${g.opponent}</td><td>${g.time||''}</td><td>${g.location||''}</td></tr>`).join('');
  $('#tbl-schedule').innerHTML = '<thead><tr><th>Date</th><th>Opponent</th><th>Time</th><th>Location</th></tr></thead><tbody>' + rows + '</tbody>';
}

function onScheduleTemplate(){
  const text = 'date,opponent,time,location\n2025-09-01,Team A,7:00 PM,Field 3\n2025-09-08,Team B,6:30 PM,Field 1';
  downloadText('schedule-template.csv', text);
}

// ========== Stats (sortable) ==========
let currentSortKey = 'Player', currentSortDir = 'asc';

function computeStats(){
  const data = loadData();
  // Initially, zeroed stats until scoring is implemented.
  return data.roster.map(p => ({
    Player: `${p.first} ${p.last}`.trim(),
    PA: 0, AB: 0, H: 0, '1B': 0, '2B': 0, '3B': 0, HR: 0, BB: 0, K: 0,
    AVG: '0.000', OBP: '0.000', SLG: '0.000', OPS: '0.000'
  }));
}

function renderStatsTable(){
  let rows = computeStats();
  // sort
  rows.sort((a,b) => {
    const A = a[currentSortKey]; const B = b[currentSortKey];
    const num = !isNaN(parseFloat(A)) && !isNaN(parseFloat(B));
    if (num){
      return (currentSortDir==='asc' ? 1 : -1) * (parseFloat(A) - parseFloat(B));
    } else {
      return (currentSortDir==='asc' ? 1 : -1) * String(A).localeCompare(String(B));
    }
  });
  const headers = ['Player','PA','AB','H','1B','2B','3B','HR','BB','K','AVG','OBP','SLG','OPS'];
  const thead = '<thead><tr>' + headers.map(h => `<th class="sortable-col" data-key="${h}">${h}</th>`).join('') + '</tr></thead>';
  const tbody = '<tbody>' + rows.map(r => '<tr>' + headers.map(h => `<td>${r[h]}</td>`).join('') + '</tr>').join('') + '</tbody>';
  $('#tbl-stats').innerHTML = thead + tbody;
  // click handlers
  $$('#tbl-stats th.sortable-col').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (currentSortKey === key){
        currentSortDir = (currentSortDir === 'asc' ? 'desc' : 'asc');
      } else {
        currentSortKey = key; currentSortDir = 'asc';
      }
      renderStatsTable();
    });
  });
}

// ========== Routing (login vs team view) ==========
function route(){
  const authed = !!loadAuth();
  if (authed){
    hide($('#view-login'));
    show($('#view-team'));
    show($('#btn-logout'));
    initTeam();
    renderRosterTable();
    renderScheduleTable();
    renderStatsTable();
  } else {
    show($('#view-login'));
    hide($('#view-team'));
    hide($('#btn-logout'));
  }
}

// ========== Wire up ==========
document.addEventListener('DOMContentLoaded', () => {
  $('#btn-login').addEventListener('click', onLogin);
  $('#btn-logout').addEventListener('click', onLogout);
  $('#btn-save-team').addEventListener('click', onSaveTeam);
  $('#team-logo').addEventListener('change', onLogoUpload);

  $('#btn-roster-upload').addEventListener('click', onRosterUpload);
  $('#btn-roster-template').addEventListener('click', onRosterTemplate);

  $('#btn-schedule-upload').addEventListener('click', onScheduleUpload);
  $('#btn-schedule-template').addEventListener('click', onScheduleTemplate);

  route();
});
