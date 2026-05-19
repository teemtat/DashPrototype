// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — SIP Trunk Seed Data
// ═══════════════════════════════════════════════════════

const SIP_TRUNKS_SEED = [
  {
    id: 'SIP-001',
    name: 'AIS Trunk 1',
    host: '10.10.1.50',
    port: 5060,
    protocol: 'UDP',
    username: 'ais_trunk1',
    password: 'p@ssw0rd!',
    codec: 'G.711',
    maxConcurrent: 30,
    assignedClient: 'AIS',
    status: 'active'
  },
  {
    id: 'SIP-002',
    name: 'AIS Trunk 2',
    host: '10.10.1.51',
    port: 5060,
    protocol: 'UDP',
    username: 'ais_trunk2',
    password: 'p@ssw0rd!',
    codec: 'G.711',
    maxConcurrent: 20,
    assignedClient: 'AIS',
    status: 'active'
  },
  {
    id: 'SIP-003',
    name: 'SCB Trunk 1',
    host: 'sip.scb.co.th',
    port: 5061,
    protocol: 'TLS',
    username: 'scb_trunk1',
    password: 's3cur3pass',
    codec: 'G.729',
    maxConcurrent: 15,
    assignedClient: 'SCB Bank',
    status: 'active'
  },
  {
    id: 'SIP-004',
    name: 'AIS Trunk 3',
    host: '10.10.1.55',
    port: 5060,
    protocol: 'TCP',
    username: 'ais_trunk3',
    password: 'ais3p@ss',
    codec: 'G.711',
    maxConcurrent: 10,
    assignedClient: 'AIS',
    status: 'inactive'
  }
];
