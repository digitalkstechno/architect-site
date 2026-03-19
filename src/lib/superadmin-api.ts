"use client";

export const SA_BASE_URL = "https://architecture-backend-71fw.onrender.com/architecture";
const TOKEN_KEY = "sa_token";

export function getSuperAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSuperAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSuperAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function normalizeUrl(path: string) {
  if (!path.startsWith("/")) return `${SA_BASE_URL}/${path}`;
  return `${SA_BASE_URL}${path}`;
}

function unwrapJson(payload: any) {
  // backend may return {data: ...} or direct array/object
  if (payload && typeof payload === "object") {
    if ("data" in payload) return (payload as any).data;
    if ("result" in payload) return (payload as any).result;
    if ("items" in payload) return (payload as any).items;
  }
  return payload;
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function saFetch<T = any>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const token = opts.token ?? getSuperAdminToken();
  const res = await fetch(normalizeUrl(path), {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const msg =
      (payload && typeof payload === "object" && ((payload as any).message || (payload as any).error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(String(msg), res.status, payload);
  }

  return unwrapJson(payload) as T;
}

export async function saLogin(userName: string, password: string) {
  const payload = await saFetch<any>("/login", {
    method: "POST",
    body: JSON.stringify({ userName, password }),
    token: null,
  });

  const token =
    payload?.token ??
    payload?.accessToken ??
    payload?.jwt ??
    payload?.data?.token ??
    payload?.data?.accessToken;

  if (!token) {
    // still return full payload for debugging
    throw new ApiError("Login succeeded but token not found in response.", 200, payload);
  }

  setSuperAdminToken(String(token));
  return payload;
}

export type CrudResource = {
  key: string;
  label: string;
  basePath: string; // e.g. "/tenant"
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

export const SA_RESOURCES: CrudResource[] = [
  { key: "tenant", label: "Tenant", basePath: "/tenant", canCreate: true },
  { key: "paymentledger", label: "Payment Ledger", basePath: "/paymentledger", canCreate: true, canUpdate: true, canDelete: true },
  { key: "bankbrief", label: "Bank Brief", basePath: "/bankbrief", canCreate: true, canUpdate: true, canDelete: true },
  { key: "subscriptionplan", label: "Subscription Plan", basePath: "/subscriptionplan", canCreate: true, canUpdate: true, canDelete: true },
  { key: "user", label: "User", basePath: "/user", canCreate: true, canUpdate: true, canDelete: true },
  { key: "role", label: "Role", basePath: "/role", canCreate: true, canUpdate: true, canDelete: true },
  { key: "permission", label: "Permission", basePath: "/permission", canCreate: true, canUpdate: true, canDelete: true },
];

