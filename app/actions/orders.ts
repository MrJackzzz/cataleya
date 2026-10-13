"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedClient, requireAdmin } from "@/lib/guards";
import { auth } from "@/lib/auth";
import {
  createOrderSchema,
  orderStatusSchema,
  deleteOrderSchema,
  adminOrderSchema,
  adminCartOrderSchema,
  orderItemQtySchema,
  orderItemReturnSchema,
} from "@/lib/validations";
import { normalizePhone, formatMoney } from "@/lib/format";
import { logMovement } from "@/lib/movements";
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

  await logMovement(
    "PEDIDO",
    `Pedido N° ${product.codeNumber} x${quantity} creado (${kind}).`
  );
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
  await logMovement("PEDIDO", `Pedido ${order.id.slice(0, 8)} pasó a ${parsed.data.status}.`);
  return { success: "Estado del pedido actualizado." };
}

export async function deleteOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = deleteOrderSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return { error: "Pedido no encontrado." };

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });
  if (!order) return { error: "Pedido no encontrado." };

  const ops = [];
  if (order.status !== "CANCELADO") {
    for (const item of order.items) {
      ops.push(
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      );
    }
  }
  ops.push(prisma.orderItem.deleteMany({ where: { orderId: order.id } }));
  ops.push(prisma.order.delete({ where: { id: order.id } }));

  await prisma.$transaction(ops);

  revalidatePath("/", "layout");
  await logMovement("PEDIDO", `Pedido ${parsed.data.orderId.slice(0, 8)} eliminado.`);
  return { success: "Pedido eliminado y stock devuelto." };
}

export async function createAdminOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = adminOrderSchema.safeParse({
    userId: formData.get("userId") || undefined,
    newName: formData.get("newName") || undefined,
    newLastName: formData.get("newLastName") || undefined,
    newPhone: formData.get("newPhone") || undefined,
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    kind: formData.get("kind"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del pedido." };
  }

  const { userId, newName, newLastName, newPhone, productId, quantity, kind } =
    parsed.data;

  let user;
  if (newName?.trim()) {
    if (!newLastName?.trim() || !newPhone?.trim()) {
      return { error: "Completá nombre, apellido y WhatsApp del nuevo cliente." };
    }
    const phone = normalizePhone(newPhone);
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return { error: "Ese número ya tiene cuenta. Seleccionalo en la lista." };
    }
    user = await prisma.user.create({
      data: {
        name: newName.trim(),
        lastName: newLastName.trim(),
        phone,
        role: "PENDIENTE",
        isApproved: false,
      },
    });
  } else {
    if (!userId) return { error: "Seleccioná un cliente." };
    user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === "ADMIN") {
      return { error: "Cliente inválido." };
    }
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return { error: "Este perfume no está disponible por el momento." };
  }
  if (product.stock < quantity) {
    return { error: `Stock insuficiente. Disponible: ${product.stock} unidad(es).` };
  }

  const markups = await prisma.roleMarkup.findMany();
  const unitPrice = priceForRole(product.baseCostPrice, markups, user.role);
  const total = roundMoney(unitPrice * quantity);

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: user.id,
        total,
        kind,
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
  await logMovement(
    "PEDIDO",
    `Pedido N° ${product.codeNumber} x${quantity} creado para ${user.name} ${user.lastName} (${kind}).`
  );
  return {
    success: `Pedido N° ${product.codeNumber} creado para ${user.name} ${user.lastName}.`,
  };
}

export async function updateOrderItemQuantity(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  const role = session?.user?.role ? String(session.user.role) : null;
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!session || !userId || !role) {
    return { error: "Sesión requerida." };
  }
  const isAdmin = role === "ADMIN";
  if (!isAdmin && role !== "CLIENTE" && role !== "SOCIO" && role !== "FAMILIAR") {
    return { error: "Sin permiso para editar." };
  }

  const parsed = orderItemQtySchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá la cantidad." };
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: parsed.data.itemId },
    include: {
      product: true,
      order: { include: { items: true, payments: { select: { amount: true } } } },
    },
  });
  if (!item) return { error: "Ítem no encontrado." };

  const editable =
    item.order.status === "PENDIENTE" ||
    (isAdmin && item.order.status === "EN_PROCESO");
  if (!editable) {
    return {
      error: isAdmin
        ? "Solo se pueden editar pedidos pendientes o en proceso."
        : "Solo podés editar pedidos pendientes.",
    };
  }
  if (!isAdmin && item.order.userId !== userId) {
    return { error: "Sin permiso para editar." };
  }

  const diff = parsed.data.quantity - item.quantity;
  if (diff > 0 && item.product.stock < diff) {
    return { error: `Stock insuficiente. Disponible: ${item.product.stock} unidad(es).` };
  }

  const paid = roundMoney(
    item.order.payments.reduce((sum, payment) => sum + payment.amount, 0)
  );
  const siblings = item.order.items.filter((entry) => entry.id !== item.id);

  if (parsed.data.quantity === 0) {
    if (siblings.length === 0) {
      if (paid > 0) {
        return { error: "Tiene pagos registrados. Pedí la eliminación en el panel." };
      }
      await prisma.$transaction([
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
        prisma.orderItem.delete({ where: { id: item.id } }),
        prisma.order.delete({ where: { id: item.orderId } }),
      ]);
      revalidatePath("/", "layout");
      revalidatePath("/mi-cuenta");
      revalidatePath("/admin");
      await logMovement(
        "PEDIDO",
        `Ítem N° ${item.product.codeNumber} quitado (pedido ${item.orderId.slice(0, 8)} eliminado, quedó vacío).`
      );
      return { success: "Ítem quitado. El pedido quedó vacío y se eliminó." };
    }
    await prisma.$transaction([
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }),
      prisma.orderItem.delete({ where: { id: item.id } }),
      prisma.order.update({
        where: { id: item.orderId },
        data: {
          total: roundMoney(
            siblings.reduce((sum, entry) => sum + entry.price * entry.quantity, 0)
          ),
        },
      }),
    ]);
    revalidatePath("/", "layout");
    revalidatePath("/mi-cuenta");
    revalidatePath("/admin");
    await logMovement(
      "PEDIDO",
      `Ítem N° ${item.product.codeNumber} quitado del pedido ${item.orderId.slice(0, 8)}.`
    );
    return { success: "Ítem quitado del pedido." };
  }

  const newTotal = roundMoney(
    siblings.reduce((sum, entry) => sum + entry.price * entry.quantity, 0) +
      item.price * parsed.data.quantity
  );

  await prisma.$transaction([
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: diff } },
    }),
    prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: parsed.data.quantity },
    }),
    prisma.order.update({ where: { id: item.orderId }, data: { total: newTotal } }),
  ]);

  revalidatePath("/", "layout");
  revalidatePath("/mi-cuenta");
  revalidatePath("/admin");
  await logMovement(
    "PEDIDO",
    `Pedido ${item.orderId.slice(0, 8)}: N° ${item.product.codeNumber} x${item.quantity} → x${parsed.data.quantity}.`
  );
  return { success: "Cantidad actualizada." };
}

