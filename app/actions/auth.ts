"use server";

import { AuthError } from "next-auth";
import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/format";
import type { FormState } from "@/lib/action-state";
import { redirect } from "next/navigation";

export async function loginAction(
  expectedRole: "CLIENTE" | "ADMIN",
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };
  }

  try {
    await signIn("credentials", {
      phone: normalizePhone(parsed.data.phone),
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales inválidas o cuenta pendiente de aprobación." };
    }
    throw error;
  }

  const session = await auth();
  const role = session?.user?.role ? String(session.user.role) : null;

  if (!session || !role) {
    return { error: "Credenciales inválidas o cuenta pendiente de aprobación." };
  }

  if (expectedRole === "ADMIN" && role !== "ADMIN") {
    await signOut({ redirect: false });
    return { error: "Esa cuenta no tiene acceso al panel de administración." };
  }

  if (expectedRole === "CLIENTE" && (role === "ADMIN" || role === "PENDIENTE")) {
    await signOut({ redirect: false });
    return {
      error:
        role === "ADMIN"
          ? "Ingresá desde /admin/login para el panel de administración."
          : "Tu solicitud está pendiente de aprobación.",
    };
  }

  await prisma.user
    .update({ where: { id: session.user.id }, data: { lastLoginAt: new Date() } })
    .catch(() => undefined);

  redirect(expectedRole === "ADMIN" ? "/admin" : "/mi-cuenta");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
