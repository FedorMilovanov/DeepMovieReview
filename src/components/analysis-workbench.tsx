"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import styles from "./analysis-workbench.module.css";

type ModeId = "autopsy" | "relationship" | "decision";

const MODES = [
  { id: "autopsy", label: "Вскрытие сцены", index: "01" },
  { id: "relationship", label: "Отношения", index: "02" },
  { id: "decision", label: "Решение и знание", index: "03" },
] as const;

const ANCHORS = [
  { id: "exit", index: "01", label: "Перекрытый выход", x: 75, y: 48, observation: "Персонаж A остаётся между персонажем B и дверью.", supports: "Пространство усиливает давление разговора.", limitation: "Блокировка сама по себе ещё не доказывает намерение удержать силой." },
  { id: "letter", index: "02", label: "Скрытое письмо", x: 37, y: 68, observation: "Документ остаётся за спиной A после прямого вопроса.", supports: "В сцене есть наблюдаемое удержание значимой информации.", limitation: "Зритель видит письмо яснее, чем персонаж B." },
  { id: "reaction", index: "03", label: "Реакция до ответа", x: 57, y: 32, observation: "B смотрит на письмо раньше, чем A отвечает.", supports: "Подозрение возникает до признания.", limitation: "Подозрение не равно знанию факта." },
] as const;

const RELATIONSHIP_EVENTS = [
  { id: "trust", label: "Сотрудничество", note: "Доверие растёт", trust: "растёт", truth: "частичная", power: "сбалансирована" },
  { id: "concealment", label: "Сокрытие", note: "Контроль усиливается", trust: "повреждено", truth: "удерживается", power: "асимметрична" },
  { id: "confrontation", label: "Конфронтация", note: "Разрыв становится явным", trust: "разорвано", truth: "вынужденная", power: "оспаривается" },
  { id: "repair", label: "Дорогая честность", note: "Ремонт начинается", trust: "хрупкое", truth: "добровольная", power: "разделяется" },
] as const;

const DECISION_FACTS = [
  { state: "KNOWN", label: "Известно тогда", text: "A знает, что письмо меняет выбор B." },
  { state: "INFERABLE", label: "Разумно выводимо", text: "B понимает, что часть информации скрыта." },
  { state: "LATER", label: "Раскрыто позже", text: "Угроза, которой A оправдывал сокрытие, была преувеличена." },
] as const;

