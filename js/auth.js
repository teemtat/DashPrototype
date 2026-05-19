// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — Authentication & RBAC
// ═══════════════════════════════════════════════════════

const AUTH_KEY = 'sunsystem_user';

// Role config: label + which screens are accessible
const ROLE_CONFIG = {
  superadmin: {
    label: 'Super Admin',
    screens: ['dashboard', 'tasks', 'inbound', 'reports', 'clients', 'settings', 'users'],
    canManageUsers: true,
    canEditSettings: true
  },
  admin: {
    label: 'Admin',
    screens: ['dashboard', 'tasks', 'inbound', 'reports', 'clients', 'settings'],
    canManageUsers: false,
    canEditSettings: true
  },
  supervisor: {
    label: 'Supervisor',
    screens: ['dashboard', 'tasks', 'inbound', 'reports'],
    canManageUsers: false,
    canEditSettings: false
  },
  agent: {
    label: 'Agent',
    screens: ['inbound'],
    canManageUsers: false,
    canEditSettings: false
  }
};

// ── Read / Write current user ────────────────────────
function Auth_getCurrentUser() {
  try {
    const s = localStorage.getItem(AUTH_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

function Auth_setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

// ── Login ────────────────────────────────────────────
function Auth_login(username, password) {
  const USERS_KEY = 'sunsystem_users';
  let users;
  try {
    const s = localStorage.getItem(USERS_KEY);
    users = s ? JSON.parse(s) : null;
  } catch(e) { users = null; }
  if (!users) users = JSON.parse(JSON.stringify(USERS_SEED));

  const match = users.find(u =>
    u.username === username.trim() &&
    u.password === password &&
    u.status === 'active'
  );
  if (!match) return { ok: false, error: 'Invalid username or password.' };

  Auth_setCurrentUser({ id: match.id, name: match.name, username: match.username, role: match.role, email: match.email });
  return { ok: true };
}

// ── Logout ───────────────────────────────────────────
function Auth_logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

// ── Guard: redirect to login if not authenticated ────
function Auth_requireAuth() {
  const user = Auth_getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  return user;
}

// ── Permission helpers ───────────────────────────────
function Auth_hasAccess(screen) {
  const user = Auth_getCurrentUser();
  if (!user) return false;
  const cfg = ROLE_CONFIG[user.role];
  return cfg ? cfg.screens.includes(screen) : false;
}

function Auth_getPermissions() {
  const user = Auth_getCurrentUser();
  if (!user) return null;
  return ROLE_CONFIG[user.role] || null;
}

function Auth_getRoleLabel(role) {
  return (ROLE_CONFIG[role] || {}).label || role;
}
