"use client";

import { useState } from "react";
import type { DiveDiscovery } from "@/lib/dive-opening";

export type DiveRoomId = "sirius" | "fear" | "memory";
const rooms = [
  { id:"sirius",number:"01",title:"SIRIUS",subtitle:"Истина и восприятие",question:"Как отличить факт от объяснения?" },
  { id:"fear",number:"02",title:"FEAR",subtitle:"Страх и свобода",question:"Что меняет наш выбор?" },
  { id:"memory",number:"03",title:"MEMORY",subtitle:"Память и идентичность",question:"Кто рассказывает историю о нас?" },
] as const;

function RoomSymbol({id}:{id:DiveRoomId}) {
  return <svg viewBox="0 0 96 76" aria-hidden="true">
    <g fill="none" stroke="currentColor">
      {id==="sirius"?<>
        <ellipse cx="48" cy="38" rx="38" ry="17" transform="rotate(-24 48 38)" opacity=".55"/>
        <ellipse cx="48" cy="38" rx="38" ry="17" transform="rotate(32 48 38)" opacity=".55"/>
        <circle cx="48" cy="38" r="20" opacity=".8"/><circle cx="48" cy="38" r="8" fill="currentColor" opacity=".6"/>
      </>:id==="fear"?<>
        {[0,1,2,3].map(i=><path key={i} d={`M5 ${25+i*11} Q26 ${15+i*11} 48 ${25+i*11} T91 ${25+i*11}`} opacity={.5+i*.1}/>)}
        <path d="M48 9V65" strokeDasharray="3 5"/><circle cx="48" cy="9" r="4" fill="currentColor"/><circle cx="48" cy="65" r="4" fill="currentColor"/>
      </>:<>
        <rect x="14" y="16" width="47" height="51" rx="3" transform="rotate(-12 14 16)" opacity=".65"/>
        <rect x="34" y="9" width="47" height="51" rx="3" transform="rotate(12 34 9)"/>
        <path d="M40 43L56 25L75 43M47 48H71" opacity=".7"/><circle cx="68" cy="24" r="4" opacity=".7"/>
      </>}
    </g>
  </svg>;
}

export function DiveAtlas({room,fearAvailable,memoryAvailable,discoveries,onSelect}:{room:DiveRoomId;fearAvailable:boolean;memoryAvailable:boolean;discoveries:Partial<Record<DiveRoomId,DiveDiscovery>>;onSelect:(id:DiveRoomId)=>void}) {
  const [expanded,setExpanded] = useState(false);
  const unlocked = {sirius:true,fear:fearAvailable,memory:memoryAvailable};
  const completed = rooms.filter(item=>unlocked[item.id]&&discoveries[item.id]);
  return <section className="diveAtlas" aria-label="Карта исследования">
    <div className="diveAtlasTitle"><span className="diveEyebrow">Карта глубины / 01—03</span><button type="button" className="diveAtlasToggle" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}> {expanded?"Скрыть открытия":"Мои открытия"} · {completed.length}/3</button></div>
    <nav className="diveRoomRail" aria-label="Маршрут погружения">
      {rooms.map(item=>unlocked[item.id]?<button type="button" key={item.id} aria-current={room===item.id?"step":undefined} onClick={()=>onSelect(item.id)} data-room-id={item.id} data-completed={Boolean(discoveries[item.id])}>
        <div className="diveAtlasSymbol"><RoomSymbol id={item.id}/></div>
        <div className="diveAtlasRoomCopy"><span className="diveEyebrow">{item.number}</span><strong>{item.title}</strong><small>{discoveries[item.id]?"Исследовано":item.subtitle}</small></div>
      </button>:<div key={item.id} className="diveAtlasLocked"><div className="diveAtlasLock" aria-hidden="true">···</div><div className="diveAtlasRoomCopy"><span className="diveEyebrow">{item.number}</span><strong>Закрытый слой</strong><small>Ранние спойлеры</small></div></div>)}
    </nav>
    {expanded?<div className="diveAtlasJournal">
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
    </div>:null}
  </section>;
}
