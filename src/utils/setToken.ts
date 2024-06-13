export function setToken(tokenKey: string, token: string) {
    return localStorage.setItem(tokenKey, token)
}

export function getToken(tokenKey: string) {
    return localStorage.getItem(tokenKey)
}

export function removeToken(tokenKey: string) {
    return localStorage.removeItem(tokenKey)
}