// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — User Management Module
// ═══════════════════════════════════════════════════════

const USERS_KEY = 'sunsystem_users';

// ── Storage ───────────────────────────────────────────
function Users_load() {
  try {
    const s = localStorage.getItem(USERS_KEY);
    if (s) return JSON.parse(s);
  } catch(e) {}
  const copy = JSON.parse(JSON.stringify(USERS_SEED));
  localStorage.setItem(USERS_KEY, JSON.stringify(copy));
  return copy;
}

function Users_save() {
  localStorage.setItem(USERS_KEY, JSON.stringify(usersList));
}

let usersList      = Users_load();
let _editingUserId = null;

// ── ID generator ──────────────────────────────────────
function Users_generateId() {
  const nums = usersList.map(u => parseInt(u.id.replace('USR-', ''))).filter(n => !isNaN(n));
  const max  = nums.length ? Math.max(...nums) : 0;
  return 'USR-' + String(max + 1).padStart(3, '0');
}

// ── Render user table ─────────────────────────────────
function Users_render() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  // Summary KPIs
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('users-kpi-total',    usersList.length);
  set('users-kpi-active',   usersList.filter(u => u.status === 'active').length);
  set('users-kpi-inactive', usersList.filter(u => u.status === 'inactive').length);

  tbody.innerHTML = usersList.map(u => {
    const roleBadge = `<span class="role-badge role-${u.role}">${Auth_getRoleLabel(u.role)}</span>`;
    const statusBadge = u.status === 'active'
      ? `<span class="status status-running">Active</span>`
      : `<span class="status status-pending">Inactive</span>`;

    // Prevent deleting yourself
    const currentUser = Auth_getCurrentUser();
    const isSelf = currentUser && currentUser.id === u.id;
    const deleteBtn = isSelf
      ? `<button class="action-btn" style="opacity:0.4;cursor:not-allowed;" disabled title="Cannot delete your own account">Delete</button>`
      : `<button class="action-btn action-btn-delete" onclick="Users_confirmDelete('${u.id}')">Delete</button>`;

    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="user-avatar-sm">${u.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style="font-weight:700;color:#1a1a2e;font-size:13px;">${u.name}${isSelf ? ' <span style="font-size:10px;color:#00a651;font-weight:600;">(you)</span>' : ''}</div>
            <div style="font-size:11px;color:#b0b0b0;">${u.email}</div>
          </div>
        </div>
      </td>
      <td><code style="font-size:12px;color:#6b7280;">${u.username}</code></td>
      <td>${roleBadge}</td>
      <td>${statusBadge}</td>
      <td style="color:#b0b0b0;font-size:12px;">${formatDate(u.createdAt)}</td>
      <td>
        <div class="action-group">
          <button class="action-btn action-btn-view" onclick="Users_openEdit('${u.id}')">Edit</button>
          ${deleteBtn}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Open Add modal ────────────────────────────────────
function Users_openAdd() {
  _editingUserId = null;
  document.getElementById('user-modal-title').textContent = 'Add User';
  document.getElementById('user-submit-btn').textContent  = 'Add User';
  document.getElementById('user-password-group').style.display = '';
  Users_clearForm();
  openModal('userForm');
}

// ── Open Edit modal ───────────────────────────────────
function Users_openEdit(id) {
  const u = usersList.find(x => x.id === id);
  if (!u) return;
  _editingUserId = id;
  document.getElementById('user-modal-title').textContent = 'Edit User';
  document.getElementById('user-submit-btn').textContent  = 'Save Changes';
  // Hide password field on edit (leave blank to keep existing)
  document.getElementById('user-password-group').style.display = 'none';

  document.getElementById('u-f-name').value     = u.name;
  document.getElementById('u-f-username').value = u.username;
  document.getElementById('u-f-email').value    = u.email;
  document.getElementById('u-f-role').value     = u.role;
  document.getElementById('u-f-status').value   = u.status;
  openModal('userForm');
}

function Users_clearForm() {
  ['u-f-name','u-f-username','u-f-email','u-f-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('u-f-role').value   = 'agent';
  document.getElementById('u-f-status').value = 'active';
}

// ── Save ──────────────────────────────────────────────
function Users_save_form() {
  const name     = document.getElementById('u-f-name').value.trim();
  const username = document.getElementById('u-f-username').value.trim();
  const email    = document.getElementById('u-f-email').value.trim();
  const role     = document.getElementById('u-f-role').value;
  const status   = document.getElementById('u-f-status').value;
  const pwEl     = document.getElementById('u-f-password');
  const password = pwEl ? pwEl.value : '';

  if (!name || !username || !email) {
    Users_showFormError('Please fill in all required fields (Name, Username, Email).');
    return;
  }

  // Check username uniqueness
  const duplicate = usersList.find(u => u.username === username && u.id !== _editingUserId);
  if (duplicate) {
    Users_showFormError('Username already exists. Please choose a different one.');
    return;
  }

  if (_editingUserId) {
    const user = usersList.find(u => u.id === _editingUserId);
    Object.assign(user, { name, username, email, role, status });
    // Update current user session if editing self
    const current = Auth_getCurrentUser();
    if (current && current.id === _editingUserId) {
      Auth_setCurrentUser({ ...current, name, username, role, email });
      Users_updateSidebarUser();
    }
  } else {
    if (!password) {
      Users_showFormError('Password is required for new users.');
      return;
    }
    usersList.push({
      id: Users_generateId(), name, username, email, role, status,
      password, createdAt: new Date().toISOString().split('T')[0]
    });
  }

  Users_save();
  closeModal('userForm');
  Users_render();
}

function Users_showFormError(msg) {
  const err = document.getElementById('user-form-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; }
  setTimeout(() => { if (err) err.style.display = 'none'; }, 3000);
}

// ── Delete ────────────────────────────────────────────
function Users_confirmDelete(id) {
  const user = usersList.find(u => u.id === id);
  if (!user) return;
  document.getElementById('delete-confirm-name').textContent = user.name;
  document.getElementById('delete-confirm-id').textContent   = user.id;
  document.getElementById('delete-confirm-btn').onclick      = () => Users_delete(id);
  document.getElementById('modal-deleteConfirm').classList.add('active');
}

function Users_delete(id) {
  closeDeleteConfirm();
  usersList = usersList.filter(u => u.id !== id);
  Users_save();
  Users_render();
}

// ── Update sidebar to reflect current user ────────────
function Users_updateSidebarUser() {
  const user = Auth_getCurrentUser();
  if (!user) return;
  const nameEl   = document.querySelector('.sidebar-footer .uname');
  const roleEl   = document.querySelector('.sidebar-footer .urole');
  const avatarEl = document.querySelector('.sidebar-footer .user-avatar');
  if (nameEl)   nameEl.textContent   = user.name;
  if (roleEl)   roleEl.textContent   = Auth_getRoleLabel(user.role);
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}
