"use client";

import { Banknote, Loader2 } from "lucide-react";
import { registerPayment } from "@/app/actions/payments";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderOption = { id: string; label: string };

export function PaymentForm({ orders }: { orders: OrderOption[] }) {
  const [, formAction, pending] = useToastAction(registerPayment);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-5">
      <div className="space-y-2 md:col-span-2">
        <Label>Pedido con saldo</Label>
        <Select name="orderId" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar…" />
          </SelectTrigger>
          <SelectContent>
            {orders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-amount">Monto ($)</Label>
        <MoneyInput id="payment-amount" name="amount" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-date">Fecha</Label>
        <Input id="payment-date" name="date" type="date" defaultValue={today} required />
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={pending || orders.length === 0}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}
          {pending ? "Registrando…" : "Registrar pago"}
        </Button>
      </div>

      <div className="space-y-2 md:col-span-5">
        <Label htmlFor="payment-note">Nota (opcional)</Label>
        <Input
          id="payment-note"
          name="note"
          maxLength={200}
          placeholder="Ej.: transferencia, seña en efectivo…"
        />
      </div>
    </form>
  );
}
