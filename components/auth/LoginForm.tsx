"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { AccessRequestButton } from "@/components/catalog/AccessRequestButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  expectedRole: "CLIENTE" | "ADMIN";
};

export function LoginForm({ expectedRole }: Props) {
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, expectedRole),
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-phone">
            {expectedRole === "ADMIN" ? "Teléfono de administrador" : "Celular / WhatsApp"}
          </Label>
          <span className="text-xs text-gold-deep font-medium">Sin 0 ni 15</span>
        </div>
        <Input
          id="login-phone"
          name="phone"
          type="tel"
          placeholder="11-5555-5555"
          autoComplete="username"
          required
        />
        <p className="text-xs text-muted-foreground">
          Ingresá tu número con código de área, sin 0 ni 15. Ej.:{" "}
          <strong className="text-gold-soft font-semibold">11-5555-5555</strong> o{" "}
          <strong className="text-gold-soft font-semibold">1157069732</strong>.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>

      {expectedRole === "CLIENTE" ? (
        <div className="flex flex-col items-center gap-3 pt-2 text-sm text-muted-foreground">
          <AccessRequestButton
            label="¿No tenés acceso? Solicitalo acá"
            variant="ghost"
          />
          <Link href="/" className="transition-colors hover:text-gold-soft">
            ← Volver al catálogo
          </Link>
        </div>
      ) : (
        <Link
          href="/"
          className="block pt-2 text-center text-sm text-muted-foreground transition-colors hover:text-gold-soft"
        >
          ← Volver al sitio
        </Link>
      )}
    </form>
  );
}
