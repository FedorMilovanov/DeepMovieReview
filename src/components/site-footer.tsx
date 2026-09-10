import { ExperienceControls } from "@/components/experience/experience-controls";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div>
        <p>DeepMovieReview · foundation build</p>
        <p>Film first. Evidence before verdict.</p>
      </div>
      <ExperienceControls />
    </footer>
  );
}
