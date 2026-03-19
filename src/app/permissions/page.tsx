
"use client";

import CrudResourcePage from "@/components/superadmin/CrudResourcePage";
import { SA_RESOURCES } from "@/lib/superadmin-api";

export default function PermissionsPage() {
  const r = SA_RESOURCES.find((x) => x.key === "permission");
  if (!r) return null;
  return <CrudResourcePage resource={r} />;
}
