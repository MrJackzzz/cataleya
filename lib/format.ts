export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function waLink(phone: string, text?: string): string {
  const digits = normalizePhone(phone);
  if (!digits) return "#";
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return money.format(value);
}

const dateTime = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(date: Date | string): string {
  return dateTime.format(typeof date === "string" ? new Date(date) : date);
}

const dateOnly = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

export function formatDate(date: Date | string): string {
  return dateOnly.format(typeof date === "string" ? new Date(date) : date);
}
