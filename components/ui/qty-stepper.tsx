"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  ariaLabel?: string;
};

function clamp(value: number, min: number, max?: number): number {
  if (Number.isNaN(value)) return min;
  const floored = Math.floor(value);
  if (floored < min) return min;
  if (max !== undefined && floored > max) return max;
  return floored;
}

export function QtyStepper({
  name,
  defaultValue = 1,
  min = 1,
  max,
  disabled,
  ariaLabel = "Cantidad",
}: Props) {
  const [value, setValue] = useState(() => clamp(defaultValue, min, max));

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Quitar uno"
        disabled={disabled || value <= min}
        onClick={() => setValue((current) => clamp(current - 1, min, max))}
      >
        <Minus className="size-4" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        name={name}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        className="w-14 text-center"
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const digits = event.currentTarget.value.replace(/\D/g, "");
          if (digits === "") {
            setValue(min);
            return;
          }
          setValue(clamp(Number(digits), min, max));
        }}
        onBlur={() => setValue((current) => clamp(current, min, max))}
      />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Agregar uno"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => setValue((current) => clamp(current + 1, min, max))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
