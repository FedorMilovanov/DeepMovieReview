type FilmMediaFrameProps = {
  slug: string;
  variant: "index" | "hero";
};

export function FilmMediaFrame({ slug, variant }: FilmMediaFrameProps) {
  return (
    <div
      className={variant === "hero" ? "filmMediaFrame filmMediaFrameHero" : "filmMediaFrame filmMediaFrameIndex"}
      data-film-transition-media={slug}
      aria-hidden="true"
    >
      <span className="filmMediaGlow filmMediaGlowPrimary" />
      <span className="filmMediaGlow filmMediaGlowSecondary" />
      <span className="filmMediaHorizon" />
      <span className="filmMediaFrameMark">Кадр / {slug.toUpperCase()}</span>
    </div>
  );
}
