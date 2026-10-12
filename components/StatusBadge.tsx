import { ORDER_STATUS_LABELS, SAMPLE_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "border-gold/40 bg-gold/10 text-gold-soft",
  PARCIAL: "border-gold/50 bg-gold/15 text-gold-deep",
  PAGADO: "border-leaf/40 bg-leaf/10 text-leaf",
  EN_PROCESO: "border-olive/40 bg-olive/10 text-leaf",
  TERMINADO: "border-leaf/40 bg-leaf/10 text-leaf",
  CANCELADO: "border-destructive/40 bg-destructive/10 text-destructive",
  CERRADO: "border-leaf/40 bg-leaf/10 text-leaf",
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
