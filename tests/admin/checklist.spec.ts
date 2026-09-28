import { test, expect } from '@playwright/test';
import { ChecklistPage } from '../../src/pages/admin/ChecklistPage';
import { AdminApi } from '../../src/api/AdminApi';
import { env } from '../../src/config/env';

test.beforeEach(async ({ request }) => {
  const api = new AdminApi(request, env.apiBaseUrl);
  await api.reset();
});

test('checklist starts with all setup items incomplete @smoke', async ({ page }) => {
  const checklistPage = new ChecklistPage(page);
  await checklistPage.open();

  await expect(checklistPage.item('set-up-tickets')).toHaveText('Set up tickets: Incomplete');
  await expect(checklistPage.item('set-up-lots')).toHaveText('Set up auction lots: Incomplete');
  await expect(checklistPage.item('set-up-raffle')).toHaveText('Set up a raffle: Incomplete');
});
