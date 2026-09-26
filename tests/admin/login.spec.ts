import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/admin/LoginPage';

test('logging in with the wrong password shows an error', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('admin', 'wrong-password');

  await expect(page.locator('#login-error')).toBeVisible();
});
