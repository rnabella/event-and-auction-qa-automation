const express = require('express');
const store = require('../data/store');
const adminStore = require('../data/adminStore');

const router = express.Router();

router.post('/guests', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  res.status(201).json(store.createGuest({ name, email }));
});

router.get('/guests/:id', (req, res) => {
  const guest = store.getGuest(req.params.id);
  if (!guest) return res.status(404).json({ error: 'guest not found' });
  res.json(guest);
});

router.post('/donations', (req, res) => {
  const { guestId, amount } = req.body;
  if (!guestId || !store.getGuest(guestId)) {
    return res.status(400).json({ error: 'guestId must reference an existing guest' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  res.status(201).json(store.createDonation({ guestId, amount }));
});

router.get('/donations/:id', (req, res) => {
  const donation = store.getDonation(req.params.id);
  if (!donation) return res.status(404).json({ error: 'donation not found' });
  res.json(donation);
});

router.post('/donations/:id/pay', (req, res) => {
  const donation = store.payDonation(req.params.id);
  if (!donation) return res.status(404).json({ error: 'donation not found' });
  res.json(donation);
});

router.get('/totals', (req, res) => {
  res.json(store.getTotals());
});

router.get('/lots/:id', (req, res) => {
  const lot = adminStore.getLot(req.params.id);
  if (!lot) return res.status(404).json({ error: 'lot not found' });
  res.json(lot);
});

router.post('/lots/:id/buy-now', (req, res) => {
  const { guestId } = req.body;
  const lot = adminStore.getLot(req.params.id);
  if (!lot) return res.status(404).json({ error: 'lot not found' });
  if (!guestId || !store.getGuest(guestId)) {
    return res.status(400).json({ error: 'guestId must reference an existing guest' });
  }
  if (lot.buyNowPrice == null) {
    return res.status(400).json({ error: 'this lot does not have a buy-now price' });
  }
  if (lot.sold) {
    return res.status(409).json({ error: 'this lot has already been sold' });
  }
  res.status(200).json(adminStore.markLotSold(req.params.id, guestId, lot.buyNowPrice));
});

router.post('/lots/:id/bid', (req, res) => {
  const { guestId, amount } = req.body;
  const lot = adminStore.getLot(req.params.id);
  if (!lot) return res.status(404).json({ error: 'lot not found' });
  if (!guestId || !store.getGuest(guestId)) {
    return res.status(400).json({ error: 'guestId must reference an existing guest' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (lot.sold) {
    return res.status(409).json({ error: 'this lot has already been sold' });
  }
  res.status(201).json(adminStore.addBid(req.params.id, { guestId, amount }));
});

router.get('/raffles/:id', (req, res) => {
  const raffle = adminStore.getRaffle(req.params.id);
  if (!raffle) return res.status(404).json({ error: 'raffle not found' });
  res.json(raffle);
});

router.post('/raffles/:id/enter', (req, res) => {
  const { guestId } = req.body;
  const raffle = adminStore.getRaffle(req.params.id);
  if (!raffle) return res.status(404).json({ error: 'raffle not found' });
  if (!guestId || !store.getGuest(guestId)) {
    return res.status(400).json({ error: 'guestId must reference an existing guest' });
  }
  if (raffle.drawn) {
    return res.status(409).json({ error: 'this raffle has already been drawn' });
  }
  res.status(201).json(adminStore.addEntry(req.params.id, { guestId }));
});

router.post('/test/reset', (req, res) => {
  store.reset();
  adminStore.reset();
  res.status(204).send();
});

module.exports = router;
