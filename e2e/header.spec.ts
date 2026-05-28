import { test, expect, type Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

test.describe('Responsive header', () => {
    test('nav collapses into a hamburger menu on narrow viewports', async ({ page }) => {
        await page.setViewportSize({ width: 414, height: 800 });
        await loginAs(page, 'admin', 'admin123');

        // Nav links are not shown inline on a narrow viewport
        await expect(page.getByRole('link', { name: 'Drivers' })).toBeHidden();

        // Open the menu and navigate
        await page.getByRole('button', { name: 'Toggle menu' }).click();
        const driversLink = page.getByRole('link', { name: 'Drivers' });
        await expect(driversLink).toBeVisible();
        await driversLink.click();

        await expect(page).toHaveURL('/drivers');
        // Menu closes after navigating
        await expect(page.getByRole('link', { name: 'Vehicles' })).toBeHidden();
    });

    test('full nav is shown inline on wide viewports', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await loginAs(page, 'admin', 'admin123');

        await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Drivers' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeHidden();
    });
});
