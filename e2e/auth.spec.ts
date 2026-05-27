import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('login with valid credentials redirects to /services', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Username').fill('admin');
        await page.getByLabel('Password').fill('admin123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        await expect(page).toHaveURL('/services');
        await expect(page.getByRole('link', { name: 'TransitDesk' })).toBeVisible();
    });

    test('login with invalid credentials shows error message', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Username').fill('admin');
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Sign in' }).click();

        await expect(page).toHaveURL('/login');
        await expect(page.getByText('Invalid username or password')).toBeVisible();
    });

    test('unauthenticated user is redirected to /login', async ({ page }) => {
        await page.goto('/services');
        await expect(page).toHaveURL('/login');
    });

    test('logout clears session and redirects to /login', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Username').fill('admin');
        await page.getByLabel('Password').fill('admin123');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL('/services');

        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page).toHaveURL('/login');

        await page.goto('/services');
        await expect(page).toHaveURL('/login');
    });
});
