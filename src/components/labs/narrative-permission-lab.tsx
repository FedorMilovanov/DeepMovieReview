"use client";

import { useState } from "react";
import styles from "./narrative-permission-lab.module.css";

type PermissionState =
  | "CONDEMNED"
  | "COSTLY"
  | "QUESTIONED"
  | "UNCHALLENGED"
  | "NORMALIZED"
  | "REWARDED"
  | "CELEBRATED"
  | "AMBIGUOUS";

type SignalKind = "Consequence" | "Framing" | "Repetition" | "Reward" | "Correction" | "Ending";

type Assessment = {
  id: string;
  subject: string;
  state: PermissionState;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  thesis: string;
  evidence: Array<{ kind: SignalKind; reading: string }>;
  counterevidence: string;
};

const STATE_COPY: Record<PermissionState, string> = {
  CONDEMNED: "The narrative supplies substantial negative judgment, correction or consequence.",
  COSTLY: "The behavior carries serious cost, but cost alone does not prove explicit condemnation.",
  QUESTIONED: "The narrative creates pressure against the behavior without settling the issue cleanly.",
  UNCHALLENGED: "The behavior appears without meaningful correction. Absence of challenge is not yet normalization.",
  NORMALIZED: "Repeated framing makes the behavior feel ordinary or expected, with little meaningful friction.",
  REWARDED: "The behavior materially helps a character obtain a desired outcome. Reward is not identical to celebration.",
  CELEBRATED: "Form, outcome and narrative emphasis jointly invite admiration or aspiration.",
  AMBIGUOUS: "Evidence points in materially different directions and the film does not resolve the tension.",
};

const ASSESSMENTS: Assessment[] = [
  {
    id: "protective-deception",
    subject: "Protective deception",
    state: "COSTLY",
    confidence: "HIGH",
    thesis: "Concealment produces relational damage, while the film still grants understandable motives to the person who lies.",
    evidence: [
      { kind: "Consequence", reading: "Trust fractures after the concealment becomes known." },
      { kind: "Framing", reading: "The liar remains emotionally intelligible rather than reduced to a villain." },
      { kind: "Correction", reading: "Repair later requires voluntary truth." },
    ],
    counterevidence: "The concealment prevents an immediate conflict, so the narrative does not portray every short-term effect as harmful.",
  },
  {
    id: "absent-parenting",
    subject: "Emotionally absent parenting",
    state: "UNCHALLENGED",
    confidence: "MEDIUM",
    thesis: "The pattern is visible, but the story rarely pauses to identify it as a cause of later family damage.",
    evidence: [
      { kind: "Repetition", reading: "The adult repeatedly withdraws during moments that require presence." },
      { kind: "Correction", reading: "No explicit confrontation names the absence itself." },
      { kind: "Ending", reading: "The final reconciliation does not directly revisit this pattern." },
    ],
    counterevidence: "Several reaction shots imply that the younger character experiences the absence as painful.",
  },
  {
    id: "peer-cruelty",
    subject: "Status through peer cruelty",
    state: "REWARDED",
    confidence: "MEDIUM",
    thesis: "Cruel behavior produces social status inside the peer group, even though later scenes begin to expose its interpersonal cost.",
    evidence: [
      { kind: "Reward", reading: "Mockery immediately produces laughter, belonging and influence." },
      { kind: "Repetition", reading: "The tactic works more than once before any cost appears." },
      { kind: "Consequence", reading: "A later rupture damages one important friendship." },
    ],
    counterevidence: "The later relational cost prevents the stronger claim that the film celebrates cruelty as admirable.",
  },
  {
    id: "casual-dishonesty",
    subject: "Casual dishonesty",
    state: "NORMALIZED",
    confidence: "MEDIUM",
    thesis: "Small lies recur as ordinary social technique and are rarely treated as events requiring moral attention.",
    evidence: [
      { kind: "Repetition", reading: "Minor deception appears across unrelated scenes and characters." },
      { kind: "Framing", reading: "Humor and pacing treat most instances as routine rather than disruptive." },
      { kind: "Correction", reading: "Only the major central lie receives explicit relational scrutiny." },
    ],
    counterevidence: "The story clearly distinguishes one grave deception from the casual pattern, so the categories should not be collapsed.",
  },
  {
    id: "revenge",
    subject: "Revenge as restoration",
    state: "AMBIGUOUS",
    confidence: "HIGH",
    thesis: "The film grants revenge emotional release and visual force while also showing that it cannot restore the lost relationship.",
    evidence: [
      { kind: "Framing", reading: "The revenge sequence receives the strongest audiovisual release in the final act." },
      { kind: "Reward", reading: "The protagonist achieves the immediate objective." },
      { kind: "Ending", reading: "The final image returns to unresolved grief rather than triumph." },
      { kind: "Consequence", reading: "The central loss remains irreversible." },
    ],
    counterevidence: "A viewer may reasonably read the climactic form as stronger than the quieter final qualification.",
  },
];

