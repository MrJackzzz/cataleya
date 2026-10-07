"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { productSchema } from "@/lib/validations";
import { uploadImageToR2 } from "@/lib/r2";
import type { FormState, UploadState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function uploadProductImage(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Seleccioná una imagen." };
  }

  try {
    const url = await uploadImageToR2(file);
    return { url, success: "Imagen subida a Cloudflare R2." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo subir la imagen." };
  }
}

export async function createProduct(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  let imageUrl = String(formData.get("imageUrl") ?? "");
  const file = formData.get("image");

  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadImageToR2(file);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      };
    }
  }

  const parsed = productSchema.safeParse({
    codeNumber: formData.get("codeNumber"),
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl,
    gender: formData.get("gender") ?? "UNISEX",
    olfactoryFamily: formData.get("olfactoryFamily") ?? "",
    stock: formData.get("stock"),
    baseCostPrice: formData.get("baseCostPrice"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del producto." };
  }

  try {
    await prisma.product.create({ data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ese número identificador ya existe." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { success: "Perfume agregado al catálogo." };
}

export async function updateProduct(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Producto no encontrado." };

  let imageUrl = String(formData.get("imageUrl") ?? "");
  const file = formData.get("image");

  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadImageToR2(file);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      };
    }
  }

  const parsed = productSchema.safeParse({
    codeNumber: formData.get("codeNumber"),
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl,
    gender: formData.get("gender") ?? "UNISEX",
    olfactoryFamily: formData.get("olfactoryFamily") ?? "",
    stock: formData.get("stock"),
    baseCostPrice: formData.get("baseCostPrice"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del producto." };
  }

  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ese número identificador ya existe." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { success: "Perfume actualizado." };
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/", "layout");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  revalidatePath("/", "layout");
}
