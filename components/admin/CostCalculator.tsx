"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Markup = {
  role: string;
  markupValue: number;
  isPercentage: boolean;
};

const FIELDS = [
  { key: "frasco", label: "Frasco" },
  { key: "esencia", label: "Esencia" },
  { key: "alcohol", label: "Alcohol" },
  { key: "packaging", label: "Packaging" },
] as const;

export function CostCalculator({ markups }: { markups: Markup[] }) {
  const [values, setValues] = useState<Record<string, number>>({
    frasco: 0,
    esencia: 0,
    alcohol: 0,
    packaging: 0,
  });
  const [margin, setMargin] = useState(100);

  const total = useMemo(
    () => FIELDS.reduce((sum, field) => sum + (values[field.key] ?? 0), 0),
    [values]
  );
  const suggested = total * (1 + margin / 100);

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-6">
      <div className="flex items-center gap-2">
        <Calculator className="size-4 text-gold" />
        <h2 className="font-display text-2xl text-ivory">
          Calculadora de precio de costo
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Sumá los componentes de una unidad y definí el margen de venta.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`cost-${field.key}`}>{field.label} ($)</Label>
            <Input
              id={`cost-${field.key}`}
              type="number"
              min={0}
              step="0.01"
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: Number(event.target.value),
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="cost-margin">Margen sobre costo (%)</Label>
        <Input
          id="cost-margin"
          type="number"
          min={0}
          step="1"
          value={margin}
          onChange={(event) => setMargin(Number(event.target.value))}
        />
      </div>

      <div className="mt-5 space-y-2 rounded-lg border border-gold/20 bg-burgundy-deep/25 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Costo total unitario</span>
          <span className="text-ivory">{formatMoney(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Precio sugerido</span>
          <span className="font-display text-3xl text-gold-soft">
            {formatMoney(suggested)}
          </span>
        </div>
        {markups.length > 0 ? (
          <div className="mt-3 space-y-1 border-t border-gold/15 pt-3">
            {markups.map((markup) => {
              const price = markup.isPercentage
                ? suggested * (1 + markup.markupValue / 100)
                : suggested + markup.markupValue;
              return (
                <div
                  key={markup.role}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="uppercase tracking-[0.18em] text-muted-foreground">
                    {markup.role}
                  </span>
                  <span className="text-gold-soft">{formatMoney(price)}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => {
          setValues({ frasco: 0, esencia: 0, alcohol: 0, packaging: 0 });
          setMargin(100);
        }}
      >
        Reiniciar
      </Button>
    </div>
  );
}
