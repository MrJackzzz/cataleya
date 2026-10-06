import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin · Acceso",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(77,18,32,0.5),transparent_65%)] px-4 py-12">
      <Link href="/" className="mb-8 text-center">
        <span className="font-display text-4xl text-gradient-gold">
          Cataleya Aromas
        </span>
        <p className="eyebrow mt-1 text-muted-foreground">Panel de administración</p>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-card p-8 shadow-[0_0_100px_-40px_rgba(201,162,75,0.6)]">
        <p className="eyebrow text-gold">Acceso restringido</p>
        <h1 className="mt-2 font-display text-4xl text-ivory">Ingresar al panel</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Este acceso es exclusivo para el administrador de Cataleya Aromas.
        </p>
        <LoginForm expectedRole="ADMIN" />
      </div>
    </div>
  );
}
