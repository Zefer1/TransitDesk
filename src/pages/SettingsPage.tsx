/** Settings page. Manages appearance, company info, and data reset. */
import { useState } from 'react';
import { CrudFormSection, CrudTextInput } from '../components/CrudFormPrimitives';
import { useToast } from '../components/useToast';
import { useTheme } from '../components/ThemeProvider';
import { resetVehiclesToDefaults } from '../api/vehicles.api';
import { resetDriversToDefaults } from '../api/drivers.api';
import { resetGuidesToDefaults } from '../api/guides.api';
import { resetServicesToDefaults } from '../api/services.api';

/** Key used to read/write company settings in localStorage. */
const COMPANY_STORAGE_KEY = 'transitdesk:company:v1';

export function SettingsPage() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // confirmReset gates the destructive action — first click shows "Are you sure?",
  // second click (Yes, reset) actually fires. Cancel flips it back to false.
  const [confirmReset, setConfirmReset] = useState(false);

  // Passing a function to useState is called "lazy initialisation" -- React
  // calls it once on mount to get the starting value. We use it to read from
  // localStorage right away so we never need a useEffect just to set state.
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

  // Read the selected image file and convert it to a base64 string.
  // FileReader.readAsDataURL turns any file into a "data:image/png;base64,..."
  // string that can be stored in state and localStorage like any other string.
  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // localStorage has a ~5MB limit. Base64 encoding inflates file size by ~33%,
    // so we cap at 1MB to stay safe and give the user a clear error if they go over.
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

  // Clear the logo from state. It won't be removed from localStorage
  // until the user clicks Save (same as the other fields).
  function handleRemoveLogo() {
    setForm((current) => ({ ...current, logoUrl: '' }));
  }

  // Write the form object to localStorage as JSON and show a toast.
  // localStorage is synchronous so no async/await needed.
  function handleSave() {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(form));
    addToast('Company info saved.', 'success');
  }

  // Restore all four mock stores to their seed data and show a toast.
  // The in-memory stores are replaced immediately; services also clears sessionStorage.
  // No page reload needed — navigate to any list to see the fresh data.
  function handleReset() {
    resetVehiclesToDefaults();
    resetDriversToDefaults();
    resetGuidesToDefaults();
    resetServicesToDefaults();
    setConfirmReset(false);
    addToast('Mock data has been reset to defaults.', 'success');
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage appearance and company information.</p>
      </div>

      {/* Appearance card */}
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

      {/* Company info form */}
      <CrudFormSection
        title="Company"
        description="This information appears on printed service sheets."
      >
        {/* Logo upload */}
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
          placeholder="e.g. Extreme Courtesy"
        />
        <CrudTextInput
          label="RNAAT Number"
          value={form.rnaat}
          onChange={(value) => setForm((current) => ({ ...current, rnaat: value }))}
          placeholder="e.g. RNAAT 598 M"
        />
        <CrudTextInput
          label="TP Number"
          value={form.tp}
          onChange={(value) => setForm((current) => ({ ...current, tp: value }))}
          placeholder="e.g. TP 10075 M"
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

      {/* Data reset */}
      <CrudFormSection title="Data" description="Reset all mock data back to the built-in defaults.">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will clear any vehicles, drivers, guides, and services you have created
            and restore the original sample records. The page will not reload — navigate
            to any list to see the fresh data.
          </p>

          {confirmReset ? (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Are you sure? This cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center justify-center rounded-md border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Reset mock data
            </button>
          )}
        </div>
      </CrudFormSection>
    </section>
  );
}
