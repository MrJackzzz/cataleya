"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deletePayment } from "@/app/actions/payments";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Button } from "@/components/ui/button";

export function PaymentDeleteButton({ paymentId }: { paymentId: string }) {
  const [, formAction, pending] = useToastAction(deletePayment);

  return (
    <form
      action={async (formData: FormData) => {
        if (
          window.confirm(
            "¿Eliminar este pago? El saldo del pedido se actualiza y no se puede deshacer."
          )
        ) {
          formAction(formData);
        }
      }}
    >
      <input type="hidden" name="paymentId" value={paymentId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        title="Eliminar pago"
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
