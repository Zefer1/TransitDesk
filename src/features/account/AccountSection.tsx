import { useState } from "react";
import axios from "axios";

import { CrudFormSection, CrudTextInput, CrudFormActions } from "../../components/CrudFormPrimitives";
import { useToast } from "../../components/useToast";
import { changePassword } from "../../api/auth.api";

const EMPTY = { current: "", next: "", confirm: "" };

function extractErrorMessage(error: unknown, fallback: string): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data;
		if (data?.errors?.length) {
			return data.errors.map((e: { message: string }) => e.message).join(". ");
		}
		if (data?.error) {
			return data.error;
		}
	}
	return fallback;
}

export function AccountSection() {
	const { addToast } = useToast();
	const [form, setForm] = useState(EMPTY);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (form.next !== form.confirm) {
			setError("New password and confirmation do not match.");
			return;
		}
		if (form.next.length < 8) {
			setError("New password must be at least 8 characters.");
			return;
		}

		setIsSubmitting(true);
		try {
			await changePassword(form.current, form.next);
			setForm(EMPTY);
			addToast("Password changed.", "success");
		} catch (err) {
			setError(extractErrorMessage(err, "Failed to change password."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<CrudFormSection title="Account" description="Change the password for your account.">
			<form onSubmit={handleSubmit} className="space-y-4" noValidate>
				<CrudTextInput
					label="Current password"
					type="password"
					value={form.current}
					onChange={(value) => setForm((c) => ({ ...c, current: value }))}
					required
					autoComplete="current-password"
				/>
				<CrudTextInput
					label="New password"
					type="password"
					value={form.next}
					onChange={(value) => setForm((c) => ({ ...c, next: value }))}
					required
					autoComplete="new-password"
					hint="Minimum 8 characters."
				/>
				<CrudTextInput
					label="Confirm new password"
					type="password"
					value={form.confirm}
					onChange={(value) => setForm((c) => ({ ...c, confirm: value }))}
					required
					autoComplete="new-password"
				/>

				{error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

				<CrudFormActions
					submitLabel="Change password"
					isSubmitting={isSubmitting}
					isSubmitDisabled={!form.current || !form.next || !form.confirm}
					onCancel={() => setForm(EMPTY)}
					cancelLabel="Clear"
				/>
			</form>
		</CrudFormSection>
	);
}
