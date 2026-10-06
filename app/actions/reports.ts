"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function getEarningsReport(range: { from: Date; to: Date }) {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: range.from, lte: range.to },
      status: { not: "CANCELADO" },
    },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, lastName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let revenue = 0;
  let cost = 0;

  const byDay = new Map<
    string,
    { day: string; revenue: number; cost: number; orders: number }
  >();

  const rows = orders.map((order) => {
    let orderRevenue = 0;
    let orderCost = 0;

    for (const item of order.items) {
      const itemRevenue = item.price * item.quantity;
      const itemCost = item.product.baseCostPrice * item.quantity;
      orderRevenue += itemRevenue;
      orderCost += itemCost;
    }

    revenue += orderRevenue;
    cost += orderCost;

    const day = order.createdAt.toISOString().slice(0, 10);
    const bucket = byDay.get(day) ?? { day, revenue: 0, cost: 0, orders: 0 };
    bucket.revenue += orderRevenue;
    bucket.cost += orderCost;
    bucket.orders += 1;
    byDay.set(day, bucket);

    return {
      id: order.id,
      createdAt: order.createdAt,
      customer: `${order.user.name} ${order.user.lastName}`,
      phone: order.user.phone,
      status: order.status,
      kind: order.kind,
      items: order.items.length,
      revenue: orderRevenue,
      cost: orderCost,
      profit: orderRevenue - orderCost,
    };
  });

  return {
    rows,
    byDay: Array.from(byDay.values()).sort((a, b) => b.day.localeCompare(a.day)),
    summary: {
      revenue,
      cost,
      profit: revenue - cost,
      orders: orders.length,
    },
  };
}
