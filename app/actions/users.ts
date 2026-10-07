"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import {
  approveUserSchema,
  rejectUserSchema,
  updateRoleSchema,
  roleMarkupSchema,
} from "@/lib/validations";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function approveUser(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = approveUserSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  const temporaryPassword = String(formData.get("temporaryPassword") ?? "").trim();

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }
  if (temporaryPassword.length < 6) {
    return { error: "La contraseña temporal debe tener al menos 6 caracteres." };
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return { error: "Usuario no encontrado." };

  let passwordHash = user.passwordHash;
  if (temporaryPassword) {
    if (temporaryPassword.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres." };
    }
    passwordHash = await bcrypt.hash(temporaryPassword, 10);
  }
  if (!passwordHash) {
    return {
      error:
        "Esa solicitud no tiene contraseña registrada. Ingresá una para poder aprobarla.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: parsed.data.role,
      isApproved: true,
      passwordHash,
    },
  });

  revalidatePath("/", "layout");
  return {
    success: `${user.name} ${user.lastName} aprobado como ${parsed.data.role}.`,
  };
}

export async function rejectUser(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = rejectUserSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Usuario no encontrado." };

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return { error: "Usuario no encontrado." };

  if (user.role === "PENDIENTE") {
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch {
      return { error: "No se pudo eliminar: el usuario tiene pedidos asociados." };
    }
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { isApproved: false, role: "PENDIENTE" },
    });
  }

  revalidatePath("/", "layout");
  return { success: `Solicitud de ${user.name} ${user.lastName} rechazada.` };
}

export async function updateUserRole(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role, isApproved: true },
  });

  revalidatePath("/", "layout");
  return { success: "Rol actualizado." };
}

export async function upsertRoleMarkup(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = roleMarkupSchema.safeParse({
    role: formData.get("role"),
    markupValue: formData.get("markupValue"),
    isPercentage: formData.get("isPercentage") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.roleMarkup.upsert({
    where: { role: parsed.data.role },
    update: {
      markupValue: parsed.data.markupValue,
      isPercentage: parsed.data.isPercentage,
    },
    create: {
      role: parsed.data.role,
      markupValue: parsed.data.markupValue,
      isPercentage: parsed.data.isPercentage,
    },
  });

  revalidatePath("/", "layout");
  return { success: `Recargo de ${parsed.data.role} actualizado.` };
}
