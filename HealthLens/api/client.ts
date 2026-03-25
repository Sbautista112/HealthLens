/**
 * Calls `fetch` with `Authorization: Bearer <token>` when a token is returned.
 * Pass a function that returns the current Firebase ID token (e.g. from `useAuth().getIdToken`).
 */
export async function fetchWithAuth(
  getToken: () => Promise<string | null>,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
