const AUTH_COOKIE_NAME = "satvos-auth-state";
const AUTH_COOKIE_MAX_AGE = 86400; // 24 hours

export function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_NAME}=authenticated; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}
