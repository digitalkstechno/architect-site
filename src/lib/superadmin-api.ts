"use client";

import { API_BASE_URL } from "./api-config";

export const SA_BASE_URL = API_BASE_URL;
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

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "boolean" | "select";
  options?: { label: string; value: any }[];
  placeholder?: string;
  required?: boolean;
};

export type CrudResource = {
  key: string;
  label: string;
  basePath: string; // e.g. "/tenant"
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  fields: CrudField[];
};

export const SA_RESOURCES: CrudResource[] = [
  {
    key: "tenant",
    label: "Tenants",
    basePath: "/tenant",
    canCreate: true,
    fields: [
      { name: "tenantName", label: "Tenant Name", type: "text", required: true, placeholder: "e.g. Dream Builders" },
      { name: "tenantPhoneNo", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "client@example.com" },
      { name: "isActive", label: "Is Active", type: "boolean" },
    ],
  },
  {
    key: "subscriptionplan",
    label: "Subscription Plans",
    basePath: "/subscription-plans",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Premium Plan" },
      { name: "price", label: "Price", type: "number", required: true, placeholder: "999" },
      { name: "billingCycle", label: "Billing Cycle", type: "select", options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Yearly", value: "Yearly" }
      ]},
      { name: "isActive", label: "Is Active", type: "boolean" },
    ],
  },
  {
    key: "user",
    label: "System Users",
    basePath: "/user",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "userName", label: "Username", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "isSuperAdmin", label: "Is Super Admin", type: "boolean" },
    ],
  },
  {
    key: "role",
    label: "Global Roles",
    basePath: "/role",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "roleName", label: "Role Name", type: "text", required: true },
    ],
  },
  {
    key: "permission",
    label: "Global Permissions",
    basePath: "/permission",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "module", label: "Module Name", type: "text", required: true },
    ],
  },
  {
    key: "client",
    label: "Global Clients",
    basePath: "/client",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "tenantId", label: "Tenant ID", type: "text", required: true },
      { name: "clientName", label: "Client Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "text" },
    ],
  },
  {
    key: "paymentledger",
    label: "Global Ledger",
    basePath: "/paymentledger",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "tenantId", label: "Tenant ID", type: "text", required: true },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "transactionType", label: "Type", type: "select", options: [
        { label: "CREDIT", value: "CREDIT" },
        { label: "DEBIT", value: "DEBIT" }
      ]},
      { name: "description", label: "Description", type: "text" },
    ],
  },
  {
    key: "bankbrief",
    label: "Global Banks",
    basePath: "/bankbrief",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      { name: "tenantId", label: "Tenant ID", type: "text", required: true },
      { name: "bankName", label: "Bank Name", type: "text", required: true },
      { name: "accountNumber", label: "A/C Number", type: "text", required: true },
      { name: "currentBalance", label: "Current Balance", type: "number" },
    ],
  },
];

