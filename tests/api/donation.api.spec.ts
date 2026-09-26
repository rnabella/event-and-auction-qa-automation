import { test, expect } from '@playwright/test';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new DonorApi(request, env.apiBaseUrl);
  await api.reset();
});

test('paying a donation eventually increases the total raised by the donation amount @smoke', async ({ request }) => {
  const api = new DonorApi(request, env.apiBaseUrl);

  const guest = await api.registerGuest('Grace Hopper', 'grace@example.com');
  const donation = await api.createDonation(guest.id, 75);
  expect(donation.status).toBe('pending');

  const before = await api.getTotals();
  await api.payDonation(donation.id);

  await expect(async () => {
    const after = await api.getTotals();
    expect(after.totalRaised).toBe(before.totalRaised + 75);
  }).toPass();
});

test('creating a donation for a guest that does not exist is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/donations`, {
    data: { guestId: 'not-a-real-guest', amount: 10 },
  });
  expect(res.status()).toBe(400);
});
