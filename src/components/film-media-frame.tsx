import Image, { type StaticImageData } from "next/image";
import { LivingFrame } from "@/components/living-frame";
import { getFilmHomeAsset } from "@/data/visual-assets";
import decisionMaster from "../../public/art/decision-master.jpg";
import heroMaster from "../../public/art/hero-master.jpg";
import lensMaster from "../../public/art/lens-master.jpg";
import relationshipMaster from "../../public/art/relationship-master.jpg";

type FilmMediaFrameProps = {
  slug: string;
  variant: "index" | "hero";
};

/**
 * Platform stand-in art per film slug until per-film art direction lands
 * with the first published analysis (Phase C). Index rows and film heroes
 * already carry honest status labels (fixture / research draft), so this
 * atmosphere art is never presented as a film still.
 */
const STANDIN_ART: Record<string, StaticImageData> = {
  "pilot-film": lensMaster,
  "second-fixture": relationshipMaster,
  "the-truman-show": heroMaster,
  "the-fast-and-the-furious": decisionMaster,
};

export function FilmMediaFrame({ slug, variant }: FilmMediaFrameProps) {
  const filmArt = getFilmHomeAsset(slug);
  const art = filmArt?.variants.find((variant) => variant.purpose === "display")?.src ?? STANDIN_ART[slug] ?? relationshipMaster;

  if (variant === "index") {
    return (
      <div
        className="filmMediaFrame filmMediaFrameIndex"
        data-film-transition-media={slug}
        aria-hidden="true"
      >
        <Image src={art} alt="" fill sizes="240px" />
      </div>
    );
  }

  return (
    <LivingFrame
      art={art}
      alt={filmArt?.alt ?? ""}
      sizes="100vw"
      metaLeft="Иллюстрация"
      metaRight={filmArt ? "редакционная" : "платформенный арт"}
      className="filmMediaFrameHero"
      transitionSlug={slug}
      label={filmArt ? "Редакционная ИИ-иллюстрация, не кадр фильма." : "Декоративный платформенный арт: рисунок, не кадр фильма."}
    />
  );
}