export async function returnOrderItem(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = orderItemReturnSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá la cantidad." };
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: parsed.data.itemId },
    include: {
      order: { include: { items: true } },
      product: { select: { codeNumber: true } },
    },
  });
  if (!item) return { error: "Ítem no encontrado." };
  if (item.order.status === "CANCELADO") {
    return { error: "El pedido está cancelado." };
  }
  if (parsed.data.quantity > item.quantity) {
    return { error: `Solo hay ${item.quantity} unidad(es) en el pedido.` };
  }

  const newQuantity = item.quantity - parsed.data.quantity;
  const remaining = item.order.items.filter((entry) => entry.id !== item.id);
  const newTotal = roundMoney(
    remaining.reduce((sum, entry) => sum + entry.price * entry.quantity, 0) +
      item.price * newQuantity
  );

  const ops = [
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: parsed.data.quantity } },
    }),
    newQuantity === 0
      ? prisma.orderItem.delete({ where: { id: item.id } })
      : prisma.orderItem.update({
          where: { id: item.id },
          data: { quantity: newQuantity },
        }),
    prisma.order.update({ where: { id: item.orderId }, data: { total: newTotal } }),
  ];

  await prisma.$transaction(ops);

  revalidatePath("/", "layout");
  await logMovement(
    "PEDIDO",
    `Devolución N° ${item.product.codeNumber} x${parsed.data.quantity} (pedido ${item.orderId.slice(0, 8)}).`
  );
  return {
    success: `Devolución registrada. Nuevo total: ${formatMoney(newTotal)}.`,
  };
}

export async function createAdminCartOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = adminCartOrderSchema.safeParse({
    userId: formData.get("userId") || undefined,
    newName: formData.get("newName") || undefined,
    newLastName: formData.get("newLastName") || undefined,
    newPhone: formData.get("newPhone") || undefined,
    kind: formData.get("kind"),
    items: formData.get("items"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá el pedido." };
  }

  const { userId, newName, newLastName, newPhone, kind, items } = parsed.data;

  let user;
  if (newName?.trim()) {
    if (!newLastName?.trim() || !newPhone?.trim()) {
      return { error: "Completá nombre, apellido y WhatsApp del nuevo cliente." };
    }
    const phone = normalizePhone(newPhone);
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return { error: "Ese número ya tiene cuenta. Seleccionalo en la lista." };
    }
    user = await prisma.user.create({
      data: {
        name: newName.trim(),
        lastName: newLastName.trim(),
        phone,
        role: "PENDIENTE",
        isApproved: false,
      },
    });
  } else {
    if (!userId) return { error: "Seleccioná un cliente." };
    user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === "ADMIN") {
      return { error: "Cliente inválido." };
    }
  }

  const combined = new Map<string, number>();
  for (const line of items) {
    combined.set(line.productId, (combined.get(line.productId) ?? 0) + line.quantity);
  }

  const markups = await prisma.roleMarkup.findMany();
  const lines: { productId: string; quantity: number; price: number; code: number }[] = [];
  for (const [productId, quantity] of combined) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return { error: "Un perfume ya no está disponible. Revisá el carrito." };
    }
    if (product.stock < quantity) {
      return {
        error: `Stock insuficiente de N° ${product.codeNumber}. Disponible: ${product.stock}.`,
      };
    }
    lines.push({
      productId: product.id,
      quantity,
      price: priceForRole(product.baseCostPrice, markups, user.role),
      code: product.codeNumber,
    });
  }

  const total = roundMoney(
    lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  );

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: user.id,
        total,
        kind,
        status: "PENDIENTE",
        items: {
          create: lines.map(({ productId, quantity, price }) => ({
            productId,
            quantity,
            price,
          })),
        },
      },
    }),
    ...lines.map((line) =>
      prisma.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      })
    ),
  ]);

  revalidatePath("/", "layout");
  const codes = lines.map((line) => line.code).join(" + ");
  await logMovement(
    "PEDIDO",
    `Pedido N° ${codes} creado para ${user.name} ${user.lastName} (${lines.length} artículo(s)).`
  );
  return {
    success: `Pedido creado para ${user.name} ${user.lastName}: ${lines.length} artículo(s) · total ${formatMoney(total)}.`,
  };
}
