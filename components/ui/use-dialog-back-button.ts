import { useEffect, useRef } from "react";

/**
 * Hace que el botón "volver" del celular cierre el diálogo abierto
 * en lugar de salir de la página. Al cerrar por UI se deshace la
 * entrada agregada al historial para no atrapar navegaciones.
 */
export function useDialogBackButton(
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  const callbackRef = useRef(onOpenChange);
  callbackRef.current = onOpenChange;
  const pushedRef = useRef(false);
  const closedByPopRef = useRef(false);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    closedByPopRef.current = false;
    window.history.pushState({ cataleyaDialog: true }, "");
    pushedRef.current = true;

    const onPopState = () => {
      closedByPopRef.current = true;
      callbackRef.current(false);
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      if (pushedRef.current && !closedByPopRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [open ]);
}
