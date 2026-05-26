import apiClient from "../lib/apiClient";

export interface AuthUser {
    id: number;
    username: string;
    name: string;
    role: string;
}

export async function login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const { data } = await apiClient.post<{ success: true; data: { token: string; user: AuthUser } }>(
        "/auth/login",
        { username, password },
    );
    return data.data;
}
