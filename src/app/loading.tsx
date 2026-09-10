export default function RootLoading() {
  return (
    <section className="sectionShell routeLoading" aria-busy="true" aria-live="polite">
      <div className="sectionIndex">LOADING / PLATFORM</div>
      <div className="routeSkeleton routeSkeletonWide" />
      <div className="routeSkeleton routeSkeletonMedium" />
      <p className="routeLoadingLabel">Preparing the next view…</p>
    </section>
  );
}
