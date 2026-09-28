import { test, expect } from '@playwright/test';
import { RafflePage } from '../../src/pages/donor/RafflePage';
import { RaffleConfirmationPage } from '../../src/pages/donor/RaffleConfirmationPage';
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
// that merely needs *a* valid admin session to create its fixture raffle —
// it is not testing admin login itself, so it doesn't need the storageState
// machinery built for tests that are actually about admin behavior.
test('donor can enter a raffle @smoke', async ({ page, request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  const rafflePage = new RafflePage(page);
  await rafflePage.open(raffle.id, guest.id);
  await expect(rafflePage.summary).toHaveText('Weekend Getaway — Entry: $10');

  await rafflePage.enter();
  await page.waitForURL(/raffle-confirmation\.html/);

  const confirmationPage = new RaffleConfirmationPage(page);
  await expect(confirmationPage.message).toHaveText('You\'ve entered "Weekend Getaway". Good luck!');
});

test('trying to enter a raffle that has already been drawn shows an error', async ({
  page,
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const firstGuest = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');
  const lateGuest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  await donorApi.enterRaffle(raffle.id, firstGuest.id);
  await adminApi.drawRaffle(raffle.id);

  const rafflePage = new RafflePage(page);
  await rafflePage.open(raffle.id, lateGuest.id);
  await rafflePage.enter();

  await expect(rafflePage.error).toHaveText('this raffle has already been drawn');
});