export function AnalysisWorkbench() {
  const [mode, setMode] = useState<ModeId>("autopsy");
  const [anchorId, setAnchorId] = useState<(typeof ANCHORS)[number]["id"]>(ANCHORS[0].id);
  const [relationshipId, setRelationshipId] = useState<(typeof RELATIONSHIP_EVENTS)[number]["id"]>(RELATIONSHIP_EVENTS[1].id);
  const [showLater, setShowLater] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedAnchor = ANCHORS.find((item) => item.id === anchorId) ?? ANCHORS[0];
  const selectedRelationship = RELATIONSHIP_EVENTS.find((item) => item.id === relationshipId) ?? RELATIONSHIP_EVENTS[0];

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % MODES.length;
    if (event.key === "ArrowLeft") next = (index - 1 + MODES.length) % MODES.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = MODES.length - 1;
    setMode(MODES[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className={`sectionShell sectionRule ${styles.section}`} aria-labelledby="analysis-workbench-title" data-analysis-workbench>
      <div className="sectionIndex">04 / Аналитическая лаборатория</div>
      <div className={styles.intro}>
        <div>
          <h2 id="analysis-workbench-title">Не читайте о методе. Проверьте, как он работает.</h2>
          <p className="sectionIntro">Синтетическая сцена показывает три слоя анализа без привязки к реальному фильму: доказательства, динамику отношений и границы знания в момент выбора.</p>
        </div>
        <span className={styles.badge}>DEMO / SYNTHETIC SCENE</span>
      </div>

      <div className={styles.shell}>
        <div className={styles.tabs} role="tablist" aria-label="Режим аналитической лаборатории">
          {MODES.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`workbench-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              aria-controls="analysis-workbench-panel"
              tabIndex={mode === item.id ? 0 : -1}
              onClick={() => setMode(item.id)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <span>{item.index}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>

        <div className={styles.stageGrid}>
          <div className={styles.frameColumn}>
            <div className={styles.frame} data-mode={mode}>
              <div className={styles.frameMeta}><span>SCENE / FIXTURE / 01:17:34</span><span>2.39:1</span></div>
              <span className={styles.light} aria-hidden="true" />
              <span className={styles.door} aria-hidden="true" />
              <span className={`${styles.figure} ${styles.figureA}`} aria-hidden="true" />
              <span className={`${styles.figure} ${styles.figureB}`} aria-hidden="true" />
              <span className={styles.letter} aria-hidden="true" />
              <span className={styles.vignette} aria-hidden="true" />
              {mode === "autopsy" ? ANCHORS.map((anchor) => (
                <button
                  key={anchor.id}
                  type="button"
                  className={styles.anchor}
                  style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
                  aria-label={`${anchor.index}: ${anchor.label}`}
                  aria-pressed={anchorId === anchor.id}
                  onClick={() => setAnchorId(anchor.id)}
                >{anchor.index}</button>
              )) : null}
              {mode === "relationship" ? <span className={styles.relationshipTrace} aria-hidden="true" /> : null}
              {mode === "decision" ? <span className={styles.knowledgeVeil} data-knowledge-veil data-open={showLater || undefined} aria-hidden="true" /> : null}
            </div>
            <p className={styles.frameNote}>Фикстура демонстрирует интерфейс. Никакого опубликованного суждения о реальном фильме.</p>
          </div>

          <div
            id="analysis-workbench-panel"
            className={styles.panel}
            role="tabpanel"
            aria-labelledby={`workbench-tab-${mode}`}
          >
            {mode === "autopsy" ? (
              <div className={styles.modePanel} data-workbench-mode="autopsy">
                <span className={styles.modeEyebrow}>EVIDENCE / {selectedAnchor.index}</span>
                <h3>{selectedAnchor.label}</h3>
                <dl className={styles.definitionList}>
                  <div><dt>Наблюдение</dt><dd>{selectedAnchor.observation}</dd></div>
                  <div><dt>Поддерживает</dt><dd>{selectedAnchor.supports}</dd></div>
                  <div><dt>Ограничение</dt><dd>{selectedAnchor.limitation}</dd></div>
                </dl>
                <div className={styles.anchorRail} aria-label="Точки доказательств">
                  {ANCHORS.map((anchor) => (
                    <button key={anchor.id} type="button" aria-pressed={anchorId === anchor.id} onClick={() => setAnchorId(anchor.id)}>
                      <span>{anchor.index}</span><strong>{anchor.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {mode === "relationship" ? (
              <div className={styles.modePanel} data-workbench-mode="relationship">
                <span className={styles.modeEyebrow}>RELATIONSHIP / A ↔ B</span>
                <h3>{selectedRelationship.label}</h3>
                <p className={styles.modeLead}>{selectedRelationship.note}</p>
                <div className={styles.eventRail} aria-label="События отношений">
                  {RELATIONSHIP_EVENTS.map((event, index) => (
                    <button key={event.id} type="button" aria-pressed={relationshipId === event.id} onClick={() => setRelationshipId(event.id)}>
                      <span>{String(index + 1).padStart(2, "0")}</span><strong>{event.label}</strong>
                    </button>
                  ))}
                </div>
                <dl className={styles.shiftGrid}>
                  <div><dt>Доверие</dt><dd>{selectedRelationship.trust}</dd></div>
                  <div><dt>Правдивость</dt><dd>{selectedRelationship.truth}</dd></div>
                  <div><dt>Власть</dt><dd>{selectedRelationship.power}</dd></div>
                </dl>
              </div>
            ) : null}

            {mode === "decision" ? (
              <div className={styles.modePanel} data-workbench-mode="decision">
                <span className={styles.modeEyebrow}>DECISION / KNOWLEDGE FOG</span>
                <h3>Судить выбор по тому, что герой знал тогда.</h3>
                <p className={styles.modeLead}>Позднее раскрытие не должно задним числом становиться знанием персонажа.</p>
                <div className={styles.knowledgeList}>
                  {DECISION_FACTS.filter((fact) => fact.state !== "LATER" || showLater).map((fact) => (
                    <article key={fact.state} data-state={fact.state.toLowerCase()}>
                      <span>{fact.label}</span><p>{fact.text}</p>
                    </article>
                  ))}
                </div>
                <div className={styles.decisionFork} aria-label="Доступные варианты">
                  <article><span>Вариант A</span><strong>Сказать правду сейчас</strong><small>цена: потеря контроля</small></article>
                  <article><span>Вариант B</span><strong>Скрыть часть фактов</strong><small>цена: риск доверия</small></article>
                </div>
                <button className={styles.revealButton} type="button" aria-expanded={showLater} onClick={() => setShowLater((value) => !value)}>
                  {showLater ? "Скрыть позднее знание" : "Показать, что выяснилось позже"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
