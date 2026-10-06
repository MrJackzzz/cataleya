"use client";

import { useActionState, useEffect, useState } from "react";
import { setOrderStatus } from "@/app/actions/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

type Status = (typeof ORDER_STATUSES)[number];

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState(setOrderStatus, null);
  const [value, setValue] = useState<Status>(
    (ORDER_STATUSES as readonly string[]).includes(status)
      ? (status as Status)
      : "PENDIENTE"
  );

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) {
      toast.error(state.error);
      setValue(
        (ORDER_STATUSES as readonly string[]).includes(status)
          ? (status as Status)
          : "PENDIENTE"
      );
    }
  }, [state, status]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="status" value={value} />
      <select
        aria-label="Estado del pedido"
        value={value}
        onChange={(event) => setValue(event.target.value as Status)}
        disabled={pending}
        className="h-8 rounded-md border border-gold/25 bg-background px-2 text-xs text-ivory outline-none focus:border-gold/60"
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="text-xs text-gold underline-offset-2 transition-colors hover:text-gold-soft hover:underline disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "…" : "Guardar"}
      </button>
    </form>
  );
}
