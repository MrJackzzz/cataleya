"use client";

import { Loader2, Undo2 } from "lucide-react";
import { returnOrderItem } from "@/app/actions/orders";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OrderItemReturnForm({ itemId, max }: { itemId: string; max: number }) {
  const [, formAction, pending] = useToastAction(returnOrderItem);

  return (
    <form action={formAction} aria-label="Devolver unidades" className="flex items-center gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <Input
        type="number"
        name="quantity"
        defaultValue={1}
        required
        aria-label="Unidades a devolver"
        className="w-16 text-center"
        onFocus={(event) => event.currentTarget.select()}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        title={`Registrar devolución, vuelve al stock (máximo ${max})`}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
        Devolver
      </Button>
    </form>
  );
}
