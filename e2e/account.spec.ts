import { test, expect, type Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

test.describe('Account password change', () => {
    test('an employee can change their own password and log in with it', async ({ page }) => {
        // Admin creates an employee account
        await loginAs(page, 'admin', 'admin123');
        await page.goto('/settings');
        await page.getByRole('button', { name: 'Add user' }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel(/^Username/).fill('pwuser');
        await dialog.getByLabel(/^Name/).fill('Password User');
        await dialog.getByLabel(/^Password/).fill('initialpass');
        await dialog.getByLabel(/^Role/).selectOption('EMPLOYEE');
        await dialog.getByRole('button', { name: 'Create user' }).click();
        await expect(page.getByRole('cell', { name: 'pwuser' })).toBeVisible();
        await page.getByRole('button', { name: 'Logout' }).click();

        // Employee logs in and changes their password
        await loginAs(page, 'pwuser', 'initialpass');
        await page.goto('/settings');
        await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
        // No admin Users section for an employee
        await expect(page.getByRole('heading', { name: 'Users' })).toBeHidden();

        await page.getByLabel(/^Current password/).fill('initialpass');
        await page.getByLabel(/^New password/).fill('changedpass');
        await page.getByLabel(/^Confirm new password/).fill('changedpass');
        await page.getByRole('button', { name: 'Change password' }).click();
        await expect(page.getByText('Password changed.')).toBeVisible();

        // Log out and log in with the new password
        await page.getByRole('button', { name: 'Logout' }).click();
        await loginAs(page, 'pwuser', 'changedpass');
    });

    test('wrong current password is rejected', async ({ page }) => {
        await loginAs(page, 'admin', 'admin123');
        await page.goto('/settings');

        await page.getByLabel(/^Current password/).fill('wrongpassword');
        await page.getByLabel(/^New password/).fill('whatever123');
        await page.getByLabel(/^Confirm new password/).fill('whatever123');
        await page.getByRole('button', { name: 'Change password' }).click();

        await expect(page.getByText('Current password is incorrect')).toBeVisible();
    });
});
