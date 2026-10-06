import type { Metadata } from "next";
import Link from "next/link";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { getEarningsReport } from "@/app/actions/reports";
import { earningsFilterSchema } from "@/lib/validations";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ganancias",
};

const PRESETS = [
  { key: "day", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
] as const;

function resolveRange(preset: string, from?: string, to?: string) {
  const now = new Date();

  switch (preset) {
    case "day":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
    case "year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "custom": {
      const fromDate = from ? parseISO(from) : startOfMonth(now);
      const toDate = to ? parseISO(to) : now;
      const safeFrom = Number.isNaN(fromDate.getTime()) ? startOfMonth(now) : fromDate;
      const safeTo = Number.isNaN(toDate.getTime()) ? now : toDate;
      return { from: startOfDay(safeFrom), to: endOfDay(safeTo) };
    }
    case "month":
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export default async function AdminEarningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const parsed = earningsFilterSchema.safeParse({
    preset: params.preset ?? "month",
    from: params.from,
    to: params.to,
  });
  const filter = parsed.success ? parsed.data : { preset: "month" as const };

  const range = resolveRange(
    filter.preset,
    typeof params.from === "string" ? params.from : undefined,
    typeof params.to === "string" ? params.to : undefined
  );

  const report = await getEarningsReport(range);

  const query = (preset: string) =>
    preset === "custom"
      ? `/admin/ganancias?preset=custom&from=${params.from ?? ""}&to=${params.to ?? ""}`
      : `/admin/ganancias?preset=${preset}`;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Reportes</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">
          Ganancias y facturación
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Período: {formatDate(range.from)} — {formatDate(range.to)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            asChild
            variant={filter.preset === preset.key ? "default" : "outline"}
            size="sm"
          >
            <Link href={query(preset.key)}>{preset.label}</Link>
          </Button>
        ))}

        <form method="GET" action="/admin/ganancias" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="preset" value="custom" />
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="from" className="text-xs">
                Desde
              </Label>
              <Input
                id="from"
                name="from"
                type="date"
                defaultValue={typeof params.from === "string" ? params.from : ""}
                className="h-8 w-40 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs">
                Hasta
              </Label>
              <Input
                id="to"
                name="to"
                type="date"
                defaultValue={typeof params.to === "string" ? params.to : ""}
                className="h-8 w-40 text-sm"
              />
            </div>
          </div>
          <Button type="submit" size="sm" variant="outline">
            Aplicar rango
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Facturación</p>
          <p className="mt-1 font-display text-3xl text-ivory">
            {formatMoney(report.summary.revenue)}
          </p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Costos</p>
          <p className="mt-1 font-display text-3xl text-muted-foreground">
            {formatMoney(report.summary.cost)}
          </p>
        </div>
        <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-burgundy-deep/50 to-card p-5">
          <p className="text-sm text-muted-foreground">Ganancia neta</p>
          <p className="mt-1 font-display text-3xl text-gold-soft">
            {formatMoney(report.summary.profit)}
          </p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Pedidos</p>
          <p className="mt-1 font-display text-3xl text-ivory">
            {report.summary.orders}
          </p>
        </div>
      </div>

      {report.byDay.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-2xl text-ivory">Resumen por día</h2>
          <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Día</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Facturación</TableHead>
                  <TableHead className="text-right">Costos</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byDay.map((day) => (
                  <TableRow key={day.day} className="border-gold/10">
                    <TableCell className="text-muted-foreground">
                      {formatDate(day.day)}
                    </TableCell>
                    <TableCell className="text-right">{day.orders}</TableCell>
                    <TableCell className="text-right text-ivory">
                      {formatMoney(day.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatMoney(day.cost)}
                    </TableCell>
                    <TableCell className="text-right text-gold-soft">
                      {formatMoney(day.revenue - day.cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-2xl text-ivory">
          Detalle de pedidos
        </h2>
        <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
          {report.rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No hay pedidos en este período.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ítems</TableHead>
                  <TableHead className="text-right">Facturación</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.id} className="border-gold/10">
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-ivory">{row.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{row.items}</TableCell>
                    <TableCell className="text-right text-ivory">
                      {formatMoney(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-gold-soft">
                      {formatMoney(row.profit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
