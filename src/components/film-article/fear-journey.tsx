"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { DiveDiscovery, DiveFearData } from "@/lib/dive-opening";

const actions = ["Переправиться сейчас", "Проверить условия и попросить помощи", "Отложить переправу"] as const;
const levels = ["Безопасность", "Память", "Предупреждение", "Суждение"] as const;

function WaterField({ risk, trusted, memory, decision }: { risk: boolean; trusted: boolean; memory: boolean; decision: number | null }) {
  return (
    <svg viewBox="0 0 640 560" className="fearWaterField" role="img" aria-label="Условная схема двух берегов и путей переправы; состояние меняется при выборе условий">
      <defs>
        <linearGradient id="fear-water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0b2836"/><stop offset=".5" stopColor="#173b51"/><stop offset="1" stopColor="#071320"/></linearGradient>
        <linearGradient id="fear-bank" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#253e47"/><stop offset="1" stopColor="#0c1a21"/></linearGradient>
        <radialGradient id="fear-light"><stop stopColor="#e9c88b" stopOpacity=".4"/><stop offset="1" stopColor="#e9c88b" stopOpacity="0"/></radialGradient>
        <pattern id="fear-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#a3bfce" strokeOpacity=".09"/></pattern>
      </defs>
      <rect width="640" height="560" fill="url(#fear-water)"/>
      <rect width="640" height="560" fill="url(#fear-grid)"/>
      <g className="fearWaterLines" opacity={risk ? ".75" : ".45"} fill="none" stroke="#7ab5c7">
        {Array.from({length:15},(_,i) => <path key={i} d={`M-30 ${135+i*25} Q80 ${115+i*25-(risk?17:0)} 180 ${138+i*25} T390 ${138+i*25} T675 ${138+i*25}`} strokeWidth={i%3===0?1.6:.8}/>)}
      </g>
      <path d="M0 0H640V75L490 137L411 108L272 135L180 99L0 151Z" fill="url(#fear-bank)" stroke="#83a6ae" strokeOpacity=".6"/>
      <path d="M0 560H640V478L510 437L415 465L298 421L158 464L0 420Z" fill="url(#fear-bank)" stroke="#83a6ae" strokeOpacity=".7"/>
      <g fill="none" stroke="#8caeb5" strokeOpacity=".24">
        {[12,24,36].map(offset=><g key={offset}>
          <path d="M0 151L180 99 272 135 411 108 490 137 640 75" transform={`translate(0 ${-offset})`}/>
          <path d="M0 420L158 464 298 421 415 465 510 437 640 478" transform={`translate(0 ${offset})`}/>
        </g>)}
      </g>
      <g stroke="#c1d9e3" strokeOpacity=".7" fill="none">
        <path d="M22 44V22h22m552 0h22v22M22 516v22h22m552 0h22v-22"/>
        <circle cx="570" cy="183" r="20" strokeOpacity=".35"/><path d="M570 165v36m-18-18h36m-18-18 5 13-5-3-5 3z"/>
        <path d="M36 356v45m0-45h6m-6 15h4m-4 15h4m-4 15h6"/>
      </g>
      <ellipse cx="320" cy="111" rx="100" ry="75" fill="url(#fear-light)"/>
      <g stroke="#c8b184" fill="none">
        <path d="M320 452C320 380 265 306 320 226S320 155 320 111" strokeWidth={decision===0?4:1.6} strokeDasharray={risk?"4 8":undefined} opacity={decision===2?.2:1}/>
        <path d="M320 452Q100 335 192 245T320 111" strokeWidth={decision===1?4:1.2} strokeDasharray="4 7" opacity={decision===1?1:.4}/>
      </g>
      {memory ? <g opacity=".8"><circle cx="320" cy="307" r="95" fill="#192b3b" fillOpacity=".75" stroke="#9e8ca4" strokeDasharray="3 8"/><path d="M320 246V369M259 307H381" stroke="#9e8ca4" strokeOpacity=".4"/><text x="320" y="311" textAnchor="middle" fill="#e1ccd5" fontSize="16">ПАМЯТЬ</text></g> : null}
      <g transform="translate(320 452)"><circle r="23" fill="#d5b67e" fillOpacity=".17" stroke="#d5b67e"/><circle r="7" fill="#e5c998"/></g>
      <g transform="translate(320 111)"><circle r="23" fill="#d5b67e" fillOpacity=".15" stroke="#d5b67e"/><circle r="7" fill="#e5c998"/></g>
      <g transform="translate(475 260)"><rect x="-73" y="-25" width="146" height="50" rx="5" fill="#0c1c29" stroke={trusted?"#cbb587":"#8393a2"} strokeDasharray={trusted?undefined:"3 5"}/><text x="0" y="-3" textAnchor="middle" fontSize="11" fill="#d6e0e6">ПРЕДУПРЕЖДЕНИЕ</text><text x="0" y="14" textAnchor="middle" fontSize="11" fill={trusted?"#e5c998":"#b3c4d2"}>{trusted?"ПРОВЕРЕНО":"НЕ ПРОВЕРЕНО"}</text></g>
      <text x="320" y="70" textAnchor="middle" fill="#d6d1bc" fontSize="14" letterSpacing="3">ДРУГОЙ БЕРЕГ</text>
      <text x="320" y="510" textAnchor="middle" fill="#d6d1bc" fontSize="14" letterSpacing="3">ТОЧКА РЕШЕНИЯ</text>
      <text x="42" y="202" fill={risk?"#efa2a4":"#bbd4df"} fontSize="15">{risk?"ОПАСНЫЕ УСЛОВИЯ":"ПРИЕМЛЕМЫЕ УСЛОВИЯ"}</text>
    </svg>
  );
}

