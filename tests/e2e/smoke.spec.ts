import { expect, test } from '@playwright/test';

test('marketing home renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Awards/i);
  await expect(page.getByText('Get Started Free')).toBeVisible();
});

test('public demo loads without login redirect', async ({ page }) => {
  await page.goto('/demo?autoplay=1');
  await expect(page).toHaveURL(/\/demo/);
  await expect(page.getByText('Live Demo')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Innovation Awards 2026')).toBeVisible();
});

test('exit demo returns to home', async ({ page }) => {
  await page.goto('/demo?autoplay=1');
  await expect(page.getByRole('button', { name: 'Exit live demo' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Exit live demo' }).click();
  await expect(page).toHaveURL('/');
});
