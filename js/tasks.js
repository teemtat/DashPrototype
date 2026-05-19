// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — Outbound Tasks Module
// ═══════════════════════════════════════════════════════

const TASKS_KEY = 'sunsystem_tasks';

const seedTasks = [
  {
    id: 'ORD-2341', name: 'Debt Collection Q2 2026',
    client: 'AIS', dialogue: 'Debt Reminder v3', callerLine: 'AIS Trunk 1',
    contacts: 50000, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '3', retryInterval: '2 hours',
    contactFile: 'contacts_q2.xlsx', dncFile: null,
    status: 'running', progress: 72, processed: 36000,
    connRate: 71.2, avgDuration: '1m 58s', createdAt: '2026-05-02'
  },
  {
    id: 'ORD-2342', name: 'May Upsell Campaign',
    client: 'AIS', dialogue: 'Upsell Package B', callerLine: 'AIS Trunk 2',
    contacts: 30000, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '3', retryInterval: '2 hours',
    contactFile: 'upsell_may.xlsx', dncFile: null,
    status: 'running', progress: 41, processed: 12300,
    connRate: 66.8, avgDuration: '1m 42s', createdAt: '2026-05-05'
  },
  {
    id: 'ORD-2343', name: 'AIS Renewal',
    client: 'AIS', dialogue: 'Package Renewal v1', callerLine: 'AIS Trunk 1',
    contacts: 20000, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '2', retryInterval: '1 hour',
    contactFile: 'AIS_renewal.xlsx', dncFile: null,
    status: 'running', progress: 88, processed: 17600,
    connRate: 69.4, avgDuration: '2m 05s', createdAt: '2026-05-01'
  },
  {
    id: 'ORD-2344', name: 'SCB Loan Follow-up',
    client: 'SCB Bank', dialogue: 'Loan Reminder v2', callerLine: 'SCB Trunk 1',
    contacts: 15000, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '3', retryInterval: '2 hours',
    contactFile: 'scb_loan.xlsx', dncFile: 'scb_dnc.xlsx',
    status: 'paused', progress: 55, processed: 8250,
    connRate: 58.1, avgDuration: '1m 20s', createdAt: '2026-04-28'
  },
  {
    id: 'ORD-2345', name: 'Appointment Reminder Apr',
    client: 'SCB Bank', dialogue: 'Appointment v2', callerLine: 'SCB Trunk 1',
    contacts: 10000, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '2', retryInterval: '1 hour',
    contactFile: 'appointments_apr.xlsx', dncFile: null,
    status: 'completed', progress: 100, processed: 10000,
    connRate: 74.3, avgDuration: '1m 55s', createdAt: '2026-04-15'
  },
  {
    id: 'ORD-2346', name: 'Survey Campaign May',
    client: 'AIS', dialogue: 'Survey v1', callerLine: 'AIS Trunk 3',
    contacts: null, workDays: 'Monday – Friday', workStart: '09:00', workEnd: '17:00',
    maxRetries: '1', retryInterval: '30 min',
    contactFile: null, dncFile: null,
    status: 'pending', progress: 0, processed: null,
    connRate: null, avgDuration: null, createdAt: '2026-05-14'
  }
];

// ── Storage ───────────────────────────────────────────
function Tasks_load() {
  try {
    const s = localStorage.getItem(TASKS_KEY);
    if (s) return JSON.parse(s);
  } catch(e) {}
  const copy = JSON.parse(JSON.stringify(seedTasks));
  localStorage.setItem(TASKS_KEY, JSON.stringify(copy));
  return copy;
}

function Tasks_save() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

let tasks = Tasks_load();
let currentFilter = 'all';
let _editingTaskId = null;

// ── ID generator ──────────────────────────────────────
function Tasks_generateId() {
  const nums = tasks.map(t => parseInt(t.id.replace('ORD-', ''))).filter(n => !isNaN(n));
  const max  = nums.length ? Math.max(...nums) : 2340;
  return 'ORD-' + (max + 1);
}

