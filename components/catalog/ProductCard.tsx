"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { createOrder } from "@/app/actions/orders";
import { AccessRequestButton } from "./AccessRequestButton";
import { ProductDetailModal } from "./ProductDetailModal";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/ui/qty-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";

export type CatalogProduct = {
  id: string;
  codeNumber: number;
  name: string;
  designer: string;
  description: string;
  imageUrl: string;
  gender: string;
  stock: number;
  olfactoryFamily: string;
};

type Props = {
  product: CatalogProduct;
  displayPrice: number | null;
  canOrder: boolean;
  isPending: boolean;
};

export function ProductCard({ product, displayPrice, canOrder, isPending }: Props) {
  const [state, formAction, pending] = useActionState(createOrder, null);
  const [kind, setKind] = useState<"REPLICA" | "MUESTRA">("REPLICA");
  const [detailOpen, setDetailOpen] = useState(false);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-card shadow-soft transition-all duration-300 hover:border-gold/40 hover:shadow-lift">
      {/* Botella / Imagen */}
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        aria-label={`Ver detalle de ${product.name}`}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F3EFEA] p-4 text-left"
      >
        <div className="relative size-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Insignia N° identificador */}
        <span className="absolute left-3 top-3 rounded-full border border-gold-deep/30 bg-cream/95 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-gold-deep shadow-sm backdrop-blur">
          N° {product.codeNumber}
        </span>

        {/* Insignia de Stock */}
        {outOfStock ? (
          <span className="absolute right-3 top-3 rounded-full border border-destructive/40 bg-card/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-destructive shadow-sm backdrop-blur">
            SIN STOCK
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full border border-leaf/30 bg-card/90 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-leaf shadow-sm backdrop-blur">
            {product.stock} u. disp.
          </span>
        )}
      </button>

      {/* Contenido / Datos de la fragancia */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-gold uppercase">
              {product.gender}
            </span>
            {product.olfactoryFamily ? (
              <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                {product.olfactoryFamily}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="cursor-pointer text-left w-full group/title"
          >
            <h3 className="font-display text-lg sm:text-xl leading-snug text-ivory group-hover/title:text-gold-soft transition-colors line-clamp-2">
              {product.name}
            </h3>
          </button>

          {product.designer ? (
            <p className="-mt-1 text-xs font-medium text-gold-soft">
              {product.designer}
            </p>
          ) : null}

          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Área de Precios y Pedidos */}
        <div className="mt-auto pt-3 border-t border-gold/15">
          {canOrder && displayPrice !== null ? (
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="kind" value={kind} />

              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                    Precio por unidad
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-semibold text-gold-soft">
                    {formatMoney(displayPrice)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Stock: {product.stock} u.
                </span>
              </div>

              {/* Selector de presentación a ancho completo (sin cortes) */}
              <div className="space-y-2">
                <Select
                  value={kind}
                  onValueChange={(value) => setKind(value as "REPLICA" | "MUESTRA")}
                >
                  <SelectTrigger className="w-full h-8 text-xs border-gold/25 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPLICA">Réplica de autor (60 ml)</SelectItem>
                    <SelectItem value="MUESTRA">Muestra de prueba (5 ml)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Cantidad y botón de pedido */}
                <div className="flex items-center gap-2">
                  <QtyStepper
                    name="quantity"
                    defaultValue={1}
                    min={1}
                    max={Math.max(product.stock, 1)}
                    disabled={outOfStock}
                  />
                  <Button
                    type="submit"
                    className="flex-1 h-8 text-xs font-medium"
                    disabled={pending || outOfStock}
                  >
                    {pending ? (
                      <Loader2 className="size-3.5 animate-spin mr-1" />
                    ) : (
                      <ShoppingBag className="size-3.5 mr-1" />
                    )}
                    {outOfStock ? "Sin stock" : pending ? "Registrando…" : "Generar pedido"}
                  </Button>
                </div>
              </div>
            </form>
          ) : isPending ? (
            <div className="rounded-lg border border-gold/25 bg-burgundy-deep/25 px-3 py-2.5 text-xs text-ivory/85 text-center">
              Tu solicitud de acceso está <strong className="text-gold-soft">en revisión</strong>.
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Precio reservado
                </span>
                <span className="font-display text-lg text-muted-foreground/50 tracking-widest">
                  ······
                </span>
              </div>
              <AccessRequestButton className="w-full h-8 text-xs" variant="outline" label="Solicitar acceso" />
              <div className="text-center pt-0.5">
                <Link
                  href="/login"
                  className="text-[11px] text-muted-foreground transition-colors hover:text-gold-soft"
                >
                  ¿Ya tenés cuenta?{" "}
                  <span className="text-ivory underline underline-offset-2">
                    Iniciar sesión
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={product}
        displayPrice={displayPrice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </article>
  );
}
