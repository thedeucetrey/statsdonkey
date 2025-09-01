const DATA_KEY = 'sd_data_v1';
function loadData(){ try{ return JSON.parse(localStorage.getItem(DATA_KEY)) || {schedule:[]}; }catch{ return {schedule:[]}; } }

let current = new Date();
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }

function render(){
  const data = loadData();
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);

  document.getElementById('cal-title').textContent = monthStart.toLocaleString(undefined, { month:'long', year:'numeric' });

  const firstDayIndex = monthStart.getDay(); // 0=Sun
  const daysInMonth = monthEnd.getDate();

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  // header row
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (const d of days){
    const h = document.createElement('div');
    h.className = 'cell head';
    h.textContent = d;
    grid.appendChild(h);
  }
  // blanks before first day
  for (let i=0;i<firstDayIndex;i++){
    const blank = document.createElement('div');
    blank.className = 'cell blank';
    grid.appendChild(blank);
  }
  // days
  for (let day=1; day<=daysInMonth; day++){
    const cell = document.createElement('div');
    cell.className = 'cell day';
    const dateStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const head = document.createElement('div');
    head.className = 'date';
    head.textContent = day;
    cell.appendChild(head);

    const ul = document.createElement('ul');
    ul.className = 'events';
    const items = (data.schedule||[]).filter(g => String(g.date) === dateStr);
    for (const g of items){
      const li = document.createElement('li');
      const home = g.home || 'Home';
      const away = g.away || 'Away';
      const time = g.time || '';
      const field = g.field ? ` @ ${g.field}` : '';
      const comp = g.comp ? ` — ${g.comp}` : '';
      li.textContent = `${time} ${home} vs ${away}${field}${comp}`.trim();
      ul.appendChild(li);
    }
    cell.appendChild(ul);
    grid.appendChild(cell);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prev-month').addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()-1, 1); render(); });
  document.getElementById('next-month').addEventListener('click', () => { current = new Date(current.getFullYear(), current.getMonth()+1, 1); render(); });
  render();
});
