"use client";

import { useState } from "react";
import { LivingFrame } from "@/components/living-frame";
import autopsyMaster from "../../../public/art/autopsy-master.jpg";

const EXAMINE_ANCHORS = [
  {
    id: "envelope",
    index: "01",
    label: "Конверт на столе",
    x: "62%",
    y: "67%",
    observation: "Документ лежит на виду, но остаётся непрочитанным.",
    supports: "В кадре есть наблюдаемое удержание значимой информации.",
    limitation: "Само письмо ещё не доказывает ни мотива, ни адресата.",
  },
  {
    id: "lamp",
    index: "02",
    label: "Лампа",
    x: "42%",
    y: "52%",
    observation: "Тёплая лужа света держит стол — всё остальное тонет в тени.",
    supports: "Форма выделяет стол как место решения задолго до слов.",
    limitation: "Свет режиссирует внимание, но не выносит вердикт.",
  },
  {
    id: "door",
    index: "03",
    label: "Приоткрытая дверь",
    x: "90%",
    y: "42%",
    observation: "Выход из комнаты остаётся открытым на протяжении сцены.",
    supports: "Пространство фиксирует: уход был возможен.",
    limitation: "Открытая дверь не равна свободе выбора — давление может быть невидимым.",
  },
] as const;

type ExamineAnchorId = (typeof EXAMINE_ANCHORS)[number]["id"];

/**
 * Homepage Scene Autopsy teaser: a cinematic frame that the visitor opens
 * into an evidence field. `EXAMINE SCENE` swaps cinematic light for
 * analytical light, separates attention via anchors, and binds each anchor
 * to observation / support / limitation. The analytical text under the frame
 * is reachable by keyboard and touch through the anchor rail; the in-frame
 * dots are a desktop pointer convenience.
 */
export function AutopsyExamine() {
  const [examined, setExamined] = useState(false);
  const [anchorId, setAnchorId] = useState<ExamineAnchorId>(EXAMINE_ANCHORS[0].id);
  const selected = EXAMINE_ANCHORS.find((anchor) => anchor.id === anchorId) ?? EXAMINE_ANCHORS[0];

  return (
    <div className="examineWrap" data-examined={examined || undefined}>
      <LivingFrame
        art={autopsyMaster}
        alt="Тёмный кабинет: стол с лампой и конвертом, сидящая фигура спиной, приоткрытая дверь"
        metaLeft="Сцена 014 · Акт II"
        metaRight={examined ? "TC 00:47:12 · ВСКРЫТИЕ" : "TC 00:47:12"}
        captionTitle={examined ? "Режим вскрытия" : "Обычный кинокадр"}
        captionNote={
          examined
            ? "Аналитический свет. Выберите точку доказательств."
            : "Нажмите «Вскрыть сцену», чтобы открыть кадр в поле доказательств."
        }
        label="Демонстрация вскрытия сцены"
        zoomed={examined}
        sizes="(max-width: 1020px) 100vw, 45vw"
      >
        {examined ? (
          <>
            <span className="examineScan" aria-hidden="true" />
            <span className="examineReticle" aria-hidden="true" />
            {EXAMINE_ANCHORS.map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                className="examineAnchor"
                style={{ left: anchor.x, top: anchor.y }}
                aria-label={`${anchor.index}: ${anchor.label}`}
                aria-pressed={anchorId === anchor.id}
                data-lens-cursor="trace"
                onClick={() => setAnchorId(anchor.id)}
              >
                {anchor.index}
              </button>
            ))}
          </>
        ) : null}
      </LivingFrame>

      <div className="examineControls">
        <button
          type="button"
          className="examineToggle"
          aria-expanded={examined}
          onClick={() => setExamined((value) => !value)}
        >
          {examined ? "Вернуть кинокадр" : "Вскрыть сцену"}
        </button>
        {examined ? (
          <div className="examinePanel" aria-live="polite">
            <div className="examineRail" role="group" aria-label="Точки доказательств">
              {EXAMINE_ANCHORS.map((anchor) => (
                <button
                  key={anchor.id}
                  type="button"
                  aria-pressed={anchorId === anchor.id}
                  onClick={() => setAnchorId(anchor.id)}
                >
                  <span>{anchor.index}</span>
                  <strong>{anchor.label}</strong>
                </button>
              ))}
            </div>
            <dl className="examineCard">
              <div>
                <dt>Наблюдение</dt>
                <dd>{selected.observation}</dd>
              </div>
              <div>
                <dt>Поддерживает</dt>
                <dd>{selected.supports}</dd>
              </div>
              <div>
                <dt>Ограничение</dt>
                <dd>{selected.limitation}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
      <p className="autopsyDemoNote">Абстрактный пример инструмента — не фрагмент реального разбора.</p>
    </div>
  );
}
