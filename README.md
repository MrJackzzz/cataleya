# Cataleya Aromas

Catálogo de perfumería de alta gama con precios dinámicos por rol, pedidos,
control de muestras, panel de administración y reportes de ganancias.

**Producción:** `cataleya-aromas.vercel.app`

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions, TypeScript) |
| UI | Tailwind CSS v4 + shadcn/ui (estética luxury: burgundy, dorado, neutros premium) |
| BD / ORM | PostgreSQL (VPS propio con Docker) + Prisma ORM |
| Imágenes | Cloudflare R2 vía `@aws-sdk/client-s3` (`lib/r2.ts`) |
| Auth | NextAuth.js v5 (Auth.js) — JWT + Credentials (teléfono + contraseña) |
| Datos de contacto | Enlaces `https://wa.me/[telefono]?text=...` en todas las fichas |

## Estructura

```
app/
├── actions/            # Server Actions
│   ├── access.ts       # Solicitud de acceso (rol PENDIENTE)
│   ├── auth.ts         # Login (cliente/admin) y logout
│   ├── account.ts      # Cambio de contraseña del cliente
│   ├── orders.ts       # Crear pedido + cambiar estado (stock reversado)
│   ├── users.ts        # Aprobar/rechazar, roles y recargos por rol
│   ├── products.ts     # CRUD perfumes + subida de imágenes a R2
│   ├── samples.ts      # Altas y estados de muestras (PENDIENTE/CERRADO)
│   ├── suppliers.ts    # Proveedores y compras de materia prima
│   ├── reports.ts      # Cálculo de ganancias/facturación por rango
│   └── settings.ts     # Configuración del sitio público
├── page.tsx            # Catálogo público (precios dinámicos + disclaimer)
├── login/              # Login de clientes
├── mi-cuenta/          # Historial de pedidos, muestras y contraseña
└── admin/
    ├── login/          # Login independiente del administrador
    └── (panel)/        # Dashboard, usuarios, productos, pedidos,
                        # proveedores, ganancias, configuración
components/
├── catalog/            # Cards, disclaimer, solicitud de acceso
├── admin/              # Sidebar, topbar con alertas, formularios CRUD
├── account/  ├── auth/  ├── layout/  └── ui/ (shadcn)
lib/                    # prisma, auth, r2, pricing, guards, validaciones…
prisma/                 # schema.prisma + seed.ts
middleware.ts           # Protección de rutas por rol (JWT en edge)
docker-compose.yml      # PostgreSQL 16 para tu VPS
```

## Puesta en marcha

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Completá `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`),
   `ADMIN_PHONE`, `ADMIN_PASSWORD` y las credenciales de R2.

3. **Levantar la base (en tu VPS)**

   ```bash
   docker compose up -d
   ```

4. **Crear tablas y datos iniciales**

   ```bash
   npm run db:push      # crea las tablas
   npm run db:seed      # admin + recargos por rol + catálogo de ejemplo
   ```

5. **Desarrollo**

   ```bash
   npm run dev
   ```

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (tipos + lint) |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincroniza `schema.prisma` con la BD |
| `npm run db:migrate` | Crea una migración versionada |
| `npm run db:seed` | Seed: admin, recargos y catálogo base |

## Roles y precios dinámicos

| Rol | Comportamiento |
| --- | --- |
| `PENDIENTE` | Solicitud de acceso registrada; sin login ni precios |
| `CLIENTE` | Ve precios con recargo de ejemplo **+10%** |
| `SOCIO` | Ve precios con recargo de ejemplo **+5%** |
| `FAMILIAR` | Ve precios con recargo de ejemplo **+8%** |
| `ADMIN` | Panel `/admin`; no aparece en el catálogo |

- El precio que ve cada cliente = `costo base + recargo de su rol`
  (configurable en **/admin/usuarios**).
- El cálculo **siempre** se valida en el Server Action (`lib/pricing.ts`),
  nunca en el cliente.
- Los visitantes solo ven imagen, descripción y N° de fragancia.

## Aviso legal (obligatorio)

El disclaimer olfativo se muestra en portada y pie de página:

> Las imágenes e identificadores numéricos son exclusivamente para orientación
> olfativa. Los productos comercializados son contratipos / réplicas de alta
> calidad inspirados en las marcas originales.

Se puede ocultar/mostrar desde **/admin/configuracion** (`showDisclaimer`).

## Cloudflare R2

1. Crear un bucket (ej. `cataleya-aromas`) y habilitar acceso público
   (o usar el dominio `pub-<id>.r2.dev`).
2. Crear un API Token con permisos **Object Read & Write** sobre ese bucket.
3. Completar en `.env`:

   ```env
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=cataleya-aromas
   NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxx.r2.dev
   ```

   > `R2_PUBLIC_URL` también es aceptada como alias por compatibilidad.

Las imágenes se suben desde los formularios de **/admin/productos** con
`PutObjectCommand` (`lib/r2.ts`), límite 8 MB (`experimental.serverActions.bodySizeLimit`).

## Despliegue en Vercel

1. Importar el repo y dejar el build por defecto (`next build`).
2. Configurar todas las variables de `.env.example` en
   **Project → Settings → Environment Variables**.
3. Tu PostgreSQL del VPS debe aceptar conexiones externas:
   - abrir el puerto 5432 solo para la IP de Vercel (o usar SSH tunnel/proxy),
   - agregar `?sslmode=require` al final de `DATABASE_URL` si tenés SSL.
4. Ejecutar una vez `npm run db:push && npm run db:seed` desde tu máquina
   apuntando a la BD de producción.

## Flujo operativo

1. Cliente ingresa a `/` → **Solicitar acceso** (nombre, apellido, WhatsApp) →
   queda como `PENDIENTE`.
2. Admin lo aprueba en **/admin/usuarios** asignando rol y contraseña temporal.
3. Cliente ingresa en `/login`, cambia su contraseña en `/mi-cuenta` y
   genera pedidos de **Réplica** o **Muestra** respetando el stock.
4. Admin gestiona estados de pedidos (al cancelar se devuelve el stock),
   registra muestras entregadas, cargа proveedores/compras y revisa
   ganancias por día/mes/año/rango en **/admin/ganancias**.
