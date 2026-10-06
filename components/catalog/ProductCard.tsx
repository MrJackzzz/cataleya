"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { createOrder } from "@/app/actions/orders";
import { AccessRequestButton } from "./AccessRequestButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  description: string;
  imageUrl: string;
  stock: number;
};

type Props = {
  product: CatalogProduct;
  displayPrice: number | null;
  canOrder: boolean;
  isPending: boolean;
};

export function ProductCard({ product, displayPrice, canOrder, isPending }: Props) {
  const [state, formAction, pending] = useActionState(createOrder, null);
  const [quantity, setQuantity] = useState(1);
  const [kind, setKind] = useState<"REPLICA" | "MUESTRA">("REPLICA");
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-card transition-colors hover:border-gold/40">
      <div className="relative aspect-4/5 overflow-hidden bg-gradient-to-b from-burgundy-deep/50 to-card">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-background/75 px-3 py-1 text-[11px] tracking-[0.25em] text-gold-soft backdrop-blur">
          N° {product.codeNumber}
        </span>
        {outOfStock ? (
          <span className="absolute right-4 top-4 rounded-full border border-destructive/40 bg-background/80 px-3 py-1 text-[11px] tracking-[0.2em] text-destructive backdrop-blur">
            SIN STOCK
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl leading-tight text-ivory">
          {product.name}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto pt-2">
          {canOrder && displayPrice !== null ? (
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="kind" value={kind} />
              <input
                type="hidden"
                name="quantity"
                value={Math.min(Math.max(quantity, 1), Math.max(product.stock, 1))}
              />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="eyebrow block text-gold">Precio</span>
                  <span className="font-display text-3xl text-gold-soft">
                    {formatMoney(displayPrice)}
                  </span>
                </div>
                <span className="pb-1 text-xs text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={Math.max(product.stock, 1)}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-16 text-center"
                  aria-label="Cantidad"
                  disabled={outOfStock}
                />
                <Select
                  value={kind}
                  onValueChange={(value) => setKind(value as "REPLICA" | "MUESTRA")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPLICA">Réplica</SelectItem>
                    <SelectItem value="MUESTRA">Muestra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={pending || outOfStock}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
                {outOfStock ? "Sin stock" : pending ? "Registrando…" : "Generar pedido"}
              </Button>
            </form>
          ) : isPending ? (
            <div className="rounded-lg border border-gold/25 bg-burgundy-deep/25 px-4 py-3 text-sm text-ivory/85">
              Tu solicitud de acceso está <strong className="text-gold-soft">en revisión</strong>.
              Te contactamos por WhatsApp.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground">
                  Precio reservado
                </span>
                <span className="font-display text-xl text-muted-foreground">
                  ····
                </span>
              </div>
              <AccessRequestButton className="w-full" variant="outline" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
