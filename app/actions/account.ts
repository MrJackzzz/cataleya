"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedClient } from "@/lib/guards";
import type { FormState } from "@/lib/action-state";
import bcrypt from "bcryptjs";

export async function changePassword(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireApprovedClient();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) return { error: "Usuario no encontrado." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "La contraseña actual no coincide." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { success: "Contraseña actualizada." };
}
