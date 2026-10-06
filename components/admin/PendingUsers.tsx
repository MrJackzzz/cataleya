"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";
import { approveUser, rejectUser } from "@/app/actions/users";
import { formatDateTime, waLink } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type PendingUser = {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  createdAt: string;
};

function PendingUserCard({ user }: { user: PendingUser }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveUser,
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectUser,
    null
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (approveState?.success) {
      toast.success(approveState.success);
      setOpen(false);
    } else if (approveState?.error) {
      toast.error(approveState.error);
    }
  }, [approveState]);

  useEffect(() => {
    if (rejectState?.success) toast.success(rejectState.success);
    if (rejectState?.error) toast.error(rejectState.error);
  }, [rejectState]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold/20 bg-card p-4">
      <div>
        <p className="font-medium text-ivory">
          {user.name} {user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {user.phone} · solicitado {formatDateTime(user.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <a
            href={waLink(
              user.phone,
              `Hola ${user.name}, tu solicitud de acceso a Cataleya Aromas está en revisión.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <ShieldCheck className="size-4" /> Aprobar
            </Button>
          </DialogTrigger>
          <DialogContent className="border-gold/25 sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-ivory">
                Aprobar usuario
              </DialogTitle>
              <DialogDescription>
                Asigná el rol y una contraseña temporal para {user.name}.
              </DialogDescription>
            </DialogHeader>
            <form action={approveAction} className="space-y-4">
              <input type="hidden" name="userId" value={user.id} />
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select name="role" defaultValue="CLIENTE">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENTE">Cliente (+10%)</SelectItem>
                    <SelectItem value="SOCIO">Socio (+5%)</SelectItem>
                    <SelectItem value="FAMILIAR">Familiar (+8%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp-password">Contraseña temporal</Label>
                <Input
                  id="temp-password"
                  name="temporaryPassword"
                  minLength={6}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <Button type="submit" className="w-full" disabled={approvePending}>
                {approvePending ? <Loader2 className="size-4 animate-spin" /> : null}
                {approvePending ? "Aprobando…" : "Confirmar aprobación"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <form action={rejectAction}>
          <input type="hidden" name="userId" value={user.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={rejectPending}
          >
            {rejectPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            Rechazar
          </Button>
        </form>
      </div>
    </div>
  );
}

export function PendingUsers({ users }: { users: PendingUser[] }) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gold/20 bg-card/50 px-5 py-10 text-center">
        <Check className="mx-auto size-5 text-emerald-300" />
        <p className="mt-2 text-sm text-muted-foreground">
          No hay solicitudes pendientes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <PendingUserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
