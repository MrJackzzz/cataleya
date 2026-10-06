"use client";

import { useActionState } from "react";
import { updateUserRole } from "@/app/actions/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  userId: string;
  role: "CLIENTE" | "SOCIO" | "FAMILIAR";
};

export function RoleSelect({ userId, role }: Props) {
  const [state, formAction, pending] = useActionState(updateUserRole, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <Select name="role" defaultValue={role}>
        <SelectTrigger className="h-8 w-32 text-xs" disabled={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CLIENTE">Cliente</SelectItem>
          <SelectItem value="SOCIO">Socio</SelectItem>
          <SelectItem value="FAMILIAR">Familiar</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="submit"
        className="text-xs text-gold underline-offset-2 transition-colors hover:text-gold-soft hover:underline disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "…" : "Guardar"}
      </button>
      {state?.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
