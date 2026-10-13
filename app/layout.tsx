import type { Metadata } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ActionToastHost } from "@/components/admin/ActionToastHost";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.siteConfig
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);
  return {
    title: {
      default: "Cataleya Aromas · Perfumería de autor",
      template: "%s · Cataleya Aromas",
    },
    description:
      "Réplicas de alta calidad inspiradas en las marcas originales. Perfumería premium con identificación olfativa numerada.",
    icons: { icon: config?.logoUrl || "/icon.svg?v=2" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider delayDuration={200}>
            <ActionToastHost>{children}</ActionToastHost>
          </TooltipProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
