"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ProductCard, type CatalogProduct } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CatalogItem = {
  product: CatalogProduct & { olfactoryFamily: string };
  displayPrice: number | null;
};

type Props = {
  items: CatalogItem[];
  canOrder: boolean;
  isPending: boolean;
};

const GENDERS = [
  { value: "TODO", label: "Todo" },
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "UNISEX", label: "Unisex" },
] as const;

const norm = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function CatalogGrid({ items, canOrder, isPending }: Props) {
  const [gender, setGender] = useState("TODO");
  const [family, setFamily] = useState("TODAS");
  const [query, setQuery] = useState("");

  const families = useMemo(() => {
    const set = new Set(
      items.map((item) => item.product.olfactoryFamily.trim()).filter(Boolean)
    );
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [items]);

  const filtered = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    return items.filter(({ product }) => {
      if (gender !== "TODO" && product.gender !== gender) return false;
      if (family !== "TODAS" && product.olfactoryFamily !== family) return false;
      if (tokens.length > 0) {
        const haystack = norm(
          `${product.name} ${product.description} ${product.olfactoryFamily}`
        );
        if (!tokens.every((token) => haystack.includes(token))) return false;
      }
      return true;
    });
  }, [items, gender, family, query]);

  const active = gender !== "TODO" || family !== "TODAS" || query.trim() !== "";

  const reset = () => {
    setGender("TODO");
    setFamily("TODAS");
    setQuery("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar por género"
        >
          {GENDERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={`rounded-full border px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
                gender === option.value
                  ? "border-gold bg-gold/15 text-gold-soft"
                  : "border-gold/20 text-muted-foreground hover:border-gold/50 hover:text-ivory"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {families.length > 1 ? (
            <Select value={family} onValueChange={setFamily}>
              <SelectTrigger
                className="w-[210px]"
                aria-label="Filtrar por familia olfativa"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las familias</SelectItem>
                {families.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar fragancia…"
              aria-label="Buscar fragancia por nombre"
              className="min-w-[230px] pr-9 pl-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-ivory"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {active ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-muted-foreground hover:text-gold-soft"
            >
              <X className="size-4" /> Restablecer filtros
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gold/20 bg-card px-6 py-16 text-center">
          <p className="font-display text-3xl text-ivory">Sin coincidencias</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No hay fragancias que coincidan con los filtros seleccionados.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={reset} className="mt-5">
            <X className="size-4" /> Restablecer filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(({ product, displayPrice }) => (
            <ProductCard
              key={product.id}
              product={product}
              displayPrice={displayPrice}
              canOrder={canOrder}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {active && filtered.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Mostrando {filtered.length} de {items.length} fragancias
        </p>
      ) : null}
    </div>
  );
}
