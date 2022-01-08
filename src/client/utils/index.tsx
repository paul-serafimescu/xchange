export function useToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export function isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token')) || Boolean(sessionStorage.getItem('token'));
}

export function logout(): void {
    sessionStorage.clear();
    localStorage.clear();
}
