"use server";

import { prisma } from "@/lib/prisma";
import { accessRequestSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/format";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function requestAccess(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = accessRequestSchema.safeParse({
    name: formData.get("name"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };
  }

  const phone = normalizePhone(parsed.data.phone);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    if (existing.role === "PENDIENTE" || !existing.isApproved) {
      return { error: "Ya existe una solicitud en revisión con ese número." };
    }
    return { error: "Ese número ya tiene cuenta activa. Iniciá sesión." };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      lastName: parsed.data.lastName,
      phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "PENDIENTE",
      isApproved: false,
    },
  });

  revalidatePath("/", "layout");
  return {
    success:
      "Solicitud enviada. Cuando tu cuenta sea aprobada vas a poder ingresar con tu número y tu contraseña.",
  };
}
