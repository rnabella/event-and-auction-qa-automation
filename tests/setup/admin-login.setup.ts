import { test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/admin/LoginPage';

const authFile = 'playwright/.auth/admin.json';

// The @smoke tag here is cosmetic, not load-bearing: Playwright dependency
// projects (this one, required by the `admin` project) run regardless of
// --grep filtering, confirmed against the installed Playwright version's
// source and with a differential test.
setup('authenticate as admin @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('admin', 'admin123');
  await page.waitForURL(/checklist\.html/);
  await page.context().storageState({ path: authFile });
});
