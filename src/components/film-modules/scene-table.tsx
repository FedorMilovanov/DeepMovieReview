import type { EvidenceRecord, FilmSceneRecord } from "@/lib/film-package";
import { LENS_LABELS } from "@/lib/content";
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
 * The recorded scene index, not a claim to an exhaustive scene list or a
 * verified boundary for the whole film. The state column comes from the scene
 * record; evidence counts are computed after the reader's spoiler projection.
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
  const sceneReadings = ordered.flatMap((scene) => {
    const readings = (scene.lensReadings ?? []).filter((reading) => canRevealSpoiler(spoilerLevel, reading.spoilerLevel));
    return readings.length ? [{ scene, readings }] : [];
  });

  return (
    <section className="sectionShell sectionRule filmSceneTable" aria-labelledby="film-scene-table-title">
      <div className="sectionIndex">Фильм / Сцены {researchDraft ? "· черновик" : "· статус реестра"}</div>
      <h2 id="film-scene-table-title" tabIndex={-1}>Сцены, таймкоды и опоры.</h2>
      <p className="sectionIntro">
        {verified} из {visibleScenes.length} сцен отмечены проверенными в реестре. Этот статус не означает
        непрерывного просмотра со звуком: у опоры в реестре указан материал проверки или отмечено, что он не записан.
        У названия каждой сцены — опоры, доступные на выбранном уровне; раскройте их, чтобы перейти к записи.
        {hiddenScenes > 0
          ? ` Ещё ${hiddenScenes} сцен скрыто до выбранного уровня спойлеров.`
          : ""}
      </p>
      <p className="microLabel">Название, время и опоры каждой сцены доступны и на узком экране.</p>
      <div className="filmSceneTableWrap" role="region" aria-label="Таблица сцен" tabIndex={0}>
        <table>
          <caption className="visuallyHidden">
            Сцены фильма: начало, название, состояние проверки и число опор
          </caption>
          <thead>
            <tr>
              <th scope="col">Сцена и опоры</th>
              <th className="filmSceneExtra" scope="col">#</th>
              <th className="filmSceneExtra" scope="col">Начало</th>
              <th className="filmSceneExtra" scope="col">Состояние</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((scene) => {
              const supports = evidencePerScene.get(scene.id) ?? [];
              return (
                <tr key={scene.id} id={`scene-${scene.id}`} tabIndex={-1}>
                  <th scope="row">
                    <span className="filmSceneName">{scene.shortLabel}</span>
                    <span className="filmSceneMobileMeta">
                      Сцена {String(scene.sequenceIndex).padStart(2, "0")} · {formatTimecode(scene.startTimestampSeconds)} · {scene.verificationState === "VERIFIED" ? "проверена" : "черновая"}
                    </span>
                    {supports.length ? (
                      <details className="filmSceneSupports">
                        <summary aria-label={`Опоры сцены «${scene.shortLabel}»: ${supports.length}`}>Опоры · {supports.length}</summary>
                        <ul>
                          {supports.map((record) => (
                            <li key={record.id}><a href={`#evidence-${record.id}`} aria-label={`${record.label} — опора сцены «${scene.shortLabel}»`}>{record.label} →</a></li>
                          ))}
                        </ul>
                      </details>
                    ) : <span className="filmSceneNoSupports">Нет видимых опор</span>}
                    {(() => {
                      const available = sceneReadings.find((item) => item.scene.id === scene.id)?.readings.length ?? 0;
                      return available ? <a className="filmSceneReadingsLink" href={`#scene-lenses-${scene.id}`}>
                        {available === 6 ? "Шесть прочтений одной сцены" : `Прочтения одной сцены · ${available}`} →
                      </a> : null;
                    })()}
                  </th>
                  <td className="filmSceneIndex filmSceneExtra">{String(scene.sequenceIndex).padStart(2, "0")}</td>
                  <td className="filmSceneTime filmSceneExtra">{formatTimecode(scene.startTimestampSeconds)}</td>
                  <td className="filmSceneExtra">
                    <span className="filmSceneState" data-state={scene.verificationState.toLowerCase()}>
                      {scene.verificationState === "VERIFIED" ? "проверена" : "черновая"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sceneReadings.map(({ scene, readings }) => (
        <details className="sceneLensDetails" id={`scene-lenses-${scene.id}`} key={scene.id} tabIndex={-1} open>
          <summary>{readings.length === 6 ? "Шесть прочтений одной сцены" : `${readings.length} прочтений одной сцены`}: {scene.shortLabel}</summary>
          <p>Это разные взгляды на один эпизод, а не отдельные полные разборы фильма. Наблюдения и интерпретации ссылаются на записи этой сцены; пределы проверки указаны у каждой опоры.</p>
          <ul>
            {readings.map((reading) => (
              <li key={reading.lens}>
                <strong>{LENS_LABELS[reading.lens]}</strong>
                <p>{reading.text}</p>
                {reading.support.evidenceIds.map((id) => {
                  const record = (evidencePerScene.get(scene.id) ?? []).find((item) => item.id === id);
                  return record ? <a key={id} href={`#evidence-${id}`}>{record.label} →</a> : null;
                })}
                {(reading.support.counterevidenceIds ?? []).map((id) => {
                  const record = (evidencePerScene.get(scene.id) ?? []).find((item) => item.id === id);
                  return record ? <a key={id} href={`#evidence-${id}`}>Контропора: {record.label} →</a> : null;
                })}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}