export default function FearJourney({data,onFinish,onRevise,onReturn,articleHref}: {data:DiveFearData;onFinish:(discovery:DiveDiscovery)=>void;onRevise:()=>void;onReturn:()=>void;articleHref:string}) {
  const [step,setStep] = useState(0);
  const [risk,setRisk] = useState(true);
  const [trusted,setTrusted] = useState(false);
  const [memory,setMemory] = useState(false);
  const [first,setFirst] = useState<number|null>(null);
  const [second,setSecond] = useState<number|null>(null);
  const [finished,setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function go(next:number) {setStep(next); requestAnimationFrame(() => heading.current?.focus());}
  const action = step < 2 ? first : second;
  const guidance = risk
    ? "При подтверждённых опасных условиях отсрочка может быть разумной. Само наличие страха не делает решение ошибочным."
    : "Если независимая проверка подтверждает приемлемые условия переправы, прежний страх не доказывает нынешнюю опасность. Решение всё равно остаётся за человеком.";
  return (
    <div className="fearJourney" data-fear-step={step}>
      <nav className="diveProgress fearProgress" aria-label="Этапы второй комнаты">{levels.map((item,i)=><span key={item} aria-current={step===i?"step":undefined} data-reached={i<=step}><i>0{i+1}</i><span>{item}</span></span>)}</nav>
      <div className="diveScene">
        <div className="fearStage">
          <div className="diveInstrumentHeader"><span lang="en">FEAR / CROSSING STUDY</span><span>Условная модель</span></div>
          <WaterField risk={risk} trusted={trusted} memory={memory} decision={action}/>
          <dl className="diveInstrumentReadout"><div><dt>Условия</dt><dd data-warning={risk}>{risk?"Опасные":"Приемлемые"}</dd></div><div><dt>Предупреждение</dt><dd>{trusted?"Проверено":"Не проверено"}</dd></div><div><dt>Память</dt><dd>{memory?"Включена":"Скрыта"}</dd></div></dl>
          <p>Условная пространственная модель · не география фильма и не прогноз безопасности переправы</p>
        </div>
        <section className="diveRoom fearRoom" aria-labelledby="fear-heading">
          <p className="diveEyebrow">FEAR / 02 · {levels[step]}</p>
          <h2 id="fear-heading" ref={heading} tabIndex={-1}>{["Перед вами вода","Что меняет прошлое?","Кто определяет опасность?","Страх и свобода"][step]}</h2>
          {step===0 ? <>
            <p>Представьте условную переправу: нужно добраться до другого берега, но сейчас известно о неблагоприятных условиях. Что вы сделаете?</p>
            {actions.map((item,i)=><button type="button" key={item} className="diveChoice" aria-pressed={first===i} onClick={()=>setFirst(i)}>{item}</button>)}
            {first!==null ? <div className="diveInsight" role="status"><p>{first===0?"Действие вопреки опасности не становится разумным только потому, что требует смелости.":first===1?"Проверка может изменить доступное знание и открыть другие варианты.":"Отсрочка может защищать человека от реального риска."}</p></div>:null}
            <button type="button" className="divePrimary" disabled={first===null} onClick={()=>{setMemory(true);go(1)}}>Открыть прошлое героя →</button>
          </> : step===1 ? <>
            <div className="diveInsight"><strong>Сцена фильма</strong><p>{data.memory}</p></div>
            <p>{data.ferry}</p>
            <p>Море связано в истории героя с утратой отца. Это помогает понять его нежелание подниматься на паром. Но воспоминание само по себе не устанавливает опасность каждой следующей переправы.</p>
            <button type="button" className="diveChoice" aria-pressed={memory} onClick={()=>setMemory(!memory)}>Слой памяти</button>
            <button type="button" className="divePrimary" onClick={()=>go(2)}>Изменить условия →</button>
          </> : step===2 ? <>
            <div className="diveInsight"><strong>Другой эпизод фильма</strong><p>{data.warning}</p></div>
            <p>Теперь измените условия нашего мысленного эксперимента. Это не реконструкция действий Трумана и не инструкция по реальной безопасности.</p>
            <div className="diveExperiment">
              <strong>Условия переправы (условно)</strong>
              <div className="diveExperimentControls"><button type="button" className="diveSortButton" aria-pressed={risk} onClick={()=>setRisk(true)}>Опасные</button><button type="button" className="diveSortButton" aria-pressed={!risk} onClick={()=>setRisk(false)}>Приемлемые по проверке</button></div>
              <strong>Предупреждение подтверждено?</strong>
              <div className="diveExperimentControls"><button type="button" className="diveSortButton" aria-pressed={!trusted} onClick={()=>setTrusted(false)}>Нет независимой проверки</button><button type="button" className="diveSortButton" aria-pressed={trusted} onClick={()=>setTrusted(true)}>Есть независимая проверка</button></div>
              <p role="status">{guidance} {trusted?"У предупреждения есть независимая опора; оцените, относится ли оно к конкретной переправе.":"Одно предупреждение не доказывает конкретную угрозу; важно проверить его основание."}</p>
            </div>
            <p>Что вы выберете теперь?</p>
            {actions.map((item,i)=><button type="button" key={item} className="diveChoice" aria-pressed={second===i} onClick={()=>setSecond(i)}>{item}</button>)}
            <button type="button" className="divePrimary" disabled={second===null} onClick={()=>go(3)}>Сопоставить решения →</button>
          </> : <>
            <div className="diveBeforeAfter"><div><small>Первое решение</small><strong>{actions[first??2]}</strong></div><span aria-hidden="true">→</span><div><small>После изменения условий</small><strong>{actions[second??2]}</strong></div></div>
            <p>{guidance}</p>
            <p>{first === second ? "Вы сохранили первое решение. Теперь сравните основания: одинаковый поступок в разных обстоятельствах может быть разумным по разным причинам." : "Вы изменили решение. Вопрос не в том, лучше ли второй выбор сам по себе, а в том, какие новые сведения его обосновали."}</p>
            <p>Фильм предлагает исследовать не только страх, но и среду, в которой человек вынужден выбирать. Забота помогает понять опасность и принять решение; контроль может превращать предупреждение в средство ограничения чужих возможностей. Пока мы не раскрываем позднейшие события.</p>
            <div className="diveInsight"><strong>Открытие</strong><p>Страх может быть настоящим, даже если его обстоятельствами пользуются другие. Ни отсутствие страха, ни его наличие не являются сами по себе мерой мудрости или мужества.</p></div>
            {finished ? <p className="diveCompletion" role="status"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><span>Вторая комната исследована. Открытия сохранены в карте путешествия.</span></p> : <button type="button" className="divePrimary" onClick={()=>{setFinished(true);onFinish({before:actions[first??2],after:actions[second??2],insight:"Страх и нынешняя опасность не одно и то же; забота не отменяет свободу выбора.",grounds:[risk?"Условная переправа опасна.":"Условная переправа признана приемлемой по проверке.",trusted?"Предупреждение имеет независимое подтверждение.":"Предупреждение не подтверждено независимо."]})}}>Завершить второе погружение</button>}
            <Link className="diveStandaloneRead" href={articleHref}>Читать анализ фильма →</Link>
            <button type="button" className="diveChoice" onClick={onReturn}>Вернуться в SIRIUS</button>
          </>}
          {step>0 ? <button type="button" className="diveBack" onClick={()=>{if(finished)onRevise();setFinished(false);go(step-1)}}>← Предыдущий слой</button>:null}
        </section>
      </div>
    </div>
  );
}
