"use client";

import { useId, useState } from "react";
import type { DiveDiscovery } from "@/lib/dive-opening";

export type DiveRoomId = "sirius" | "fear" | "memory";
const rooms = [
  { id:"sirius",number:"01",title:"SIRIUS",subtitle:"Истина и восприятие",question:"Как отличить факт от объяснения?" },
  { id:"fear",number:"02",title:"FEAR",subtitle:"Страх и свобода",question:"Что меняет наш выбор?" },
  { id:"memory",number:"03",title:"MEMORY",subtitle:"Память и идентичность",question:"Кто рассказывает историю о нас?" },
] as const;

function RoomSymbol({id}:{id:DiveRoomId}) {
  return <svg viewBox="0 0 96 76" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16V8h8m64 0h8v8M8 60v8h8m64 0h8v-8" opacity=".42"/>
      {id==="sirius"?<>
        {/* The falling studio lamp: evidence, not an astronomical atom. */}
        <path d="M48 9v9m-8 5 16-9 10 18-16 9z" fill="currentColor" fillOpacity=".08"/>
        <ellipse cx="58" cy="36" rx="9" ry="4" transform="rotate(-30 58 36)"/>
        <path d="m51 39-12 21m22-22 8 22M39 60h30" opacity=".6" strokeDasharray="3 4"/>
        <path d="M17 60h14m44 0h4M48 5v4" opacity=".6"/>
        <circle cx="48" cy="60" r="3" fill="currentColor"/>
      </>:id==="fear"?<>
        {/* A route through water, interrupted by a barrier. */}
        <path d="M13 25q9-7 18 0t18 0 18 0 16 0M13 39q9-7 18 0t18 0 18 0 16 0M13 53q9-7 18 0t18 0 18 0 16 0" opacity=".38"/>
        <path d="M21 61 39 48 43 34 61 20" strokeWidth="2"/>
        <path d="M54 21l8-2-2 8"/>
        <circle cx="21" cy="61" r="3" fill="currentColor"/>
        <path d="M31 34h40" strokeDasharray="2 4" opacity=".8"/>
        <path d="M66 31v6m4-6v6" strokeWidth="2"/>
      </>:<>
        {/* Two film frames, one reconstructed memory. */}
        <rect x="17" y="21" width="43" height="37" rx="2" transform="rotate(-11 38 40)" opacity=".55"/>
        <rect x="36" y="15" width="43" height="37" rx="2" fill="currentColor" fillOpacity=".06"/>
        <path d="M36 22h43M36 45h43M43 18.5h3m8 0h3m8 0h3M43 48.5h3m8 0h3m8 0h3"/>
        <path d="m41 41 10-10 7 6 6-5 10 9" opacity=".75"/>
        <circle cx="68" cy="28" r="2.5"/>
        <path d="M29 61h26m-3-3 3 3-3 3" opacity=".65"/>
      </>}
    </g>
  </svg>;
}

export function DiveAtlas({room,fearAvailable,memoryAvailable,discoveries,onSelect}:{room:DiveRoomId;fearAvailable:boolean;memoryAvailable:boolean;discoveries:Partial<Record<DiveRoomId,DiveDiscovery>>;onSelect:(id:DiveRoomId)=>void}) {
  const [expanded,setExpanded] = useState(false);
  const journalId = useId();
  const unlocked = {sirius:true,fear:fearAvailable,memory:memoryAvailable};
  const completed = rooms.filter(item=>unlocked[item.id]&&discoveries[item.id]);
  return <section className="diveAtlas" aria-label="Карта исследования">
    <div className="diveAtlasTitle"><span className="diveEyebrow">Карта глубины / 01—03</span><button type="button" className="diveAtlasToggle" aria-expanded={expanded} aria-controls={journalId} onClick={()=>setExpanded(value=>!value)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v16m3-11h4m-4 4h4"/><path d="M3 8h4m-4 8h4"/></svg><span>{expanded?"Скрыть открытия":"Мои открытия"}</span><span className="diveAtlasCount">{completed.length}/3</span></button></div>
    <nav className="diveRoomRail" aria-label="Маршрут погружения">
      {rooms.map(item=>unlocked[item.id]?<button type="button" key={item.id} aria-current={room===item.id?"step":undefined} onClick={()=>onSelect(item.id)} data-room-id={item.id} data-completed={Boolean(discoveries[item.id])}>
        <div className="diveAtlasSymbol"><RoomSymbol id={item.id}/></div>
        <div className="diveAtlasRoomCopy"><span className="diveEyebrow">{item.number}{discoveries[item.id]?<span className="diveAtlasDone"><span className="visuallyHidden">Исследовано</span><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg></span>:null}</span><strong lang="en">{item.title}</strong><small>{item.subtitle}</small></div>
      </button>:<div key={item.id} className="diveAtlasLocked"><div className="diveAtlasLock" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M16 21v-6a8 8 0 0 1 16 0v6"/><rect x="11" y="21" width="26" height="20" rx="3"/><circle cx="24" cy="29" r="2"/><path d="M24 31v4M5 8v-3h5m28 0h5v3" opacity=".5"/></svg></div><div className="diveAtlasRoomCopy"><span className="diveEyebrow">{item.number}</span><strong>Закрытый слой</strong><small>Нужен уровень ранних спойлеров</small></div></div>)}
    </nav>
    <div id={journalId} className="diveAtlasJournal" hidden={!expanded}>
      <h2>Ваш путь мысли</h2>
      {completed.length===0?<p>После каждого завершённого исследования здесь появятся ваши открытия и изменение первоначального суждения.</p>:completed.map(item=>{
        const finding=discoveries[item.id];
        if(!finding)return null;
        return <article className="diveJournalItem" key={item.id}><span className="diveEyebrow">{item.title} / {item.subtitle}</span><strong>{finding.insight}</strong>
          <div className="diveJournalShift"><div><small>До</small><span>{finding.before}</span></div><span aria-hidden="true">→</span><div><small>После</small><span>{finding.after}</span></div></div>
          <details><summary>Основания моего исследования</summary><ul>{finding.grounds.map(ground=><li key={ground}>{ground}</li>)}</ul></details>
          <button type="button" className="diveBack" onClick={()=>onSelect(item.id)}>Вернуться в {item.title} →</button></article>;
      })}
      {completed.length>=2?<div className="diveJournalSynthesis"><span className="diveEyebrow">Связь открытий</span><p>{discoveries.sirius&&discoveries.fear?"То, чему человек доверяет, влияет на его представление об опасности. Проверка объяснений и проверка предупреждений — части одного вопроса о свободе суждения.":discoveries.fear&&discoveries.memory?"Пережитое и рассказанное о прошлом участвуют в решениях человека. Это объясняет необходимость исследовать одновременно обстоятельства, память и отношения.":"Личное воспоминание и рассказ о нём — не одно и то же. Сопоставление этих уровней помогает понять, откуда берутся наши представления о себе."}</p>{completed.length===3?<p>Все три комнаты связывает вопрос: как человек формирует знание о мире и о себе, не отдавая другому право единолично определять его действительность?</p>:null}</div>:null}
      <small>Это дневник исследованных аргументов в текущем сеансе, а не оценка личности.</small>
    </div>
  </section>;
}
