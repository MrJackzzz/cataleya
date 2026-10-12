"use client";

import { useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CatalogProduct } from "./ProductCard";

type Props = {
  product: CatalogProduct;
  displayPrice: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDetailModal({ product, displayPrice, open, onOpenChange }: Props) {
  const [size, setSize] = useState<"60" | "5">("60");
  const isSample = size === "5";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/25 bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-ivory sm:text-4xl">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-base text-gold-deep">
            {product.designer ? `${product.designer} · ` : ""}N° {product.codeNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-gold/15 bg-gradient-to-b from-sand via-cream to-card">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-contain p-6"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div
              role="group"
              aria-label="Elegir presentación"
              className="grid grid-cols-2 gap-2 rounded-xl border border-gold/20 bg-background/60 p-1.5"
            >
              {(
                [
                  { value: "60", title: "Envase completo", sub: "60 ml" },
                  { value: "5", title: "Muestra", sub: "5 ml" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSize(option.value)}
                  aria-pressed={size === option.value}
                  className={`rounded-lg px-3 py-2 text-center transition-colors ${
                    size === option.value
                      ? "bg-leaf font-semibold text-cream shadow-soft"
                      : "text-muted-foreground hover:text-ivory"
                  }`}
                >
                  <span className="block text-sm leading-tight">{option.title}</span>
                  <span
                    className={`block text-xs ${size === option.value ? "text-cream/85" : "text-muted-foreground"}`}
                  >
                    {option.sub}
                  </span>
                </button>
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-base">
              <div className="rounded-lg border border-gold/15 px-3 py-2">
                <dt className="eyebrow text-gold-deep">Género</dt>
                <dd className="mt-1 font-medium text-ivory">{product.gender}</dd>
              </div>
              <div className="rounded-lg border border-gold/15 px-3 py-2">
                <dt className="eyebrow text-gold-deep">Familia</dt>
                <dd className="mt-1 font-medium text-ivory">
                  {product.olfactoryFamily || "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-gold/15 px-3 py-2">
                <dt className="eyebrow text-gold-deep">Disponibilidad</dt>
                <dd className="mt-1 font-medium text-ivory">
                  {product.stock > 0 ? `En stock (${product.stock} u.)` : "Sin stock"}
                </dd>
              </div>
              <div className="rounded-lg border border-gold/15 px-3 py-2">
                <dt className="eyebrow text-gold-deep">Precio</dt>
                <dd className="mt-1 font-display text-2xl text-gold-soft">
                  {isSample
                    ? "A consultar"
                    : displayPrice !== null
                      ? formatMoney(displayPrice)
                      : "Reservado"}
                </dd>
              </div>
            </dl>

            <p className="text-base leading-relaxed text-ivory/90 sm:text-lg">
              {product.description}
            </p>

            {isSample ? (
              <p className="text-sm text-muted-foreground">
                La muestra de 5 ml te permite probar la fragancia. Coordinamos
                su precio por WhatsApp.
              </p>
            ) : displayPrice === null ? (
              <p className="text-sm text-muted-foreground">
                Los precios y pedidos están reservados para clientes con acceso
                aprobado.
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="mt-auto w-full"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
