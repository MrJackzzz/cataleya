import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/format";
import { PendingUsers } from "@/components/admin/PendingUsers";
import { MarkupEditor } from "@/components/admin/MarkupEditor";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { RoleBadge } from "@/components/StatusBadge";
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
  title: "Usuarios",
};

export default async function AdminUsersPage() {
  const [pendingUsers, approvedUsers, markups] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PENDIENTE", isApproved: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["CLIENTE", "SOCIO", "FAMILIAR"] }, isApproved: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.roleMarkup.findMany({
      where: { role: { in: ["CLIENTE", "SOCIO", "FAMILIAR"] } },
    }),
  ]);

  const markupByRole = new Map(markups.map((markup) => [markup.role, markup]));
  const editorData = (["CLIENTE", "SOCIO", "FAMILIAR"] as const).map((role) => ({
    role,
    markupValue: markupByRole.get(role)?.markupValue ?? 0,
    isPercentage: markupByRole.get(role)?.isPercentage ?? true,
  }));

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-gold">Aprobaciones</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">
          Usuarios y roles
        </h1>
      </div>

      <section>
        <h2 className="mb-3 font-display text-2xl text-ivory">
          Solicitudes pendientes
          {pendingUsers.length > 0 ? (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 align-middle text-xs text-primary-foreground">
              {pendingUsers.length}
            </span>
          ) : null}
        </h2>
        <PendingUsers
          users={pendingUsers.map((user) => ({
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            phone: user.phone,
            createdAt: user.createdAt.toISOString(),
          }))}
        />
      </section>

      <section>
        <h2 className="mb-1 font-display text-2xl text-ivory">
          Recargo por rol
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Define cuánto se suma al costo base según la membresía del cliente
          (ej.: costo $20.000 + 10% = $22.000).
        </p>
        <MarkupEditor markups={editorData} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl text-ivory">
          Clientes activos
        </h2>
        <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
          {approvedUsers.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía hay usuarios aprobados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Nombre</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Recargo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((user) => {
                  const markup = markups.find((entry) => entry.role === user.role);
                  return (
                    <TableRow key={user.id} className="border-gold/10">
                      <TableCell className="text-ivory">
                        {user.name} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {markup
                          ? `${markup.markupValue}${markup.isPercentage ? "%" : " (fijo)"}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-3">
                          <RoleSelect
                            userId={user.id}
                            role={user.role as "CLIENTE" | "SOCIO" | "FAMILIAR"}
                          />
                          <a
                            href={waLink(
                              user.phone,
                              `Hola ${user.name}, te escribe Cataleya Aromas.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gold transition-colors hover:text-gold-soft"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
