import { test, expect, type Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/services');
}

test.describe('User management (admin)', () => {
    test('admin can view, create, edit, and delete users with guardrails', async ({ page }) => {
        await loginAs(page, 'admin', 'admin123');

        // 1. Users section visible in Settings for admin
        await page.goto('/settings');
        await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

        await page.getByRole('button', { name: 'Add user' }).click();
        const createDialog = page.getByRole('dialog');
        await createDialog.getByLabel(/^Username/).fill('tester1');
        await createDialog.getByLabel(/^Name/).fill('Test One');
        await createDialog.getByLabel(/^Password/).fill('password123');
        await createDialog.getByLabel(/^Role/).selectOption('EMPLOYEE');
        await createDialog.getByRole('button', { name: 'Create user' }).click();

        await expect(page.getByRole('cell', { name: 'tester1' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Test One', exact: true })).toBeVisible();

        await page.getByRole('button', { name: 'Edit user Test One' }).click();
        const editDialog = page.getByRole('dialog');
        await expect(editDialog.getByLabel(/^Username/)).toBeDisabled();
        await expect(editDialog.getByLabel(/^Role/)).toBeEnabled();
        await editDialog.getByLabel(/^Name/).fill('Test One Renamed');
        await editDialog.getByRole('button', { name: 'Save changes' }).click();
        await expect(page.getByRole('cell', { name: 'Test One Renamed', exact: true })).toBeVisible();

        await expect(page.getByRole('button', { name: 'Delete user Administrator' })).toBeDisabled();

        await page.getByRole('button', { name: 'Delete user Test One Renamed' }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'Delete user', exact: true }).click();
        await expect(page.getByRole('cell', { name: 'tester1' })).toBeHidden();
    });

    test('a super admin can create another super admin who cannot be deleted', async ({ page }) => {
        await loginAs(page, 'admin', 'admin123');
        await page.goto('/settings');

        await page.getByRole('button', { name: 'Add user' }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel(/^Username/).fill('superx');
        await dialog.getByLabel(/^Name/).fill('Super X');
        await dialog.getByLabel(/^Password/).fill('password123');
        await dialog.getByLabel(/^Role/).selectOption('SUPER_ADMIN');
        await dialog.getByRole('button', { name: 'Create user' }).click();

        await expect(page.getByRole('cell', { name: 'superx' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Delete user Super X' })).toBeDisabled();
    });

    test('an admin can change a user role', async ({ page }) => {
        await loginAs(page, 'admin', 'admin123');
        await page.goto('/settings');

        await page.getByRole('button', { name: 'Add user' }).click();
        const createDialog = page.getByRole('dialog');
        await createDialog.getByLabel(/^Username/).fill('roley');
        await createDialog.getByLabel(/^Name/).fill('Role User');
        await createDialog.getByLabel(/^Password/).fill('password123');
        await createDialog.getByLabel(/^Role/).selectOption('EMPLOYEE');
        await createDialog.getByRole('button', { name: 'Create user' }).click();
        await expect(page.getByRole('cell', { name: 'roley' })).toBeVisible();

        await page.getByRole('button', { name: 'Edit user Role User' }).click();
        const editDialog = page.getByRole('dialog');
        await editDialog.getByLabel(/^Role/).selectOption('ADMIN');
        await editDialog.getByRole('button', { name: 'Save changes' }).click();

        const row = page.getByRole('row', { name: /Role User/ });
        await expect(row).toContainText('Admin');
        await expect(row).toContainText('Administrator');
    });

    test('employee cannot see the Users section', async ({ page }) => {
        await loginAs(page, 'admin', 'admin123');
        await page.goto('/settings');
        await page.getByRole('button', { name: 'Add user' }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel(/^Username/).fill('emp1');
        await dialog.getByLabel(/^Name/).fill('Employee One');
        await dialog.getByLabel(/^Password/).fill('password123');
        await dialog.getByLabel(/^Role/).selectOption('EMPLOYEE');
        await dialog.getByRole('button', { name: 'Create user' }).click();
        await expect(page.getByRole('cell', { name: 'emp1' })).toBeVisible();

        await page.getByRole('button', { name: 'Logout' }).click();

        await loginAs(page, 'emp1', 'password123');
        await page.goto('/settings');
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Users' })).toBeHidden();
    });
});
