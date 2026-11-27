"use client";

import { useEffect, useRef, useState } from "react";

const hypotheses = ["Обычная случайность", "Часть постановки", "Недостаточно сведений"] as const;
const paths = ["Предмет", "Сообщение", "Независимая проверка"] as const;
const categories = ["Наблюдение", "Сообщение", "Гипотеза"] as const;
const cards = [
  { text: "На синем приборе видна надпись Sirius.", category: "Наблюдение" },
  { text: "Обломки объясняются деталями самолёта.", category: "Сообщение" },
  { text: "Предмет мог оказаться здесь вследствие постановки.", category: "Гипотеза" },
] as const;
const questions = [
  { title: "Прибор под увеличением", question: "Что можно установить по самому предмету?", options: ["На приборе видна надпись.", "Известна причина его падения."], explanation: "Предмет позволяет описать его видимые признаки. Причина появления требует других сведений." },
  { title: "Сообщение об аномалии", question: "Что устанавливает запись субтитров?", options: ["Такое объяснение присутствует в тексте.", "Самолёт действительно потерял деталь."], explanation: "Сообщение подтверждает наличие объяснения, но не гарантирует его истинности." },
  { title: "Независимость сведений", question: "Какое дополнительное сведение было бы полезнее?", options: ["Независимо проверяемая запись происхождения предмета.", "Повтор того же объяснения тем же источником."], explanation: "Это мысленный эксперимент: такого независимого свидетельства здесь не предъявлено. Повторение не равно независимому подтверждению." },
] as const;
const chapters = ["Наблюдение", "Гипотеза", "Развилка", "Проверка", "Синтез"];
const findings = [
  "Надпись позволяет описать предмет, но не причину его появления.",
  "Субтитры подтверждают наличие объяснения, но не его истинность.",
  "Несколько повторов одного сообщения не являются независимыми подтверждениями.",
] as const;

function SourceExperiment({ mode, setMode }: { mode: number; setMode: (mode: number) => void }) {
  const independent = mode === 1;
  return (
    <div className="diveExperiment">
      <p className="diveEyebrow">Мысленный эксперимент · не события фильма</p>
      <h3>Три сообщения. Сколько источников?</h3>
      <div className="diveExperimentControls">
        <button type="button" className="diveSortButton" aria-pressed={!independent} onClick={() => setMode(0)}>Один первоисточник</button>
        <button type="button" className="diveSortButton" aria-pressed={independent} onClick={() => setMode(1)}>Разные первоисточники</button>
      </div>
      <svg viewBox="0 0 360 184" role="img" aria-label={independent ? "Три сообщения из трёх условно независимых источников" : "Три сообщения, восходящие к одному источнику"}>
        <g fill="none" stroke="#9ab6ce" strokeWidth="1.5">
          {[60,180,300].map(x => <path key={x} d={`M${independent ? x : 180} 55 Q${independent ? x : 180} 88 ${x} 117`}/>)}
        </g>
        {(independent ? [60,180,300] : [180]).map((x,i) => <g key={x}><rect x={x-43} y="14" width="86" height="42" rx="5" fill="#263d50" stroke="#9ab6ce"/><text x={x} y="39" textAnchor="middle" fill="#e1e9ee" fontSize="11">Источник {i+1}</text></g>)}
        {[60,180,300].map((x,i) => <g key={x}><rect x={x-48} y="117" width="96" height="42" rx="5" fill="#322f28" stroke="#d3b88a"/><text x={x} y="142" textAnchor="middle" fill="#f3e5ce" fontSize="11">Сообщение {i+1}</text></g>)}
      </svg>
      <p role="status">{independent ? "Если источники действительно независимы и заслуживают доверия, совпадение их сведений может усилить обоснованность вывода. Само совпадение ещё не доказывает истину." : "Три сообщения, но всего один исходный источник. Повторение может создавать ощущение подтверждения, хотя новой независимой опоры не появилось."}</p>
    </div>
  );
}

