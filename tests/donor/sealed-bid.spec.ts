import { test, expect } from '@playwright/test';
import { BidPage } from '../../src/pages/donor/BidPage';
import { BidConfirmationPage } from '../../src/pages/donor/BidConfirmationPage';
import { AdminApi } from '../../src/api/AdminApi';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await donorApi.reset();
});

// This test lives in tests/donor/ (the `chromium` project), which has no
// admin storageState — unlike tests/admin/*, which reuse a saved session
// via the `admin` project's dependency on `setup`. Logging in here, once,
// inline, via the request fixture is the correct pattern for a donor test
// that merely needs *a* valid admin session to create its fixture lot —
// it is not testing admin login itself, so it doesn't need the storageState
// machinery built for tests that are actually about admin behavior.
test('donor can place a sealed bid on a lot @smoke', async ({ page, request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Sealed-Only Item', 25);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  const bidPage = new BidPage(page);
  await bidPage.open(lot.id, guest.id);
  await bidPage.placeBid(40);

  await page.waitForURL(/bid-confirmation\.html/);
  const confirmationPage = new BidConfirmationPage(page);
  await expect(confirmationPage.message).toHaveText('Your sealed bid of $40 has been submitted.');
});
