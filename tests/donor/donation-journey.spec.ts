import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../src/pages/donor/RegisterPage';
import { DonatePage } from '../../src/pages/donor/DonatePage';
import { CheckoutPage } from '../../src/pages/donor/CheckoutPage';
import { ConfirmationPage } from '../../src/pages/donor/ConfirmationPage';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new DonorApi(request, env.apiBaseUrl);
  await api.reset();
});

test('donor can register, donate, check out, and see the total raised update @smoke', async ({
  page,
}) => {
  const registerPage = new RegisterPage(page);
  await registerPage.open();
  await registerPage.register('Ada Lovelace', 'ada@example.com');

  const donatePage = new DonatePage(page);
  await donatePage.donate(50);

  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.pay('4242424242424242');

  const confirmationPage = new ConfirmationPage(page);
  await expect(confirmationPage.message).toContainText('is paid');

  // The demo app's total-raised figure updates asynchronously after payment —
  // a deliberate, generic stand-in for an eventually-consistent totals
  // endpoint. Poll rather than trust the very first render.
  await expect(async () => {
    await confirmationPage.refreshTotal();
    // One iteration's budget for click -> fetch -> repaint; toPass() drives the retry.
    await expect(confirmationPage.totalRaised).toHaveText('Total raised so far: $50', {
      timeout: 400,
    });
  }).toPass();
});
