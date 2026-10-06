import { redirect } from "next/navigation";
import { auth } from "./auth";
import { APPROVED_ROLES } from "./constants";

export async function getSession() {
  return await auth();
}

export async function requireApprovedClient() {
  const session = await auth();
  const role = session?.user?.role ? String(session.user.role) : null;
  if (!session || !role || !APPROVED_ROLES.includes(role as never)) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
