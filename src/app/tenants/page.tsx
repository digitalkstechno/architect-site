
"use client";

import CrudResourcePage from "@/components/superadmin/CrudResourcePage";
import { SA_RESOURCES } from "@/lib/superadmin-api";

export default function TenantsPage() {
  const r = SA_RESOURCES.find((x) => x.key === "tenant");
  if (!r) return null;
  return <CrudResourcePage resource={r} />;
}
