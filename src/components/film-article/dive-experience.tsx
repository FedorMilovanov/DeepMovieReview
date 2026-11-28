"use client";

import Link from "next/link";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiveDiscovery, DiveFearData, DiveMemoryData } from "@/lib/dive-opening";
import SiriusJourney from "./sirius-journey";
import { DiveAtlas, type DiveRoomId } from "./dive-atlas";

const FearJourney = lazy(() => import("./fear-journey"));
const MemoryJourney = lazy(() => import("./memory-journey"));

const roomDescriptions = {
  sirius:"Один странный предмет. Несколько объяснений. Исследуйте сцену и постройте собственное суждение. Путешествие начинается без спойлеров.",
  fear:"Исследуйте, как память об опасности, доверие к предупреждениям и доступность выбора меняют решение человека.",
  memory:"Соберите два фрагмента прошлого и измените их смысловое соседство. Как семейные истории и личные воспоминания участвуют в понимании себя?",
} as const;

export function DiveExperience({title,articleHref,journeyHref,observation,report,fear,memory}: {title:string;articleHref:string;journeyHref:string;observation:string;report:string;fear?:DiveFearData;memory?:DiveMemoryData}) {
  const router = useRouter();
  const [selected,setSelected] = useState<DiveRoomId|null>(null);
  const room = selected === "memory" && memory ? "memory" : selected === "fear" && fear ? "fear" : selected === "sirius" ? "sirius" : fear ? "fear" : "sirius";
  const [discoveries,setDiscoveries] = useState<Partial<Record<DiveRoomId,DiveDiscovery>>>({});
  const titleRef = useRef<HTMLDivElement>(null);
  const lastRoom = useRef(room);
  useEffect(() => {
    if (lastRoom.current !== room) {
      lastRoom.current = room;
      titleRef.current?.focus({preventScroll:true});
      titleRef.current?.scrollIntoView({block:"start",behavior:"instant"});
    }
  }, [room]);
  function save(id:DiveRoomId,discovery:DiveDiscovery) {
    setDiscoveries(previous=>({...previous,[id]:discovery}));
  }
  function revise(id:DiveRoomId) {
    setDiscoveries(previous=>{
      const next={...previous};
      delete next[id];
      return next;
    });
  }
  function select(id:DiveRoomId) {
    if ((id==="fear"&&!fear)||(id==="memory"&&!memory)) return;
    setSelected(id);
  }
  function finishSirius(discovery:DiveDiscovery) {
    save("sirius",discovery);
    if (fear) setSelected("fear");
    else {setSelected(null);router.push(journeyHref+"?spoilers=minor");}
  }
  return (
    <section className="diveStandalone" aria-labelledby="dive-standalone-title" data-room={room}>
      <div className="diveStandaloneInner">
        <header className="diveStandaloneHeader">
          <div>
            <div ref={titleRef} tabIndex={-1} className="diveEyebrow diveRoomFocus">DIVE / Погружение · {room==="sirius"?"01 / SIRIUS":room==="fear"?"02 / FEAR":"03 / MEMORY"}</div>
            <h1 id="dive-standalone-title">{title}</h1>
            <p>{roomDescriptions[room]}</p>
          </div>
          <Link className="diveStandaloneRead" href={articleHref}>Читать статью вместо погружения →</Link>
        </header>
        <DiveAtlas room={room} fearAvailable={Boolean(fear)} memoryAvailable={Boolean(memory)} discoveries={discoveries} onSelect={select}/>
        <div hidden={room!=="sirius"}>
          <SiriusJourney observation={observation} report={report} standalone onFinish={finishSirius} onRevise={()=>revise("sirius")} finishLabel={fear?"Продолжить в FEAR":"Открыть следующую комнату · ранние спойлеры"}/>
        </div>
        {fear ? <div hidden={room!=="fear"}>
          <Suspense fallback={<p role="status">Открываем следующую комнату…</p>}>
            <FearJourney data={fear} onFinish={discovery=>save("fear",discovery)} onRevise={()=>revise("fear")} onReturn={()=>select("sirius")} articleHref={articleHref}/>
          </Suspense>
          {discoveries.fear && memory ? <button className="divePrimary diveRoomContinue" type="button" onClick={()=>select("memory")}>Продолжить в MEMORY →</button>:null}
        </div> : null}
        {memory ? <div hidden={room!=="memory"}>
          <Suspense fallback={<p role="status">Открываем комнату памяти…</p>}>
            <MemoryJourney data={memory} onFinish={discovery=>save("memory",discovery)} onRevise={()=>revise("memory")} onReturn={()=>select("fear")} articleHref={articleHref}/>
          </Suspense>
        </div>:null}
        <noscript><p>Для интерактивного исследования нужен JavaScript. <a href={articleHref}>Разбор доступен в обычном режиме чтения.</a></p></noscript>
      </div>
    </section>
  );
}
