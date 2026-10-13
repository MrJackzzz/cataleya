"use client";

import { Loader2, Undo2 } from "lucide-react";
import { registerSampleReturn } from "@/app/actions/samples";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SampleReturnForm({ sampleId, max }: { sampleId: string; max: number }) {
  const [, formAction, pending] = useToastAction(registerSampleReturn);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="sampleId" value={sampleId} />
      <Input
        type="number"
        name="quantity"
        defaultValue={1}
        required
        aria-label="Unidades devueltas"
        className="w-16 text-center"
        onFocus={(event) => event.currentTarget.select()}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        title={`Registrar devolución (máximo ${max})`}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
        Devolver
      </Button>
    </form>
  );
}
