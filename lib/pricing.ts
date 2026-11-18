import type { Role } from "@prisma/client";

export type MarkupRate = {
  role: string;
  markupValue: number;
  isPercentage: boolean;
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseMoneyInput(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value || typeof value !== "string") return 0;
  let clean = value.trim().replace(/[$ \s]/g, "");
  if (!clean) return 0;

  if (clean.includes(".") && clean.includes(",")) {
    // Formato con miles y decimales: 15.000,50 -> 15000.50
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(",")) {
    // 15000,50 -> 15000.50
    clean = clean.replace(",", ".");
  } else if (clean.includes(".")) {
    // Si tiene puntos: puede ser separador de miles (ej: 15.000 o 1.500.000)
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts.join("");
    } else if (parts.length === 2 && parts[1].length === 3) {
      clean = parts.join("");
    }
  }

  const num = Number(clean);
  return Number.isFinite(num) ? num : 0;
}

export function calcSellPrice(baseCost: number, markup?: MarkupRate | null): number {
  if (!markup) return roundMoney(baseCost);
  const value = markup.markupValue ?? 0;
  const price = markup.isPercentage
    ? baseCost * (1 + value / 100)
    : baseCost + value;
  return roundMoney(price);
}

export function findMarkup(
  markups: MarkupRate[],
  role: Role | string
): MarkupRate | null {
  return markups.find((markup) => markup.role === role) ?? null;
}

export function priceForRole(
  baseCost: number,
  markups: MarkupRate[],
  role: Role | string
): number {
  return calcSellPrice(baseCost, findMarkup(markups, role));
}

export function formatMarkupLabel(markup?: MarkupRate | null): string {
  if (!markup || markup.markupValue === 0) return "sin recargo";
  return markup.isPercentage
    ? `+${markup.markupValue}%`
    : `+$${markup.markupValue.toLocaleString("es-AR")}`;
}
