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
    d.setDate(d.getDate() + 2);
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString().slice(0, 16);
}

async function fillServiceForm(page: Page, description: string, scheduledAt: string) {
    await page.getByLabel('Scheduled time').fill(scheduledAt);
    await page.getByLabel('Service type').selectOption('Tour');
    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Passenger quantity').fill('4');
    await page.getByLabel('Stop 1').fill('Funchal');

    await expect(page.getByLabel('Choose vehicle')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose vehicle').selectOption({ label: 'AA-00-BB - Toyota HiAce - 8 seats' });
    await expect(page.getByLabel('Choose driver')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose driver').selectOption({ label: 'Test Driver - License D - Van' });
}

async function createService(page: Page, description: string, scheduledAt: string) {
    await page.getByRole('link', { name: '+ New Service' }).click();
    await expect(page).toHaveURL('/services/new');
    await fillServiceForm(page, description, scheduledAt);
    await page.getByRole('button', { name: 'Create Service' }).click();
}

test.describe('Scheduling conflicts', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('blocks creating a second service for the same vehicle at the same time', async ({ page }) => {
        const when = atOffsetMinutes(0);

        await createService(page, 'Conflict Base', when);
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });

        await createService(page, 'Conflict Clash', when);
        await expect(page).toHaveURL('/services/new');
        await expect(page.getByRole('alert')).toContainText(/already booked/i);
    });

    test('blocks starting a service while the vehicle is already on an ongoing one', async ({ page }) => {
        const first = atOffsetMinutes(100);
        const second = atOffsetMinutes(200);

        await createService(page, 'Start Guard A', first);
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });
        await page.getByRole('button', { name: 'Start Service' }).click();
        await page.getByRole('button', { name: 'Confirm transition' }).click();
        await expect(page.getByRole('button', { name: 'Complete Service' })).toBeVisible();

        await createService(page, 'Start Guard B', second);
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });
        await page.getByRole('button', { name: 'Start Service' }).click();
        await page.getByRole('button', { name: 'Confirm transition' }).click();

        await expect(page.getByRole('dialog').getByText(/already on an ongoing service/i)).toBeVisible();
    });
});
