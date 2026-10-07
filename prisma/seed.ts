import { PrismaClient, Role, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPhone = (process.env.ADMIN_PHONE ?? "+5491100000000").replace(
    /\D/g,
    ""
  );
  const adminPassword = process.env.ADMIN_PASSWORD ?? "CambiaEstaClave2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: Role.ADMIN, isApproved: true, passwordHash },
    create: {
      name: "Admin",
      lastName: "Cataleya",
      phone: adminPhone,
      passwordHash,
      role: Role.ADMIN,
      isApproved: true,
    },
  });

  const markups: { role: Role; markupValue: number; isPercentage: boolean }[] = [
    { role: Role.CLIENTE, markupValue: 10, isPercentage: true },
    { role: Role.SOCIO, markupValue: 5, isPercentage: true },
    { role: Role.FAMILIAR, markupValue: 8, isPercentage: true },
  ];

  for (const markup of markups) {
    await prisma.roleMarkup.upsert({
      where: { role: markup.role },
      update: markup,
      create: markup,
    });
  }

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const products: {
    codeNumber: number;
    name: string;
    description: string;
    baseCostPrice: number;
    stock: number;
    gender: Gender;
  }[] = [
    {
      codeNumber: 101,
      name: "Amaderado Ahumado — Inspirado en Ombré Leather",
      description:
        "Cuero sofisticado sobre cedro y ámbar. Una firma intensa para la noche, con estela persistente y carácter.",
      baseCostPrice: 18000,
      stock: 25,
      gender: Gender.MASCULINO,
    },
    {
      codeNumber: 102,
      name: "Cítrico Aromático — Inspirado en Bleu de Chanel",
      description:
        "Bergamota vibrante con fondo de sándalo y jengibre. Frescura elegante para el día a día.",
      baseCostPrice: 16500,
      stock: 40,
      gender: Gender.MASCULINO,
    },
    {
      codeNumber: 103,
      name: "Floral Oriental — Inspirado en Good Girl",
      description:
        "Jazmín y tonka sobre un lecho de vainilla. Dulzor envolvente con remate amaderado.",
      baseCostPrice: 17200,
      stock: 30,
      gender: Gender.FEMENINO,
    },
    {
      codeNumber: 104,
      name: "Ámbar Dulce — Inspirado en Baccarat Rouge 540",
      description:
        "Azafrán, ámbar y cedro en equilibrio perfecto. Una huella distintiva y memorables.",
      baseCostPrice: 21000,
      stock: 0,
      gender: Gender.UNISEX,
    },
  ];

  const freshInstall = (await prisma.product.count()) === 0;
  for (const product of products) {
    const found = await prisma.product.findUnique({
      where: { codeNumber: product.codeNumber },
      select: { id: true },
    });
    if (found) {
      await prisma.product.update({ where: { id: found.id }, data: product });
    } else if (freshInstall) {
      await prisma.product.create({
        data: { ...product, imageUrl: "/images/perfume-placeholder.svg" },
      });
    }
  }

  console.log("✓ Seed ejecutado: admin, roles, configuración y catálogo base.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