const STATE_GROUPS: Array<{ label: string; states: PermissionState[] }> = [
  { label: "Narrative resistance", states: ["CONDEMNED", "COSTLY", "QUESTIONED"] },
  { label: "Narrative non-resolution", states: ["UNCHALLENGED", "AMBIGUOUS"] },
  { label: "Narrative permission", states: ["NORMALIZED", "REWARDED", "CELEBRATED"] },
];

export function NarrativePermissionLab() {
  const [selectedId, setSelectedId] = useState(ASSESSMENTS[0].id);
  const selected = ASSESSMENTS.find((assessment) => assessment.id === selectedId) ?? ASSESSMENTS[0];

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / NARRATIVE PERMISSION / V0</p>
        <h1>What the film permits is not one good-to-bad scale.</h1>
        <p className={styles.lede}>
          This lab separates consequence, framing, repetition, reward, correction and ending. A behavior can be costly without being condemned, rewarded without being celebrated, or left unchallenged without yet being normalized.
        </p>
      </header>

      <section className={styles.field} aria-labelledby="permission-field-title">
        <div className={styles.fieldHeader}>
          <div>
            <span>FIELD / FIXTURE EVIDENCE</span>
            <h2 id="permission-field-title">Narrative treatment map</h2>
          </div>
          <p>Select a behavior to inspect the evidence behind its categorical reading.</p>
        </div>

        <div className={styles.stateGroups} aria-label="Narrative Permission state families">
          {STATE_GROUPS.map((group) => (
            <section key={group.label} className={styles.stateGroup}>
              <h3>{group.label}</h3>
              <div className={styles.stateChips}>
                {group.states.map((state) => (
                  <span key={state} data-active={selected.state === state}>{state}</span>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className={styles.assessmentGrid}>
          <nav className={styles.subjectList} aria-label="Fixture behaviors">
            {ASSESSMENTS.map((assessment, index) => (
              <button
                type="button"
                key={assessment.id}
                aria-pressed={selected.id === assessment.id}
                onClick={() => setSelectedId(assessment.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{assessment.subject}</strong>
                <small>{assessment.state}</small>
              </button>
            ))}
          </nav>

          <article className={styles.inspector}>
            <div className={styles.inspectorTopline}>
              <span>{selected.state}</span>
              <span>Confidence / {selected.confidence}</span>
            </div>
            <h3>{selected.subject}</h3>
            <p className={styles.stateDefinition}>{STATE_COPY[selected.state]}</p>
            <p className={styles.thesis}>{selected.thesis}</p>

            <div className={styles.signalGrid}>
              {selected.evidence.map((signal) => (
                <div key={`${selected.id}-${signal.kind}`}>
                  <span>{signal.kind}</span>
                  <p>{signal.reading}</p>
                </div>
              ))}
            </div>

            <aside className={styles.counterevidence}>
              <span>Counterevidence</span>
              <p>{selected.counterevidence}</p>
            </aside>
          </article>
        </div>
      </section>

      <section className={styles.comprehension} aria-labelledby="permission-rules-title">
        <p className={styles.kicker}>COMPREHENSION GATES</p>
        <h2 id="permission-rules-title">Three distinctions must survive the visual design.</h2>
        <div className={styles.ruleGrid}>
          <article><span>UNCHALLENGED ≠ NORMALIZED</span><p>Silence is weaker evidence than repetition plus ordinary framing.</p></article>
          <article><span>COSTLY ≠ CONDEMNED</span><p>Bad consequences do not automatically tell us what judgment the narrative makes.</p></article>
          <article><span>REWARDED ≠ CELEBRATED</span><p>A behavior may work instrumentally while the film still withholds admiration.</p></article>
          <article><span>FORM MATTERS</span><p>Music, camera, humor and performance can qualify or complicate plot-level consequences.</p></article>
        </div>
      </section>
    </div>
  );
}
