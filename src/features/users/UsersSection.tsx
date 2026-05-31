import { useEffect, useState } from "react";

import { CrudFormSection, CrudSelectInput, CrudTextInput, CrudFormActions } from "../../components/CrudFormPrimitives";
import { Modal } from "../../components/Modal";
import { useToast } from "../../components/useToast";
import { getUser } from "../../lib/auth";
import { extractApiError } from "../../lib/apiError";
import {
	createUser,
	deleteUser,
	listUsers,
	updateUser,
	type CreateUserInput,
	type User,
	type UserRole,
} from "../../api/users.api";

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
	{ label: "Employee", value: "EMPLOYEE" },
	{ label: "Admin", value: "ADMIN" },
];

const SUPER_ADMIN_OPTION: { label: string; value: UserRole } = { label: "Super Admin", value: "SUPER_ADMIN" };

function roleLabel(role: UserRole): string {
	if (role === "SUPER_ADMIN") return "Super Admin";
	if (role === "ADMIN") return "Admin";
	return "Employee";
}

type FormState = {
	username: string;
	name: string;
	password: string;
	role: UserRole;
};

const EMPTY_FORM: FormState = { username: "", name: "", password: "", role: "EMPLOYEE" };

export function UsersSection() {
	const { addToast } = useToast();
	const currentUser = getUser();
	const roleOptions = currentUser?.role === "SUPER_ADMIN" ? [...ROLE_OPTIONS, SUPER_ADMIN_OPTION] : ROLE_OPTIONS;

	function canEditRole(user: User): boolean {
		return user.role !== "SUPER_ADMIN" && user.id !== currentUser?.id;
	}

	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [editing, setEditing] = useState<User | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	async function loadUsers() {
		setIsLoading(true);
		setLoadError(null);
		try {
			setUsers(await listUsers());
		} catch (error) {
			setLoadError(extractApiError(error, "Failed to load users."));
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		void loadUsers();
	}, []);

	function openCreate() {
		setEditing(null);
		setForm(EMPTY_FORM);
		setFormError(null);
		setIsFormOpen(true);
	}

	function openEdit(user: User) {
		setEditing(user);
		setForm({ username: user.username, name: user.name, password: "", role: user.role });
		setFormError(null);
		setIsFormOpen(true);
	}

	function closeForm() {
		setIsFormOpen(false);
	}

	async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setFormError(null);
		try {
			if (editing) {
				const payload: { name: string; password?: string; role?: UserRole } = { name: form.name.trim() };
				if (form.password) {
					payload.password = form.password;
				}
				if (canEditRole(editing) && form.role !== editing.role) {
					payload.role = form.role;
				}
				await updateUser(editing.id, payload);
				addToast("User updated.", "success");
			} else {
				const payload: CreateUserInput = {
					username: form.username.trim(),
					name: form.name.trim(),
					password: form.password,
					role: form.role,
				};
				await createUser(payload);
				addToast("User created.", "success");
			}
			setIsFormOpen(false);
			await loadUsers();
		} catch (error) {
			setFormError(extractApiError(error, "Failed to save user."));
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) {
			return;
		}
		setIsDeleting(true);
		try {
			await deleteUser(deleteTarget.id);
			addToast("User deleted.", "success");
			setDeleteTarget(null);
			await loadUsers();
		} catch (error) {
			addToast(extractApiError(error, "Failed to delete user."), "error");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<CrudFormSection title="Users" description="Create and manage the accounts that can access TransitDesk.">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={openCreate}
					className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					Add user
				</button>
			</div>

			{isLoading ? (
				<p className="text-sm text-gray-500 dark:text-gray-400">Loading users...</p>
			) : loadError ? (
				<div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
					<span>{loadError}</span>
					<button type="button" onClick={() => void loadUsers()} className="underline">
						Retry
					</button>
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-900">
							<tr>
								<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Name</th>
								<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Username</th>
								<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Role</th>
								<th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
							{users.map((user) => (
								<tr key={user.id}>
									<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.name}</td>
									<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.username}</td>
									<td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{roleLabel(user.role)}</td>
									<td className="px-4 py-3 text-right text-sm">
										<div className="flex justify-end gap-2">
											<button
												type="button"
												onClick={() => openEdit(user)}
												aria-label={`Edit user ${user.name}`}
												className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => setDeleteTarget(user)}
												disabled={currentUser?.id === user.id || user.role === "SUPER_ADMIN"}
												aria-label={`Delete user ${user.name}`}
												title={
													user.role === "SUPER_ADMIN"
														? "A Super Admin cannot be deleted"
														: currentUser?.id === user.id
															? "You cannot delete your own account"
															: undefined
												}
												className="rounded-md border border-red-300 dark:border-red-700 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-50"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<Modal isOpen={isFormOpen} title={editing ? "Edit user" : "Add user"} onClose={closeForm}>
				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					{editing ? (
						<CrudTextInput label="Username" value={form.username} onChange={() => {}} disabled hint="Username cannot be changed." />
					) : (
						<CrudTextInput label="Username" value={form.username} onChange={(value) => setForm((c) => ({ ...c, username: value }))} required autoComplete="off" />
					)}

					<CrudTextInput label="Name" value={form.name} onChange={(value) => setForm((c) => ({ ...c, name: value }))} required />

					<CrudTextInput
						label={editing ? "New password" : "Password"}
						type="text"
						value={form.password}
						onChange={(value) => setForm((c) => ({ ...c, password: value }))}
						required={!editing}
						autoComplete="new-password"
						hint={editing ? "Leave blank to keep the current password. Minimum 8 characters." : "Minimum 8 characters."}
					/>

					{editing && !canEditRole(editing) ? (
						<CrudTextInput label="Role" value={roleLabel(form.role)} onChange={() => {}} disabled hint="Role cannot be changed." />
					) : (
						<CrudSelectInput
							label="Role"
							value={form.role}
							onChange={(value) => setForm((c) => ({ ...c, role: value as UserRole }))}
							options={roleOptions}
							required
						/>
					)}

					{formError ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}

					<CrudFormActions submitLabel={editing ? "Save changes" : "Create user"} isSubmitting={isSubmitting} onCancel={closeForm} />
				</form>
			</Modal>

			<Modal isOpen={deleteTarget !== null} title="Delete user" onClose={() => setDeleteTarget(null)}>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
				</p>
				<div className="mt-6 flex justify-end gap-2">
					<button
						type="button"
						onClick={() => setDeleteTarget(null)}
						disabled={isDeleting}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => void handleDelete()}
						disabled={isDeleting}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isDeleting ? "Deleting..." : "Delete user"}
					</button>
				</div>
			</Modal>
		</CrudFormSection>
	);
}
