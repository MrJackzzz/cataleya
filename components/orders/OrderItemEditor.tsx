"use client";

import { Loader2 } from "lucide-react";
import { updateOrderItemQuantity } from "@/app/actions/orders";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { Button } from "@/components/ui/button";

type Props = {
  itemId: string;
  quantity: number;
  max: number;
  showRemove?: boolean;
};

export function OrderItemEditor({ itemId, quantity, max, showRemove = true }: Props) {
  const [saveState, saveAction, savePending] = useToastAction(updateOrderItemQuantity);
  const [removeState, removeAction, removePending] = useToastAction(updateOrderItemQuantity);
  const feedback = removeState ?? saveState;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={saveAction} aria-label="Editar cantidad" className="flex items-center gap-2">
        <input type="hidden" name="itemId" value={itemId} />
        <QtyStepper
          name="quantity"
          defaultValue={quantity}
          min={1}
          max={Math.max(max, 1)}
        />
        <Button type="submit" variant="outline" size="sm" disabled={savePending}>
          {savePending ? <Loader2 className="size-4 animate-spin" /> : null}
          Guardar
        </Button>
      </form>

      {showRemove ? (
        <form
          action={async (formData: FormData) => {
            if (window.confirm("¿Quitar este ítem del pedido?")) {
              removeAction(formData);
            }
          }}
          aria-label="Quitar ítem"
        >
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="quantity" value="0" />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={removePending}
          >
            Quitar
          </Button>
        </form>
      ) : null}

      {feedback?.error ? (
        <p className="w-full text-xs text-destructive">{feedback.error}</p>
      ) : feedback?.success ? (
        <p className="w-full text-xs text-leaf">{feedback.success}</p>
      ) : null}
    </div>
  );
}
