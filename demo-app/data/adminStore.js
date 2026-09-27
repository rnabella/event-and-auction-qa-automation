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
  bidsByLot: new Map(),
};

function reset() {
  state.tickets.clear();
  state.lots.clear();
  state.bidsByLot.clear();
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

function createLot({ name, startPrice, buyNowPrice }) {
  const lot = {
    id: makeEntityId('lot'),
    name,
    startPrice,
    buyNowPrice: buyNowPrice ?? null,
    sold: false,
    soldTo: null,
    winningBid: null,
  };
  state.lots.set(lot.id, lot);
  const item = state.checklist.find((i) => i.id === 'set-up-lots');
  item.complete = true;
  return lot;
}

// Called from both the admin router (lot creation/management) and the
// public, unauthenticated donor router (buying a lot) — lots are
// admin-created but donor-purchasable, so this module's name is a slight
// misnomer for these two functions specifically.
function getLot(id) {
  return state.lots.get(id) || null;
}

function markLotSold(id, guestId, winningBid) {
  const lot = state.lots.get(id);
  if (!lot) return null;
  lot.sold = true;
  lot.soldTo = guestId;
  if (winningBid !== undefined) {
    lot.winningBid = winningBid;
  }
  return lot;
}

function addBid(id, { guestId, amount }) {
  const lot = state.lots.get(id);
  if (!lot) return null;
  const bid = { id: makeEntityId('bid'), guestId, amount };
  const bids = state.bidsByLot.get(id) || [];
  bids.push(bid);
  state.bidsByLot.set(id, bids);
  return bid;
}

function getBidsForLot(id) {
  return state.bidsByLot.get(id) || [];
}

module.exports = {
  reset,
  login,
  isValidSession,
  getChecklist,
  createTicket,
  createLot,
  getLot,
  markLotSold,
  addBid,
  getBidsForLot,
};
