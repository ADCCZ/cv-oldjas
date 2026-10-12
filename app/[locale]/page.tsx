import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { FULL_NAME, Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { OffCode } from "@/components/sections/OffCode";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Stack } from "@/components/sections/Stack";
import { Stats } from "@/components/sections/Stats";
import { links } from "@/content/links.config";
import { projects } from "@/content/projects.config";
import { getDictionary } from "@/lib/dictionary";
import { getRepoMeta } from "@/lib/github";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const github = await getRepoMeta(projects.flatMap((p) => (p.repo ? [p.repo] : [])));

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FULL_NAME,
    alternateName: "Olda",
    jobTitle: t.meta.jobTitle,
    url: links.site,
    email: `mailto:${links.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Plzeň", addressCountry: "CZ" },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Fakulta aplikovaných věd, Západočeská univerzita v Plzni",
      alternateName: "Faculty of Applied Sciences, University of West Bohemia",
    },
    sameAs: [links.github, ...(links.linkedin ? [links.linkedin] : [])],
  };

  return (
    <>
      <Nav locale={locale} projectCount={projects.length} cvHref={links.cv[locale].design} labels={{ ...t.nav, ...t.a11y }} />
      <main id="main" tabIndex={-1}>
        <Hero t={t} locale={locale} />
        <About t={t} />
        <Stats t={t} />
        <Projects t={t} locale={locale} github={github} />
        <Stack t={t} locale={locale} />
        <Skills t={t} />
        <Journey t={t} />
        <OffCode t={t} />
        <Contact t={t} locale={locale} />
      </main>
      <Footer t={t} locale={locale} projectCount={projects.length} />
      <MotionRoot />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
    </>
  );
}
