export function useToken(): string | null {
    return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token'));
}
