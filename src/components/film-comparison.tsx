"use client";

import { useState } from "react";
import { COMPARISON_DIMENSIONS, type ComparisonDimension, type EvidenceRecord, type FilmComparison } from "@/lib/film-package";
import { useHydrated } from "@/lib/use-hydrated";
import { formatTimecode } from "@/lib/timecode";

const dimensionLabels: Record<ComparisonDimension, string> = {
  knowledge: "Что знал",
  pressure: "Давление",
  options: "Варианты",
  decision: "Решение",
  cost: "Цена",
  consequences: "Последствия",
  counterpoint: "Контрдовод",
};

function Cell({
  side,
  dimension,
  evidence,
  sources,
}: {
  side: FilmComparison["sides"][number];
  dimension: ComparisonDimension;
  evidence: ReadonlyMap<string, EvidenceRecord>;
  sources: ReadonlyMap<string, FilmComparison["sources"][number]>;
}) {
  const cell = side.cells[dimension];
  return (
    <td role="cell">
      <strong className="comparisonCellName">{side.name}</strong>
      <p>{cell.text}</p>
      <ul className="comparisonCitations" aria-label={`Основания: ${side.name}, ${dimensionLabels[dimension]}`}>
        {(cell.evidenceIds ?? []).map((id) => {
          const record = evidence.get(id);
          return record ? (
            <li key={id}>
              <a href={`#evidence-${id}`}>
                К фильму: {record.label}{record.timestampSeconds === undefined ? "" : ` · ${formatTimecode(record.timestampSeconds)}`}
              </a>
              {record.basis?.outcome === "pending" ? <span> · проверка ожидается</span> : null}
            </li>
          ) : null;
        })}
        {(cell.sourceIds ?? []).map((id) => {
          const source = sources.get(id);
          return source ? <li key={id}><a href={source.url}>{source.label} ↗</a></li> : null;
        })}
      </ul>
    </td>
  );
}

export function FilmComparisonView({ comparison, evidence: evidenceRecords }: {
  comparison: FilmComparison;
  evidence: EvidenceRecord[];
}) {
  const hydrated = useHydrated();
  const [leftId, setLeftId] = useState(comparison.sides[0].id);
  const [rightId, setRightId] = useState(comparison.sides[1].id);
  const left = comparison.sides.find((side) => side.id === leftId) ?? comparison.sides[0];
  const right = comparison.sides.find((side) => side.id === rightId) ?? comparison.sides[1];
  const evidence = new Map(evidenceRecords.map((record) => [record.id, record]));
  const sources = new Map(comparison.sources.map((source) => [source.id, source]));

  return (
    <section id={comparison.id} className="sectionShell sectionRule filmComparison" aria-labelledby={`${comparison.id}-title`}>
      <div className="sectionIndex">Battle / Сравнение решений · после просмотра</div>
      <h2 id={`${comparison.id}-title`}>{comparison.heading}</h2>
      <p className="sectionIntro">{comparison.introduction}</p>
      <p className="comparisonLimitation">{comparison.limitation}</p>
      <div className="comparisonControls">
        <fieldset>
          <legend>Первая сторона</legend>
          <div className="comparisonChoices">
            {comparison.sides.map((side) => (
              <label key={side.id}>
                <input type="radio" name={`${comparison.id}-left`} value={side.id} checked={side.id === left.id}
                  disabled={!hydrated || side.id === right.id} onChange={() => setLeftId(side.id)} />
                <span>{side.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Вторая сторона</legend>
          <div className="comparisonChoices">
            {comparison.sides.map((side) => (
              <label key={side.id}>
                <input type="radio" name={`${comparison.id}-right`} value={side.id} checked={side.id === right.id}
                  disabled={!hydrated || side.id === left.id} onChange={() => setRightId(side.id)} />
                <span>{side.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" disabled={!hydrated} onClick={() => { setLeftId(right.id); setRightId(left.id); }}>
          Поменять местами
        </button>
      </div>
      {!hydrated ? <p className="comparisonFallback">Выбор сторон доступен после загрузки скриптов; сравнение Трумана и Гавела приведено ниже.</p> : null}
      <p className="comparisonStatus" role="status">Сравниваются: {left.name} и {right.name}.</p>
      <p className="microLabel comparisonScrollHint">Таблицу можно прокрутить по горизонтали.</p>
      <div className="comparisonViewport" role="region" aria-label="Сравнительная таблица решений" tabIndex={0}>
        <table role="table">
          <caption className="visuallyHidden">Сравнение знаний, давления, выбора и последствий</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">Вопрос</th>
              {[left, right].map((side) => (
                <th scope="col" role="columnheader" key={side.id}>
                  <span>{side.kind === "HISTORICAL" ? "Историческая фигура" : "Персонаж фильма"}</span>
                  <strong>{side.name}</strong>
                  <small>{side.context}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {COMPARISON_DIMENSIONS.map((dimension) => (
              <tr role="row" key={dimension}>
                <th scope="row" role="rowheader">{dimensionLabels[dimension]}</th>
                <Cell side={left} dimension={dimension} evidence={evidence} sources={sources} />
                <Cell side={right} dimension={dimension} evidence={evidence} sources={sources} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="comparisonSources">
        <summary>О пределах исторических источников</summary>
        <ul>{comparison.sources.map((source) => <li key={source.id}><a href={source.url}>{source.label}</a> — {source.scope}</li>)}</ul>
      </details>
    </section>
  );
}
