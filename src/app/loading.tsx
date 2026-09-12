export default function RootLoading() {
  return (
    <section className="sectionShell routeLoading" aria-busy="true" aria-live="polite">
      <div className="sectionIndex">Загрузка / Платформа</div>
      <div className="routeSkeleton routeSkeletonWide" />
      <div className="routeSkeleton routeSkeletonMedium" />
      <p className="routeLoadingLabel">Готовим следующий кадр…</p>
    </section>
  );
}
