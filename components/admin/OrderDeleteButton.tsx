"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteOrder } from "@/app/actions/orders";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Button } from "@/components/ui/button";

export function OrderDeleteButton({ orderId }: { orderId: string }) {
  const [, formAction, pending] = useToastAction(deleteOrder);

  return (
    <form
      action={async (formData: FormData) => {
        if (
          window.confirm(
            "¿Eliminar este pedido definitivamente? Se devuelve el stock y no se puede deshacer."
          )
        ) {
          formAction(formData);
        }
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        title="Eliminar pedido"
        className="text-destructive"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
    </form>
  );
}