function ClaimExperiment({ mode, setMode }: { mode: number; setMode: (mode: number) => void }) {
  return (
    <div className="diveExperiment">
      <p className="diveEyebrow">Один предмет · два уровня утверждения</p>
      <h3>Насколько далеко можно зайти?</h3>
      <div className="diveExperimentControls">
        <button type="button" className="diveSortButton" aria-pressed={mode === 0} onClick={() => setMode(0)}>Описание</button>
        <button type="button" className="diveSortButton" aria-pressed={mode === 1} onClick={() => setMode(1)}>Происхождение</button>
      </div>
      <div className="diveClaimLayers">
        <div data-active={mode === 0}><small>НАБЛЮДАЕМОЕ</small><strong>Синий прибор · Sirius</strong></div>
        <span aria-hidden="true">↓</span>
        <div data-active={mode === 1}><small>ТРЕБУЕТ ПРОВЕРКИ</small><strong>Откуда и почему он появился?</strong></div>
      </div>
      <p role="status">{mode === 0 ? "Описание удерживает вывод в границах видимого. Оно ничего не сообщает о причине падения." : "Для утверждения о происхождении нужен дополнительный материал: например, надёжно установленная последовательность событий. Сам предмет не восполняет этот пробел."}</p>
    </div>
  );
}

function ReportExperiment({ mode, setMode }: { mode: number; setMode: (mode: number) => void }) {
  return (
    <div className="diveExperiment">
      <p className="diveEyebrow">Лингвистическая лаборатория</p>
      <h3>Снимите слой уверенности</h3>
      <div className="diveExperimentControls">
        <button type="button" className="diveSortButton" aria-pressed={mode === 0} onClick={() => setMode(0)}>Как факт</button>
        <button type="button" className="diveSortButton" aria-pressed={mode === 1} onClick={() => setMode(1)}>Как сообщение</button>
      </div>
      <div className="diveReportLine">
        {mode === 1 ? <><span>В субтитрах обломки объясняются как </span><strong>детали самолёта.</strong></> : <strong>Предмет — деталь самолёта.</strong>}
      </div>
      <p role="status">{mode === 0 ? "Формулировка отбрасывает сведения о происхождении утверждения и звучит как установленный факт. Но у нас нет такого подтверждения." : "Теперь предложение точно указывает, что подтверждено: наличие объяснения в субтитрах, а не происхождение предмета."}</p>
    </div>
  );
}

function SiriusArtifact({ inspected }: { inspected: boolean }) {
  return (
    <svg className="diveArtifact" viewBox="0 0 640 520" role="img" aria-label="Авторская условная модель синего осветительного прибора с надписью Sirius; не реконструкция кинокадра">
      <defs>
        <radialGradient id="dive-halo"><stop stopColor="#577e9c" stopOpacity=".46"/><stop offset="1" stopColor="#0b1019" stopOpacity="0"/></radialGradient>
        <linearGradient id="dive-metal" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b0c6d5"/><stop offset=".18" stopColor="#395b7b"/><stop offset=".65" stopColor="#152c42"/><stop offset="1" stopColor="#6187a3"/></linearGradient>
        <linearGradient id="dive-lens" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#c5e0e9"/><stop offset=".22" stopColor="#7197b0"/><stop offset=".7" stopColor="#1c3249"/><stop offset="1" stopColor="#0b1725"/></linearGradient>
        <pattern id="dive-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#718aa2" strokeOpacity=".14"/></pattern>
      </defs>
      <rect width="640" height="520" fill="url(#dive-halo)"/>
      <g transform="translate(320 374) scale(1 .32)">
        {[88,138,196,265].map(r => <circle key={r} r={r} fill="none" stroke="#9bb3c2" strokeOpacity=".25" />)}
        <path d="M-300 0H300M0 -300V300M-220 -220L220 220M220 -220L-220 220" stroke="#7896ad" strokeOpacity=".2"/>
      </g>
      <path d="M50 390L220 262H420L590 390V478H50Z" fill="url(#dive-grid)" opacity=".55"/>
      <ellipse cx="320" cy="374" rx="138" ry="25" fill="#060a0e" opacity=".8"/>
      <g className="diveInstrument" transform="translate(320 240) rotate(-17)">
        <path d="M-123 -66L30 -100L109 -59L109 64L-40 100L-123 58Z" fill="url(#dive-metal)" stroke="#aac4d4" strokeWidth="1.5"/>
        <path d="M-123 -66L-40 -25L109 -59M-40 -25V100" fill="none" stroke="#89a6b8" strokeWidth="1.6"/>
        <path d="M-94 -54L-5 -80M-78 -45L11 -71M-62 -36L27 -62M-46 -27L43 -53" stroke="#9ab3c4" strokeOpacity=".55" strokeWidth="3"/>
        <ellipse cx="86" cy="6" rx="45" ry="62" transform="rotate(11 86 6)" fill="#112639" stroke="#b3c9d6" strokeWidth="4"/>
        <ellipse cx="86" cy="6" rx="34" ry="50" transform="rotate(11 86 6)" fill="url(#dive-lens)" stroke="#61859c" strokeWidth="2"/>
        <path d="M-110 43L-54 70L-54 45L-110 18Z" fill="#d2c7a6" stroke="#e9ddbd"/>
        <text transform="translate(-104 39) skewY(25)" fontSize="13" fontFamily="monospace" fontWeight="bold" fill="#172333">SIRIUS</text>
      </g>
      <g fill="none" stroke="#d4b481" strokeWidth="1.3" opacity={inspected ? 1 : .35}>
        <path d="M80 159H174L240 230M80 159V145M174 159H191" />
        <circle cx="240" cy="230" r="13"/>
      </g>
      <g fill="#e1c69b" fontSize="12" fontFamily="monospace"><text x="80" y="139">01 / OBJECT</text><text x="80" y="155">SIRIUS</text></g>
      <g fill="#9ab2c6" fontSize="11" fontFamily="monospace"><text x="46" y="480">OBSERVATION FIELD</text><text x="594" y="480" textAnchor="end">01 — 05</text></g>
    </svg>
  );
}

