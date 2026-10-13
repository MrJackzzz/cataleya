"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { paymentSchema, deletePaymentSchema } from "@/lib/validations";
import { roundMoney } from "@/lib/pricing";
import { formatMoney } from "@/lib/format";
import { logMovement } from "@/lib/movements";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function registerPayment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = paymentSchema.safeParse({
    orderId: formData.get("orderId"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos del pago." };
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      payments: true,
      items: { include: { product: { select: { codeNumber: true } } } },
      user: { select: { name: true, lastName: true } },
    },
  });
  if (!order) return { error: "Pedido no encontrado." };
  if (order.status === "CANCELADO") {
    return { error: "No se puede cobrar un pedido cancelado." };
  }

  const paid = roundMoney(
    order.payments.reduce((sum, payment) => sum + payment.amount, 0)
  );
  const remaining = roundMoney(order.total - paid);
  const amount = roundMoney(parsed.data.amount);

  if (amount > remaining) {
    return {
      error: `El monto supera el saldo pendiente (${formatMoney(remaining)}).`,
    };
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount,
      note: parsed.data.note || null,
      date: new Date(parsed.data.date),
    },
  });

  revalidatePath("/", "layout");
  const codes = order.items.map((item) => item.product.codeNumber).join(" + ") || "—";
  const who = `${order.user.name} ${order.user.lastName}`;
  const newRemaining = roundMoney(remaining - amount);
  await logMovement("PAGO", `Pago ${formatMoney(amount)} pedido N° ${codes} (${who}).`);
  return {
    success:
      newRemaining <= 0
        ? "Pago registrado. Pedido totalmente abonado."
        : `Pago registrado. Resta ${formatMoney(newRemaining)}.`,
  };
}

export async function deletePayment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = deletePaymentSchema.safeParse({ paymentId: formData.get("paymentId") });
  if (!parsed.success) return { error: "Pago no encontrado." };

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
  });
  if (!payment) return { error: "Pago no encontrado." };

  await prisma.payment.delete({ where: { id: payment.id } });

  revalidatePath("/", "layout");
  await logMovement("PAGO", `Pago ${formatMoney(payment.amount)} eliminado.`);
  return { success: "Pago eliminado." };
}
