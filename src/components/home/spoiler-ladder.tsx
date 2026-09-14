"use client";

import { useId, useState, type CSSProperties } from "react";

const SPOILER_LEVELS = [
  {
    level: "Без спойлеров",
    note: "только завязка и метод",
    preview: "Видно: завязка, метод, персонажи верхнего уровня. Финал и повороты структурно отсутствуют на странице.",
  },
  {
    level: "Минимальные",
    note: "структура без финала",
    preview: "Добавляются: структура актов, линии отношений, вопросы фильма. Повороты и финал скрыты.",
  },
  {
    level: "Серьёзные",
    note: "повороты и развязки",
    preview: "Добавляются: поворотные точки, вскрытие сцен, разбор решений — с явными метками раскрытия.",
  },
  {
    level: "Финал",
    note: "развязка и её цена",
    preview: "Добавляются: финал, цена выбора, последствия. Всё, что меняет первое впечатление от фильма.",
  },
  {
    level: "Полный разбор",
    note: "вся глубина анализа",
    preview: "Всё: библейский синтез, вердикт, связи с атласом. Уровень для тех, кто уже смотрел фильм.",
  },
] as const;

/**
 * Interactive spoiler ladder: choosing a level previews what that level
 * unlocks. Every level's base note is server-rendered text, so the section
 * stays complete without JS; the preview line is the enhancement.
 */
export function SpoilerLadder() {
  const [selected, setSelected] = useState(0);
  const previewId = useId();
  const active = SPOILER_LEVELS[selected] ?? SPOILER_LEVELS[0];

  return (
    <div>
      <ol className="spoilerLadder spoilerLadderLive" aria-label="Уровни раскрытия спойлеров">
        {SPOILER_LEVELS.map((item, index) => (
          <li
            className="spoilerStep"
            key={item.level}
            style={{ "--step": index } as CSSProperties}
            data-active={index === selected || undefined}
          >
            <button
              type="button"
              className="spoilerButton"
              aria-pressed={index === selected}
              aria-controls={previewId}
              onClick={() => setSelected(index)}
            >
              <strong>{item.level}</strong>
              <span>{item.note}</span>
            </button>
          </li>
        ))}
      </ol>
      <p id={previewId} className="spoilerPreview" aria-live="polite">
        <span className="spoilerPreviewLevel">{active.level}:</span> {active.preview}
      </p>
    </div>
  );
}
