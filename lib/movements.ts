import { prisma } from "./prisma";

export const MOVEMENT_TYPES = [
  "PEDIDO",
  "PAGO",
  "MUESTRA",
  "PRODUCTO",
  "USUARIO",
  "CONFIG",
] as const;

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  PEDIDO: "Pedido",
  PAGO: "Pago",
  MUESTRA: "Muestra",
  PRODUCTO: "Producto",
  USUARIO: "Usuario",
  CONFIG: "Configuración",
};

/** Registro de auditoría best-effort: nunca debe romper la acción principal. */
export async function logMovement(type: string, detail: string): Promise<void> {
  try {
    await prisma.movement.create({ data: { type, detail: detail.slice(0, 300) } });
  } catch {
    // ignorar: el historial no puede romper la operación
  }
}
