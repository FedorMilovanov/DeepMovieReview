export default function FilmsLoading() {
  return (
    <section className="sectionShell routeLoading" aria-busy="true" aria-live="polite">
      <div className="sectionIndex">Фильмы / Загрузка</div>
      <div className="routeSkeleton routeSkeletonWide" />
      <div className="routeGridSkeleton" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="routeCardSkeleton" key={index} />
        ))}
      </div>
      <p className="routeLoadingLabel">Готовим индекс фильмов…</p>
    </section>
  );
}
