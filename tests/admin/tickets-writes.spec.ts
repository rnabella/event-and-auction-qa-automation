import { test, expect } from '@playwright/test';
import { TicketsPage } from '../../src/pages/admin/TicketsPage';
import { ChecklistPage } from '../../src/pages/admin/ChecklistPage';
import { AdminApi } from '../../src/api/AdminApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await api.reset();
});

test('creating a ticket completes the "Set up tickets" checklist item', async ({ page }) => {
  const ticketsPage = new TicketsPage(page);
  await ticketsPage.open();
  await ticketsPage.createTicket('General Admission', 20);
  await page.waitForURL(/checklist\.html/);

  const checklistPage = new ChecklistPage(page);
  await expect(checklistPage.item('set-up-tickets')).toHaveText('Set up tickets: Complete');
});
