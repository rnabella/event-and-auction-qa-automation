import { test, expect } from '@playwright/test';
import { LotsPage } from '../../src/pages/admin/LotsPage';
import { ChecklistPage } from '../../src/pages/admin/ChecklistPage';
import { AdminApi } from '../../src/api/AdminApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await api.reset();
});

test('creating a lot completes the "Set up auction lots" checklist item', async ({ page }) => {
  const lotsPage = new LotsPage(page);
  await lotsPage.open();
  await lotsPage.createLot('Signed Guitar', 25);
  await page.waitForURL(/checklist\.html/);

  const checklistPage = new ChecklistPage(page);
  await expect(checklistPage.item('set-up-lots')).toHaveText('Set up auction lots: Complete');
});
