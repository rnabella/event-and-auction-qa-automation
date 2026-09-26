let nextId = 1;
function makeId(prefix) {
  return `${prefix}-${nextId++}`;
}

const state = {
  guests: new Map(),
  donations: new Map(),
  totalRaised: 0,
};

const pendingTotalTimers = [];

function reset() {
  state.guests.clear();
  state.donations.clear();
  state.totalRaised = 0;
  nextId = 1;
  for (const timer of pendingTotalTimers) {
    clearTimeout(timer);
  }
  pendingTotalTimers.length = 0;
}

function createGuest({ name, email }) {
  const guest = { id: makeId('guest'), name, email };
  state.guests.set(guest.id, guest);
  return guest;
}

function getGuest(id) {
  return state.guests.get(id) || null;
}

function createDonation({ guestId, amount }) {
  const donation = {
    id: makeId('donation'),
    guestId,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  state.donations.set(donation.id, donation);
  return donation;
}

function getDonation(id) {
  return state.donations.get(id) || null;
}

function payDonation(id) {
  const donation = state.donations.get(id);
  if (!donation) return null;
  donation.status = 'paid';
  // Totals are recomputed by a reconciliation pass that lags the payment write.
  const timer = setTimeout(() => {
    state.totalRaised += donation.amount;
  }, 300);
  pendingTotalTimers.push(timer);
  return donation;
}

function getTotals() {
  return { totalRaised: state.totalRaised };
}

module.exports = {
  reset,
  createGuest,
  getGuest,
  createDonation,
  getDonation,
  payDonation,
  getTotals,
};
