import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gold/20 bg-card p-8 shadow-[0_0_80px_-40px_rgba(201,162,75,0.5)]">
            <p className="eyebrow text-gold">Acceso de clientes</p>
            <h1 className="mt-2 font-display text-4xl text-ivory">
              Iniciar sesión
            </h1>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">
              Ingresá con tu número de WhatsApp y tu contraseña para ver precios
              y gestionar tus pedidos.
            </p>
            <LoginForm expectedRole="CLIENTE" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
