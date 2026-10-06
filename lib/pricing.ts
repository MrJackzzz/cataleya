import type { Role, RoleMarkup } from "@prisma/client";

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calcSellPrice(baseCost: number, markup?: RoleMarkup | null): number {
  if (!markup) return roundMoney(baseCost);
  const value = markup.markupValue ?? 0;
  const price = markup.isPercentage
    ? baseCost * (1 + value / 100)
    : baseCost + value;
  return roundMoney(price);
}

export function findMarkup(
  markups: RoleMarkup[],
  role: Role | string
): RoleMarkup | null {
  return markups.find((markup) => markup.role === role) ?? null;
}

export function priceForRole(
  baseCost: number,
  markups: RoleMarkup[],
  role: Role | string
): number {
  return calcSellPrice(baseCost, findMarkup(markups, role));
}
