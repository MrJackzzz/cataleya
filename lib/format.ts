export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  // Si empieza con 0, removerlo (ej: 011... -> 11...)
  if (digits.length >= 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // Si ingresan 11 seguido de 15 y 8 dígitos (total 12 dígitos)
  if (digits.length === 12 && digits.startsWith("1115")) {
    digits = `11${digits.slice(4)}`;
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
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDateTime(date: Date | string): string {
  return dateTime.format(typeof date === "string" ? new Date(date) : date);
}

const dateOnly = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDate(date: Date | string): string {
  return dateOnly.format(typeof date === "string" ? new Date(date) : date);
}
