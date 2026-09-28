import { test, expect } from '@playwright/test';
import { RafflesPage } from '../../src/pages/admin/RafflesPage';
import { ChecklistPage } from '../../src/pages/admin/ChecklistPage';
import { AdminApi } from '../../src/api/AdminApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await api.reset();
});

test('creating a raffle completes the "Set up a raffle" checklist item', async ({ page }) => {
  const rafflesPage = new RafflesPage(page);
  await rafflesPage.open();
  await rafflesPage.createRaffle('Weekend Getaway', 10);
  await page.waitForURL(/checklist\.html/);

  const checklistPage = new ChecklistPage(page);
  await expect(checklistPage.item('set-up-raffle')).toHaveText('Set up a raffle: Complete');
});
