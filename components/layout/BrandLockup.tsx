import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LOGO } from "@/lib/constants";

type Props = {
  href?: string;
  emblemSize?: number;
  title?: string;
  tagline?: string;
  titleClassName?: string;
  logoUrl?: string;
};

export function BrandLockup({
  href = "/",
  emblemSize = 40,
  title = "Cataleya Aromas",
  tagline = "Perfumería de autor",
  titleClassName = "font-display text-2xl tracking-wide",
  logoUrl,
}: Props) {
  return (
    <Link href={href} className="group flex items-center gap-3 leading-none">
      <Image
        src={logoUrl || DEFAULT_LOGO}
        alt="Emblema Cataleya Aromas"
        width={emblemSize}
        height={emblemSize}
        sizes={`${emblemSize}px`}
        className="shrink-0 rounded-full"
        priority
      />
      <span className="flex flex-col">
        <span className={`${titleClassName} text-gradient-gold`}>{title}</span>
        <span className="eyebrow mt-1 text-muted-foreground">{tagline}</span>
      </span>
    </Link>
  );
}
