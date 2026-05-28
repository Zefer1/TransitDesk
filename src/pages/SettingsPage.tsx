import { useState } from 'react';
import { CrudFormSection, CrudTextInput } from '../components/CrudFormPrimitives';
import { useToast } from '../components/useToast';
import { useTheme } from '../components/ThemeProvider';
import { getUser } from '../lib/auth';
import { UsersSection } from '../features/users/UsersSection';

const COMPANY_STORAGE_KEY = 'transitdesk:company:v1';

export function SettingsPage() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = getUser()?.role === 'ADMIN';

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        companyName: data.companyName ?? '',
        rnaat: data.rnaat ?? '',
        tp: data.tp ?? '',
        designation: data.designation ?? '',
        logoUrl: data.logoUrl ?? '',
      };
    }
    return { companyName: '', rnaat: '', tp: '', designation: '', logoUrl: '' };
  });

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1_000_000) {
      addToast('Image must be under 1MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setForm((current) => ({ ...current, logoUrl: '' }));
  }

  function handleSave() {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(form));
    addToast('Company info saved.', 'success');
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage appearance and company information.</p>
      </div>

      <CrudFormSection title="Appearance" description="Choose how the app looks.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently: {theme === 'dark' ? 'Dark' : 'Light'}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </CrudFormSection>

      <CrudFormSection
        title="Company"
        description="This information appears on printed service sheets."
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</p>

          {form.logoUrl ? (
            <div className="flex items-center gap-4">
              <img
                src={form.logoUrl}
                alt="Company logo preview"
                className="h-16 w-auto rounded border border-gray-200 dark:border-gray-700 bg-white p-1"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">No logo uploaded yet.</p>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-700 dark:text-gray-300
                       file:mr-3 file:rounded-md file:border file:border-gray-300 dark:file:border-gray-600
                       file:bg-white dark:file:bg-gray-700 file:px-3 file:py-2
                       file:text-sm file:font-medium file:text-gray-700 dark:file:text-gray-300
                       file:transition file:hover:bg-gray-100 dark:file:hover:bg-gray-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or SVG. Will appear on printed service sheets.</p>
        </div>

        <CrudTextInput
          label="Company Name"
          value={form.companyName}
          onChange={(value) => setForm((current) => ({ ...current, companyName: value }))}
          placeholder="e.g. Madeira Shuttles"
        />
        <CrudTextInput
          label="RNAAT Number"
          value={form.rnaat}
          onChange={(value) => setForm((current) => ({ ...current, rnaat: value }))}
          placeholder="e.g. RNAAT 123 M"
        />
        <CrudTextInput
          label="TP Number"
          value={form.tp}
          onChange={(value) => setForm((current) => ({ ...current, tp: value }))}
          placeholder="e.g. TP 12345 M"
        />
        <CrudTextInput
          label="Commercial Designation"
          value={form.designation}
          onChange={(value) => setForm((current) => ({ ...current, designation: value }))}
          placeholder="e.g. ANIMAÇÃO TURÍSTICA"
        />
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Save
          </button>
        </div>
      </CrudFormSection>

      {isAdmin ? <UsersSection /> : null}
    </section>
  );
}
