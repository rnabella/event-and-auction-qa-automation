import { test, expect } from '@playwright/test';
import { AdminApi } from '../../src/api/AdminApi';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await donorApi.reset();
});

test('buying an already-sold lot is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25, 50);
  const guest1 = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  const guest2 = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');

  await donorApi.buyNow(lot.id, guest1.id);

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/buy-now`, {
    data: { guestId: guest2.id },
  });
  expect(res.status()).toBe(409);
});

test('buying a lot with no buy-now price is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Sealed-Only Item', 25);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/buy-now`, {
    data: { guestId: guest.id },
  });
  expect(res.status()).toBe(400);
});

test('buying a lot that does not exist is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/lots/lot-does-not-exist/buy-now`, {
    data: { guestId: 'guest-1' },
  });
  expect(res.status()).toBe(404);
});

test('buying a lot with a guestId that does not reference a real guest is rejected', async ({
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25, 50);

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/buy-now`, {
    data: { guestId: 'not-a-real-guest' },
  });
  expect(res.status()).toBe(400);
});
