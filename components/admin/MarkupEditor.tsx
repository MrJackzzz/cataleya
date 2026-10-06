"use client";

import { useActionState, useState } from "react";
import { Percent } from "lucide-react";
import { upsertRoleMarkup } from "@/app/actions/users";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Markup = {
  role: "CLIENTE" | "SOCIO" | "FAMILIAR";
  markupValue: number;
  isPercentage: boolean;
};

function MarkupForm({ markup }: { markup: Markup }) {
  const [state, formAction, pending] = useActionState(upsertRoleMarkup, null);
  const [isPercentage, setIsPercentage] = useState(markup.isPercentage);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-gold/15 bg-card p-5"
    >
      <input type="hidden" name="role" value={markup.role} />
      <input
        type="hidden"
        name="isPercentage"
        value={isPercentage ? "on" : ""}
      />
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl text-ivory">
          {ROLE_LABELS[markup.role]}
        </p>
        <Percent className="size-4 text-gold" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Recargo aplicado sobre el costo base del perfume.
      </p>

      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`markup-${markup.role}`}>Valor</Label>
          <Input
            id={`markup-${markup.role}`}
            name="markupValue"
            type="number"
            min={0}
            step="0.5"
            defaultValue={markup.markupValue}
            required
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id={`percent-${markup.role}`}
            checked={isPercentage}
            onCheckedChange={setIsPercentage}
          />
          <Label htmlFor={`percent-${markup.role}`} className="text-xs mb-0">
            %
          </Label>
        </div>
      </div>

      {state?.error ? (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="mt-2 text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <Button type="submit" size="sm" className="mt-4 w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar recargo"}
      </Button>
    </form>
  );
}

export function MarkupEditor({ markups }: { markups: Markup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {markups.map((markup) => (
        <MarkupForm key={markup.role} markup={markup} />
      ))}
    </div>
  );
}
