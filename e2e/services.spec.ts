import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

let scheduledMinuteOffset = 0;

function futureDateTimeLocal(minuteOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(d.getMinutes() + minuteOffset);
    return d.toISOString().slice(0, 16);
}

async function fillServiceForm(page: Page, description: string, type: string, scheduledAt?: string) {
    const when = scheduledAt ?? futureDateTimeLocal(scheduledMinuteOffset++);
    await page.getByLabel('Scheduled time').fill(when);
    await page.getByLabel('Service type').selectOption(type);
    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Passenger quantity').fill('4');

    await page.getByLabel('Stop 1').fill('Funchal');

    // Wait for vehicle/driver selects to load from API
    await expect(page.getByLabel('Choose vehicle')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose vehicle').selectOption({ label: 'AA-00-BB - Toyota HiAce - 8 seats' });

    await expect(page.getByLabel('Choose driver')).not.toBeDisabled({ timeout: 10000 });
    await page.getByLabel('Choose driver').selectOption({ label: 'Test Driver - License D - Van' });
}

test.describe('Services CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('create a service and view its detail', async ({ page }) => {
        await page.getByRole('link', { name: '+ New Service' }).click();
        await expect(page).toHaveURL('/services/new');

        await fillServiceForm(page, 'E2E Test Service', 'Tour');
        await page.getByRole('button', { name: 'Create Service' }).click();

        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'E2E Test Service' })).toBeVisible();
        await expect(page.getByText('Tour', { exact: false }).first()).toBeVisible();
        await expect(page.getByText('Test Driver', { exact: false }).first()).toBeVisible();
        await expect(page.getByText('AA-00-BB', { exact: false }).first()).toBeVisible();
        await expect(page.getByText(/Created by Administrator/)).toBeVisible();
    });

    test('blocks passenger quantity above the vehicle capacity', async ({ page }) => {
        await page.getByRole('link', { name: '+ New Service' }).click();
        await fillServiceForm(page, 'Over Capacity', 'Tour');
        await page.getByLabel('Passenger quantity').fill('20');
        await page.getByRole('button', { name: 'Create Service' }).click();

        await expect(page).toHaveURL('/services/new');
        await expect(page.getByText(/exceeds the vehicle capacity/i)).toBeVisible();
    });

    test('guardrail blocks deleting a driver with an active service', async ({ page }) => {
        await page.getByRole('link', { name: '+ New Service' }).click();
        await fillServiceForm(page, 'Guardrail Test Service', 'Tour');
        await page.getByRole('button', { name: 'Create Service' }).click();
        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });

        await page.getByRole('link', { name: 'Drivers' }).click();
        await expect(page).toHaveURL('/drivers');

        await page.getByRole('button', { name: /Test Driver/ }).first().click();
        await expect(page).toHaveURL(/\/drivers\/\d+/);

        const deleteButton = page.getByRole('button', { name: 'Delete Driver' });
        await expect(deleteButton).toBeDisabled({ timeout: 10000 });
        await expect(deleteButton).toHaveAttribute(
            'title',
            /Cannot delete: driver has \d+ active service assignment/,
        );
    });

    test('transition service status from scheduled to ongoing', async ({ page }) => {
        await page.getByRole('link', { name: '+ New Service' }).click();

        await fillServiceForm(page, 'Status Transition Test', 'Transfer');
        await page.getByRole('button', { name: 'Create Service' }).click();

        await expect(page).toHaveURL(/\/services\/\d+/, { timeout: 10000 });

        await page.getByRole('button', { name: 'Start Service' }).click();

        await expect(page.getByText('ongoing', { exact: false })).toBeVisible();
    });

    test('delete a service from the services list', async ({ page }) => {
        await page.getByRole('link', { name: '+ New Service' }).click();

        await fillServiceForm(page, 'Service To Delete', 'Taxi');
        await page.getByRole('button', { name: 'Create Service' }).click();

        await expect(page).toHaveURL(/\/services\/(\d+)/, { timeout: 10000 });
        const serviceId = page.url().match(/\/services\/(\d+)/)?.[1];

        await page.getByRole('link', { name: 'Services' }).click();
        await expect(page).toHaveURL('/services');

        await page.getByRole('button', { name: `Delete service ${serviceId}` }).click();

        await expect(page.getByRole('button', { name: `Delete service ${serviceId}` })).not.toBeVisible();
    });
});
