import Image, { type StaticImageData } from "next/image";
import { LivingFrame } from "@/components/living-frame";
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
  const art = STANDIN_ART[slug] ?? relationshipMaster;

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
      alt=""
      sizes="100vw"
      metaLeft="Кадр · стенд-ин"
      metaRight="платформенный арт"
      className="filmMediaFrameHero"
      transitionSlug={slug}
      label="Декоративный платформенный арт. Это не кадр из фильма."
    />
  );
}
