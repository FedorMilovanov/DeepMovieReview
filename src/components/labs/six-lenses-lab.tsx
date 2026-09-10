"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./six-lenses-lab.module.css";

type LensId = "STORY" | "PEOPLE" | "RELATIONSHIPS" | "IDEAS" | "MORAL WORLD" | "CRAFT";

type Lens = {
  id: LensId;
  number: string;
  question: string;
  summary: string;
  annotations: Array<{
    id: string;
    label: string;
    value: string;
    x: number;
    y: number;
    target: "A" | "B" | "SPACE" | "OBJECT";
  }>;
};

const LENSES: Lens[] = [
  {
    id: "STORY",
    number: "01",
    question: "What changes here, and why does the turn matter?",
    summary: "Story analysis tracks causal turns before any moral conclusion is attached to them.",
    annotations: [
      { id: "story-pressure", label: "TURN", value: "A withheld fact changes the conflict from uncertainty to distrust.", x: 45, y: 31, target: "SPACE" },
      { id: "story-choice", label: "CHOICE", value: "The scene forces disclosure or continued concealment.", x: 65, y: 67, target: "A" },
    ],
  },
  {
    id: "PEOPLE",
    number: "02",
    question: "What do these people want, fear and hide from themselves?",
    summary: "Character analysis distinguishes desire, fear and contradiction from a simple hero or villain label.",
    annotations: [
      { id: "people-a", label: "A / WANTS", value: "Protection without surrendering control.", x: 67, y: 48, target: "A" },
      { id: "people-b", label: "B / FEARS", value: "Being managed rather than trusted with the truth.", x: 37, y: 45, target: "B" },
    ],
  },
  {
    id: "RELATIONSHIPS",
    number: "03",
    question: "What is happening between them, not only inside them?",
    summary: "The same scene becomes a relationship event: trust, truthfulness, power, boundaries and possible repair all move.",
    annotations: [
      { id: "rel-trust", label: "TRUST", value: "Suspicion becomes a visible fracture.", x: 50, y: 42, target: "SPACE" },
      { id: "rel-power", label: "POWER", value: "One person controls both information and access to the exit.", x: 76, y: 55, target: "SPACE" },
    ],
  },
  {
    id: "IDEAS",
    number: "04",
    question: "What question about life is the story testing through this conflict?",
    summary: "Ideas are argued through events and outcomes, not extracted from one line of dialogue.",
    annotations: [
      { id: "ideas-question", label: "QUESTION", value: "Can protection remain love when it removes another person's agency?", x: 52, y: 26, target: "SPACE" },
      { id: "ideas-counter", label: "COUNTEREVIDENCE", value: "Immediate disclosure may also expose the other person to real danger.", x: 28, y: 70, target: "SPACE" },
    ],
  },
  {
    id: "MORAL WORLD",
    number: "05",
    question: "What does the narrative resist, leave open, normalize or reward?",
    summary: "Moral-world analysis asks how behavior is narratively treated without assuming depiction equals endorsement.",
    annotations: [
      { id: "moral-deception", label: "COSTLY", value: "Concealment damages trust, but motives remain understandable.", x: 34, y: 72, target: "OBJECT" },
      { id: "moral-control", label: "QUESTIONED", value: "Protective control is increasingly exposed as a relational problem.", x: 72, y: 35, target: "A" },
    ],
  },
  {
    id: "CRAFT",
    number: "06",
    question: "How does form shape sympathy before the viewer makes a judgment?",
    summary: "Camera, blocking, light, performance and sound can complicate or intensify the story level reading.",
    annotations: [
      { id: "craft-camera", label: "CAMERA", value: "Close framing keeps both faces emotionally legible instead of isolating a villain.", x: 47, y: 52, target: "SPACE" },
      { id: "craft-blocking", label: "BLOCKING", value: "The doorway remains visible behind Character A, making spatial control part of the scene grammar.", x: 82, y: 47, target: "SPACE" },
    ],
  },
];

