export const APPROVED_ROLES = ["CLIENTE", "SOCIO", "FAMILIAR"] as const;

export const ORDER_STATUSES = [
  "PENDIENTE",
  "EN_PROCESO",
  "TERMINADO",
  "CANCELADO",
] as const;

export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  TERMINADO: "Terminado",
  CANCELADO: "Cancelado",
};

export const ROLE_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CLIENTE: "Cliente",
  SOCIO: "Socio",
  FAMILIAR: "Familiar",
  ADMIN: "Admin",
};

export const ORDER_KIND_LABELS: Record<string, string> = {
  MUESTRA: "Muestra",
  REPLICA: "Réplica",
};

export const SAMPLE_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CERRADO: "Cerrado",
};
