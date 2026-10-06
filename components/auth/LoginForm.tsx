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
        <Label htmlFor="login-phone">
          {expectedRole === "ADMIN" ? "Teléfono de administrador" : "WhatsApp"}
        </Label>
        <Input
          id="login-phone"
          name="phone"
          type="tel"
          placeholder="+54 9 11 2345-6789"
          autoComplete="username"
          required
        />
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