/** The same field changes from an object to a map of reasoning, not a decorative new scene. */
function ReasoningField({ step, path, sorted, completed, explored }: { step: number; path: number | null; sorted: number[]; completed: boolean; explored: boolean[] }) {
  const branchNames = ["ПРЕДМЕТ", "СООБЩЕНИЕ", "ПРОВЕРКА"];
  const colors = ["#9ec5de", "#d9b986", "#c5a5d6"];
  return (
    <svg className="diveReasoningField" viewBox="0 0 640 520" aria-hidden="true">
      <defs>
        <radialGradient id="dive-field"><stop stopColor="#436782" stopOpacity=".4"/><stop offset="1" stopColor="#0b1019" stopOpacity="0"/></radialGradient>
        <linearGradient id="dive-field-path" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#7f9cb7"/><stop offset="1" stopColor="#d8b886"/></linearGradient>
      </defs>
      <rect width="640" height="520" fill="url(#dive-field)"/>
      <g transform="translate(320 250) scale(1 .65)" fill="none" stroke="#7195b4" strokeOpacity=".2">
        {[95,153,220,282].map(r => <circle key={r} r={r}/>)}
        <path d="M-300 0H300M0 -330V330M-230 -230L230 230M230 -230L-230 230"/>
      </g>
      {step === 2 ? <>
        <g fill="none" stroke="url(#dive-field-path)" strokeWidth="2">
          {branchNames.map((name,i) => <path key={name} d={`M320 125 C320 175 ${110+i*210} 155 ${110+i*210} 244`} opacity={path === null || path === i || explored[i] ? 1 : .22} strokeWidth={path === i ? 4 : explored[i] ? 2.5 : 1.5}/>)}
        </g>
        <rect x="241" y="58" width="158" height="67" rx="8" fill="#192c40" stroke="#c5d5e0"/>
        <text x="320" y="84" textAnchor="middle" fill="#a9c2d5" fontSize="11" letterSpacing="2">ИСХОДНЫЙ ВОПРОС</text>
        <text x="320" y="106" textAnchor="middle" fill="#f3eee6" fontSize="19">SIRIUS</text>
        {branchNames.map((name,i) => <g key={name} opacity={path === null || path === i || explored[i] ? 1 : .35}>
          <ellipse cx={110+i*210} cy="284" rx="73" ry="40" fill="#1b2b3c" stroke={colors[i]} strokeWidth={path === i ? 2.5 : 1}/>
          <ellipse cx={110+i*210} cy="284" rx="90" ry="51" fill="none" stroke={colors[i]} opacity=".3"/>
          <text x={110+i*210} y="279" textAnchor="middle" fill={colors[i]} fontSize="13">0{i+1}{explored[i] ? " ✓" : ""}</text>
          <text x={110+i*210} y="297" textAnchor="middle" fill="#eef1f4" fontSize="12">{name}</text>
        </g>)}
        <path d="M110 326 Q110 402 320 416 Q530 402 530 326 M320 326V416" fill="none" stroke="#8ba1b6" strokeDasharray="4 7" opacity=".6"/>
        <circle cx="320" cy="416" r="13" fill="#d9b986" opacity=".7"/>
        <text x="320" y="451" textAnchor="middle" fill="#d9b986" fontSize="12" letterSpacing="2">СЛЕДУЮЩИЙ СЛОЙ</text>
      </> : step === 3 ? <>
        {categories.map((category,i) => <g key={category}>
          <rect x={32+i*198} y="280" width="180" height="92" rx="8" fill="#16293a" stroke={colors[i]}/>
          <text x={122+i*198} y="340" textAnchor="middle" fontSize="13" fill={colors[i]}>{category}</text>
        </g>)}
        {cards.map((item,i) => {
          const selected = sorted[i];
          const target = 122 + (selected >= 0 ? selected : i)*198;
          return <g key={item.text}>
            <path d={`M${122+i*198} 134 Q${122+i*198} 205 ${target} 280`} fill="none" stroke={selected >= 0 ? colors[selected] : "#6b8298"} strokeDasharray={selected >= 0 ? undefined : "4 7"} strokeWidth={selected >= 0 ? 2 : 1}/>
            <rect x={75+i*198} y="72" width="94" height="62" rx="6" fill="#1b2b3b" stroke="#8fa9bd"/>
            <text x={122+i*198} y="96" textAnchor="middle" fontSize="11" fill="#a4bdcf">СВЕДЕНИЕ</text>
            <text x={122+i*198} y="119" textAnchor="middle" fontSize="19" fill="#e3eaf0">0{i+1}</text>
          </g>;
        })}
        <text x="320" y="431" textAnchor="middle" fill="#d9b986" fontSize="12" letterSpacing="2">РАЗЛИЧИТЬ ВИДЫ ЗНАНИЯ</text>
      </> : <>
        <g fill="none" stroke="#9ab2c6">
          <circle cx="320" cy="246" r="164" opacity=".2"/>
          <circle cx="320" cy="246" r="116" opacity=".4"/>
          <path d="M320 94L169 330H471Z" opacity=".7"/>
          <path d="M320 94V246M169 330L320 246M471 330L320 246" opacity=".6" strokeDasharray="4 7"/>
        </g>
        {["НАБЛЮДЕНИЕ","СООБЩЕНИЕ","ГИПОТЕЗА"].map((item,i) => {
          const x=[320,169,471][i], y=[94,330,330][i];
          return <g key={item}><circle cx={x} cy={y} r="60" fill="#1a2c3b" stroke={colors[i]}/><text x={x} y={y+4} fill={colors[i]} textAnchor="middle" fontSize="12">{item}</text></g>;
        })}
        <circle cx="320" cy="246" r="55" fill={completed ? "#5b4933" : "#1d3142"} stroke="#d9b986" strokeWidth="2"/>
        <text x="320" y="250" textAnchor="middle" fill="#efdbb9" fontSize="14">{completed ? "ОТКРЫТИЕ" : "СИНТЕЗ"}</text>
        <text x="320" y="453" textAnchor="middle" fill="#d9b986" fontSize="12" letterSpacing="2">ОБОСНОВАННОЕ СУЖДЕНИЕ</text>
      </>}
    </svg>
  );
}