// ── Permission helpers ────────────────────────────────
// Returns true if the current user can create/edit/delete/pause tasks
function Tasks_canControl() {
  const user = Auth_getCurrentUser();
  return user && ['superadmin', 'admin'].includes(user.role);
}

// ── Filter ────────────────────────────────────────────
function filterTasks(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  Tasks_render();
}

// ── Render task cards ─────────────────────────────────
function Tasks_render() {
  const grid = document.getElementById('task-card-grid');
  if (!grid) return;
  const list = currentFilter === 'all' ? tasks : tasks.filter(t => t.status === currentFilter);
  grid.innerHTML = list.map(Tasks_cardHTML).join('');

  // Sidebar running badge
  const runningCount = tasks.filter(t => t.status === 'running').length;
  const badge = document.getElementById('nav-running-count');
  if (badge) {
    badge.textContent = runningCount;
    badge.style.display = runningCount > 0 ? '' : 'none';
  }

  // Screen KPIs
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('tasks-kpi-total',     tasks.length);
  set('tasks-kpi-running',   tasks.filter(t => t.status === 'running').length);
  set('tasks-kpi-paused',    tasks.filter(t => t.status === 'paused').length);
  set('tasks-kpi-completed', tasks.filter(t => t.status === 'completed').length);
}

// ── Render dashboard section ──────────────────────────
function Tasks_renderDashboard() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const running         = tasks.filter(t => t.status === 'running');
  const totalProcessed  = tasks.reduce((s, t) => s + (t.processed || 0), 0);
  const ratesWithData   = running.filter(t => t.connRate);
  const avgRate = ratesWithData.length
    ? (ratesWithData.reduce((s, t) => s + t.connRate, 0) / ratesWithData.length).toFixed(1) + '%'
    : '—';

  set('dash-kpi-total',     tasks.length);
  set('dash-kpi-active',    running.length);
  set('dash-kpi-processed', totalProcessed > 0 ? totalProcessed.toLocaleString() : '—');
  set('dash-kpi-connrate',  avgRate);

  const tbody = document.getElementById('dash-task-tbody');
  if (!tbody) return;

  const order  = { running: 0, paused: 1, pending: 2, completed: 3 };
  const sorted = [...tasks].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

  const skeletonRow = () => `
    <tr class="skeleton-row">
      <td><div class="skeleton-line" style="width:150px;"></div></td>
      <td><div class="skeleton-line" style="width:55px;"></div></td>
      <td><div class="skeleton-line" style="width:110px;"></div></td>
      <td><div class="progress-wrap"><div class="progress-bar"><div class="progress-fill skeleton-fill"></div></div><div class="skeleton-line" style="width:28px;"></div></div></td>
      <td><div class="skeleton-line" style="width:44px;"></div></td>
      <td><div class="skeleton-pill"></div></td>
      <td><div class="action-group"><div class="skeleton-btn"></div><div class="skeleton-btn"></div></div></td>
    </tr>`;

  tbody.innerHTML = sorted.map(Tasks_tableRowHTML).join('') + skeletonRow() + skeletonRow();
}

