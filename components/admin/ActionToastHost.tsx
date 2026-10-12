"use client";

import { createContext, useCallback, useContext } from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import type { FormState } from "@/lib/action-state";

type ServerAction = (
  prev: FormState,
  formData: FormData
) => Promise<FormState>;

const ToastContext = createContext<(state: FormState) => void>(() => {});

export function ActionToastHost({ children }: { children: React.ReactNode }) {
  const notify = useCallback((state: FormState) => {
    if (state?.success) toast.success(state.success);
    else if (state?.error) toast.error(state.error);
  }, []);

  return (
    <ToastContext.Provider value={notify}>{children}</ToastContext.Provider>
  );
}

export function useToastAction(action: ServerAction) {
  const notify = useContext(ToastContext);

  return useActionState(async (_prev: FormState, formData: FormData) => {
    const result = await action(_prev, formData);
    notify(result);
    return result;
  }, null);
}
