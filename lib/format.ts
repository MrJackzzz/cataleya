export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (/^549\d{10}$/.test(digits)) return digits;
  if (/^54\d{10}$/.test(digits)) return `549${digits.slice(2)}`;
  if (/^\d{10}$/.test(digits)) return `549${digits}`;
  return digits;
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
