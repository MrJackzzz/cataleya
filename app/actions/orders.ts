"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedClient, requireAdmin } from "@/lib/guards";
import { createOrderSchema, orderStatusSchema } from "@/lib/validations";
import { priceForRole, roundMoney } from "@/lib/pricing";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function createOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireApprovedClient();

  const parsed = createOrderSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    kind: formData.get("kind"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá el pedido." };
  }

  const { productId, quantity, kind, note } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return { error: "Este perfume no está disponible por el momento." };
  }
  if (product.stock < quantity) {
    return { error: `Stock insuficiente. Disponible: ${product.stock} unidad(es).` };
  }

  const markups = await prisma.roleMarkup.findMany();
  const unitPrice = priceForRole(product.baseCostPrice, markups, session.user.role);
  const total = roundMoney(unitPrice * quantity);

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        kind,
        note: note ?? null,
        status: "PENDIENTE",
        items: {
          create: [{ productId: product.id, quantity, price: unitPrice }],
        },
      },
    }),
    prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } },
    }),
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/mi-cuenta");
  revalidatePath("/admin");

  return {
    success: `Pedido #${product.codeNumber} registrado. Te contactamos por WhatsApp para coordinar la entrega.`,
  };
}

export async function setOrderStatus(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });
  if (!order) return { error: "Pedido no encontrado." };
  if (order.status === parsed.data.status) return { success: "Sin cambios." };

  const wasCancelled = order.status === "CANCELADO";
  const willCancel = parsed.data.status === "CANCELADO";

  const stockOps = order.items.map((item) => {
    if (willCancel && !wasCancelled) {
      return prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    if (!willCancel && wasCancelled) {
      return prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    return prisma.product.findUnique({ where: { id: item.productId } });
  });

  try {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: parsed.data.status },
      }),
      ...stockOps,
    ]);
  } catch {
    return {
      error: "No hay stock disponible para reactivar este pedido.",
    };
  }

  revalidatePath("/", "layout");
  return { success: "Estado del pedido actualizado." };
}
