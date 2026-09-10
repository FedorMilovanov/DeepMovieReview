"use client";

import { useState } from "react";
import styles from "./relationship-observatory-lab.module.css";

type Tone = "trust" | "fracture" | "pressure" | "repair";

type RelationshipEvent = {
  id: string;
  label: string;
  eyebrow: string;
  tone: Tone;
  summary: string;
  shifts: Array<{
    dimension: "Trust" | "Truthfulness" | "Power" | "Boundaries" | "Repair";
    before: string;
    after: string;
  }>;
};

const EVENTS: RelationshipEvent[] = [
  {
    id: "shared-dependence",
    label: "Shared dependence",
    eyebrow: "OPENING / TRUST",
    tone: "trust",
    summary: "Need creates genuine cooperation, but neither person has yet tested whether trust can survive costly truth.",
    shifts: [
      { dimension: "Trust", before: "Tentative", after: "Growing" },
      { dimension: "Truthfulness", before: "Selective", after: "More open" },
      { dimension: "Power", before: "Guarded", after: "More balanced" },
      { dimension: "Boundaries", before: "Unclear", after: "Still unclear" },
      { dimension: "Repair", before: "Not required", after: "Not required" },
    ],
  },
  {
    id: "concealment",
    label: "Concealment",
    eyebrow: "FRACTURE / CONTROL",
    tone: "fracture",
    summary: "Information is withheld in the name of protection. Care becomes mixed with unilateral control.",
    shifts: [
      { dimension: "Trust", before: "Growing", after: "Damaged" },
      { dimension: "Truthfulness", before: "More open", after: "Withheld" },
      { dimension: "Power", before: "More balanced", after: "Asymmetric" },
      { dimension: "Boundaries", before: "Unclear", after: "Crossed" },
      { dimension: "Repair", before: "Not required", after: "Needed, unaddressed" },
    ],
  },
  {
    id: "confrontation",
    label: "Confrontation",
    eyebrow: "PRESSURE / DISCLOSURE",
    tone: "pressure",
    summary: "The hidden power imbalance becomes explicit. Truth arrives under pressure rather than through voluntary honesty.",
    shifts: [
      { dimension: "Trust", before: "Damaged", after: "Ruptured" },
      { dimension: "Truthfulness", before: "Withheld", after: "Forced disclosure" },
      { dimension: "Power", before: "Asymmetric", after: "Contested" },
      { dimension: "Boundaries", before: "Crossed", after: "Named" },
      { dimension: "Repair", before: "Needed", after: "Possible, absent" },
    ],
  },
  {
    id: "costly-honesty",
    label: "Costly honesty",
    eyebrow: "TURN / RESPONSIBILITY",
    tone: "repair",
    summary: "One person accepts a real cost in order to tell the truth without controlling the other person’s response.",
    shifts: [
      { dimension: "Trust", before: "Ruptured", after: "Fragile" },
      { dimension: "Truthfulness", before: "Forced", after: "Voluntary" },
      { dimension: "Power", before: "Contested", after: "More shared" },
      { dimension: "Boundaries", before: "Named", after: "Respected" },
      { dimension: "Repair", before: "Possible", after: "Begins" },
    ],
  },
  {
    id: "partial-repair",
    label: "Partial repair",
    eyebrow: "AFTERMATH / TEST",
    tone: "repair",
    summary: "Reconciliation is treated as a process. One truthful act opens repair but does not erase prior harm.",
    shifts: [
      { dimension: "Trust", before: "Fragile", after: "Tested" },
      { dimension: "Truthfulness", before: "Voluntary", after: "Must become sustained" },
      { dimension: "Power", before: "More shared", after: "Shared, still tested" },
      { dimension: "Boundaries", before: "Respected", after: "Maintained" },
      { dimension: "Repair", before: "Begins", after: "Partial, ongoing" },
    ],
  },
];

const TONE_LABEL: Record<Tone, string> = {
  trust: "Trust",
  fracture: "Fracture",
  pressure: "Pressure",
  repair: "Repair",
};

