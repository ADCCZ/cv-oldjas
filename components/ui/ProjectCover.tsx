import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Segments } from "@/components/ui/Segments";
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
  const title = tx(project.title, locale);
  // A long word ("SAMOOBSLUŽNÝ") shrinks the type until it fits the 82cqw text box (≈ 0.92 em a letter).
  const longest = Math.max(...title.split(" ").map((word) => word.length));
  const titleSize = `min(8.4cqw, ${(82 / (longest * 0.92)).toFixed(2)}cqw)`;

  return (
    <div
      data-cover-frame
      className="relative aspect-[16/10] overflow-hidden text-cream [container-type:inline-size]"
      // Up to --red-600 only: the small gold number and cream type keep 4.5 : 1 on every cover.
      style={{ background: shadeFor(index, total, "var(--red-600)") }}
    >
      {image ? (
        // Oversized wrapper: ProjectsMotion slides it sideways for a slower-than-the-card parallax.
        <div data-parallax className="absolute inset-0 scale-[1.14]">
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 36vw, (min-width: 768px) 52vw, 85vw" className="object-cover" />
        </div>
      ) : (
        <div data-parallax className="absolute inset-0 flex scale-[1.14] flex-col p-[9cqw]" aria-hidden="true">
          {/* Never below 11 / 14 px – on a phone the cover is only ~350 px wide. */}
          <div className="flex items-start justify-between gap-[4cqw] font-label text-[max(2.4cqw,0.6875rem)] leading-tight">
            <span className="text-[max(3.4cqw,0.875rem)] text-gold-soft">{pad(index + 1)}</span>
            <Segments className="max-w-[60%] text-right" items={project.stack.map((s) => tx(s, locale))} />
          </div>
          <p
            className="mt-auto mb-[9cqw] font-wide leading-[0.86] font-black tracking-[-0.03em] text-balance uppercase"
            style={{ fontSize: titleSize }}
          >
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
