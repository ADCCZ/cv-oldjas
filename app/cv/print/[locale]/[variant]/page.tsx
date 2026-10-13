import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignCv } from "@/components/cv/DesignCv";
import { PlainCv } from "@/components/cv/PlainCv";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

const variants = ["design", "plain"] as const;
type Variant = (typeof variants)[number];

const isVariant = (value: string): value is Variant => (variants as readonly string[]).includes(value);

type Props = {
  params: Promise<{ locale: string; variant: string }>;
};

export const dynamicParams = false;

/** /cv/print/en/design, /cv/print/cs/plain, … */
export function generateStaticParams() {
  return variants.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Becomes the title of the PDF document.
  return { title: getDictionary(locale, "plain").cv.documentTitle };
}

export default async function CvPrintPage({ params }: Props) {
  const { locale, variant } = await params;
  // The pages carry the phone number, which belongs in the PDFs only: on Vercel they are static 404s,
  // locally and in CI they render for `npm run cv` and the tests.
  if (process.env.VERCEL || !isLocale(locale) || !isVariant(variant)) notFound();
  const t = getDictionary(locale, "plain");

  return variant === "design" ? <DesignCv t={t} locale={locale} /> : <PlainCv t={t} locale={locale} />;
}
