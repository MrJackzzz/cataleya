"use client";

import { useActionState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";

export function OrderDeleteButton({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(deleteOrder, null);

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    else if (state?.error) toast.error(state.error);
  }, [state]);

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
