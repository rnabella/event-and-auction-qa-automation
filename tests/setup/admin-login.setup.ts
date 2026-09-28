import { test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/admin/LoginPage';

// The @smoke tag here is cosmetic, not load-bearing: Playwright dependency
// projects (this one, required by the `admin` project) run regardless of
// --grep filtering, confirmed against the installed Playwright version's
// source and with a differential test.
setup('authenticate as admin @smoke', async ({ page }, testInfo) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('admin', 'admin123');
  await page.waitForURL(/checklist\.html/);
  // One file per engine's setup project (`setup`, `setup-firefox`, `setup-webkit`)
  // so three engines running in the same `npm test` invocation don't clobber
  // each other's saved session — each engine's `admin-*` project reads back
  // exactly the file its own `setup-*` project wrote.
  const authFile = `playwright/.auth/admin-${testInfo.project.name}.json`;
  await page.context().storageState({ path: authFile });
});
