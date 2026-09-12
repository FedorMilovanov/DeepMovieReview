import { ExperienceControls } from "@/components/experience/experience-controls";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div>
        <p>DeepMovieReview · Сначала фильм. Доказательства — потом вердикт.</p>
        <p>История, люди, смысл, моральная аргументация и библейский синтез.</p>
      </div>
      <ExperienceControls />
    </footer>
  );
}
