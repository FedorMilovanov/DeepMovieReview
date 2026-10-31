import type { EvidenceRecord, FilmSceneRecord } from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "@/lib/spoilers";
import { formatTimecode } from "@/lib/timecode";

type FilmSceneTableProps = {
  scenes: FilmSceneRecord[];
  evidence: EvidenceRecord[];
  researchDraft: boolean;
  /** The reader's level: scenes above it are not rendered at all. */
  spoilerLevel: SpoilerLevel;
};

/**
 * The measured spine of the film, on one screen.
 *
 * The site already knows every scene, every boundary and how many evidence
 * records stand inside each one; until this table existed, a reader had to
 * collect that from a dozen cards and could not see the shape of the film at
 * all. Nothing here is editorial: the state column is the record's own
 * verification state, and the counts are computed.
 */
export function FilmSceneTable({
  scenes,
  evidence,
  researchDraft,
  spoilerLevel,
}: FilmSceneTableProps) {
  // A scene's short label is a synopsis in three words — «Край неба и дверь» at
  // level NONE ends the film for a reader who asked for no ending. Project first,
  // then say how much was held back, so the table is neither a leak nor a lie.
  const visibleScenes = scenes.filter((scene) => canRevealSpoiler(spoilerLevel, scene.spoilerLevel));
  if (visibleScenes.length === 0) return null;
  const hiddenScenes = scenes.length - visibleScenes.length;

  const evidencePerScene = new Map<string, EvidenceRecord[]>();
  for (const item of evidence) {
    if (!item.sceneId || !canRevealSpoiler(spoilerLevel, item.spoilerLevel)) continue;
    const records = evidencePerScene.get(item.sceneId) ?? [];
    records.push(item);
    evidencePerScene.set(item.sceneId, records);
  }

  const verified = visibleScenes.filter((scene) => scene.verificationState === "VERIFIED").length;
  const ordered = [...visibleScenes].sort(
    (a, b) => a.startTimestampSeconds - b.startTimestampSeconds,
  );

  return (
    <section className="sectionShell sectionRule filmSceneTable" aria-labelledby="film-scene-table-title">
      <div className="sectionIndex">Фильм / Сцены {researchDraft ? "· черновик" : "· проверено"}</div>
      <h2 id="film-scene-table-title">Все сцены с таймкодами и опорами.</h2>
      <p className="sectionIntro">
        {verified} из {visibleScenes.length} сцен отмечены проверенными в реестре. Этот статус не означает
        непрерывного просмотра со звуком: материал отдельной проверки показан в реестре опор.
        В последней колонке — видимые на выбранном уровне опоры; раскройте число, чтобы перейти к записи.
        {hiddenScenes > 0
          ? ` Ещё ${hiddenScenes} сцен скрыто до выбранного уровня спойлеров.`
          : ""}
      </p>
      <p className="microLabel">На узком экране таблицу можно прокрутить по горизонтали.</p>
      <div className="filmSceneTableWrap" role="region" aria-label="Таблица сцен, горизонтальная прокрутка" tabIndex={0}>
        <table>
          <caption className="visuallyHidden">
            Сцены фильма: начало, длительность, состояние проверки и число опор
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Начало</th>
              <th scope="col">Сцена</th>
              <th scope="col">Состояние</th>
              <th scope="col">Опоры</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((scene) => {
              const supports = evidencePerScene.get(scene.id) ?? [];
              return (
                <tr key={scene.id} id={`scene-${scene.id}`}>
                  <td className="filmSceneIndex">{String(scene.sequenceIndex).padStart(2, "0")}</td>
                  <td className="filmSceneTime">{formatTimecode(scene.startTimestampSeconds)}</td>
                  <th scope="row">{scene.shortLabel}</th>
                  <td>
                    <span className="filmSceneState" data-state={scene.verificationState.toLowerCase()}>
                      {scene.verificationState === "VERIFIED" ? "проверена" : "черновая"}
                    </span>
                  </td>
                  <td className="filmSceneSupports">
                    {supports.length ? (
                      <details>
                        <summary aria-label={`Опоры сцены «${scene.shortLabel}»: ${supports.length}`}>{supports.length}</summary>
                        <ul>
                          {supports.map((record) => (
                            <li key={record.id}><a href={`#evidence-${record.id}`}>{record.label}</a></li>
                          ))}
                        </ul>
                      </details>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
