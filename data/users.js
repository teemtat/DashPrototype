// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — Users Seed Data
//  NOTE: Passwords are plaintext for mockup only.
//        In production, always use hashed passwords.
// ═══════════════════════════════════════════════════════

const USERS_SEED = [
  {
    id: 'USR-001',
    username: 'superadmin',
    password: '1234',
    name: 'Super Admin',
    email: 'superadmin@sunsystem.th',
    role: 'superadmin',
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-002',
    username: 'admin',
    password: '1234',
    name: 'Admin User',
    email: 'admin@sunsystem.th',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'USR-003',
    username: 'supervisor',
    password: '1234',
    name: 'Somchai Jaidee',
    email: 'somchai@sunsystem.th',
    role: 'supervisor',
    status: 'active',
    createdAt: '2026-02-01'
  },
  {
    id: 'USR-004',
    username: 'agent',
    password: '1234',
    name: 'Malee Srisuk',
    email: 'malee@sunsystem.th',
    role: 'agent',
    status: 'active',
    createdAt: '2026-02-10'
  },
  {
    id: 'USR-005',
    username: 'agent2',
    password: '1234',
    name: 'Nattapong Wongchai',
    email: 'nattapong@sunsystem.th',
    role: 'agent',
    status: 'inactive',
    createdAt: '2026-03-01'
  }
];
