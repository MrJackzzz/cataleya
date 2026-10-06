"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleProductActive, deleteProduct } from "@/app/actions/products";
import { ProductForm } from "./ProductForm";
import { Button } from "@/components/ui/button";

type Props = {
  product: {
    id: string;
    codeNumber: number;
    name: string;
    description: string;
    imageUrl: string;
    stock: number;
    baseCostPrice: number;
    isActive: boolean;
  };
};

export function ProductRowActions({ product }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ProductForm product={product} />

      <form action={toggleProductActive}>
        <input type="hidden" name="id" value={product.id} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          title={product.isActive ? "Ocultar del catálogo" : "Mostrar en catálogo"}
        >
          {product.isActive ? (
            <Eye className="size-4 text-gold" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
        </Button>
      </form>

      <form
        action={async (formData: FormData) => {
          if (
            window.confirm(
              "¿Eliminar este perfume? Si tiene pedidos asociados se desactivará en su lugar."
            )
          ) {
            await deleteProduct(formData);
          }
        }}
      >
        <input type="hidden" name="id" value={product.id} />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          title="Eliminar"
          className="text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}
