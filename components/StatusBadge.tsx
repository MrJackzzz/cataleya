import { ORDER_STATUS_LABELS, SAMPLE_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "border-gold/40 bg-gold/10 text-gold-soft",
  EN_PROCESO: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  TERMINADO: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  CANCELADO: "border-destructive/40 bg-destructive/10 text-destructive",
  CERRADO: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

export function StatusBadge({ status }: { status: string }) {
  const label =
    ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ??
    SAMPLE_STATUS_LABELS[status] ??
    status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase ${
        STATUS_STYLES[status] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/35 bg-burgundy-deep/40 px-2.5 py-0.5 text-[11px] tracking-[0.14em] text-gold-soft uppercase">
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