function Tasks_tableRowHTML(t) {
  const label    = t.status.charAt(0).toUpperCase() + t.status.slice(1);
  const crDisp   = t.connRate ? t.connRate + '%' : '—';
  const crClass  = t.connRate >= 65 ? 'rate-good' : t.connRate ? 'rate-mid' : '';
  const pct      = t.progress || 0;
  const canCtrl  = Tasks_canControl();

  let actions = '';
  if (canCtrl) {
    // Full control: Admin / Super Admin
    if (t.status === 'running') {
      actions = `<button class="action-btn action-btn-view"  onclick="Tasks_openDetail('${t.id}')">View</button>
                 <button class="action-btn action-btn-pause" onclick="Tasks_confirmStatusChange('${t.id}','paused')">Pause</button>`;
    } else if (t.status === 'paused') {
      actions = `<button class="action-btn action-btn-view"  onclick="Tasks_openDetail('${t.id}')">View</button>
                 <button class="action-btn action-btn-start" onclick="Tasks_confirmStatusChange('${t.id}','running')">Resume</button>`;
    } else if (t.status === 'pending') {
      actions = `<button class="action-btn action-btn-start"  onclick="Tasks_updateStatus('${t.id}','running')">Start</button>
                 <button class="action-btn action-btn-delete" onclick="Tasks_confirmDelete('${t.id}')">Delete</button>`;
    } else {
      actions = `<button class="action-btn action-btn-view" onclick="Tasks_openDetail('${t.id}')">View</button>`;
    }
  } else {
    // View only: Supervisor and below
    actions = `<button class="action-btn action-btn-view" onclick="Tasks_openDetail('${t.id}')">View</button>`;
  }

  return `<tr>
    <td><span class="table-link" onclick="Tasks_openDetail('${t.id}')">${t.name}</span></td>
    <td>${t.client}</td>
    <td>${t.dialogue}</td>
    <td><div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><span class="progress-pct">${pct}%</span></div></td>
    <td>${crClass ? `<span class="${crClass}">${crDisp}</span>` : crDisp}</td>
    <td><span class="status status-${t.status}">${label}</span></td>
    <td><div class="action-group">${actions}</div></td>
  </tr>`;
}

function Tasks_cardHTML(task) {
  const label    = task.status.charAt(0).toUpperCase() + task.status.slice(1);
  let   cardClass = 'task-card';
  if (task.status === 'running')   cardClass += ' task-card-running';
  if (task.status === 'completed') cardClass += ' task-card-done';

  const connColor = task.connRate && task.connRate >= 65 ? '#00a651' : '#e65100';
  const ctDisp    = task.contacts  ? task.contacts.toLocaleString()  : '—';
  const prDisp    = task.processed ? task.processed.toLocaleString() : '—';
  const crDisp    = task.connRate  ? task.connRate + '%' : '—';
  const durDisp   = task.avgDuration || '—';

  const canCtrl = Tasks_canControl();

  let actionBtn = '';
  let editBtn   = '';
  let deleteBtn = '';
  let detailBtn = '';

  if (canCtrl) {
    // Full control buttons for Admin / Super Admin
    if (task.status === 'running')   actionBtn = `<button class="card-btn card-btn-pause"  onclick="Tasks_confirmStatusChange('${task.id}','paused')">Pause</button>`;
    else if (task.status === 'paused')  actionBtn = `<button class="card-btn card-btn-start"  onclick="Tasks_confirmStatusChange('${task.id}','running')">Resume</button>`;
    else if (task.status === 'pending') actionBtn = `<button class="card-btn card-btn-start"  onclick="Tasks_updateStatus('${task.id}','running')">Start</button>`;
    editBtn   = `<button class="card-btn card-btn-edit"   onclick="Tasks_openEdit('${task.id}')">Edit</button>`;
    deleteBtn = `<button class="card-btn card-btn-delete" onclick="Tasks_confirmDelete('${task.id}')">Delete</button>`;
    detailBtn = task.status !== 'pending'
      ? `<button class="card-btn card-btn-detail" onclick="Tasks_openDetail('${task.id}')">Detail</button>` : '';
  } else {
    // View only for Supervisor and below — Detail button only
    detailBtn = `<button class="card-btn card-btn-detail" onclick="Tasks_openDetail('${task.id}')">Detail</button>`;
  }

  return `
  <div class="${cardClass}" id="card-${task.id}">
    <button class="task-card-arrow" onclick="Tasks_openDetail('${task.id}')">↗</button>
    <div class="task-card-top"><span class="status status-${task.status}">${label}</span></div>
    <div class="task-card-id">${task.id}</div>
    <div class="task-card-title">${task.name}</div>
    <div class="task-card-meta">${task.client} &nbsp;·&nbsp; ${task.dialogue} &nbsp;·&nbsp; ${ctDisp} contacts</div>
    <div class="task-card-progress-wrap">
      <div class="task-card-progress-bar"><div class="task-card-progress-fill" style="width:${task.progress}%"></div></div>
      <span class="task-card-pct">${task.progress}%</span>
    </div>
    <div class="task-card-stats">
      <div class="task-stat"><div class="ts-val">${prDisp}</div><div class="ts-lbl">Processed</div></div>
      <div class="task-stat"><div class="ts-val" style="color:${task.connRate ? connColor : '#b0b0b0'}">${crDisp}</div><div class="ts-lbl">Conn. Rate</div></div>
      <div class="task-stat"><div class="ts-val">${durDisp}</div><div class="ts-lbl">Avg Duration</div></div>
    </div>
    <div class="task-card-footer">
      ${detailBtn}${editBtn}${actionBtn}${deleteBtn}
    </div>
  </div>`;
}

