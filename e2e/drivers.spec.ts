import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

test.describe('Driver licence guard', () => {
    test('blocks a light license entitled to a heavy vehicle type', async ({ page }) => {
        await login(page);
        await page.goto('/drivers/new');

        await page.getByLabel(/^Full Name/).fill('Light Heavy');
        await page.getByLabel(/^Gender/).selectOption('Male');
        await page.getByLabel(/^License Type/).selectOption('B1');
        await page.getByLabel(/^Entitled to Drive/).selectOption('Heavy Vehicle');
        await page.getByRole('button', { name: 'Create Driver' }).click();

        await expect(page.getByText(/cannot drive Heavy Vehicle/i)).toBeVisible();
        await expect(page).toHaveURL('/drivers/new');
    });
});
