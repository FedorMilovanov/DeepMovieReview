import type {
  ClaimSupport,
  EvidenceRecord,
  FilmModule,
  FilmSceneRecord,
  SourcesMethodModule,
} from "@/lib/film-package";
import { researchSourceRoleLabels, sourceKindLabels } from "@/lib/presentation-labels";

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
    <article className="evidenceMapCard" data-counter={counter || undefined}>
      <div className="evidenceMapTopline">
        <span>{counter ? "Контрдоказательство" : researchDraft ? "Исследовательская опора" : "Доказательство"}</span>
        {scene ? (
          <span data-state={scene.verificationState.toLowerCase()}>
            Сцена {scene.verificationState === "VERIFIED" ? "проверена" : "черновая"}
          </span>
        ) : null}
      </div>
      <h4>{record.label}</h4>
      <p>{record.observation}</p>
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

  return (
    <section className="sectionShell sectionRule filmEvidenceMap" aria-labelledby="evidence-map-title">
      <div className="sectionIndex">Доказательность / Карта опор</div>
      <h2 id="evidence-map-title">Путь от тезиса к источнику.</h2>
      <p className="sectionIntro">
        {researchDraft
          ? "Это исследовательский черновик: опоры собраны по вторичным источникам, сцены и таймкоды предварительные. После блокировки точного мастера каждое утверждение должно быть заново воспроизведено и привязано к проверенной сцене."
          : "Каждое видимое утверждение можно проследить до записи доказательства, сцены, таймкода и источника."}
      </p>
      <div className="evidenceMapList">
        {entries.map((entry, index) => (
          <details className="evidenceMapClaim" key={entry.id} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{entry.label}</strong>
              <small>{entry.support.evidenceIds.length} опор · {entry.support.counterevidenceIds?.length ?? 0} контропор</small>
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
    </section>
  );
}
