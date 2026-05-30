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
    d.setDate(d.getDate() + 3);
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

test.describe('In use badge', () => {
    test('vehicle and driver show In use linking to the ongoing service', async ({ page }) => {
        await login(page);

        await createService(page, 'In Use Flow', atOffsetMinutes(0));
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });
        const serviceId = page.url().match(/\/services\/(\d+)/)![1];

        // Scheduled but not started: the resource is Available (in use means ongoing).
        await page.goto('/vehicles');
        await page.getByRole('button', { name: 'View vehicle AA-00-BB' }).click();
        await expect(page).toHaveURL(/\/vehicles\/\d+/);
        await expect(page.getByText('Available')).toBeVisible();

        // Start the service.
        await page.goto(`/services/${serviceId}`);
        await page.getByRole('button', { name: 'Start Service' }).click();
        await page.getByRole('button', { name: 'Confirm transition' }).click();
        await expect(page.getByRole('button', { name: 'Complete Service' })).toBeVisible();
        await expect(page.getByText(/Last edited by Administrator/)).toBeVisible();

        // Vehicle now shows In use, and the badge links to the service.
        await page.goto('/vehicles');
        await page.getByRole('button', { name: 'View vehicle AA-00-BB' }).click();
        await page.getByRole('link', { name: /In use/ }).click();
        await expect(page).toHaveURL(new RegExp(`/services/${serviceId}$`));

        // Driver shows the same, labelled Active.
        await page.goto('/drivers');
        await page.getByRole('button', { name: 'View driver Test Driver' }).click();
        await page.getByRole('link', { name: 'Active' }).click();
        await expect(page).toHaveURL(new RegExp(`/services/${serviceId}$`));

        // Complete the service so it does not leave the vehicle ongoing for later specs.
        await page.goto(`/services/${serviceId}`);
        await page.getByRole('button', { name: 'Complete Service' }).click();
        await page.getByRole('button', { name: 'Confirm transition' }).click();
        await expect(page.getByRole('button', { name: 'Start Service' })).toBeHidden();
    });
});
