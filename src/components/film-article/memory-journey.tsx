"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { DiveDiscovery, DiveMemoryData } from "@/lib/dive-opening";

const lenses = ["Семейная преемственность","Личное воспоминание","Право на собственную историю"] as const;
const captions = ["Альбом удерживает общее прошлое семьи. Он может быть знаком близости, но один предмет не доказывает искренности всех отношений.","Образ девушки, собираемый из фрагментов журналов, показывает попытку удержать память о встрече. Мы не можем по этому предмету знать все чувства героя.","Сопоставление предметов открывает различие между тем, какую историю человеку предлагают о нём, и тем, что он пытается сохранить сам."] as const;

function MemoryField({first,seen,lens}:{first:number;seen:boolean[];lens:number|null}) {
  return <svg viewBox="0 0 640 520" className="memoryField" role="img" aria-label="Авторская символическая композиция семейного альбома и журнальных фрагментов">
    <defs>
      <radialGradient id="memory-glow"><stop stopColor="#b5a078" stopOpacity=".33"/><stop offset="1" stopColor="#19181d" stopOpacity="0"/></radialGradient>
      <linearGradient id="memory-paper" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#e9ddbd"/><stop offset="1" stopColor="#8c7c60"/></linearGradient>
      <pattern id="memory-grain" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 10L30 8M0 22L30 24" stroke="#dac6a8" strokeOpacity=".09" fill="none"/></pattern>
    </defs>
    <rect width="640" height="520" fill="#1a2028"/><rect width="640" height="520" fill="url(#memory-glow)"/><rect width="640" height="520" fill="url(#memory-grain)"/>
    <g fill="none" stroke="#ceb38b" opacity=".3">
      <path d="M24 50V26h24m544 0h24v24M24 470v24h24m544 0h24v-24"/>
      <path d="M320 125v250M40 264h560" strokeDasharray="2 7"/>
      <path d="M30 148h580M30 378h580"/>
    </g>
    <g fill="#e1cba9" fontSize="12" fontFamily="monospace">
      <text x="40" y="44">01 / ARCHIVE</text><text x="600" y="44" textAnchor="end">02 / FRAGMENTS</text>
    </g>
    <path d="M115 265Q320 95 525 265" fill="none" stroke="#d3b88a" strokeOpacity={seen.every(Boolean)?".9":".25"} strokeWidth="2" strokeDasharray={seen.every(Boolean)?undefined:"5 8"}/>
    <g className="memoryAlbum" transform={`translate(${first===0?167:473} 264) rotate(-8)`} opacity={seen[0]?1:.42}>
      <rect x="-105" y="-89" width="210" height="174" rx="7" fill="#49382a" stroke="#b09a78" strokeWidth="2"/>
      <path d="M-94 -76H-7V72H-94ZM7 -76H94V72H7Z" fill="url(#memory-paper)" stroke="#d4c2a1"/>
      <path d="M0 -76V72" stroke="#6b5540" strokeWidth="2"/>
      {[-1,1].map(n=><g key={n} transform={`translate(${n*49} -22)`}><rect x="-32" y="-34" width="64" height="68" fill="#29313a" stroke="#f1dfbf" strokeWidth="4"/><circle cy="-10" r="10" fill="#8c9ca2"/><path d="M-23 27Q-22 0 0 0T23 27" fill="#73858e"/></g>)}
      <path d="M-83 43H-16M17 43H83M-83 52H-33M17 52H64" stroke="#655746" strokeWidth="2" opacity=".6"/>
    </g>
    <g className="memoryFragments" transform={`translate(${first===1?167:473} 264) rotate(7)`} opacity={seen[1]?1:.42}>
      <path d="M-94 -90L-8 -78L-19 -15L-105 -25Z" fill="#c6bdab" stroke="#ddd3bc"/>
      <path d="M5 -94L98 -80L87 -18L10 -15Z" fill="#a8b2b5" stroke="#e0d7c6"/>
      <path d="M-100 -7L-12 -2L-15 78L-91 86Z" fill="#8d9fa7" stroke="#e2dbce"/>
      <path d="M1 0L100 -3L90 87L6 75Z" fill="#c6aa84" stroke="#e0d7c6"/>
      <path d="M-70 -50Q-48 -69 -26 -45M35 -52Q61 -69 79 -45M-62 45Q-25 23 10 43M27 29Q60 57 77 19" fill="none" stroke="#354753" strokeWidth="3" opacity=".72"/>
    </g>
    <g fill="none" stroke="#ceb38b"><circle cx="320" cy="108" r="25" fill="#a38d6a" fillOpacity=".15"/><circle cx="320" cy="108" r="34" strokeDasharray="3 6" opacity=".5"/></g>
    <path d="M320 95V121M307 108H333" stroke="#e0c49b"/>
    <text x="320" y="62" textAnchor="middle" fill="#e1cba9" fontSize="13" letterSpacing="3">ДВА ФРАГМЕНТА</text>
    <text x="167" y="404" textAnchor="middle" fill="#e0d6c6" fontSize="16">{first===0?"СЕМЕЙНЫЙ АЛЬБОМ":"ФРАГМЕНТЫ ПАМЯТИ"}</text>
    <text x="473" y="404" textAnchor="middle" fill="#e0d6c6" fontSize="16">{first===1?"СЕМЕЙНЫЙ АЛЬБОМ":"ФРАГМЕНТЫ ПАМЯТИ"}</text>
    <rect x="100" y="444" width="440" height="40" rx="5" fill="#242b33" stroke="#bba17b66"/>
    <text x="320" y="469" textAnchor="middle" fill="#e0c8a4" fontSize="13">{lens===null?"ВЫБЕРИТЕ СМЫСЛОВУЮ ЛИНЗУ":lenses[lens].toUpperCase()}</text>
  </svg>;
}

