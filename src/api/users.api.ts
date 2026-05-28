import apiClient from "../lib/apiClient";

export type UserRole = "ADMIN" | "EMPLOYEE";

export interface User {
	id: number;
	username: string;
	name: string;
	role: UserRole;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserInput {
	username: string;
	password: string;
	name: string;
	role: UserRole;
}

export interface UpdateUserInput {
	name?: string;
	password?: string;
}

export async function listUsers(): Promise<User[]> {
	const { data } = await apiClient.get<{ success: true; data: User[] }>("/users");
	return data.data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
	const { data } = await apiClient.post<{ success: true; data: User }>("/users", input);
	return data.data;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<User> {
	const { data } = await apiClient.patch<{ success: true; data: User }>(`/users/${id}`, input);
	return data.data;
}

export async function deleteUser(id: number): Promise<void> {
	await apiClient.delete(`/users/${id}`);
}
