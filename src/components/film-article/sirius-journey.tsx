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

export default function SiriusJourney({ observation, report, onFinish }: { observation: string; report: string; onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [inspected, setInspected] = useState(false);
  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const [path, setPath] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [sorted, setSorted] = useState<number[]>([-1,-1,-1]);
  const [revised, setRevised] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: false }); }, [step, completed]);
  function reset() {
    setStep(0); setInspected(false); setHypothesis(null); setPath(null); setAnswer(null);
    setSorted([-1,-1,-1]); setRevised(null); setCompleted(false);
  }
  const route = questions[path ?? 0];
  const ready = sorted.every(value => value >= 0);
  const valid = sorted.every((value, index) => categories[value] === cards[index].category);
  const titles = ["Что упало с неба?", "Ваше первое объяснение", path === null ? "Куда направить исследование?" : route.title, "Разложите сведения", completed ? "Вы открыли различие" : "Возвращение к гипотезе"];
  return (
    <div className="diveJourney" data-depth={step} data-completed={completed}>
      <nav className="diveProgress" aria-label="Этапы исследования">
        {chapters.map((chapter, i) => <span key={chapter} aria-current={i === step ? "step" : undefined} data-reached={i <= step}><i>{String(i + 1).padStart(2, "0")}</i><span>{chapter}</span></span>)}
      </nav>
      <div className="diveScene">
        <div className="diveStageArt" aria-hidden="true">
          <div className="diveOrbit diveOrbitOne" /><div className="diveOrbit diveOrbitTwo" />
          <SiriusArtifact inspected={inspected} />
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
            <p>Откройте один путь. Можно сравнить и остальные, прежде чем идти дальше.</p>
            <div className="diveBranches">{paths.map((item, i) => <button key={item} type="button" className="diveBranch" aria-pressed={path === i} onClick={() => {setPath(i);setAnswer(null);}}><span aria-hidden="true">0{i+1}</span>{item}</button>)}</div>
            {path !== null ? <div className="diveBranchContent" key={path}>
              <p>{path === 0 ? observation : path === 1 ? report : "Представьте возможность проверить предмет по независимому источнику. Это условная ситуация, не событие фильма."}</p>
              <strong>{route.question}</strong>
              {route.options.map((item, i) => <button type="button" className="diveChoice" key={item} aria-pressed={answer === i} onClick={() => setAnswer(i)}>{item}</button>)}
              {answer !== null ? <div className="diveInsight" role="status"><strong>{answer === 0 ? "Обоснованный вывод" : "Здесь необходима дополнительная проверка"}</strong><p>{route.explanation}</p></div> : null}
            </div> : null}
            <button type="button" className="divePrimary" disabled={answer === null} onClick={() => setStep(3)}>Соединить сведения <span aria-hidden="true">→</span></button>
          </> : step === 3 ? <>
            <p>Распределите три утверждения по категориям. Можно исправлять решения сколько угодно.</p>
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
            {hypotheses.map((item, i) => <button key={item} type="button" className="diveChoice" aria-pressed={revised === i} onClick={() => setRevised(i)}>{item}</button>)}
            <button type="button" className="divePrimary" disabled={revised === null} onClick={() => setCompleted(true)}>Открыть итог <span aria-hidden="true">→</span></button>
          </> : <>
            <div className="diveBeforeAfter"><div><small>Первый вывод</small><strong>{hypotheses[hypothesis ?? 2]}</strong></div><span aria-hidden="true">→</span><div><small>После исследования</small><strong>{hypotheses[revised ?? 2]}</strong></div></div>
            <p>Вы {hypothesis === revised ? "сохранили первоначальную гипотезу" : "пересмотрели первоначальную гипотезу"}. Важно не само изменение, а основание вывода: наблюдение подтверждает предмет, сообщение — существование объяснения, гипотеза требует проверки.</p>
            <p>В этом и состоит первое открытие фильма: увидеть странность недостаточно. Нужно понять, насколько обосновано объяснение, которому мы доверяем.</p>
            <button type="button" className="divePrimary" onClick={onFinish}>Продолжить статью <span aria-hidden="true">→</span></button>
            <button type="button" className="diveChoice" onClick={reset}>Исследовать заново</button>
          </>}
          {step > 0 && !completed ? <button type="button" className="diveBack" onClick={() => setStep(step - 1)}>← Предыдущий слой</button> : null}
        </section>
      </div>
      <footer className="diveFoot"><span>Авторская схема прибора · не кадр фильма</span><span>Ваши ответы остаются в текущем сеансе.</span></footer>
    </div>
  );
}