export default function SiriusJourney({ observation, report, onFinish, standalone = false }: { observation: string; report: string; onFinish: () => void; standalone?: boolean }) {
  const [step, setStep] = useState(0);
  const [inspected, setInspected] = useState(false);
  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const [path, setPath] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([-1,-1,-1]);
  const [experiments, setExperiments] = useState<number[]>([0,0,0]);
  const [explored, setExplored] = useState<boolean[]>([false,false,false]);
  const [sorted, setSorted] = useState<number[]>([-1,-1,-1]);
  const [revised, setRevised] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (!standalone || step > 0 || completed) heading.current?.focus({ preventScroll: false }); }, [step, completed, standalone]);
  function reset() {
    setStep(0); setInspected(false); setHypothesis(null); setPath(null); setAnswers([-1,-1,-1]); setExperiments([0,0,0]); setExplored([false,false,false]);
    setSorted([-1,-1,-1]); setRevised(null); setCompleted(false);
  }
  const route = questions[path ?? 0];
  const answer = path === null ? -1 : answers[path];
  const exploredCount = explored.filter(Boolean).length;
  function updateExperiment(mode: number) { if (path !== null) setExperiments(old => old.map((value,i) => i === path ? mode : value)); }
  function selectAnswer(i: number) { if (path !== null) { setAnswers(old => old.map((value,k) => k === path ? i : value)); setExplored(old => old.map((value,k) => k === path ? true : value)); } }
  const ready = sorted.every(value => value >= 0);
  const valid = sorted.every((value, index) => categories[value] === cards[index].category);
  const titles = ["Что упало с неба?", "Ваше первое объяснение", path === null ? "Куда направить исследование?" : route.title, "Разложите сведения", completed ? "Вы открыли различие" : "Возвращение к гипотезе"];
  return (
    <div className="diveJourney" data-depth={step} data-completed={completed}>
      <nav className="diveProgress" aria-label="Этапы исследования">
        {chapters.map((chapter, i) => <span key={chapter} aria-current={i === step ? "step" : undefined} data-reached={i <= step}><i>{String(i + 1).padStart(2, "0")}</i><span>{chapter}</span></span>)}
      </nav>
      <div className="diveScene">
        <div className="diveStageArt" data-inspected={inspected} aria-hidden="true">
          <div className="diveOrbit diveOrbitOne" /><div className="diveOrbit diveOrbitTwo" />
          {step < 2 ? <SiriusArtifact inspected={inspected} /> : <ReasoningField key={step} step={step} path={path} sorted={sorted} completed={completed} explored={explored} />}
          <div className="diveArtMeta"><span>SEAHAVEN / 001</span><span>{chapters[step].toUpperCase()}</span></div>
        </div>
        <section className="diveRoom" key={step + "-" + String(completed)} aria-labelledby="dive-room-title">
          <p className="diveEyebrow">Глубина {String(step + 1).padStart(2, "0")} / 05</p>
          <h2 id="dive-room-title" ref={heading} tabIndex={-1}>{titles[step]}</h2>
          {step === 0 ? <>
            <p>На улице обнаружен необычный предмет. Пока не нужно объяснять его происхождение. Начните с того, что можно увидеть.</p>
            <button type="button" className="diveChoice" aria-expanded={inspected} onClick={() => setInspected(!inspected)}>Рассмотреть маркировку <span aria-hidden="true">◎</span></button>
            {inspected ? <div className="diveInsight"><strong>Наблюдение</strong><p>{observation}</p></div> : null}
            <button type="button" className="divePrimary" disabled={!inspected} onClick={() => setStep(1)}>Сформулировать гипотезу <span aria-hidden="true">→</span></button>
          </> : step === 1 ? <>
            <p>Что могло бы объяснить находку? Пока это только предположение, а не знание.</p>
            {hypotheses.map((item, i) => <button key={item} type="button" className="diveChoice" aria-pressed={hypothesis === i} onClick={() => setHypothesis(i)}>{item}</button>)}
            <button type="button" className="divePrimary" disabled={hypothesis === null} onClick={() => setStep(2)}>Выбрать способ проверки <span aria-hidden="true">→</span></button>
          </> : step === 2 ? <>
            <p>Выберите направление исследования. Каждая ветвь открывает свой эксперимент. Можно пройти одну или сопоставить все три.</p>
            <div className="diveBranches">{paths.map((item, i) => <button key={item} type="button" className="diveBranch" aria-pressed={path === i} onClick={() => setPath(i)} data-explored={explored[i]}><span aria-hidden="true">0{i+1}{explored[i] ? " ✓" : ""}</span>{item}</button>)}</div>
            {path !== null ? <div className="diveBranchContent" key={path}>
              <p>{path === 0 ? observation : path === 1 ? report : "Представьте возможность проверить предмет по независимому источнику. Это условная ситуация, не событие фильма."}</p>
              {path === 0 ? <ClaimExperiment mode={experiments[path]} setMode={updateExperiment} /> : path === 1 ? <ReportExperiment mode={experiments[path]} setMode={updateExperiment} /> : <SourceExperiment mode={experiments[path]} setMode={updateExperiment} />}
              <strong>{route.question}</strong>
              {route.options.map((item, i) => <button type="button" className="diveChoice" key={item} aria-pressed={answer === i} onClick={() => selectAnswer(i)}>{item}</button>)}
              {answer >= 0 ? <div className="diveInsight" role="status"><strong>{answer === 0 ? "Обоснованный вывод" : "Здесь необходима дополнительная проверка"}</strong><p>{route.explanation}</p></div> : null}
            </div> : null}
            <button type="button" className="divePrimary" disabled={exploredCount === 0} onClick={() => setStep(3)}>Соединить сведения <span aria-hidden="true">→</span></button>
          </> : step === 3 ? <>
            <p>Распределите три утверждения по категориям. Можно исправлять решения сколько угодно.</p>
            <div className="diveTrace"><strong>Ваши открытия · {exploredCount} из 3 ветвей</strong>{findings.filter((_,i) => explored[i]).map(item => <p key={item}>{item}</p>)}</div>
            {cards.map((item, index) => <fieldset className="diveSort" key={item.text}>
              <legend>{item.text}</legend>
              <div>{categories.map((category, i) => <button key={category} type="button" className="diveSortButton" aria-pressed={sorted[index] === i} onClick={() => setSorted(previous => previous.map((value, j) => j === index ? i : value))}>{category}</button>)}</div>
              {sorted[index] >= 0 ? <small>{categories[sorted[index]] === item.category ? "Категория обоснована." : "Подумайте: это увидено, сообщено или предположено?"}</small> : null}
            </fieldset>)}
            {ready ? <div role="status" className="diveInsight"><p>{valid ? "Наблюдение, сообщение и гипотеза различены." : "Не все категории совпали. В финале вы сможете сопоставить их с разбором."}</p></div> : null}
            <button type="button" className="divePrimary" disabled={!ready} onClick={() => setStep(4)}>Вернуться к первому выводу <span aria-hidden="true">→</span></button>
          </> : !completed ? <>
            <div className="diveInsight"><strong>Ваша первая гипотеза</strong><p>{hypotheses[hypothesis ?? 2]}</p></div>
            <p>Предмет и сообщение — разные виды сведений. Достаточно ли их, чтобы принять прежнее объяснение? Выберите теперь.</p>
            <div className="diveTrace"><strong>Основания, которые вы исследовали</strong>{findings.filter((_,i) => explored[i]).map(item => <p key={item}>{item}</p>)}</div>
            {hypotheses.map((item, i) => <button key={item} type="button" className="diveChoice" aria-pressed={revised === i} onClick={() => setRevised(i)}>{item}</button>)}
            <button type="button" className="divePrimary" disabled={revised === null} onClick={() => setCompleted(true)}>Открыть итог <span aria-hidden="true">→</span></button>
          </> : <>
            <div className="diveBeforeAfter"><div><small>Первый вывод</small><strong>{hypotheses[hypothesis ?? 2]}</strong></div><span aria-hidden="true">→</span><div><small>После исследования</small><strong>{hypotheses[revised ?? 2]}</strong></div></div>
            <p>Вы {hypothesis === revised ? "сохранили первоначальную гипотезу" : "пересмотрели первоначальную гипотезу"}. Важно не само изменение, а основание вывода: наблюдение подтверждает предмет, сообщение — существование объяснения, гипотеза требует проверки.</p>
            {!valid ? <div className="diveInsight"><strong>Сопоставление категорий</strong>{cards.map(item => <p key={item.text}>{item.category} — {item.text}</p>)}</div> : null}
            <div className="diveTrace"><strong>Пройденный путь · {exploredCount} из 3 ветвей</strong>{findings.filter((_,i) => explored[i]).map(item => <p key={item}>{item}</p>)}</div>
            <p>В этом и состоит первое открытие фильма: увидеть странность недостаточно. Нужно понять, насколько обосновано объяснение, которому мы доверяем.</p>
            <button type="button" className="divePrimary" onClick={onFinish}>{standalone ? "Перейти к разбору фильма" : "Продолжить статью"} <span aria-hidden="true">→</span></button>
            <button type="button" className="diveChoice" onClick={reset}>Исследовать заново</button>
          </>}
          {step > 0 && !completed ? <button type="button" className="diveBack" onClick={() => setStep(step - 1)}>← Предыдущий слой</button> : null}
        </section>
      </div>
      <footer className="diveFoot"><span>Авторская визуализация · не кадр фильма</span><span>Ваши ответы остаются в текущем сеансе.</span></footer>
    </div>
  );
}