// ── Task detail modal ─────────────────────────────────
function Tasks_openDetail(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  document.getElementById('td-title').textContent    = t.name;
  document.getElementById('td-subtitle').textContent = `${t.client} · ${t.dialogue} · Created ${formatDate(t.createdAt)}`;
  const badge = document.getElementById('td-status');
  badge.textContent  = t.status.charAt(0).toUpperCase() + t.status.slice(1);
  badge.className    = `status status-${t.status}`;
  badge.style.marginLeft = 'auto';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('td-contacts',   t.contacts  ? t.contacts.toLocaleString()  : '—');
  set('td-connrate',   t.connRate  ? t.connRate + '%' : '—');
  set('td-processed',  t.processed ? t.processed.toLocaleString() : '—');
  set('td-avgdur',     t.avgDuration || '—');
  set('td-info-client',   t.client);
  set('td-info-dialogue', t.dialogue);
  set('td-info-line',     t.callerLine);
  set('td-info-created',  formatDate(t.createdAt));
  set('td-info-period',   `${t.workDays}, ${t.workStart}–${t.workEnd}`);
  set('td-info-retries',  `${t.maxRetries} attempts`);

  openModal('taskDetail');
  document.querySelectorAll('#modal-taskDetail .tab-btn').forEach((b, i)     => b.classList.toggle('active', i === 0));
  document.querySelectorAll('#modal-taskDetail .tab-content').forEach((c, i) => c.classList.toggle('active', i === 0));
}

// ── Status change ─────────────────────────────────────
function Tasks_confirmStatusChange(id, newStatus) {
  if (!Tasks_canControl()) return; // guard
  const task    = tasks.find(t => t.id === id);
  if (!task) return;
  const isPause = newStatus === 'paused';
  const action  = isPause ? 'Pause' : 'Resume';

  document.getElementById('sc-icon').textContent  = isPause ? '⏸' : '▶';
  document.getElementById('sc-title').textContent = action + ' Task?';
  document.getElementById('sc-name').textContent  = task.name;
  document.getElementById('sc-msg').textContent   = isPause
    ? 'The AI engine will stop dialing new contacts. Progress is saved.'
    : 'The AI engine will resume dialing from where it left off.';

  const btn = document.getElementById('sc-confirm-btn');
  btn.textContent = action;
  btn.className   = isPause ? 'sc-confirm-btn sc-pause' : 'sc-confirm-btn sc-resume';
  btn.onclick     = () => { closeStatusConfirm(); Tasks_updateStatus(id, newStatus); };
  document.getElementById('modal-statusConfirm').classList.add('active');
}

function closeStatusConfirm() {
  document.getElementById('modal-statusConfirm').classList.remove('active');
}

function Tasks_updateStatus(id, newStatus) {
  if (!Tasks_canControl()) return; // guard
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.status = newStatus;
  Tasks_save();
  renderAll();
}

// ── Create / Edit modal ───────────────────────────────
function openCreateTask() {
  _editingTaskId = null;
  document.getElementById('form-mode-title').textContent = 'Create Outbound Task';
  document.getElementById('form-mode-sub').textContent   = 'Fill in the details below to set up a new calling task';
  document.getElementById('form-submit-btn').textContent = 'Create Task';
  Tasks_clearForm();
  openModal('createTask');
}

