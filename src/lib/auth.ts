export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function getUser() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearAuth(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
    return getToken() !== null;
}
