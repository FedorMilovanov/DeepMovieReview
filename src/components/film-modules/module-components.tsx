import type {
  AutopsyModule,
  BiblicalSynthesisModule,
  CharactersModule,
  CraftModule,
  DecisionModule,
  FamilyYouthModule,
  MeaningModule,
  MoralAnalysisModule,
  PermissionModule,
  RelationshipModule,
  SourcesMethodModule,
  StoryModule,
  TeachingSignalsModule,
} from "@/lib/film-package";
import {
  confidenceLabels,
  craftMechanismLabels,
  decisionKnowledgeLabels,
  decisionPressureLabels,
  moralCulpabilityLabels,
  moralNarrativeStanceLabels,
  moralSeverityLabels,
  moralValenceLabels,
  narrativePermissionLabels,
  pressureKindLabels,
  repentanceLabels,
  socialFormationLabels,
  sourceKindLabels,
  teachingSignalLabels,
} from "@/lib/presentation-labels";

function ModuleHeader({ eyebrow, heading }: { eyebrow?: string; heading: string }) {
  return (
    <>
      <div className="sectionIndex">{eyebrow ?? "Разбор"}</div>
      <h2>{heading}</h2>
    </>
  );
}

export function StoryModuleView({ module }: { module: StoryModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmModuleStory">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <p className="sectionIntro">{module.summary}</p>
      <ol className="storyTrack">
        {module.beats.map((beat, index) => (
          <li key={beat.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{beat.label}</strong><p>{beat.summary}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CharactersModuleView({ module }: { module: CharactersModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="characterGrid">
        {module.characters.map((character) => (
          <article className="characterCard" key={character.id}>
            <div className="portraitPlaceholder" aria-hidden="true" />
            <h3>{character.name}</h3>
            <dl>
              <div><dt>Хочет</dt><dd>{character.wants}</dd></div>
              <div><dt>Боится</dt><dd>{character.fears}</dd></div>
              <div><dt>Противоречие</dt><dd>{character.contradiction}</dd></div>
              {character.believes ? <div><dt>Верит</dt><dd>{character.believes}</dd></div> : null}
              {character.selfDeception ? <div><dt>Самообман</dt><dd>{character.selfDeception}</dd></div> : null}
              {character.arcSummary ? <div><dt>Арка</dt><dd>{character.arcSummary}</dd></div> : null}
              {character.roleInArgument ? <div><dt>Роль</dt><dd>{character.roleInArgument}</dd></div> : null}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RelationshipModuleView({ module }: { module: RelationshipModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="relationshipPanel">
        <div>
          <span className="microLabel">{module.label}</span>
          <p>{module.summary}</p>
        </div>
        <ol className="relationshipTrace">
          {module.events.map((event) => (
            <li className={`traceEvent trace-${event.tone}`} key={event.id}>
              <span className="traceDot" aria-hidden="true" />
              <div><strong>{event.label}</strong><p>{event.change}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FamilyYouthModuleView({ module }: { module: FamilyYouthModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmFormation">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      {module.summary ? <p className="sectionIntro">{module.summary}</p> : null}
      <div className="filmObservationGrid">
        {module.observations.map((observation) => (
          <article key={observation.id}>
            <div className="filmObservationMeta">
              <span>{socialFormationLabels[observation.domain]}</span>
              <span>Достоверность / {confidenceLabels[observation.confidence]}</span>
            </div>
            <h3>{observation.subject}</h3>
            <p>{observation.claim}</p>
            {observation.counterevidence ? (
              <p className="filmCounterevidence"><strong>Контрдоказательство</strong> {observation.counterevidence}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function MeaningModuleView({ module }: { module: MeaningModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule meaningSection">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <p className="microLabel">Вопрос</p>
      <h3 className="filmModuleQuestion">{module.question}</h3>
      <div className="meaningGrid">
        <div><span>Тема</span><strong>{module.theme}</strong></div>
        <div><span>Мнимый тезис</span><strong>{module.apparentClaim}</strong></div>
        <div><span>Контрдоказательство</span><strong>{module.counterevidence}</strong></div>
        <div><span>Достоверность</span><strong>{confidenceLabels[module.confidence]}</strong></div>
      </div>
    </section>
  );
}

export function TeachingSignalsModuleView({ module }: { module: TeachingSignalsModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmTeachingSignals">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmSignalList">
        {module.signals.map((signal, index) => (
          <article key={signal.id}>
            <span className="filmSignalIndex">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="microLabel">{teachingSignalLabels[signal.type]} · {confidenceLabels[signal.confidence]}</span>
              <h3>{signal.subject}</h3>
              <p>{signal.interpretation}</p>
              {signal.counterevidence ? (
                <p className="filmCounterevidence"><strong>Контрдоказательство</strong> {signal.counterevidence}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PermissionModuleView({ module }: { module: PermissionModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="permissionField">
        {module.assessments.map((assessment) => (
          <article key={assessment.id}>
            <span className="permissionState">{narrativePermissionLabels[assessment.state]}</span>
            <h3>{assessment.subject}</h3>
            <p>{assessment.rationale}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CraftModuleView({ module }: { module: CraftModule }) {
  const pressureAssessments = module.pressureAssessments ?? [];
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmCraft">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmCraftGrid">
        {module.observations.map((observation) => (
          <article key={observation.id}>
            <div className="filmObservationMeta">
              <span>{craftMechanismLabels[observation.mechanism]}</span>
              <span>Достоверность / {confidenceLabels[observation.confidence]}</span>
            </div>
            <p>{observation.observation}</p>
            <strong>{observation.interpretiveEffect}</strong>
          </article>
        ))}
      </div>
      {pressureAssessments.length > 0 ? (
        <div className="filmPressureGrid">
          {pressureAssessments.map((assessment) => (
            <article key={assessment.id}>
              <span className="microLabel">{pressureKindLabels[assessment.kind]} давление{assessment.level ? ` / ${confidenceLabels[assessment.level]}` : ""}</span>
              <p>{assessment.rationale}</p>
              <small>Достоверность / {confidenceLabels[assessment.confidence]}</small>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function AutopsyModuleView({ module }: { module: AutopsyModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule autopsySection">
      <div className="sectionIndex">{module.eyebrow ?? "Вскрытие сцены"}</div>
      <div className="autopsyFrame" aria-hidden="true">
        <span>{module.sceneLabel}</span>
        <div className="autopsyCrosshair" />
      </div>
      <div className="autopsyCopy">
        <h2>{module.heading}</h2>
        <dl className="autopsyGrid">
          <div><dt>Акт</dt><dd>{module.act}</dd></div>
          <div><dt>Мотив</dt><dd>{module.motive}</dd></div>
          <div><dt>Знание</dt><dd>{module.knowledge}</dd></div>
          <div><dt>Давление</dt><dd>{module.pressure}</dd></div>
          <div><dt>Последствие</dt><dd>{module.consequence}</dd></div>
        </dl>
        <p><strong>Тезис:</strong> {module.claim}</p>
        {module.counterevidence ? <p className="sectionIntro">Контрдоказательство: {module.counterevidence}</p> : null}
      </div>
    </section>
  );
}

export function DecisionModuleView({ module }: { module: DecisionModule }) {
  const knownFacts = module.facts.filter(
    (fact) => fact.knowledgeState === "KNOWN_TO_CHARACTER" || fact.knowledgeState === "REASONABLY_INFERABLE",
  );
  const withheldFacts = module.facts.filter(
    (fact) => fact.knowledgeState === "UNKNOWN_AT_TIME" || fact.knowledgeState === "REVEALED_LATER",
  );

  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmDecision">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <h3 className="filmModuleQuestion">{module.prompt}</h3>
      <div className="filmDecisionOptions">
        {module.options.map((option) => (
          <article key={option.id} data-available={option.availableAtDecisionTime}>
            <span className="microLabel">{option.availableAtDecisionTime ? "Доступно тогда" : "Недоступно тогда"}</span>
            <strong>{option.label}</strong>
            {option.description ? <p>{option.description}</p> : null}
          </article>
        ))}
      </div>
      <div className="filmKnowledgeGrid">
        <article>
          <span className="microLabel">Известно / выводимо тогда</span>
          {knownFacts.map((fact) => <p key={fact.id}><strong>{decisionKnowledgeLabels[fact.knowledgeState]}</strong> {fact.text}</p>)}
        </article>
        <article className="filmKnowledgeFog">
          <span className="microLabel">Неизвестно / раскрыто позже</span>
          {withheldFacts.map((fact) => <p key={fact.id}><strong>{decisionKnowledgeLabels[fact.knowledgeState]}</strong> {fact.text}</p>)}
        </article>
      </div>
      <div className="filmDecisionContext">
        <article>
          <span className="microLabel">Давления</span>
          {module.pressures.map((pressure) => <p key={pressure.id}><strong>{decisionPressureLabels[pressure.kind]}</strong> {pressure.summary}</p>)}
        </article>
        <article>
          <span className="microLabel">Обязанности / блага</span>
          {module.dutiesOrGoods.map((duty) => <p key={duty.id}><strong>{duty.label}</strong>{duty.summary ? ` ${duty.summary}` : ""}</p>)}
        </article>
      </div>
      {module.editorialJudgment ? (
        <article className="filmDecisionJudgment">
          <span className="microLabel">Позиция редакции / {confidenceLabels[module.editorialJudgment.confidence]}</span>
          <p>{module.editorialJudgment.claim}</p>
          {module.editorialJudgment.qualification ? <p className="filmCounterevidence">{module.editorialJudgment.qualification}</p> : null}
        </article>
      ) : null}
    </section>
  );
}

export function MoralAnalysisModuleView({ module }: { module: MoralAnalysisModule }) {
  const wrongdoingCount = module.events.filter((event) => event.valence === "WRONGDOING").length;

  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmMoralAnalysis">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      {module.summary ? <p className="sectionIntro">{module.summary}</p> : null}
      <div className="filmMoralLedgerMeta" aria-label="Сводка видимых моральных событий">
        <div><span>Видимые значимые события</span><strong>{module.events.length}</strong></div>
        <div><span>Видимые проступки</span><strong>{wrongdoingCount}</strong></div>
        <p>Подсчёт событий носит описательный характер и никогда не используется как мера тяжести, качества фильма или одобрения со стороны повествования.</p>
      </div>
      <ol className="filmMoralLedger">
        {module.events.map((event, index) => (
          <li key={event.id}>
            <div className="filmMoralEventTopline">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{event.category}</span>
              <span>{moralValenceLabels[event.valence]}</span>
              <span>Достоверность / {confidenceLabels[event.confidence]}</span>
            </div>
            <h3>{event.act}</h3>
            <dl className="filmMoralEventGrid">
              {event.target ? <div><dt>Объект</dt><dd>{event.target}</dd></div> : null}
              {event.motive ? <div><dt>Мотив</dt><dd>{event.motive}</dd></div> : null}
              {event.intention ? <div><dt>Намерение</dt><dd>{event.intention}</dd></div> : null}
              {event.knowledge ? <div><dt>Знание</dt><dd>{event.knowledge}</dd></div> : null}
              {event.freedom ? <div><dt>Свобода</dt><dd>{event.freedom}</dd></div> : null}
              {event.pressure ? <div><dt>Давление</dt><dd>{event.pressure}</dd></div> : null}
              {event.foreseeability ? <div><dt>Предвидимость</dt><dd>{event.foreseeability}</dd></div> : null}
              {event.consequence ? <div><dt>Последствие</dt><dd>{event.consequence}</dd></div> : null}
              {event.responsibility ? <div><dt>Ответственность</dt><dd>{event.responsibility}</dd></div> : null}
              {event.severity ? <div><dt>Тяжесть проступка</dt><dd>{moralSeverityLabels[event.severity]}</dd></div> : null}
              {event.culpability ? <div><dt>Виновность</dt><dd>{moralCulpabilityLabels[event.culpability]}</dd></div> : null}
              {event.repentance ? <div><dt>Раскаяние / искупление</dt><dd>{repentanceLabels[event.repentance]}</dd></div> : null}
              <div><dt>Позиция повествования</dt><dd>{moralNarrativeStanceLabels[event.narrativeStance]}</dd></div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BiblicalSynthesisModuleView({ module }: { module: BiblicalSynthesisModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule biblicalSection">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <ol className="synthesisSteps">
        <li><span>Наблюдение</span><p>{module.observation}</p></li>
        <li><span>Принцип</span><p>{module.principle}</p></li>
        <li><span>Писание</span><p>{module.scriptureRefs.join(" · ")}</p></li>
        <li><span>Применение</span><p>{module.application}</p></li>
        <li><span>Оговорка</span><p>{module.qualification}</p></li>
      </ol>
    </section>
  );
}

export function SourcesMethodModuleView({ module }: { module: SourcesMethodModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmSourcesMethod">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmMethodMeta">
        <div><span>Методология</span><strong>{module.methodologyVersion}</strong></div>
        <div><span>Редакционная ревизия</span><strong>{module.editorialRevision}</strong></div>
        <div><span>Издание / статус</span><strong>{module.analyzedEdition}</strong></div>
        <div><span>Дата редакционной ревизии</span><strong>{module.lastReviewedAt ?? "Не опубликовано"}</strong></div>
      </div>
      <ol className="filmSourceList">
        {module.sources.map((source) => (
          <li key={source.id}>
            <span className="microLabel">{sourceKindLabels[source.kind]}</span>
            <div>
              {source.href ? <a href={source.href}>{source.label}</a> : <strong>{source.label}</strong>}
              {source.locator ? <p>{source.locator}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