function Tasks_openEdit(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  _editingTaskId = id;
  document.getElementById('form-mode-title').textContent = 'Edit Task';
  document.getElementById('form-mode-sub').textContent   = 'Editing ' + t.id;
  document.getElementById('form-submit-btn').textContent = 'Save Changes';

  document.getElementById('f-name').value           = t.name;
  document.getElementById('f-client').value         = t.client;
  document.getElementById('f-dialogue').value       = t.dialogue;
  document.getElementById('f-callerLine').value     = t.callerLine;
  document.getElementById('f-workDays').value       = t.workDays;
  document.getElementById('f-workStart').value      = t.workStart;
  document.getElementById('f-workEnd').value        = t.workEnd;
  document.getElementById('f-maxRetries').value     = t.maxRetries;
  document.getElementById('f-retryInterval').value  = t.retryInterval;
  document.getElementById('f-contactFile').textContent = t.contactFile || 'No file uploaded';
  document.getElementById('f-dncFile').textContent     = t.dncFile     || 'No file uploaded';
  openModal('createTask');
}

function Tasks_clearForm() {
  ['f-name','f-client','f-dialogue','f-callerLine'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-workDays').value      = 'Monday – Friday';
  document.getElementById('f-workStart').value     = '09:00';
  document.getElementById('f-workEnd').value       = '17:00';
  document.getElementById('f-maxRetries').value    = '3';
  document.getElementById('f-retryInterval').value = '2 hours';
  document.getElementById('f-contactFile').textContent = 'No file uploaded';
  document.getElementById('f-dncFile').textContent     = 'No file uploaded';
}

function saveTask() {
  const name           = document.getElementById('f-name').value.trim();
  const client         = document.getElementById('f-client').value;
  const dialogue       = document.getElementById('f-dialogue').value;
  const callerLine     = document.getElementById('f-callerLine').value;
  const workDays       = document.getElementById('f-workDays').value;
  const workStart      = document.getElementById('f-workStart').value;
  const workEnd        = document.getElementById('f-workEnd').value;
  const maxRetries     = document.getElementById('f-maxRetries').value;
  const retryInterval  = document.getElementById('f-retryInterval').value;

  if (!name || !client || !dialogue || !callerLine) {
    Tasks_showFormError('Please fill in all required fields (Name, Client, Dialogue, Caller Line).');
    return;
  }

  if (_editingTaskId) {
    const task = tasks.find(t => t.id === _editingTaskId);
    Object.assign(task, { name, client, dialogue, callerLine, workDays, workStart, workEnd, maxRetries, retryInterval });
  } else {
    tasks.unshift({
      id: Tasks_generateId(), name, client, dialogue, callerLine,
      workDays, workStart, workEnd, maxRetries, retryInterval,
      contacts: null, contactFile: null, dncFile: null,
      status: 'pending', progress: 0,
      processed: null, connRate: null, avgDuration: null,
      createdAt: new Date().toISOString().split('T')[0]
    });
  }

  Tasks_save();
  closeModal('createTask');
  renderAll();
}

function Tasks_showFormError(msg) {
  let err = document.getElementById('form-error');
  if (!err) {
    err = document.createElement('div');
    err.id = 'form-error';
    err.style.cssText = 'color:#e65100;font-size:12px;font-weight:600;padding:6px 24px;background:#fff8f0;border-top:1px solid #ffe0cc;';
    document.querySelector('#modal-createTask .form-footer').before(err);
  }
  err.textContent = msg;
  setTimeout(() => { if (err) err.textContent = ''; }, 3000);
}

// ── Delete ────────────────────────────────────────────
function Tasks_confirmDelete(id) {
  if (!Tasks_canControl()) return; // guard
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('delete-confirm-name').textContent = task.name;
  document.getElementById('delete-confirm-id').textContent   = task.id;
  document.getElementById('delete-confirm-btn').onclick      = () => Tasks_delete(id);
  document.getElementById('modal-deleteConfirm').classList.add('active');
}

function closeDeleteConfirm() {
  document.getElementById('modal-deleteConfirm').classList.remove('active');
}

function Tasks_delete(id) {
  closeDeleteConfirm();
  tasks = tasks.filter(t => t.id !== id);
  Tasks_save();
  renderAll();
}
