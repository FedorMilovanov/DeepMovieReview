import type {
  AutopsyModule,
  BiblicalSynthesisModule,
  CharactersModule,
  MeaningModule,
  PermissionModule,
  RelationshipModule,
  SourcesMethodModule,
  StoryModule,
} from "@/lib/film-package";
import { filterBySpoilerLevel, type SpoilerLevel } from "@/lib/spoilers";

function ModuleHeader({ eyebrow, heading }: { eyebrow?: string; heading: string }) {
  return (
    <>
      <div className="sectionIndex">{eyebrow ?? "ANALYSIS"}</div>
      <h2>{heading}</h2>
    </>
  );
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
