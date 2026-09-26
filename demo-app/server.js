const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/admin', adminRouter);
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, 'public')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Event & Auction demo app listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
