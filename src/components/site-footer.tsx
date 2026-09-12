import { ExperienceControls } from "@/components/experience/experience-controls";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div>
        <p>Deep Waters · Сначала фильм. Доказательства — потом вердикт.</p>
        <p>Исследование кино через библейскую картину мира: история, люди, смысл, моральная аргументация и синтез.</p>
      </div>
      <ExperienceControls />
    </footer>
  );
}
