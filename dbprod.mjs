import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://nexora:%2Bv-hY74Lnh9_SeSrKi9nk_B6TGKg8o3J@45.55.255.221:5433/cataleya?schema=public&sslmode=require",
});
const products = await prisma.product.findMany({
  orderBy: { codeNumber: "asc" },
  select: { codeNumber: true, name: true, designer: true, isActive: true, imageUrl: true, stock: true },
});
for (const p of products) {
  const img = p.imageUrl.length > 70 ? p.imageUrl.slice(0, 70) + "..." : p.imageUrl;
  console.log(`N ${p.codeNumber} active=${p.isActive} stock=${p.stock} dis=${p.designer} :: ${p.name.slice(0, 45)} :: ${img}`);
}
await prisma.$disconnect();
