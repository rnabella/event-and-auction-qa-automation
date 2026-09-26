import { test, expect } from '@playwright/test';
import { LotPage } from '../../src/pages/donor/LotPage';
import { LotConfirmationPage } from '../../src/pages/donor/LotConfirmationPage';
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
test('donor can buy an auction lot at its buy-now price @smoke', async ({ page, request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25, 50);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  const lotPage = new LotPage(page);
  await lotPage.open(lot.id, guest.id);
  await expect(lotPage.summary).toHaveText('Signed Guitar — Buy now: $50');

  await lotPage.buyNow();
  await page.waitForURL(/lot-confirmation\.html/);

  const confirmationPage = new LotConfirmationPage(page);
  await expect(confirmationPage.message).toHaveText('You bought "Signed Guitar" for $50.');
});

test('trying to buy a lot with no buy-now price shows an error', async ({ page, request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Sealed-Only Item', 25);
  const guest = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');

  const lotPage = new LotPage(page);
  await lotPage.open(lot.id, guest.id);
  await lotPage.buyNow();

  await expect(lotPage.error).toHaveText('this lot does not have a buy-now price');
});
