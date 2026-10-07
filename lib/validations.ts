import { z } from "zod";

const phoneField = z
  .string()
  .trim()
  .min(8, "Ingresá un número de WhatsApp válido")
  .max(20, "Número demasiado largo")
  .refine((value) => value.replace(/\D/g, "").length >= 8, {
    message: "Ingresá un número de WhatsApp válido",
  });

export const accessRequestSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre").max(60),
  lastName: z.string().trim().min(2, "Ingresá tu apellido").max(60),
  phone: phoneField,
});

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(6, "La contraseña tiene al menos 6 caracteres"),
});

export const createOrderSchema = z.object({
  productId: z.string().min(1, "Producto inválido"),
  quantity: z.coerce
    .number({ error: "Cantidad inválida" })
    .int("Cantidad inválida")
    .min(1, "Mínimo 1 unidad")
    .max(99, "Máximo 99 unidades"),
  kind: z.enum(["MUESTRA", "REPLICA"]),
  note: z.string().trim().max(300).optional(),
});

export const productSchema = z.object({
  codeNumber: z.coerce
    .number({ error: "Número identificador inválido" })
    .int("Debe ser un número entero")
    .positive("Debe ser positivo"),
  name: z.string().trim().min(3, "Ingresá el nombre / equivalencia olfativa").max(120),
  description: z.string().trim().min(10, "Descripción demasiado corta").max(600),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Subí una imagen del producto")
    .refine((value) => !value.startsWith("blob:"), {
      message: "La imagen no se subió correctamente. Volvé a seleccionarla.",
    }),
  gender: z.enum(["MASCULINO", "FEMENINO", "UNISEX"], {
    error: "Elegí el género del perfume",
  }),
  olfactoryFamily: z
    .string()
    .trim()
    .max(40, "Familia olfativa demasiado larga")
    .default(""),
  stock: z.coerce
    .number({ error: "Stock inválido" })
    .int("Stock inválido")
    .min(0, "Stock inválido"),
  baseCostPrice: z.coerce
    .number({ error: "Costo base inválido" })
    .min(0, "Costo inválido"),
});

export const approveUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CLIENTE", "SOCIO", "FAMILIAR"]),
});

export const rejectUserSchema = z.object({
  userId: z.string().min(1),
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CLIENTE", "SOCIO", "FAMILIAR"]),
});

export const roleMarkupSchema = z.object({
  role: z.enum(["CLIENTE", "SOCIO", "FAMILIAR"]),
  markupValue: z.coerce
    .number({ error: "Valor inválido" })
    .min(0, "No puede ser negativo")
    .max(1000, "Valor demasiado alto"),
  isPercentage: z.boolean(),
});

export const sampleDeliverySchema = z.object({
  userId: z.string().min(1, "Seleccioná un cliente"),
  productCode: z.coerce
    .number({ error: "Número de fragancia inválido" })
    .int("Número inválido")
    .positive("Número inválido"),
  quantity: z.coerce
    .number({ error: "Cantidad inválida" })
    .int("Cantidad inválida")
    .min(1, "Mínimo 1"),
});

export const sampleStatusSchema = z.object({
  sampleId: z.string().min(1),
  status: z.enum(["PENDIENTE", "CERRADO"]),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del proveedor").max(80),
  contact: z.string().trim().max(120).optional().or(z.literal("")),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Seleccioná un proveedor"),
  item: z.string().trim().min(2, "Ingresá el insumo").max(120),
  cost: z.coerce
    .number({ error: "Monto inválido" })
    .min(0, "Monto inválido"),
  date: z.string().min(1, "Ingresá la fecha"),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "TERMINADO", "CANCELADO"]),
});

export const siteConfigSchema = z.object({
  siteName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(120),
  whatsapp: z.string().trim().max(20),
  announcement: z.string().trim().max(200),
  announcementEnabled: z.boolean(),
  catalogEnabled: z.boolean(),
  showDisclaimer: z.boolean(),
});

export const earningsFilterSchema = z.object({
  preset: z.enum(["day", "week", "month", "year", "custom"]).default("month"),
  from: z.string().optional(),
  to: z.string().optional(),
});
