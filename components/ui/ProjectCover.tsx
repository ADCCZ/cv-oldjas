import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { Project } from "@/content/projects.config";
import type { Locale } from "@/content/types";
import { pad, tx } from "@/lib/i18n";
import { shadeFor } from "@/lib/shade";

/** Checked at build time – a screenshot dropped into public/projects/ replaces the cover automatically. */
function publicFileExists(publicPath: string): boolean {
  return existsSync(path.join(process.cwd(), "public", publicPath));
}

type Props = {
  project: Project;
  index: number;
  total: number;
  locale: Locale;
};

/**
 * 16:10 project image. Without a screenshot it renders the typographic cover:
 * red shade by order, the title in Archivo (wdth 125, wght 900), gold mono number, technologies.
 */
export function ProjectCover({ project, index, total, locale }: Props) {
  const image = project.image && publicFileExists(project.image) ? project.image : null;

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden text-cream [container-type:inline-size]"
      style={{ background: shadeFor(index, total) }}
    >
      {image ? (
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 44vw, (min-width: 640px) 62vw, 85vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col p-[5cqw]" aria-hidden="true">
          <div className="flex items-start justify-between gap-[4cqw] font-mono text-[2.4cqw] leading-tight">
            <span className="text-[3.4cqw] text-gold-soft">{pad(index + 1)}</span>
            <span className="max-w-[60%] text-right opacity-80">{project.stack.map((s) => tx(s, locale)).join(" · ")}</span>
          </div>
          <p className="mt-auto mb-[9cqw] font-wide text-[8.4cqw] leading-[0.86] font-black tracking-[-0.03em] text-balance uppercase">
            {tx(project.title, locale)}
          </p>
        </div>
      )}
    </div>
  );
}
