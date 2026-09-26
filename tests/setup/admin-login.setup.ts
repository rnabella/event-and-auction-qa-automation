import { test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/admin/LoginPage';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('admin', 'admin123');
  await page.waitForURL(/checklist\.html/);
  await page.context().storageState({ path: authFile });
});
