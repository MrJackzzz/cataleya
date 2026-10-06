"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, UploadCloud } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type EditableProduct = {
  id: string;
  codeNumber: number;
  name: string;
  description: string;
  imageUrl: string;
  stock: number;
  baseCostPrice: number;
};

type Props = {
  product?: EditableProduct;
};

export function ProductForm({ product }: Props) {
  const editing = Boolean(product);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(product?.imageUrl ?? "");
  const [state, formAction, pending] = useActionState(
    editing ? updateProduct : createProduct,
    null
  );
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
        {editing ? (
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo perfume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/25 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-ivory">
            {editing ? "Editar perfume" : "Nuevo perfume"}
          </DialogTitle>
          <DialogDescription>
            Número identificador, equivalencia olfativa, stock y costo base.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {editing ? <input type="hidden" name="id" value={product!.id} /> : null}
          <input type="hidden" name="imageUrl" value={preview} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-code">N° identificador</Label>
              <Input
                id="product-code"
                name="codeNumber"
                type="number"
                min={1}
                defaultValue={product?.codeNumber ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 0}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-name">Nombre / equivalencia olfativa</Label>
            <Input
              id="product-name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="Ej.: Amaderado Ahumado — Inspirado en Ombré Leather"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Descripción</Label>
            <Textarea
              id="product-description"
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              placeholder="Notas principales y perfil olfativo…"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-cost">Costo base ($)</Label>
            <Input
              id="product-cost"
              name="baseCostPrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={product?.baseCostPrice ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Imagen (JPG, PNG, WebP · máx. 8MB)</Label>
            <Input
              id="product-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            <div className="relative aspect-video overflow-hidden rounded-lg border border-gold/15 bg-background">
              {preview ? (
                <Image
                  src={preview}
                  alt="Vista previa"
                  fill
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <UploadCloud className="size-6" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              La imagen se sube a Cloudflare R2 al guardar.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear perfume"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
