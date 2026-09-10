import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How DeepMovieReview separates film craft, story, psychology, relationships, narrative meaning, moral analysis and biblical synthesis.",
};

const lenses = [
  ["Story", "Premise, plot structure, causality, turns, resolution and how the ending reshapes the whole story."],
  ["People", "Character desire, fear, contradiction, psychological realism, formation and role in the film's argument."],
  ["Relationships", "Trust, truthfulness, power, boundaries, responsibility, loyalty, conflict, forgiveness and repair."],
  ["Family / Youth", "Parents, adult examples, authority, peer pressure, rebellion/autonomy, maturation and consequences."],
  ["Ideas / Meaning", "Themes, narrative questions, apparent claims, worldview assumptions, counterevidence and confidence."],
  ["Narrative Permission", "What the story condemns, makes costly, questions, leaves unchallenged, normalizes, rewards or celebrates."],
  ["Craft / Form", "How camera, editing, music, acting, genre, humor and point of view shape sympathy and imitation pressure."],
  ["Moral Forensics", "Acts, motives, knowledge, freedom, pressure, responsibility, consequences, repentance and redemptive movement."],
  ["Biblical Lens", "Scripture-grounded principles, careful application, qualifications and a prose-first final synthesis."],
] as const;

const axioms = [
  ["Depiction ≠ Endorsement", "Showing evil does not by itself mean the film approves of evil."],
  ["Explanation ≠ Justification", "Understanding why a person acts does not automatically excuse the action."],
  ["Representation ≠ Prescription", "Showing a family, relationship or social pattern does not automatically prescribe it as a model."],
  ["Moral Severity ≠ Film Quality", "A film can depict grave evil and still be artistically excellent or morally clear about what it depicts."],
  ["Editorial ≠ Crowd", "Editorial conclusions and future audience ratings remain separate datasets."],
  ["Popularity ≠ Biblical Authority", "Community agreement can describe reception; it cannot define biblical truth."],
] as const;

export default function MethodologyPage() {
  return (
    <>
      <section className="sectionShell methodologyHero" aria-labelledby="methodology-title">
        <div className="sectionIndex">METHODOLOGY / WORKING FOUNDATION</div>
        <h1 id="methodology-title">Understand the film first. Judge from evidence second.</h1>
        <p className="sectionIntro">
          DeepMovieReview is not designed as a sin counter or a single moral score. The method separates what a film is, what it depicts, how it frames what it depicts, what its characters know and choose, and how those claims should finally be evaluated.
        </p>
        <p className="fixtureNotice">
          The public methodology is still being calibrated. Current definitions are an inspectable working foundation and will be versioned as real-film analysis exposes weaknesses.
        </p>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="axioms-title">
        <div className="sectionIndex">01 / INTERPRETIVE AXIOMS</div>
        <h2 id="axioms-title">Do not collapse different questions into one verdict.</h2>
        <div className="methodologyAxioms">
          {axioms.map(([title, copy]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule" aria-labelledby="lenses-method-title">
        <div className="sectionIndex">02 / WHOLE-FILM LENSES</div>
        <h2 id="lenses-method-title">The moral layer is deep because the film layer comes first.</h2>
        <div className="methodologyLensList">
          {lenses.map(([title, copy], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionShell sectionRule methodologyEvidence" aria-labelledby="evidence-title">
        <div>
          <div className="sectionIndex">03 / EVIDENCE CHAIN</div>
          <h2 id="evidence-title">Claims should be traceable back to scenes.</h2>
        </div>
        <ol>
          <li><span>Observation</span><p>What actually happens on screen?</p></li>
          <li><span>Claim</span><p>What interpretation are we proposing?</p></li>
          <li><span>Evidence</span><p>Which scenes, choices, reactions or formal devices support it?</p></li>
          <li><span>Counterevidence</span><p>What in the film complicates our preferred reading?</p></li>
          <li><span>Confidence</span><p>How strongly can the interpretation be asserted?</p></li>
          <li><span>Norm</span><p>Which biblical principle is actually relevant, and at what level of certainty?</p></li>
          <li><span>Synthesis</span><p>What is the final prose conclusion without reducing the film to one number?</p></li>
        </ol>
      </section>

      <section className="sectionShell sectionRule methodologyPermission" aria-labelledby="permission-method-title">
        <div className="sectionIndex">04 / NARRATIVE PERMISSION</div>
        <h2 id="permission-method-title">“Not condemned” is not the same as “celebrated.”</h2>
        <div className="permissionScale" role="list" aria-label="Narrative Permission states">
          {[
            "CONDEMNED",
            "COSTLY",
            "QUESTIONED",
            "UNCHALLENGED",
            "NORMALIZED",
            "REWARDED",
            "CELEBRATED",
            "AMBIGUOUS",
          ].map((state) => <span key={state} role="listitem">{state}</span>)}
        </div>
        <p className="sectionIntro">
          These are categorical readings of a film's narrative treatment, not a red/green morality meter. Evidence and counterevidence remain necessary.
        </p>
      </section>

      <section className="sectionShell sectionRule methodologyVersion" aria-labelledby="version-title">
        <div className="sectionIndex">05 / VERSIONING + CORRECTION</div>
        <h2 id="version-title">The method must be correctable.</h2>
        <div className="meaningGrid">
          <div><span>Rubrics</span><strong>Versioned rather than silently rewritten.</strong></div>
          <div><span>Film analysis</span><strong>Claims and moral events retain revision history.</strong></div>
          <div><span>Audience</span><strong>Never merged into editorial authority.</strong></div>
          <div><span>Uncertainty</span><strong>Confidence and disputed applications remain visible.</strong></div>
        </div>
      </section>
    </>
  );
}
