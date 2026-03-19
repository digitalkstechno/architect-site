
"use client";

import CrudResourcePage from "@/components/superadmin/CrudResourcePage";
import { SA_RESOURCES } from "@/lib/superadmin-api";

export default function PlansPage() {
  const r = SA_RESOURCES.find((x) => x.key === "subscriptionplan");
  if (!r) return null;
  return <CrudResourcePage resource={r} />;
}
