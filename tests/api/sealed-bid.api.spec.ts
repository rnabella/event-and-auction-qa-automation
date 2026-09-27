import { test, expect } from '@playwright/test';
import { AdminApi } from '../../src/api/AdminApi';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await donorApi.reset();
});

test('closing a lot awards it to the highest bidder', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25);
  const lowBidder = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  const highBidder = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');
  const laterLowerBidder = await donorApi.registerGuest('Marie Curie', 'marie@example.com');

  await donorApi.placeBid(lot.id, lowBidder.id, 30);
  await donorApi.placeBid(lot.id, highBidder.id, 45);
  await donorApi.placeBid(lot.id, laterLowerBidder.id, 35);

  const closed = await adminApi.closeLot(lot.id);
  expect(closed.soldTo).toBe(highBidder.id);
  expect(closed.winningBid).toBe(45);
});

test('closing a lot with no bids is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Never Bid On', 25);

  const res = await request.post(`${env.apiBaseUrl}/admin/lots/${lot.id}/close`);
  expect(res.status()).toBe(400);
});

test('bidding on an already-sold lot is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25, 50);
  const buyer = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  const bidder = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');

  await donorApi.buyNow(lot.id, buyer.id);

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/bid`, {
    data: { guestId: bidder.id, amount: 40 },
  });
  expect(res.status()).toBe(409);
});

test('the public lot endpoint never exposes bid data, even after bids are placed', async ({
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25);
  const bidder = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  await donorApi.placeBid(lot.id, bidder.id, 30);

  const res = await request.get(`${env.apiBaseUrl}/lots/${lot.id}`);
  const body = await res.json();
  expect(body.bids).toBeUndefined();
});

test('placing a bid on a lot that does not exist is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/lots/lot-does-not-exist/bid`, {
    data: { guestId: 'guest-1', amount: 30 },
  });
  expect(res.status()).toBe(404);
});

test('placing a bid with a guestId that does not reference a real guest is rejected', async ({
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25);

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/bid`, {
    data: { guestId: 'not-a-real-guest', amount: 30 },
  });
  expect(res.status()).toBe(400);
});

test('placing a bid with a non-positive amount is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const lot = await adminApi.createLot('Signed Guitar', 25);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  const res = await request.post(`${env.apiBaseUrl}/lots/${lot.id}/bid`, {
    data: { guestId: guest.id, amount: -5 },
  });
  expect(res.status()).toBe(400);
});
