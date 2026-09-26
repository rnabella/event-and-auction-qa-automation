let nextId = 1;
function makeId(prefix) {
  return `${prefix}-${nextId++}`;
}

const state = {
  guests: new Map(),
  donations: new Map(),
  totalRaised: 0,
};

// Module-level tracking of all pending timeouts across all tests
const allPendingTimeouts = [];

function reset() {
  state.guests.clear();
  state.donations.clear();
  state.totalRaised = 0;
  nextId = 1;
  // Clear all pending setTimeout callbacks to prevent state pollution between tests
  allPendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  allPendingTimeouts.length = 0;
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
  // Deliberately delayed: mirrors a real-world eventually-consistent totals
  // endpoint (e.g. recomputed by a downstream job), so consumers must poll
  // rather than assume the total is current immediately after payment.
  const timeoutId = setTimeout(() => {
    state.totalRaised += donation.amount;
  }, 300);
  allPendingTimeouts.push(timeoutId);
  return donation;
}

function getTotals() {
  return { totalRaised: state.totalRaised };
}

module.exports = { reset, createGuest, getGuest, createDonation, getDonation, payDonation, getTotals };