export function SixLensesLab() {
  const [selectedId, setSelectedId] = useState<LensId>("STORY");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = LENSES.findIndex((lens) => lens.id === selectedId);
  const selected = LENSES[selectedIndex] ?? LENSES[0];

  function activateTab(index: number) {
    const normalizedIndex = (index + LENSES.length) % LENSES.length;
    const lens = LENSES[normalizedIndex];
    if (!lens) return;
    setSelectedId(lens.id);
    tabRefs.current[normalizedIndex]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        activateTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        activateTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        activateTab(0);
        break;
      case "End":
        event.preventDefault();
        activateTab(LENSES.length - 1);
        break;
    }
  }

  const selectedTabId = `six-lenses-tab-${selectedIndex}`;

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / SIX LENSES / V0</p>
        <h1>One frame. Six different analytical questions.</h1>
        <p className={styles.lede}>
          The homepage should communicate whole-film scope without six disconnected cards. Every state below reuses one cinematic frame and changes only the structured reading applied to it.
        </p>
      </header>

      <section className={styles.experience} aria-labelledby="six-lenses-title">
        <div className={styles.lensRail} role="tablist" aria-label="Film analysis lenses">
          {LENSES.map((lens, index) => {
            const active = selected.id === lens.id;
            const tabId = `six-lenses-tab-${index}`;
            return (
              <button
                key={lens.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={tabId}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls="six-lenses-panel"
                className={styles.lensButton}
                onFocus={() => setSelectedId(lens.id)}
                onClick={() => setSelectedId(lens.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span>{lens.number}</span>
                <strong>{lens.id}</strong>
              </button>
            );
          })}
        </div>

        <div
          id="six-lenses-panel"
          role="tabpanel"
          aria-labelledby={selectedTabId}
          tabIndex={0}
          className={styles.frameShell}
        >
          <div className={styles.frame} aria-hidden="true">
            <div className={styles.scene}>
              <span className={styles.door} />
              <span className={styles.subjectA} />
              <span className={styles.subjectB} />
              <span className={styles.document} />
              <span className={styles.horizon} />
            </div>
            <div className={styles.frameTopline}>
              <span>FRAME / FIXTURE / 2.39:1</span>
              <span>LENS / {selected.id}</span>
            </div>

            {selected.id === "RELATIONSHIPS" ? <span className={styles.relationshipTrace} /> : null}
            {selected.id === "CRAFT" ? <span className={styles.cameraFrame} /> : null}

            {selected.annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={styles.annotation}
                data-target={annotation.target}
                style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
              >
                <span className={styles.annotationPoint} />
                <div>
                  <strong>{annotation.label}</strong>
                  <p>{annotation.value}</p>
                </div>
              </div>
            ))}
          </div>

          <article className={styles.lensReading}>
            <div className={styles.readingTopline}>
              <span>{selected.number} / {selected.id}</span>
              <span>ONE FRAME / ONE DATA SOURCE</span>
            </div>
            <h2 id="six-lenses-title">{selected.question}</h2>
            <p>{selected.summary}</p>
            <div className={styles.annotationList} aria-label={`${selected.id} annotations`}>
              {selected.annotations.map((annotation) => (
                <div key={annotation.id}>
                  <span>{annotation.label}</span>
                  <p>{annotation.value}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.rules} aria-labelledby="lenses-rules-title">
        <p className={styles.kicker}>HOMEPAGE GATES</p>
        <h2 id="lenses-rules-title">The user should remember the domains, not the effect.</h2>
        <div className={styles.ruleGrid}>
          <article><span>01</span><strong>One scene</strong><p>No separate heavyweight render or image download for each lens.</p></article>
          <article><span>02</span><strong>Different questions</strong><p>Each lens changes the analytical task, not only annotation color.</p></article>
          <article><span>03</span><strong>Keyboard first-class</strong><p>Arrow keys, Home and End navigate the same tab state that pointer activation changes.</p></article>
          <article><span>04</span><strong>Mobile stays singular</strong><p>One selected lens and its annotation list remain readable without six card columns.</p></article>
        </div>
      </section>
    </div>
  );
}
