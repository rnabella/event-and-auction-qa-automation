const express = require('express');
const adminStore = require('../data/adminStore');

const router = express.Router();

// Demo-grade: session ids are internally generated as `session-N` (see
// adminStore.js), so no URL-decoding or embedded-semicolon handling is
// needed here. A real app would use a proper cookie-parsing library.
function parseSessionId(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('sessionId='));
  return match ? match.slice('sessionId='.length) : null;
}

function requireAuth(req, res, next) {
  const sessionId = parseSessionId(req);
  if (!adminStore.isValidSession(sessionId)) {
    return res.status(401).json({ error: 'authentication required' });
  }
  next();
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sessionId = adminStore.login(username, password);
  if (!sessionId) {
    return res.status(401).json({ error: 'invalid username or password' });
  }
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);
  res.status(200).json({ ok: true });
});

// Clears the cookie client-side only — doesn't remove the session from
// adminStore, since the admin Playwright project shares one session across
// its whole run (see adminStore.js's reset()). Nothing currently calls this
// route; it's here for completeness, not exercised by the test suite.
router.post('/logout', requireAuth, (req, res) => {
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0');
  res.status(204).send();
});

router.get('/checklist', requireAuth, (req, res) => {
  res.json(adminStore.getChecklist());
});

router.post('/tickets', requireAuth, (req, res) => {
  const { name, price } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'price must be a positive number' });
  }
  res.status(201).json(adminStore.createTicket({ name, price }));
});

router.post('/lots', requireAuth, (req, res) => {
  const { name, startPrice, buyNowPrice } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof startPrice !== 'number' || startPrice <= 0) {
    return res.status(400).json({ error: 'startPrice must be a positive number' });
  }
  if (buyNowPrice !== undefined && (typeof buyNowPrice !== 'number' || buyNowPrice <= 0)) {
    return res.status(400).json({ error: 'buyNowPrice must be a positive number if provided' });
  }
  res.status(201).json(adminStore.createLot({ name, startPrice, buyNowPrice }));
});

module.exports = router;
