import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB (serverActions.bodySizeLimit)

export function assertR2Configured() {
  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME
  ) {
    throw new Error(
      "Cloudflare R2 no está configurado. Completá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY y R2_BUCKET_NAME en las variables de entorno."
    );
  }
}

export async function uploadImageToR2(file: File): Promise<string> {
  assertR2Configured();

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no admitido. Usá JPG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen supera el máximo de 8MB.");
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const key = `products/${Date.now()}-${safeName || `imagen.${extension}`}`;

  const body = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const base = (
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
    process.env.R2_PUBLIC_URL ??
    ""
  ).replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "Falta NEXT_PUBLIC_R2_PUBLIC_URL (URL pública del bucket)."
    );
  }
  return `${base}/${key}`;
}
