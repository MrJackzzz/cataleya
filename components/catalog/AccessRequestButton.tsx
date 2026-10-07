"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { requestAccess } from "@/app/actions/access";
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
import { toast } from "sonner";

type Props = {
  label?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
};

export function AccessRequestButton({
  label = "Solicitar acceso",
  variant = "default",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestAccess, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset();
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Sparkles className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-gold/25 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-ivory">
            Solicitud de acceso
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completá tus datos y elegí tu contraseña. Cuando aprobemos tu
            cuenta vas a poder ingresar con tu número y tu contraseña.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="access-name">Nombre</Label>
              <Input id="access-name" name="name" placeholder="Tu nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-lastname">Apellido</Label>
              <Input
                id="access-lastname"
                name="lastName"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-phone">WhatsApp (con código de país)</Label>
            <Input
              id="access-phone"
              name="phone"
              type="tel"
              placeholder="+54 9 11 2345-6789"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="access-password">Contraseña</Label>
              <Input
                id="access-password"
                name="password"
                type="password"
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-confirm">Repetí la contraseña</Label>
              <Input
                id="access-confirm"
                name="confirmPassword"
                type="password"
                minLength={6}
                placeholder="Igual a la anterior"
                required
              />
            </div>
          </div>
          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Enviando…" : "Enviar solicitud"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
