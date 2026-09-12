export default function FilmLoading() {
  return (
    <section className="sectionShell routeLoading routeLoadingFilm" aria-busy="true" aria-live="polite">
      <div className="sectionIndex">Фильм / Загрузка</div>
      <div className="routeFilmHeroSkeleton" aria-hidden="true" />
      <div className="routeSkeleton routeSkeletonWide" />
      <div className="routeSkeleton routeSkeletonMedium" />
      <div className="routeMetaSkeleton" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="routeMetaCellSkeleton" key={index} />
        ))}
      </div>
      <p className="routeLoadingLabel">Готовим разбор фильма…</p>
    </section>
  );
}
