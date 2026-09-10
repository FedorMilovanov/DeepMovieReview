import type {
  AutopsyModule,
  BiblicalSynthesisModule,
  CharactersModule,
  CraftModule,
  DecisionModule,
  FamilyYouthModule,
  MeaningModule,
  PermissionModule,
  RelationshipModule,
  SourcesMethodModule,
  StoryModule,
  TeachingSignalsModule,
} from "@/lib/film-package";
import {
  canRevealSpoiler,
  filterBySpoilerLevel,
  type SpoilerLevel,
} from "@/lib/spoilers";

function ModuleHeader({ eyebrow, heading }: { eyebrow?: string; heading: string }) {
  return (
    <>
      <div className="sectionIndex">{eyebrow ?? "ANALYSIS"}</div>
      <h2>{heading}</h2>
    </>
  );
}

function humanizeEnum(value: string) {
  return value.replaceAll("_", " ");
}

export function StoryModuleView({ module, spoilerLevel }: { module: StoryModule; spoilerLevel: SpoilerLevel }) {
  const beats = filterBySpoilerLevel(module.beats, spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmModuleStory">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <p className="sectionIntro">{module.summary}</p>
      <ol className="storyTrack">
        {beats.map((beat, index) => (
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
              <div><dt>Wants</dt><dd>{character.wants}</dd></div>
              <div><dt>Fears</dt><dd>{character.fears}</dd></div>
              <div><dt>Contradiction</dt><dd>{character.contradiction}</dd></div>
              {character.believes ? <div><dt>Believes</dt><dd>{character.believes}</dd></div> : null}
              {character.selfDeception ? <div><dt>Self-deception</dt><dd>{character.selfDeception}</dd></div> : null}
              {character.arcSummary ? <div><dt>Arc</dt><dd>{character.arcSummary}</dd></div> : null}
              {character.roleInArgument ? <div><dt>Role</dt><dd>{character.roleInArgument}</dd></div> : null}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RelationshipModuleView({ module, spoilerLevel }: { module: RelationshipModule; spoilerLevel: SpoilerLevel }) {
  const events = filterBySpoilerLevel(module.events, spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="relationshipPanel">
        <div>
          <span className="microLabel">{module.label}</span>
          <p>{module.summary}</p>
        </div>
        <ol className="relationshipTrace">
          {events.map((event) => (
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

export function FamilyYouthModuleView({ module, spoilerLevel }: { module: FamilyYouthModule; spoilerLevel: SpoilerLevel }) {
  const observations = filterBySpoilerLevel(module.observations, spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmFormation">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      {module.summary ? <p className="sectionIntro">{module.summary}</p> : null}
      <div className="filmObservationGrid">
        {observations.map((observation) => (
          <article key={observation.id}>
            <div className="filmObservationMeta">
              <span>{humanizeEnum(observation.domain)}</span>
              <span>Confidence / {observation.confidence}</span>
            </div>
            <h3>{observation.subject}</h3>
            <p>{observation.claim}</p>
            {observation.counterevidence ? (
              <p className="filmCounterevidence"><strong>Counterevidence</strong> {observation.counterevidence}</p>
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
      <p className="microLabel">QUESTION</p>
      <h3 className="filmModuleQuestion">{module.question}</h3>
      <div className="meaningGrid">
        <div><span>Theme</span><strong>{module.theme}</strong></div>
        <div><span>Apparent claim</span><strong>{module.apparentClaim}</strong></div>
        <div><span>Counterevidence</span><strong>{module.counterevidence}</strong></div>
        <div><span>Confidence</span><strong>{module.confidence}</strong></div>
      </div>
    </section>
  );
}

export function TeachingSignalsModuleView({ module, spoilerLevel }: { module: TeachingSignalsModule; spoilerLevel: SpoilerLevel }) {
  const signals = filterBySpoilerLevel(module.signals, spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmTeachingSignals">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmSignalList">
        {signals.map((signal, index) => (
          <article key={signal.id}>
            <span className="filmSignalIndex">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="microLabel">{humanizeEnum(signal.type)} · {signal.confidence}</span>
              <h3>{signal.subject}</h3>
              <p>{signal.interpretation}</p>
              {signal.counterevidence ? (
                <p className="filmCounterevidence"><strong>Counterevidence</strong> {signal.counterevidence}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PermissionModuleView({ module, spoilerLevel }: { module: PermissionModule; spoilerLevel: SpoilerLevel }) {
  const assessments = filterBySpoilerLevel(module.assessments, spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="permissionField">
        {assessments.map((assessment) => (
          <article key={assessment.id}>
            <span className="permissionState">{assessment.state}</span>
            <h3>{assessment.subject}</h3>
            <p>{assessment.rationale}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CraftModuleView({ module, spoilerLevel }: { module: CraftModule; spoilerLevel: SpoilerLevel }) {
  const observations = filterBySpoilerLevel(module.observations, spoilerLevel);
  const pressureAssessments = filterBySpoilerLevel(module.pressureAssessments ?? [], spoilerLevel);
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmCraft">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmCraftGrid">
        {observations.map((observation) => (
          <article key={observation.id}>
            <div className="filmObservationMeta">
              <span>{humanizeEnum(observation.mechanism)}</span>
              <span>Confidence / {observation.confidence}</span>
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
              <span className="microLabel">{assessment.kind} PRESSURE {assessment.level ? `/ ${assessment.level}` : ""}</span>
              <p>{assessment.rationale}</p>
              <small>Confidence / {assessment.confidence}</small>
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
      <div className="sectionIndex">{module.eyebrow ?? "SCENE AUTOPSY"}</div>
      <div className="autopsyFrame" aria-hidden="true">
        <span>{module.sceneLabel}</span>
        <div className="autopsyCrosshair" />
      </div>
      <div className="autopsyCopy">
        <h2>{module.heading}</h2>
        <dl className="autopsyGrid">
          <div><dt>ACT</dt><dd>{module.act}</dd></div>
          <div><dt>MOTIVE</dt><dd>{module.motive}</dd></div>
          <div><dt>KNOWLEDGE</dt><dd>{module.knowledge}</dd></div>
          <div><dt>PRESSURE</dt><dd>{module.pressure}</dd></div>
          <div><dt>CONSEQUENCE</dt><dd>{module.consequence}</dd></div>
        </dl>
        <p><strong>Claim:</strong> {module.claim}</p>
        {module.counterevidence ? <p className="sectionIntro">Counterevidence: {module.counterevidence}</p> : null}
      </div>
    </section>
  );
}

export function DecisionModuleView({ module, spoilerLevel }: { module: DecisionModule; spoilerLevel: SpoilerLevel }) {
  const facts = filterBySpoilerLevel(module.facts, spoilerLevel);
  const pressures = filterBySpoilerLevel(module.pressures, spoilerLevel);
  const dutiesOrGoods = filterBySpoilerLevel(module.dutiesOrGoods, spoilerLevel);
  const knownFacts = facts.filter((fact) => fact.knowledgeState === "KNOWN_TO_CHARACTER" || fact.knowledgeState === "REASONABLY_INFERABLE");
  const withheldFacts = facts.filter((fact) => fact.knowledgeState === "UNKNOWN_AT_TIME" || fact.knowledgeState === "REVEALED_LATER");
  const showJudgment = module.editorialJudgment
    ? canRevealSpoiler(spoilerLevel, module.editorialJudgment.spoilerLevel)
    : false;

  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmDecision">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <h3 className="filmModuleQuestion">{module.prompt}</h3>
      <div className="filmDecisionOptions">
        {module.options.map((option) => (
          <article key={option.id} data-available={option.availableAtDecisionTime}>
            <span className="microLabel">{option.availableAtDecisionTime ? "AVAILABLE THEN" : "NOT AVAILABLE THEN"}</span>
            <strong>{option.label}</strong>
            {option.description ? <p>{option.description}</p> : null}
          </article>
        ))}
      </div>
      <div className="filmKnowledgeGrid">
        <article>
          <span className="microLabel">KNOWN / INFERABLE THEN</span>
          {knownFacts.map((fact) => <p key={fact.id}><strong>{humanizeEnum(fact.knowledgeState)}</strong> {fact.text}</p>)}
        </article>
        <article className="filmKnowledgeFog">
          <span className="microLabel">UNKNOWN / REVEALED LATER</span>
          {withheldFacts.map((fact) => <p key={fact.id}><strong>{humanizeEnum(fact.knowledgeState)}</strong> {fact.text}</p>)}
        </article>
      </div>
      <div className="filmDecisionContext">
        <article>
          <span className="microLabel">PRESSURES</span>
          {pressures.map((pressure) => <p key={pressure.id}><strong>{humanizeEnum(pressure.kind)}</strong> {pressure.summary}</p>)}
        </article>
        <article>
          <span className="microLabel">DUTIES / GOODS</span>
          {dutiesOrGoods.map((duty) => <p key={duty.id}><strong>{duty.label}</strong>{duty.summary ? ` ${duty.summary}` : ""}</p>)}
        </article>
      </div>
      {showJudgment && module.editorialJudgment ? (
        <article className="filmDecisionJudgment">
          <span className="microLabel">EDITORIAL JUDGMENT / {module.editorialJudgment.confidence}</span>
          <p>{module.editorialJudgment.claim}</p>
          {module.editorialJudgment.qualification ? <p className="filmCounterevidence">{module.editorialJudgment.qualification}</p> : null}
        </article>
      ) : null}
    </section>
  );
}

export function BiblicalSynthesisModuleView({ module }: { module: BiblicalSynthesisModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule biblicalSection">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <ol className="synthesisSteps">
        <li><span>Observation</span><p>{module.observation}</p></li>
        <li><span>Principle</span><p>{module.principle}</p></li>
        <li><span>Scripture</span><p>{module.scriptureRefs.join(" · ")}</p></li>
        <li><span>Application</span><p>{module.application}</p></li>
        <li><span>Qualification</span><p>{module.qualification}</p></li>
      </ol>
    </section>
  );
}

export function SourcesMethodModuleView({ module }: { module: SourcesMethodModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmSourcesMethod">
      <ModuleHeader eyebrow={module.eyebrow} heading={module.heading} />
      <div className="filmMethodMeta">
        <div><span>Methodology</span><strong>{module.methodologyVersion}</strong></div>
        <div><span>Editorial revision</span><strong>{module.editorialRevision}</strong></div>
        <div><span>Analyzed edition</span><strong>{module.analyzedEdition}</strong></div>
        <div><span>Last reviewed</span><strong>{module.lastReviewedAt ?? "Not published"}</strong></div>
      </div>
      <ol className="filmSourceList">
        {module.sources.map((source) => (
          <li key={source.id}>
            <span className="microLabel">{source.kind}</span>
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
