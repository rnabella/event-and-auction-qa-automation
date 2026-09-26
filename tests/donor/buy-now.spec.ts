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
