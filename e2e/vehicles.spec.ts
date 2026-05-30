import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

function atOffsetMinutes(minutes: number): string {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString().slice(0, 16);
}

async function createService(page: Page, description: string, scheduledAt: string) {
    await page.getByRole('link', { name: '+ New Service' }).click();
    await expect(page).toHaveURL('/services/new');
    await page.getByLabel('Scheduled time').fill(scheduledAt);
    await page.getByLabel('Service type').selectOption('Tour');
    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Passenger quantity').fill('4');
    await page.getByLabel('Stop 1').fill('Funchal');
    await expect(page.getByLabel('Choose vehicle')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose vehicle').selectOption({ label: 'AA-00-BB - Toyota HiAce - 8 seats' });
    await expect(page.getByLabel('Choose driver')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose driver').selectOption({ label: 'Test Driver - License D - Van' });
    await page.getByRole('button', { name: 'Create Service' }).click();
}

test.describe('Vehicle active guard', () => {
    test('blocks deactivating a vehicle assigned to an active service', async ({ page }) => {
        await login(page);

        await createService(page, 'Active Vehicle Service', atOffsetMinutes(0));
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });

        await page.goto('/vehicles');
        await page.getByRole('button', { name: 'View vehicle AA-00-BB' }).click();
        await page.getByRole('button', { name: 'Edit Vehicle' }).click();

        await page.getByLabel('Active').uncheck();
        await page.getByRole('button', { name: 'Update Vehicle' }).click();

        await expect(page.getByText(/Cannot deactivate a vehicle/i)).toBeVisible();
    });
});
