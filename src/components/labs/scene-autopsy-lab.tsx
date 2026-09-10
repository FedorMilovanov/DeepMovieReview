"use client";

import { useState } from "react";
import styles from "./scene-autopsy-lab.module.css";

type EvidenceAnchor = {
  id: string;
  index: string;
  label: string;
  x: number;
  y: number;
  kind: "gesture" | "object" | "reaction" | "space";
  observation: string;
  supports: string;
  limitation: string;
};

const ANCHORS: EvidenceAnchor[] = [
  {
    id: "hand-on-door",
    index: "01",
    label: "Blocked exit",
    x: 72,
    y: 51,
    kind: "gesture",
    observation: "Character A keeps one hand on the door while asking Character B to remain in the room.",
    supports: "The request is accompanied by spatial control, so pressure is not purely verbal.",
    limitation: "The gesture alone cannot establish intent; earlier dialogue is required to interpret motive.",
  },
  {
    id: "hidden-letter",
    index: "02",
    label: "Concealed letter",
    x: 37,
    y: 69,
    kind: "object",
    observation: "A material piece of information remains partially hidden behind Character A after disclosure is requested.",
    supports: "The scene gives visual evidence that Character A still controls relevant knowledge.",
    limitation: "The viewer sees the object more clearly than Character B does, so viewer knowledge must not be assigned to the character.",
  },
  {
    id: "reaction",
    index: "03",
    label: "Reaction before answer",
    x: 57,
    y: 34,
    kind: "reaction",
    observation: "Character B looks toward the concealed object before Character A answers the question.",
    supports: "Suspicion exists before the explicit disclosure, which changes how later silence is interpreted.",
    limitation: "A reaction shot communicates suspicion, not certainty about the hidden fact.",
  },
  {
    id: "distance",
    index: "04",
    label: "Closing distance",
    x: 48,
    y: 55,
    kind: "space",
    observation: "The physical distance between the characters narrows while the available exit remains behind Character A.",
    supports: "Blocking increases interpersonal pressure even though no explicit threat is spoken.",
    limitation: "Spatial pressure should not be described as physical violence without additional evidence.",
  },
];

const FORENSIC_ROWS = [
  ["ACT", "Concealment while requesting continued trust"],
  ["MOTIVE", "Protection mixed with desire to retain control"],
  ["KNOWLEDGE", "Character A knows the withheld fact; Character B has suspicion, not certainty"],
  ["PRESSURE", "Moderate interpersonal and spatial pressure"],
  ["CONSEQUENCE", "The later disclosure converts suspicion into a trust rupture"],
] as const;

export function SceneAutopsyLab() {
  const [selectedId, setSelectedId] = useState(ANCHORS[0].id);
  const selected = ANCHORS.find((anchor) => anchor.id === selectedId) ?? ANCHORS[0];

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / SCENE AUTOPSY / PHASE A</p>
        <h1>Evidence should be inspectable before a verdict is persuasive.</h1>
        <p className={styles.lede}>
          This semantic prototype links visual anchors to observations, claims and limitations. Depth, masks and relighting are deliberately absent until this evidence relationship works without GPU enhancement.
        </p>
      </header>

      <section className={styles.autopsy} aria-labelledby="scene-title">
        <div className={styles.sceneTopline}>
          <div>
            <span>SCENE / FIXTURE / 01:17:34</span>
            <h2 id="scene-title">Concealment under pressure</h2>
          </div>
          <p>Fixture evidence only / no published film judgment</p>
        </div>

        <div className={styles.workspace}>
          <div className={styles.scenePanel}>
            <div className={styles.sceneArt}>
              <span className={styles.doorway} aria-hidden="true" />
              <span className={styles.personA} aria-hidden="true" />
              <span className={styles.personB} aria-hidden="true" />
              <span className={styles.letter} aria-hidden="true" />
              <span className={styles.sceneLight} aria-hidden="true" />
              {ANCHORS.map((anchor) => (
                <button
                  type="button"
                  key={anchor.id}
                  className={styles.anchor}
                  style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                  data-active={selected.id === anchor.id}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => setSelectedId(anchor.id)}
                >
                  <span>{anchor.index}</span>
                </button>
              ))}
            </div>
            <div className={styles.frameMeta}>
              <span>ANCHORS / {ANCHORS.length}</span>
              <span>NO DEPTH / NO GPU</span>
            </div>
          </div>

          <article id="scene-evidence-inspector" className={styles.evidenceInspector} aria-live="polite">
            <div className={styles.inspectorTopline}>
              <span>EVIDENCE / {selected.index}</span>
              <span>{selected.kind}</span>
            </div>
            <h3>{selected.label}</h3>
            <dl>
              <div><dt>Observation</dt><dd>{selected.observation}</dd></div>
              <div><dt>Supports</dt><dd>{selected.supports}</dd></div>
              <div><dt>Limitation</dt><dd>{selected.limitation}</dd></div>
            </dl>
          </article>
        </div>

        <div className={styles.evidenceList} aria-label="Scene evidence anchors">
          {ANCHORS.map((anchor) => (
            <button
              key={anchor.id}
              type="button"
              aria-pressed={selected.id === anchor.id}
              aria-controls="scene-evidence-inspector"
              onClick={() => setSelectedId(anchor.id)}
            >
              <span>{anchor.index}</span>
              <strong>{anchor.label}</strong>
              <small>{anchor.kind}</small>
            </button>
          ))}
        </div>

        <div className={styles.forensicGrid}>
          <div className={styles.forensicRows}>
            {FORENSIC_ROWS.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
          <article className={styles.claimPanel}>
            <span>FEATURED CLAIM</span>
            <h3>The scene makes control visible before the dialogue admits it.</h3>
            <p>
              The claim depends on multiple evidence records together: withheld knowledge, spatial pressure and a reaction that signals suspicion. No single anchor proves the entire interpretation.
            </p>
            <aside>
              <strong>Counterevidence</strong>
              <p>Character A also creates a real opportunity for Character B to leave later in the scene, which complicates any stronger claim of coercion.</p>
            </aside>
          </article>
        </div>
      </section>

      <section className={styles.rules} aria-labelledby="autopsy-rules-title">
        <p className={styles.kicker}>PHASE A GATES</p>
        <h2 id="autopsy-rules-title">GPU enhancement is allowed only after the evidence model stands on its own.</h2>
        <div className={styles.ruleGrid}>
          <article><span>01</span><strong>Anchor ≠ claim</strong><p>A visual point identifies evidence; interpretation remains a separate argued record.</p></article>
          <article><span>02</span><strong>Knowledge stays scoped</strong><p>What the viewer sees cannot silently become what the character knew.</p></article>
          <article><span>03</span><strong>Counterevidence remains visible</strong><p>The interface must make overclaiming harder, not prettier.</p></article>
          <article><span>04</span><strong>One keyboard path</strong><p>The evidence list is the canonical keyboard and assistive-technology control surface; visual anchors remain pointer affordances.</p></article>
        </div>
      </section>
    </div>
  );
}
