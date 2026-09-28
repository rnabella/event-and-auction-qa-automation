import { test, expect } from '@playwright/test';
import { AdminApi } from '../../src/api/AdminApi';
import { DonorApi } from '../../src/api/DonorApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await donorApi.reset();
});

test('drawing a raffle with only one guest entering awards it to them', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');

  // Multiple entries from the same guest are allowed — this also proves
  // that having several entries doesn't create several distinct possible
  // winners; there's only one guest in play, so the draw is deterministic.
  await donorApi.enterRaffle(raffle.id, guest.id);
  await donorApi.enterRaffle(raffle.id, guest.id);
  await donorApi.enterRaffle(raffle.id, guest.id);

  const drawn = await adminApi.drawRaffle(raffle.id);
  expect(drawn.drawn).toBe(true);
  expect(drawn.winnerGuestId).toBe(guest.id);
});

test('drawing a raffle with multiple guests awards it to one of the real entrants', async ({
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);

  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const guestA = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  const guestB = await donorApi.registerGuest('Grace Hopper', 'grace@example.com');

  await donorApi.enterRaffle(raffle.id, guestA.id);
  await donorApi.enterRaffle(raffle.id, guestB.id);

  const drawn = await adminApi.drawRaffle(raffle.id);
  expect(drawn.drawn).toBe(true);
  expect([guestA.id, guestB.id]).toContain(drawn.winnerGuestId);
});

test('drawing a raffle with no entries is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Never Entered', 10);

  const res = await request.post(`${env.apiBaseUrl}/admin/raffles/${raffle.id}/draw`);
  expect(res.status()).toBe(400);
});

test('drawing an already-drawn raffle is rejected', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  await donorApi.enterRaffle(raffle.id, guest.id);
  await adminApi.drawRaffle(raffle.id);

  const res = await request.post(`${env.apiBaseUrl}/admin/raffles/${raffle.id}/draw`);
  expect(res.status()).toBe(409);
});

test('entering a raffle that does not exist is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/raffles/raffle-does-not-exist/enter`, {
    data: { guestId: 'guest-1' },
  });
  expect(res.status()).toBe(404);
});

test('entering a raffle with a guestId that does not reference a real guest is rejected', async ({
  request,
}) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);

  const res = await request.post(`${env.apiBaseUrl}/raffles/${raffle.id}/enter`, {
    data: { guestId: 'not-a-real-guest' },
  });
  expect(res.status()).toBe(400);
});

test('the public raffle endpoint never exposes entry data', async ({ request }) => {
  const adminApi = new AdminApi(request, env.apiBaseUrl);
  const donorApi = new DonorApi(request, env.apiBaseUrl);
  await adminApi.login('admin', 'admin123');
  const raffle = await adminApi.createRaffle('Weekend Getaway', 10);
  const guest = await donorApi.registerGuest('Ada Lovelace', 'ada@example.com');
  await donorApi.enterRaffle(raffle.id, guest.id);

  const res = await request.get(`${env.apiBaseUrl}/raffles/${raffle.id}`);
  const body = await res.json();
  expect(body.entries).toBeUndefined();
});
