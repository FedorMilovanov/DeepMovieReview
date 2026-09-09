import Link from "next/link";
import { homepageFixture } from "@/lib/content";

export default function HomePage() {
  const data = homepageFixture;

  return (
    <>
      <section className="heroSection sectionShell" aria-labelledby="hero-title">
        <div className="eyebrow">Deep film analysis / shell v0</div>
        <div className="heroGrid">
          <div className="heroCopy">
            <p className="kicker">A film is more than what happens on screen.</p>
            <h1 id="hero-title">Stories teach through people, relationships, choices and consequences.</h1>
            <p className="lede">
              DeepMovieReview examines the whole film first — then argues its moral and biblical synthesis from evidence.
            </p>
            <div className="heroActions">
              <Link className="buttonPrimary" href={`/films/${data.featuredFilm.slug}`}>Open fixture</Link>
              <a className="buttonGhost" href="#lenses">See the lenses</a>
            </div>
          </div>
          <div className="livingFrame" aria-label="Living Film Frame placeholder">
            <div className="frameMeta"><span>FRAME / 0001</span><span>2.39:1</span></div>
            <div className="frameVisual" aria-hidden="true">
              <div className="frameOrb frameOrbA" />
              <div className="frameOrb frameOrbB" />
              <div className="frameHorizon" />
            </div>
            <div className="frameCaption">
              <strong>{data.featuredFilm.title}</strong>
              <span>{data.featuredFilm.thesisQuestion}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="lenses" className="sectionShell sectionRule" aria-labelledby="lenses-title">
        <div className="sectionIndex">02 / SIX LENSES</div>
        <h2 id="lenses-title">One film. Six ways to see deeper.</h2>
        <div className="lensGrid">
          {data.lenses.map((lens, index) => (
            <article className="lensItem" key={lens.key}>
              <span className="lensNumber">0{index + 1}</span>
              <h3>{lens.label}</h3>
              <p>{lens.prompt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule splitSection" aria-labelledby="story-title">
        <div>
          <div className="sectionIndex">03 / STORY</div>
          <h2 id="story-title">Understand the story before judging it.</h2>
          <p className="sectionIntro">Plot structure, causality and turning points remain separate from moral scoring.</p>
        </div>
        <ol className="storyTrack">
          {data.storyBeats.map((beat, index) => (
            <li key={beat.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{beat.label}</strong><p>{beat.summary}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="people-title">
        <div className="sectionIndex">04 / PEOPLE + RELATIONSHIPS</div>
        <h2 id="people-title">Characters are not moral counters. Relationships are not static labels.</h2>
        <div className="characterGrid">
          {data.characters.map((character) => (
            <article className="characterCard" key={character.id}>
              <div className="portraitPlaceholder" aria-hidden="true" />
              <h3>{character.name}</h3>
              <dl>
                <div><dt>Wants</dt><dd>{character.wants}</dd></div>
                <div><dt>Fears</dt><dd>{character.fears}</dd></div>
                <div><dt>Contradiction</dt><dd>{character.contradiction}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="relationshipPanel" aria-labelledby="relationship-title">
          <div>
            <span className="microLabel">RELATIONSHIP OBSERVATORY</span>
            <h3 id="relationship-title">{data.relationship.label}</h3>
            <p>{data.relationship.summary}</p>
          </div>
          <ol className="relationshipTrace">
            {data.relationship.events.map((event) => (
              <li className={`traceEvent trace-${event.tone}`} key={event.id}>
                <span className="traceDot" aria-hidden="true" />
                <div><strong>{event.label}</strong><p>{event.change}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sectionShell sectionRule splitSection" aria-labelledby="family-title">
        <div>
          <div className="sectionIndex">05 / FAMILY + YOUTH</div>
          <h2 id="family-title">What kind of adulthood does the story model?</h2>
          <p className="sectionIntro">Parents, peers, authority, rebellion, autonomy and formation are analyzed as relationships and responsibilities.</p>
        </div>
        <div className="stackList">
          {data.familyYouth.map((item) => (
            <article key={item.label}><span className="microLabel">{item.label}</span><p>{item.observation}</p></article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule meaningSection" aria-labelledby="meaning-title">
        <div className="sectionIndex">06 / MEANING</div>
        <p className="microLabel">QUESTION</p>
        <h2 id="meaning-title">{data.meaning.question}</h2>
        <div className="meaningGrid">
          <div><span>Theme</span><strong>{data.meaning.theme}</strong></div>
          <div><span>Apparent claim</span><strong>{data.meaning.apparentClaim}</strong></div>
          <div><span>Counterevidence</span><strong>{data.meaning.counterevidence}</strong></div>
          <div><span>Confidence</span><strong>{data.meaning.confidence}</strong></div>
        </div>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="permission-title">
        <div className="sectionIndex">07 / NARRATIVE PERMISSION</div>
        <h2 id="permission-title">What does the film make costly, questionable, normal or rewarding?</h2>
        <div className="permissionField">
          {data.permissions.map((permission) => (
            <article key={permission.subject}>
              <span className="permissionState">{permission.state}</span>
              <h3>{permission.subject}</h3>
              <p>{permission.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule splitSection" aria-labelledby="craft-title">
        <div>
          <div className="sectionIndex">08 / FORM SHAPES SYMPATHY</div>
          <h2 id="craft-title">What does the film make us feel before it asks us to think?</h2>
        </div>
        <div className="stackList">
          {data.craft.map((item) => (
            <article key={item.device}><span className="microLabel">{item.device}</span><p>{item.effect}</p></article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule autopsySection" aria-labelledby="autopsy-title">
        <div className="sectionIndex">09 / SCENE AUTOPSY</div>
        <div className="autopsyFrame" aria-hidden="true"><span>SCENE / FIXTURE</span><div className="autopsyCrosshair" /></div>
        <div className="autopsyCopy">
          <h2 id="autopsy-title">Evidence before conclusion.</h2>
          <dl className="autopsyGrid">
            <div><dt>ACT</dt><dd>{data.sceneAutopsy.act}</dd></div>
            <div><dt>MOTIVE</dt><dd>{data.sceneAutopsy.motive}</dd></div>
            <div><dt>KNOWLEDGE</dt><dd>{data.sceneAutopsy.knowledge}</dd></div>
            <div><dt>PRESSURE</dt><dd>{data.sceneAutopsy.pressure}</dd></div>
            <div><dt>CONSEQUENCE</dt><dd>{data.sceneAutopsy.consequence}</dd></div>
          </dl>
        </div>
      </section>

      <section className="sectionShell sectionRule decisionSection" aria-labelledby="decision-title">
        <div className="sectionIndex">10 / DECISION + KNOWLEDGE FOG</div>
        <h2 id="decision-title">{data.decision.question}</h2>
        <div className="knowledgeGrid">
          <article><span className="microLabel">KNOWN THEN</span>{data.decision.knownThen.map((item) => <p key={item}>{item}</p>)}</article>
          <article className="fogPanel"><span className="microLabel">REVEALED LATER</span>{data.decision.revealedLater.map((item) => <p key={item}>{item}</p>)}</article>
        </div>
      </section>

      <section id="method" className="sectionShell sectionRule biblicalSection" aria-labelledby="biblical-title">
        <div className="sectionIndex">11 / BIBLICAL LENS + SYNTHESIS</div>
        <h2 id="biblical-title">The norm comes after careful description.</h2>
        <ol className="synthesisSteps">
          <li><span>Observation</span><p>{data.biblicalSynthesis.observation}</p></li>
          <li><span>Principle</span><p>{data.biblicalSynthesis.principle}</p></li>
          <li><span>Application</span><p>{data.biblicalSynthesis.application}</p></li>
          <li><span>Qualification</span><p>{data.biblicalSynthesis.qualification}</p></li>
        </ol>
      </section>

      <section className="sectionShell sectionRule discoverySection" aria-labelledby="discovery-title">
        <div>
          <div className="sectionIndex">12 / DISCOVERY</div>
          <h2 id="discovery-title">Build the platform first. Then let every film deepen the atlas.</h2>
          <p className="sectionIntro">Films will later connect through themes, relationships, dilemmas, narrative permissions and biblical principles.</p>
        </div>
        <div className="discoveryLinks">
          <Link href="/films">Browse film shell</Link>
          <a href="/#lenses">Explore lenses</a>
          <a href="/#method">Read the method preview</a>
        </div>
      </section>
    </>
  );
}
