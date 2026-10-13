import type { Metadata } from "next";
import Link from "next/link";
import { endOfDay, parseISO, startOfDay, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { historyFilterSchema } from "@/lib/validations";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPES } from "@/lib/movements";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Historial",
};

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const now = new Date();

  const parsed = historyFilterSchema.safeParse({
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
    type: typeof params.type === "string" ? params.type : "TODOS",
    q: typeof params.q === "string" ? params.q : "",
  });
  const filter = parsed.success
    ? parsed.data
    : { from: undefined, to: undefined, type: "TODOS" as const, q: "" };

  const fromDate =
    filter.from && !Number.isNaN(Date.parse(filter.from))
      ? startOfDay(parseISO(filter.from))
      : startOfDay(startOfMonth(now));
  const toDate =
    filter.to && !Number.isNaN(Date.parse(filter.to))
      ? endOfDay(parseISO(filter.to))
      : endOfDay(now);

  const query = filter.q.trim();

  const movements = await prisma.movement.findMany({
    where: {
      createdAt: { gte: fromDate, lte: toDate },
      ...(filter.type !== "TODOS" ? { type: filter.type } : {}),
      ...(query ? { detail: { contains: query, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const isoDate = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold-deep">Auditoría</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Historial</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Movimientos del {formatDateTime(fromDate)} al {formatDateTime(toDate)} ·{" "}
          {movements.length} registro(s)
        </p>
      </div>

      <section>
        <form
          method="get"
          action="/admin/historial"
          className="grid gap-4 rounded-xl border border-gold/15 bg-card p-5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="space-y-2">
            <Label htmlFor="hist-from">Desde</Label>
            <Input
              id="hist-from"
              name="from"
              type="date"
              defaultValue={isoDate(fromDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hist-to">Hasta</Label>
            <Input id="hist-to" name="to" type="date" defaultValue={isoDate(toDate)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select name="type" defaultValue={filter.type}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {MOVEMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {MOVEMENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hist-q">Buscar</Label>
            <Input
              id="hist-q"
              name="q"
              defaultValue={filter.q}
              placeholder="Texto del movimiento"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              Filtrar
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/historial">Limpiar</Link>
            </Button>
          </div>
        </form>
      </section>

      <section>
        <div className="overflow-x-auto rounded-xl border border-gold/15 bg-card">
          {movements.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              No hay movimientos en el período seleccionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} className="border-gold/10 align-top">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(movement.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-gold/35 bg-burgundy-deep/40 px-2.5 py-0.5 text-[11px] tracking-[0.14em] text-gold-soft uppercase">
                        {MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-ivory">{movement.detail}</TableCell>
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
