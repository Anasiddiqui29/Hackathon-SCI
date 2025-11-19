// Connect to backend WebSocket and update DOM in real-time
const wsUrl = 'ws://localhost:4000';
const ws = new WebSocket(wsUrl);

const energyList = document.getElementById('energy-list');
const roomList = document.getElementById('room-list');
const alertsList = document.getElementById('alerts-list');

function upsert(selector, id, html) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = selector;
    selector === 'bld' && (el.className += ' bld');
    (selector === 'room') && (el.className += ' room');
    if (selector === 'bld') energyList.appendChild(el);
    if (selector === 'room') roomList.appendChild(el);
  }
  el.innerHTML = html;
}

function addAlert(ticket) {
  const li = document.createElement('li');
  li.className = 'alert-item';
  li.textContent = `[${ticket.type}] ${ticket.building || ticket.roomId || ''} — ${ticket.note} (${ticket.created_at})`;
  alertsList.prepend(li);
}

ws.addEventListener('open', () => console.log('Connected to backend WS'));

ws.addEventListener('message', (ev) => {
  const obj = JSON.parse(ev.data);
  if (obj.event === 'initial_state') {
    // render initial state
    const s = obj.state;
    Object.entries(s.buildings).forEach(([b, data]) => {
      upsert('bld', 'bld-'+b, `<strong>Building ${b}</strong><div>${data.energy_kw || 0} kW</div>`);
    });
    Object.entries(s.rooms).forEach(([r, data]) => {
      upsert('room','room-'+r, `<strong>${r}</strong><div>Occupied: ${data.occupied} — ${data.occupancy_count}</div>`);
    });
    (s.maintenance || []).forEach(t => addAlert(t));
  } else if (obj.event === 'energy_update') {
    const id = 'bld-'+obj.building;
    upsert('bld', id, `<strong>Building ${obj.building}</strong><div>${obj.kw} kW</div><div><small>${new Date(obj.ts).toLocaleTimeString()}</small></div>`);
  } else if (obj.event === 'occupancy_update') {
    const id = 'room-'+obj.roomId;
    upsert('room', id, `<strong>${obj.roomId}</strong><div>Occupied: ${obj.occupied} — Count: ${obj.count}</div><div><small>${new Date(obj.ts).toLocaleTimeString()}</small></div>`);
  } else if (obj.event === 'alert') {
    addAlert(obj.ticket);
  }
});

ws.addEventListener('close', () => console.log('WS closed'));
