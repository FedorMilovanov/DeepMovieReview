import Link from "next/link";
import { ExperienceControls } from "@/components/experience/experience-controls";
import { filmPackages } from "@/data/film-registry";

export function SiteFooter() {
  const publishedCount = filmPackages.filter(
    (filmPackage) => filmPackage.film.status === "published",
  ).length;

  return (
    <footer className="siteFooter">
      <div className="footerBrand">
        <p>
          <strong>Deep Waters</strong> · Сначала фильм. Доказательства — потом вердикт.
        </p>
        <p>
          Исследование кино через библейскую картину мира: история, люди, смысл,
          моральная аргументация и синтез.
        </p>
      </div>
      <nav className="footerNav" aria-label="Карта сайта">
        <Link href="/films">Фильмы</Link>
        <Link href="/#lenses">Шесть линз</Link>
        <Link href="/methodology">Методология</Link>
      </nav>
      <div className="footerMeta">
        <p>Предзапуск · опубликовано разборов: {publishedCount}</p>
        <p>© 2026 Deep Waters · Черновики не являются опубликованными суждениями.</p>
      </div>
      <ExperienceControls />
    </footer>
  );
}
