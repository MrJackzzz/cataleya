"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, UploadCloud } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { priceForRole, findMarkup, formatMarkupLabel, type MarkupRate } from "@/lib/pricing";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDialogBackButton } from "@/components/ui/use-dialog-back-button";

export type EditableProduct = {
  id: string;
  codeNumber: number;
  name: string;
  designer: string;
  description: string;
  imageUrl: string;
  gender: string;
  olfactoryFamily: string;
  stock: number;
  baseCostPrice: number;
};

type Props = {
  product?: EditableProduct;
  markups?: MarkupRate[];
};

export function ProductForm({ product, markups = [] }: Props) {
  const editing = Boolean(product);
  const [open, setOpen] = useState(false);
  useDialogBackButton(open, setOpen);
  const [preview, setPreview] = useState(product?.imageUrl ?? "");
  const [gender, setGender] = useState(product?.gender ?? "UNISEX");
  const [cost, setCost] = useState<number>(product?.baseCostPrice ?? 0);
  const [state, formAction, pending] = useActionState(
    editing ? updateProduct : createProduct,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) {
      setCost(product?.baseCostPrice ?? 0);
      setPreview(product?.imageUrl ?? "");
      setGender(product?.gender ?? "UNISEX");
    }
  }, [open, product]);

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
                onFocus={(event) => event.currentTarget.select()}
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
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Fragancia</Label>
              <Input
                id="product-name"
                name="name"
                defaultValue={product?.name ?? ""}
                placeholder="Ej.: Bleu de Chanel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-designer">Diseñador</Label>
              <Input
                id="product-designer"
                name="designer"
                defaultValue={product?.designer ?? ""}
                placeholder="Ej.: Chanel"
                maxLength={60}
              />
            </div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-gender">Género</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="product-gender" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="gender" value={gender} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-family">Familia olfativa</Label>
              <Input
                id="product-family"
                name="olfactoryFamily"
                defaultValue={product?.olfactoryFamily ?? ""}
                placeholder="Ej.: Amaderado, Cítrico, Floral…"
                maxLength={40}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-cost">Costo base ($)</Label>
            <MoneyInput
              id="product-cost"
              name="baseCostPrice"
              defaultValue={product?.baseCostPrice ?? ""}
              onValueChange={(raw) => setCost(Number(raw) || 0)}
              required
            />
            {markups.length > 0 && cost > 0 ? (
              <div className="rounded-lg border border-gold/25 bg-background/80 p-3 space-y-2">
                <p className="text-xs font-medium text-gold-soft uppercase tracking-wider">
                  Precios finales según recargo:
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-gold/15 bg-card/60 p-2 text-center">
                    <span className="block text-[11px] text-muted-foreground">
                      Cliente ({formatMarkupLabel(findMarkup(markups, "CLIENTE"))})
                    </span>
                    <span className="font-semibold text-ivory text-sm">
                      {formatMoney(priceForRole(cost, markups, "CLIENTE"))}
                    </span>
                  </div>
                  <div className="rounded-md border border-gold/15 bg-card/60 p-2 text-center">
                    <span className="block text-[11px] text-muted-foreground">
                      Familiar ({formatMarkupLabel(findMarkup(markups, "FAMILIAR"))})
                    </span>
                    <span className="font-semibold text-gold-soft text-sm">
                      {formatMoney(priceForRole(cost, markups, "FAMILIAR"))}
                    </span>
                  </div>
                  <div className="rounded-md border border-gold/15 bg-card/60 p-2 text-center">
                    <span className="block text-[11px] text-muted-foreground">
                      Socio ({formatMarkupLabel(findMarkup(markups, "SOCIO"))})
                    </span>
                    <span className="font-semibold text-leaf text-sm">
                      {formatMoney(priceForRole(cost, markups, "SOCIO"))}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
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
              Opcional. Si no subís imagen se usa la genérica. Con R2
              configurado, la imagen elegida se sube a la nube al guardar.
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