export default function MemoryJourney({data,onFinish,onRevise,onReturn,articleHref}:{data:DiveMemoryData;onFinish:(discovery:DiveDiscovery)=>void;onRevise:()=>void;onReturn:()=>void;articleHref:string}) {
  const [step,setStep]=useState(0);
  const [first,setFirst]=useState(0);
  const [seen,setSeen]=useState([false,false]);
  const [expanded,setExpanded]=useState([false,false]);
  const fragmentId=useId();
  function toggleFragment(i:number) {
    setExpanded(old=>old.map((v,k)=>k===i?!v:v));
    setSeen(old=>old.map((v,k)=>k===i?true:v));
  }
  const [initial,setInitial]=useState<number|null>(null);
  const [lens,setLens]=useState<number|null>(null);
  const [finished,setFinished]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  function go(next:number){setStep(next);requestAnimationFrame(()=>heading.current?.focus());}
  const objects=[{title:"Семейный альбом",copy:data.album},{title:"Фрагменты журналов",copy:data.fiji}];
  return <div className="memoryJourney" data-memory-step={step}>
    <nav className="diveProgress memoryProgress" aria-label="Этапы третьей комнаты">{["Фрагменты","Монтаж смысла","Синтез"].map((item,i)=><span key={item} aria-current={step===i?"step":undefined} data-reached={i<=step}><i>0{i+1}</i><span>{item}</span></span>)}</nav>
    <div className="diveScene">
      <div className="memoryStage"><div className="diveInstrumentHeader"><span lang="en">MEMORY / EDITING DESK</span><span>Авторская схема</span></div><MemoryField first={first} seen={seen} lens={lens}/><dl className="diveInstrumentReadout"><div><dt>Фрагменты</dt><dd>{seen.filter(Boolean).length} / 2 изучено</dd></div><div><dt>Первый в композиции</dt><dd>{objects[first].title}</dd></div><div><dt>Смысловая линза</dt><dd>{lens===null?"Не выбрана":lenses[lens]}</dd></div></dl><p>Авторская схема предметов, не кадры и не восстановленный порядок монтажа фильма.</p></div>
      <section className="diveRoom" aria-labelledby="memory-heading">
        <p className="diveEyebrow">MEMORY / 03</p>
        <h2 id="memory-heading" ref={heading} tabIndex={-1}>{["Две истории о себе","Измените смысловое соседство","Чья это история?"][step]}</h2>
        {step===0?<><p>В фильме встречаются два предмета, которые по-разному удерживают прошлое. Выберите первый, затем второй.</p>
          {[first,1-first].map(i=><div key={i} className="memoryFragment"><button type="button" className="diveChoice memoryFragmentToggle" aria-expanded={expanded[i]} aria-controls={`${fragmentId}-${i}`} onClick={()=>toggleFragment(i)}><span>{objects[i].title}</span>{seen[i]?<span className="memoryReadMark"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg><span>Изучено</span></span>:null}</button><div id={`${fragmentId}-${i}`} className="diveInsight" hidden={!expanded[i]}><strong>Сцена фильма</strong><p>{objects[i].copy}</p></div></div>)}
          <button type="button" className="divePrimary" disabled={!seen.every(Boolean)} onClick={()=>go(1)}>Собрать два фрагмента →</button>
        </>:step===1?<><p>Порядок, в котором мы рассматриваем предметы, способен менять акцент нашего прочтения. Это редакционный эксперимент, а не утверждение о монтаже оригинала.</p>
          <div className="diveExperiment"><strong>Что поставить первым?</strong><div className="diveExperimentControls">{objects.map((item,i)=><button type="button" key={item.title} className="diveSortButton" aria-pressed={first===i} onClick={()=>setFirst(i)}>{item.title}</button>)}</div><p role="status">{first===0?"Начинаем с истории, которую семья хранит и рассказывает, затем замечаем то, что человек пытается сохранить сам.":"Начинаем с личного усилия удержать образ, затем сопоставляем его с историей, которую предлагает семья."}</p></div>
          <p>Какая смысловая линза вам сейчас кажется особенно важной?</p>
          {lenses.map((item,i)=><button type="button" key={item} className="diveChoice" aria-pressed={lens===i} onClick={()=>{setLens(i);if(initial===null)setInitial(i);}}>{item}</button>)}
          {lens!==null?<div className="diveInsight" role="status"><p>{captions[lens]}</p></div>:null}
          <button type="button" className="divePrimary" disabled={lens===null} onClick={()=>go(2)}>Сопоставить прочтения →</button>
        </>:<>
          <div className="diveBeforeAfter"><div><small>Первый акцент</small><strong>{lenses[initial??0]}</strong></div><span aria-hidden="true">→</span><div><small>Последний акцент</small><strong>{lenses[lens??0]}</strong></div></div>
          <p>{captions[lens??0]}</p><p>Альбом и журнальные фрагменты не доказывают, что одна память истинна, а другая ложна. Но их сопоставление помогает увидеть центральный вопрос: кто вправе формировать историю человеческой жизни и насколько эта история открыта правде?</p>
          <div className="diveInsight"><strong>Открытие</strong><p>Семейная близость не исчерпывается общей памятью. Она требует правдивости, иначе рассказ о прошлом может стать способом распоряжаться настоящим другого человека.</p></div>
          {finished?<p className="diveCompletion" role="status"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><span>Третья комната исследована. Откройте «Мои открытия», чтобы связать три уровня путешествия.</span></p>:<button type="button" className="divePrimary" onClick={()=>{setFinished(true);onFinish({before:lenses[initial??0],after:lenses[lens??0],insight:"Личное воспоминание и рассказ о прошлом следует различать.",grounds:[captions[lens??0],first===0?"В итоговой композиции альбом поставлен первым.":"В итоговой композиции журнальные фрагменты поставлены первыми."]})}}>Завершить третье погружение</button>}
          <Link className="diveStandaloneRead" href={articleHref}>Читать анализ фильма →</Link><button type="button" className="diveChoice" onClick={onReturn}>Вернуться в FEAR</button>
        </>}
        {step>0?<button type="button" className="diveBack" onClick={()=>{if(finished)onRevise();setFinished(false);go(step-1)}}>← Предыдущий слой</button>:null}
      </section>
    </div>
  </div>;
}
