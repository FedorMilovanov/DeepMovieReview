import type {
  ClaimSupport,
  EvidenceRecord,
  FilmModule,
  FilmSceneRecord,
  SourcesMethodModule,
} from "@/lib/film-package";
import { EvidenceBasisLine } from "@/components/evidence-basis";
import { tallyReviewBasis } from "@/lib/evidence-review";
import { pluralRu } from "@/lib/plural-ru";
import {
  evidenceBasisMaterialLabels,
  evidenceBasisOutcomeLabels,
  researchSourceRoleLabels,
  sourceKindLabels,
} from "@/lib/presentation-labels";
import { formatTimecode } from "@/lib/timecode";

type SupportEntry = {
  id: string;
  label: string;
  support: ClaimSupport;
};

type FilmEvidenceMapProps = {
  modules: FilmModule[];
  evidence: EvidenceRecord[];
  scenes: FilmSceneRecord[];
  sources: SourcesMethodModule["sources"];
  researchDraft: boolean;
};

function addSupport(entries: SupportEntry[], id: string, label: string, support: ClaimSupport | undefined) {
  if (!support) return;
  if (support.evidenceIds.length === 0 && (support.counterevidenceIds?.length ?? 0) === 0) return;
  entries.push({ id, label, support });
};

function collectModuleSupports(module: FilmModule): SupportEntry[] {
  const entries: SupportEntry[] = [];

  switch (module.kind) {
    case "story":
      addSupport(entries, `${module.id}-summary`, `${module.heading}: общий тезис`, module.summarySupport);
      for (const beat of module.beats) addSupport(entries, `${module.id}-${beat.id}`, beat.label, beat.support);
      break;
    case "characters":
      for (const character of module.characters) {
        addSupport(entries, `${module.id}-${character.id}-profile`, `${character.name}: профиль`, character.profileSupport);
        addSupport(entries, `${module.id}-${character.id}-interpretation`, `${character.name}: интерпретация`, character.interpretiveSupport);
      }
      break;
    case "relationship":
      addSupport(entries, `${module.id}-summary`, `${module.label}: общий тезис`, module.summarySupport);
      for (const event of module.events) addSupport(entries, `${module.id}-${event.id}`, event.label, event.support);
      break;
    case "family-youth":
      addSupport(entries, `${module.id}-summary`, `${module.heading}: общий тезис`, module.summarySupport);
      for (const observation of module.observations) addSupport(entries, `${module.id}-${observation.id}`, observation.subject, observation.support);
      break;
    case "meaning":
      addSupport(entries, `${module.id}-meaning`, module.apparentClaim, module.support);
      break;
    case "teaching-signals":
      for (const signal of module.signals) addSupport(entries, `${module.id}-${signal.id}`, signal.subject, signal.support);
      break;
    case "permission":
      for (const assessment of module.assessments) addSupport(entries, `${module.id}-${assessment.id}`, assessment.subject, assessment.support);
      break;
    case "craft":
      for (const observation of module.observations) {
        addSupport(entries, `${module.id}-${observation.id}`, observation.interpretiveEffect, observation.support);
      }
      for (const assessment of module.pressureAssessments ?? []) {
        addSupport(entries, `${module.id}-${assessment.id}`, assessment.rationale, assessment.support);
      }
      break;
    case "autopsy":
      addSupport(entries, `${module.id}-claim`, module.claim, module.support);
      break;
    case "decision":
      for (const option of module.options) addSupport(entries, `${module.id}-${option.id}`, option.label, option.support);
      for (const fact of module.facts) addSupport(entries, `${module.id}-${fact.id}`, fact.text, fact.support);
      for (const pressure of module.pressures) addSupport(entries, `${module.id}-${pressure.id}`, pressure.summary, pressure.support);
      for (const duty of module.dutiesOrGoods) addSupport(entries, `${module.id}-${duty.id}`, duty.label, duty.support);
      if (module.editorialJudgment) {
        addSupport(entries, `${module.id}-judgment`, module.editorialJudgment.claim, module.editorialJudgment.support);
      }
      break;
    case "moral-analysis":
      addSupport(entries, `${module.id}-summary`, `${module.heading}: общий тезис`, module.summarySupport);
      for (const event of module.events) addSupport(entries, `${module.id}-${event.id}`, event.act, event.support);
      break;
    case "biblical-synthesis":
      addSupport(entries, `${module.id}-synthesis`, module.observation, module.support);
      break;
    case "final-synthesis":
      addSupport(entries, `${module.id}-final`, module.thesis, module.support);
      break;
    case "sources-method":
      break;
  }

  return entries;
}

