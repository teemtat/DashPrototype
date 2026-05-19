// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — Core: Navigation, Shared Helpers, Init
// ═══════════════════════════════════════════════════════

// ── Shared helpers ────────────────────────────────────
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Modal helpers ─────────────────────────────────────
function openModal(id)  { document.getElementById('modal-' + id).classList.add('open'); }
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); }
function closeModalIfOverlay(e, id) {
  if (e.target === document.getElementById('modal-' + id)) closeModal(id);
}

function showTab(name, btn) {
  btn.closest('.modal').querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.closest('.modal').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ── Render all (called after any state change) ────────
function renderAll() {
  Tasks_render();
  Tasks_renderDashboard();
  Inbound_render();
}

// ── Screen navigation ─────────────────────────────────
function showScreen(name, el) {
  // RBAC guard — block access to screens not in user's role
  if (!Auth_hasAccess(name)) return;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  if (el) el.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    tasks:     'Outbound Tasks',
    inbound:   'Inbound Calls',
    reports:   'Reports',
    clients:   'Client Accounts',
    settings:  'System Settings',
    users:     'User Management'
  };

  const bc = document.getElementById('topbar-bc');
  if (bc) bc.textContent = titles[name] || name;

  if (name === 'tasks')    Tasks_render();
  if (name === 'inbound')  Inbound_render();
  if (name === 'settings') SIP_render();
  if (name === 'users')    Users_render();
  Tasks_renderDashboard();
}

// ── Apply RBAC: show/hide nav items ──────────────────
function applyRBAC() {
  const user = Auth_getCurrentUser();
  if (!user) return;
  const perms = ROLE_CONFIG[user.role];
  if (!perms) return;

  // Hide nav items the user cannot access
  document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    const screen = item.dataset.screen;
    item.style.display = Auth_hasAccess(screen) ? '' : 'none';
  });

  // Update sidebar user info
  Users_updateSidebarUser();
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  const user = Auth_requireAuth();
  if (!user) return;

  // Apply role-based nav visibility
  applyRBAC();

  // Determine first accessible screen and show it
  const roleScreens = (ROLE_CONFIG[user.role] || {}).screens || ['dashboard'];
  const firstScreen  = roleScreens[0] || 'dashboard';
  const firstNavItem = document.querySelector(`.nav-item[data-screen="${firstScreen}"]`);
  showScreen(firstScreen, firstNavItem);

  // Initial render
  renderAll();
});
