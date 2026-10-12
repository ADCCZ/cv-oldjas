import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "404 – Oldřich Jan Švehla",
  robots: { index: false },
};

/** Global 404 – it sits outside the [locale] tree, so it speaks both languages. */
export default function NotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main className="site-grid min-h-svh content-center gap-y-8 py-24">
          <p className="eyebrow col-span-12 text-gold-text">404</p>
          <h1 className="text-h2 col-span-12 font-bold lg:col-span-10">This page got lost in the woods.</h1>
          <p lang="cs" className="col-span-12 font-serif text-3xl italic text-fg-muted md:text-4xl">
            Tahle stránka se ztratila v lese.
          </p>
          <p className="col-span-12 flex flex-wrap gap-3">
            <Link href="/" className="pill pill-red">
              Back to the trail →
            </Link>
            <Link href="/cs" lang="cs" className="pill pill-outline">
              Zpátky na cestu →
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
