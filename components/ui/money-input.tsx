"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

function toRaw(value: string): string {
  if (!value) return "";
  // Quitar espacios y signo pesos
  let clean = value.replace(/[$ \s]/g, "");

  // Si tiene coma y punto, asumimos que el punto es de miles y la coma es decimal
  if (clean.includes(".") && clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(",")) {
    // Si sólo tiene coma, la coma es decimal
    clean = clean.replace(",", ".");
  } else if (clean.includes(".")) {
    // Si sólo tiene punto:
    // Si tiene múltiples puntos (ej: 1.500.000) o si tiene exactamente 3 dígitos tras el punto (ej: 15.000), es miles
    const parts = clean.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = parts.join("");
    }
  }

  // Ahora filtrar sólo dígitos y a lo sumo un punto decimal
  const filtered = clean.replace(/[^0-9.]/g, "");
  const [intPart = "", ...rest] = filtered.split(".");
  const digits = intPart.replace(/^0+(?=\d)/, "");
  const decimals = rest.join("").slice(0, 2);

  if (!digits && !decimals) return "";
  return rest.length > 0 ? `${digits || "0"}.${decimals}` : digits;
}

function formatDisplay(raw: string): string {
  if (!raw) return "";
  const [int, decimals] = raw.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimals !== undefined ? `${grouped},${decimals}` : grouped;
}

function normalizeDefault(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  return String(value).replace(",", ".");
}

type Props = {
  id?: string;
  name: string;
  defaultValue?: number | string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  onValueChange?: (raw: string) => void;
};

export function MoneyInput({
  id,
  name,
  defaultValue,
  required,
  disabled,
  placeholder,
  className,
  ariaLabel,
  onValueChange,
}: Props) {
  const [raw, setRaw] = useState(() => normalizeDefault(defaultValue));
  const [display, setDisplay] = useState(() => formatDisplay(normalizeDefault(defaultValue)));

  useEffect(() => {
    const nextRaw = normalizeDefault(defaultValue);
    setRaw(nextRaw);
    setDisplay(formatDisplay(nextRaw));
  }, [defaultValue]);

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        required={required}
        disabled={disabled}
        placeholder={placeholder ?? "0"}
        className={className}
        aria-label={ariaLabel}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const newRaw = toRaw(event.target.value);
          const newDisplay = formatDisplay(newRaw);
          setRaw(newRaw);
          setDisplay(newDisplay);
          onValueChange?.(newRaw);
        }}
      />
      <input type="hidden" name={name} value={raw} />
    </>
  );
}
