"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";

function toRaw(value: string): string {
  const clean = value.replace(/[^0-9,]/g, "");
  const [int = "", ...rest] = clean.split(",");
  const digits = int.replace(/^0+(?=\d)/, "");
  const decimals = rest.join("").slice(0, 2);
  if (!digits && !decimals) return "";
  return decimals ? `${digits || "0"}.${decimals}` : digits;
}

function formatDisplay(raw: string): string {
  if (!raw) return "";
  const [int, decimals] = raw.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimals !== undefined ? `${grouped},${decimals}` : grouped;
}

function normalizeDefault(value: number | string | undefined): string {
  if (value === undefined || value === "") return "";
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
}: Props) {
  const initialRaw = normalizeDefault(defaultValue);
  const hiddenRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        defaultValue={formatDisplay(initialRaw)}
        required={required}
        disabled={disabled}
        placeholder={placeholder ?? "0"}
        className={className}
        aria-label={ariaLabel}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const raw = toRaw(event.currentTarget.value);
          event.currentTarget.value = formatDisplay(raw);
          if (hiddenRef.current) hiddenRef.current.value = raw;
        }}
      />
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialRaw} />
    </>
  );
}
