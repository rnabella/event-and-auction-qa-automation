// Demo-fixture credentials only — this app has no real users or real secrets.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

let nextEntityId = 1;
let nextSessionId = 1;

function makeEntityId(prefix) {
  return `${prefix}-${nextEntityId++}`;
}

function makeSessionId() {
  return `session-${nextSessionId++}`;
}

function freshChecklist() {
  return [
    { id: 'set-up-tickets', label: 'Set up tickets', complete: false },
    { id: 'set-up-lots', label: 'Set up auction lots', complete: false },
  ];
}

const state = {
  sessions: new Set(),
  tickets: new Map(),
  lots: new Map(),
  checklist: freshChecklist(),
};

function reset() {
  state.tickets.clear();
  state.lots.clear();
  state.checklist = freshChecklist();
  nextEntityId = 1;
  // Sessions are intentionally NOT cleared here. The `setup` Playwright
  // project logs in once per test run and saves that session to
  // playwright/.auth/admin.json; every test's beforeEach calls this
  // reset() to clear the data it's about to exercise, and that must not
  // also log the saved session out, or every admin test after the first
  // would start failing with 401s.
}

function login(username, password) {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;
  const sessionId = makeSessionId();
  state.sessions.add(sessionId);
  return sessionId;
}

function isValidSession(sessionId) {
  return !!sessionId && state.sessions.has(sessionId);
}

function getChecklist() {
  return state.checklist;
}

function createTicket({ name, price }) {
  const ticket = { id: makeEntityId('ticket'), name, price };
  state.tickets.set(ticket.id, ticket);
  const item = state.checklist.find((i) => i.id === 'set-up-tickets');
  item.complete = true;
  return ticket;
}

function createLot({ name, startPrice }) {
  const lot = { id: makeEntityId('lot'), name, startPrice };
  state.lots.set(lot.id, lot);
  const item = state.checklist.find((i) => i.id === 'set-up-lots');
  item.complete = true;
  return lot;
}

module.exports = {
  reset,
  login,
  isValidSession,
  getChecklist,
  createTicket,
  createLot,
};
