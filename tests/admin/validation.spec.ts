import { test, expect } from '@playwright/test';
import { AdminApi } from '../../src/api/AdminApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await api.reset();
});

test('creating a ticket with a non-positive price is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/admin/tickets`, {
    data: { name: 'Bad Ticket', price: 0 },
  });
  expect(res.status()).toBe(400);
});

test('creating a lot without a name is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/admin/lots`, {
    data: { startPrice: 25 },
  });
  expect(res.status()).toBe(400);
});

test('creating a lot with a non-positive buyNowPrice is rejected', async ({ request }) => {
  const res = await request.post(`${env.apiBaseUrl}/admin/lots`, {
    data: { name: 'Bad Lot', startPrice: 25, buyNowPrice: -5 },
  });
  expect(res.status()).toBe(400);
});

test('a rejected ticket submission does not complete the checklist item', async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await request.post(`${env.apiBaseUrl}/admin/tickets`, {
    data: { name: 'Bad Ticket', price: -5 },
  });
  const checklist = await api.getChecklist();
  const ticketsItem = checklist.find((item) => item.id === 'set-up-tickets');
  expect(ticketsItem?.complete).toBe(false);
});
