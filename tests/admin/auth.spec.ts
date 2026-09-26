import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';

test('an unauthenticated request to an admin route is rejected', async ({ playwright }) => {
  // storageState is explicitly overridden to an empty cookie jar: the `admin`
  // project configures `use.storageState` (the saved admin session), and
  // playwright.request.newContext() inherits that project default even
  // though it's a manually-created context — confirmed against the
  // installed Playwright version's behavior. Without this override, this
  // "unauthenticated" context would silently carry the saved admin cookie
  // and the test would not exercise the unauthenticated case at all.
  const unauthenticatedContext = await playwright.request.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const res = await unauthenticatedContext.get(`${env.apiBaseUrl}/admin/checklist`);
  expect(res.status()).toBe(401);
  await unauthenticatedContext.dispose();
});