export function RelationshipObservatoryLab() {
  const [selectedId, setSelectedId] = useState(EVENTS[1].id);
  const selected = EVENTS.find((event) => event.id === selectedId) ?? EVENTS[0];

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / RELATIONSHIP OBSERVATORY / V0</p>
        <h1>Relationships change through choices, not labels.</h1>
        <p className={styles.lede}>
          This lab tests a qualitative relationship model. It shows where trust fractures, how power shifts, whether boundaries are respected and what repair actually requires — without inventing a fake relationship score.
        </p>
      </header>

      <section className={styles.observatory} aria-labelledby="relationship-title">
        <div className={styles.relationshipHeader}>
          <div>
            <span>RELATIONSHIP / FIXTURE</span>
            <h2 id="relationship-title">Character A <em>↔</em> Character B</h2>
          </div>
          <p>Protection, truth and control</p>
        </div>

        <div className={styles.traceWrap}>
          <svg className={styles.traceSvg} viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.traceBase} d="M40 90 C180 60 260 60 370 96 S570 132 660 84 S820 48 960 72" />
            <path className={styles.traceFracture} d="M250 72 C305 70 335 84 370 96 S470 124 520 118" />
            <path className={styles.traceRepair} d="M650 86 C760 48 830 48 960 72" />
          </svg>

          <ol className={styles.eventRail} aria-label="Relationship events">
            {EVENTS.map((event, index) => (
              <li key={event.id}>
                <button
                  type="button"
                  className={styles.eventButton}
                  data-tone={event.tone}
                  aria-pressed={selected.id === event.id}
                  onClick={() => setSelectedId(event.id)}
                >
                  <span className={styles.eventNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.eventDot} aria-hidden="true" />
                  <span className={styles.eventText}>
                    <small>{event.eyebrow}</small>
                    <strong>{event.label}</strong>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.detailGrid}>
          <article className={styles.selectedEvent} data-tone={selected.tone}>
            <span className={styles.detailEyebrow}>{TONE_LABEL[selected.tone]} / selected event</span>
            <h3>{selected.label}</h3>
            <p>{selected.summary}</p>
            <div className={styles.readingKey} aria-label="Reading key">
              <span data-tone="trust">Trust</span>
              <span data-tone="fracture">Fracture</span>
              <span data-tone="pressure">Pressure</span>
              <span data-tone="repair">Repair</span>
            </div>
          </article>

          <div className={styles.dimensionTable} role="table" aria-label={`Relationship changes at ${selected.label}`}>
            <div className={styles.tableHead} role="row">
              <span role="columnheader">Dimension</span>
              <span role="columnheader">Before</span>
              <span role="columnheader">After</span>
            </div>
            {selected.shifts.map((shift) => (
              <div className={styles.shiftRow} role="row" key={shift.dimension}>
                <strong role="cell">{shift.dimension}</strong>
                <span role="cell">{shift.before}</span>
                <span role="cell" className={styles.afterValue}>{shift.after}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.rules} aria-labelledby="relationship-rules-title">
        <p className={styles.kicker}>PASS / FAIL RULES</p>
        <h2 id="relationship-rules-title">The visual must explain a relationship even when animation is removed.</h2>
        <div className={styles.ruleGrid}>
          <article><span>01</span><strong>No pseudo-precision</strong><p>Trust is described through evidence-backed changes, not “72/100”.</p></article>
          <article><span>02</span><strong>Power is visible</strong><p>Care, coercion, dependence and control must not collapse into one “chemistry” label.</p></article>
          <article><span>03</span><strong>Repair has conditions</strong><p>Forgiveness or reconciliation is shown as a process with truth, boundaries and responsibility.</p></article>
          <article><span>04</span><strong>Mobile stays semantic</strong><p>The horizontal trace becomes an ordinary vertical event sequence without losing meaning.</p></article>
        </div>
      </section>
    </div>
  );
}