function formatTime(seconds: number | undefined) {
  if (seconds === undefined) return "таймкод не указан";
  const rounded = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function EvidenceCard({
  evidenceId,
  evidenceById,
  scenesById,
  sourcesById,
  counter,
  researchDraft,
}: {
  evidenceId: string;
  evidenceById: Map<string, EvidenceRecord>;
  scenesById: Map<string, FilmSceneRecord>;
  sourcesById: Map<string, SourcesMethodModule["sources"][number]>;
  counter: boolean;
  researchDraft: boolean;
}) {
  const record = evidenceById.get(evidenceId);
  if (!record) return null;

  const scene = record.sceneId ? scenesById.get(record.sceneId) : undefined;
  const sourceRecords = (record.sourceIds ?? []).flatMap((sourceId) => {
    const source = sourcesById.get(sourceId);
    return source ? [source] : [];
  });

  return (
    <article
      className="evidenceMapCard"
      data-counter={counter || undefined}
      id={`evidence-${record.id}`}
    >
      <div className="evidenceMapTopline">
        <span>{counter ? "Контрдоказательство" : researchDraft ? "Исследовательская опора" : "Доказательство"}</span>
        {scene ? (
          <span data-state={scene.verificationState.toLowerCase()}>
            Сцена {scene.verificationState === "VERIFIED" ? "проверена" : "черновая"}
          </span>
        ) : null}
      </div>
      <h3>{record.label}</h3>
      <p>{record.observation}</p>
      <EvidenceBasisLine basis={record.basis} />
      <dl className="evidenceMapMeta">
        {scene ? <div><dt>Сцена</dt><dd>{scene.shortLabel}</dd></div> : null}
        <div>
          <dt>{researchDraft ? "Предварительный таймкод" : "Таймкод"}</dt>
          <dd>{formatTime(record.timestampSeconds)}</dd>
        </div>
      </dl>
      {sourceRecords.length > 0 ? (
        <ul className="evidenceMapSources" aria-label="Источники этой опоры">
          {sourceRecords.map((source) => (
            <li key={source.id}>
              <span>{sourceKindLabels[source.kind]}{source.researchRole ? ` · ${researchSourceRoleLabels[source.researchRole]}` : ""}</span>
              {source.href ? <a href={source.href}>{source.label}</a> : <strong>{source.label}</strong>}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function FilmEvidenceMap({
  modules,
  evidence,
  scenes,
  sources,
  researchDraft,
}: FilmEvidenceMapProps) {
  const entries = modules.flatMap(collectModuleSupports);
  if (entries.length === 0) return null;

  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]));
  const sourcesById = new Map(sources.map((source) => [source.id, source]));

  // One card per claim–record link, one record per check. A tally over the linked
  // records — never over the links — is the only count that means anything.
  const linkedIds = new Set<string>();
  let links = 0;
  for (const entry of entries) {
    for (const id of [...entry.support.evidenceIds, ...(entry.support.counterevidenceIds ?? [])]) {
      linkedIds.add(id);
      links += 1;
    }
  }
  const tally = tallyReviewBasis(evidence);
  const tallyParts = [
    tally.seen > 0 ? `${tally.seen} ${pluralRu(tally.seen, "проверена", "проверены", "проверено")} по кадрам` : undefined,
    tally.heard > 0 ? `${tally.heard} ${pluralRu(tally.heard, "подтверждена", "подтверждены", "подтверждено")} по репликам` : undefined,
    tally.refused > 0 ? `${tally.refused} ${pluralRu(tally.refused, "не подтвердилась", "не подтвердились", "не подтвердилось")}` : undefined,
    tally.pending > 0 ? `${tally.pending} ${pluralRu(tally.pending, "ждёт проверки", "ждут проверки", "ждут проверки")}` : undefined,
    tally.unrecorded > 0 ? `${tally.unrecorded} без записи в журнале` : undefined,
    tally.rewritten > 0
      ? `${tally.rewritten} ${pluralRu(tally.rewritten, "переписана", "переписаны", "переписано")} после отказа проверки`
      : undefined,
  ].filter((part): part is string => Boolean(part));

  return (
    <section className="sectionShell sectionRule filmEvidenceMap" aria-labelledby="evidence-map-title">
      <div className="sectionIndex">Доказательность / Карта опор</div>
      <h2 id="evidence-map-title">Путь от тезиса к источнику.</h2>
      <p className="sectionIntro">
        {researchDraft
          ? "Это исследовательский черновик: опоры собраны по вторичным источникам, сцены и таймкоды предварительные. После блокировки точного мастера каждое утверждение должно быть заново воспроизведено и привязано к проверенной сцене."
          : "Каждое видимое утверждение можно проследить до записи доказательства, сцены, таймкода и источника."}
      </p>
      <p className="evidenceMapTally">
        {tally.records} {pluralRu(tally.records, "запись", "записи", "записей")} в реестре:{" "}
        {tallyParts.join(", ")}. {entries.length} {pluralRu(entries.length, "тезис", "тезиса", "тезисов")}{" "}
        ссылаются на {links} {pluralRu(links, "опору", "опоры", "опор")} — это {linkedIds.size}{" "}
        {pluralRu(linkedIds.size, "запись", "записи", "записей")}, потому что одна проверка может
        подтверждать несколько тезисов. Реестр ниже перечисляет все проверки, включая те, на
        которые пока не сослался ни один тезис.
      </p>
      <div className="evidenceMapList">
        {entries.map((entry, index) => (
          <details className="evidenceMapClaim" key={entry.id} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{entry.label}</strong>
              <small>
                {entry.support.evidenceIds.length} опор · {entry.support.counterevidenceIds?.length ?? 0} контропор ·{" "}
                {new Set([...entry.support.evidenceIds, ...(entry.support.counterevidenceIds ?? [])]).size} записей
              </small>
            </summary>
            <div className="evidenceMapCards">
              {entry.support.evidenceIds.map((evidenceId) => (
                <EvidenceCard
                  counter={false}
                  evidenceById={evidenceById}
                  evidenceId={evidenceId}
                  key={`support-${evidenceId}`}
                  researchDraft={researchDraft}
                  scenesById={scenesById}
                  sourcesById={sourcesById}
                />
              ))}
              {(entry.support.counterevidenceIds ?? []).map((evidenceId) => (
                <EvidenceCard
                  counter
                  evidenceById={evidenceById}
                  evidenceId={evidenceId}
                  key={`counter-${evidenceId}`}
                  researchDraft={researchDraft}
                  scenesById={scenesById}
                  sourcesById={sourcesById}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
      <EvidenceRegister evidence={evidence} researchDraft={researchDraft} scenesById={scenesById} />
    </section>
  );
}

/**
 * Every check the edition holds, not only the ones a claim happens to cite.
 *
 * The map above follows the argument, which means it shows what the argument
 * needed — six cards here, out of forty-seven records. A register sorted by the
 * film's own clock is the honest complement: it is the whole ledger, including the
 * records nobody has cited yet, so «проверено» can be counted instead of believed.
 */
function EvidenceRegister({
  evidence,
  scenesById,
}: {
  evidence: EvidenceRecord[];
  scenesById: Map<string, FilmSceneRecord>;
  researchDraft: boolean;
}) {
  if (evidence.length === 0) return null;

  const ordered = [...evidence].sort(
    (a, b) => (a.timestampSeconds ?? 0) - (b.timestampSeconds ?? 0) || a.id.localeCompare(b.id),
  );

  return (
    <div className="evidenceRegister">
      <h3 id="evidence-register-title">Реестр проверок</h3>
      <p className="evidenceRegisterIntro">
        Все {ordered.length} записей по ходу фильма. «Основа» — то, чем проверяли: кадры мастера или
        встроенные субтитры; «итог» — что показала проверка.
      </p>
      <div className="evidenceRegisterWrap">
        <table aria-labelledby="evidence-register-title">
          <caption className="visuallyHidden">
            Реестр проверок: таймкод, сцена, запись, материал и итог проверки
          </caption>
          <thead>
            <tr>
              <th scope="col">Таймкод</th>
              <th scope="col">Сцена</th>
              <th scope="col">Запись</th>
              <th scope="col">Основа</th>
              <th scope="col">Итог</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((record) => {
              const scene = record.sceneId ? scenesById.get(record.sceneId) : undefined;
              return (
                <tr key={record.id} data-outcome={record.basis?.outcome ?? "missing"}>
                  <td className="evidenceRegisterTime">
                    {record.timestampSeconds === undefined ? "—" : formatTimecode(record.timestampSeconds)}
                  </td>
                  <td>{scene ? scene.shortLabel : "—"}</td>
                  <th scope="row">
                    <a href={`#evidence-${record.id}`}>{record.label}</a>
                  </th>
                  <td>{record.basis ? evidenceBasisMaterialLabels[record.basis.material] : "не записана"}</td>
                  <td>
                    {record.basis ? evidenceBasisOutcomeLabels[record.basis.outcome] : "нет записи в журнале"}
                    {record.basis?.refusedAncestor ? " · переписана после отказа" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
