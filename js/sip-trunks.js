// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — SIP Trunk Configuration Module
// ═══════════════════════════════════════════════════════

const SIP_KEY = 'sunsystem_sip_trunks';

// ── Storage ───────────────────────────────────────────
function SIP_load() {
  try {
    const s = localStorage.getItem(SIP_KEY);
    if (s) return JSON.parse(s);
  } catch(e) {}
  const copy = JSON.parse(JSON.stringify(SIP_TRUNKS_SEED));
  localStorage.setItem(SIP_KEY, JSON.stringify(copy));
  return copy;
}

function SIP_save() {
  localStorage.setItem(SIP_KEY, JSON.stringify(sipTrunks));
}

let sipTrunks     = SIP_load();
let _editingSipId = null;

// ── ID generator ──────────────────────────────────────
function SIP_generateId() {
  const nums = sipTrunks.map(s => parseInt(s.id.replace('SIP-', ''))).filter(n => !isNaN(n));
  const max  = nums.length ? Math.max(...nums) : 0;
  return 'SIP-' + String(max + 1).padStart(3, '0');
}

// ── Render SIP trunk table ────────────────────────────
function SIP_render() {
  const tbody = document.getElementById('sip-trunk-tbody');
  if (!tbody) return;

  tbody.innerHTML = sipTrunks.map(t => {
    const statusBadge = t.status === 'active'
      ? `<span class="status status-running">Active</span>`
      : `<span class="status status-pending">Inactive</span>`;
    return `<tr>
      <td><strong style="color:#1a1a2e;">${t.name}</strong><div style="font-size:11px;color:#b0b0b0;margin-top:2px;">${t.id}</div></td>
      <td><span style="font-family:monospace;font-size:12px;">${t.host}</span></td>
      <td>${t.port}</td>
      <td><span class="sip-tag sip-tag-${t.protocol.toLowerCase()}">${t.protocol}</span></td>
      <td>${t.codec}</td>
      <td>${t.maxConcurrent}</td>
      <td>${t.assignedClient}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-group">
          <button class="action-btn action-btn-view" onclick="SIP_openEdit('${t.id}')">Edit</button>
          <button class="action-btn action-btn-delete" onclick="SIP_confirmDelete('${t.id}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Open Add modal ────────────────────────────────────
function SIP_openAdd() {
  _editingSipId = null;
  document.getElementById('sip-modal-title').textContent = 'Add SIP Trunk';
  document.getElementById('sip-submit-btn').textContent  = 'Add Trunk';
  SIP_clearForm();
  SIP_togglePasswordVisibility(false); // reset to hidden
  openModal('sipTrunk');
}

// ── Open Edit modal ───────────────────────────────────
function SIP_openEdit(id) {
  const t = sipTrunks.find(x => x.id === id);
  if (!t) return;
  _editingSipId = id;
  document.getElementById('sip-modal-title').textContent = 'Edit SIP Trunk';
  document.getElementById('sip-submit-btn').textContent  = 'Save Changes';

  document.getElementById('sip-f-name').value           = t.name;
  document.getElementById('sip-f-host').value           = t.host;
  document.getElementById('sip-f-port').value           = t.port;
  document.getElementById('sip-f-protocol').value       = t.protocol;
  document.getElementById('sip-f-username').value       = t.username;
  document.getElementById('sip-f-password').value       = t.password;
  document.getElementById('sip-f-codec').value          = t.codec;
  document.getElementById('sip-f-maxConcurrent').value  = t.maxConcurrent;
  document.getElementById('sip-f-assignedClient').value = t.assignedClient;
  document.getElementById('sip-f-status').value         = t.status;
  SIP_togglePasswordVisibility(false);
  openModal('sipTrunk');
}

function SIP_clearForm() {
  ['sip-f-name','sip-f-host','sip-f-username','sip-f-password'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('sip-f-port').value          = '5060';
  document.getElementById('sip-f-protocol').value      = 'UDP';
  document.getElementById('sip-f-codec').value         = 'G.711';
  document.getElementById('sip-f-maxConcurrent').value = '10';
  document.getElementById('sip-f-assignedClient').value = '';
  document.getElementById('sip-f-status').value        = 'active';
}

// ── Password show/hide toggle ─────────────────────────
function SIP_togglePasswordVisibility(forceHide) {
  const input = document.getElementById('sip-f-password');
  const btn   = document.getElementById('sip-pw-toggle');
  if (!input || !btn) return;
  if (forceHide === false) { input.type = 'password'; btn.textContent = '👁'; return; }
  input.type   = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

// ── Save ──────────────────────────────────────────────
function SIP_save_form() {
  const name          = document.getElementById('sip-f-name').value.trim();
  const host          = document.getElementById('sip-f-host').value.trim();
  const port          = parseInt(document.getElementById('sip-f-port').value) || 5060;
  const protocol      = document.getElementById('sip-f-protocol').value;
  const username      = document.getElementById('sip-f-username').value.trim();
  const password      = document.getElementById('sip-f-password').value;
  const codec         = document.getElementById('sip-f-codec').value;
  const maxConcurrent = parseInt(document.getElementById('sip-f-maxConcurrent').value) || 10;
  const assignedClient = document.getElementById('sip-f-assignedClient').value.trim();
  const status        = document.getElementById('sip-f-status').value;

  if (!name || !host || !username || !password) {
    SIP_showFormError('Please fill in all required fields (Name, Host, Username, Password).');
    return;
  }

  if (_editingSipId) {
    const trunk = sipTrunks.find(t => t.id === _editingSipId);
    Object.assign(trunk, { name, host, port, protocol, username, password, codec, maxConcurrent, assignedClient, status });
  } else {
    sipTrunks.push({ id: SIP_generateId(), name, host, port, protocol, username, password, codec, maxConcurrent, assignedClient, status });
  }

  SIP_save();
  closeModal('sipTrunk');
  SIP_render();
}

function SIP_showFormError(msg) {
  let err = document.getElementById('sip-form-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; }
  setTimeout(() => { if (err) err.style.display = 'none'; }, 3000);
}

// ── Delete ────────────────────────────────────────────
function SIP_confirmDelete(id) {
  const trunk = sipTrunks.find(t => t.id === id);
  if (!trunk) return;
  document.getElementById('delete-confirm-name').textContent = trunk.name;
  document.getElementById('delete-confirm-id').textContent   = trunk.id;
  document.getElementById('delete-confirm-btn').onclick      = () => SIP_delete(id);
  document.getElementById('modal-deleteConfirm').classList.add('active');
}

function SIP_delete(id) {
  closeDeleteConfirm();
  sipTrunks = sipTrunks.filter(t => t.id !== id);
  SIP_save();
  SIP_render();
}
