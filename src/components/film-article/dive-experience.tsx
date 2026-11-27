"use client";

import Link from "next/link";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiveFearData } from "@/lib/dive-opening";
import SiriusJourney from "./sirius-journey";

const FearJourney = lazy(() => import("./fear-journey"));

export function DiveExperience({title,articleHref,journeyHref,observation,report,fear}: {title:string;articleHref:string;journeyHref:string;observation:string;report:string;fear?:DiveFearData}) {
  const router = useRouter();
  const [firstDone, setFirstDone] = useState(false);
  const [firstShown, setFirstShown] = useState(false);
  const inFear = Boolean(fear) && !firstShown;
  const [secondDone, setSecondDone] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastRoom = useRef(inFear);
  useEffect(() => {
    if (lastRoom.current !== inFear) {
      lastRoom.current = inFear;
      titleRef.current?.focus({preventScroll:true});
      titleRef.current?.scrollIntoView({block:"start",behavior:"instant"});
    }
  }, [inFear]);
  return (
    <section className="diveStandalone" aria-labelledby="dive-standalone-title" data-room={inFear ? "fear" : "sirius"}>
      <div className="diveStandaloneInner">
        <header className="diveStandaloneHeader">
          <div>
            <div ref={titleRef} tabIndex={-1} className="diveEyebrow diveRoomFocus">DIVE / Погружение · {inFear ? "02 / FEAR" : "01 / SIRIUS"}</div>
            <h1 id="dive-standalone-title">{title}</h1>
            <p>{inFear ? "Исследуйте, как память об опасности, доверие к предупреждениям и доступность выбора меняют решение человека." : "Один странный предмет. Несколько объяснений. Исследуйте сцену и постройте собственное суждение. Первое путешествие без спойлеров."}</p>
          </div>
          <Link className="diveStandaloneRead" href={articleHref}>Читать статью вместо погружения →</Link>
        </header>
        <nav className="diveRoomRail" aria-label="Маршрут погружения">
          <button type="button" aria-current={!inFear ? "step" : undefined} onClick={() => setFirstShown(true)}><span>01</span><strong>SIRIUS</strong><small>{firstDone ? "Исследовано" : "Наблюдение"}</small></button>
          {fear ? <button type="button" aria-current={inFear ? "step" : undefined} onClick={() => setFirstShown(false)}><span>02</span><strong>FEAR</strong><small>{secondDone ? "Исследовано" : "Страх и свобода"}</small></button> :
            <div><span>02</span><strong>Следующая комната</strong><small>Ранние спойлеры</small></div>}
          <div className="diveRailFuture"><span>···</span><strong>Дальнейшие комнаты</strong><small>В разработке</small></div>
        </nav>
        <div hidden={inFear}>
          <SiriusJourney observation={observation} report={report} standalone onFinish={() => {setFirstDone(true); setFirstShown(false); if (!fear) router.push(journeyHref+"?spoilers=minor");}} finishLabel="Открыть следующую комнату · ранние спойлеры"/>
        </div>
        {fear ? <div hidden={!inFear}>
          <Suspense fallback={<p role="status">Открываем следующую комнату…</p>}>
            <FearJourney data={fear} onFinish={() => setSecondDone(true)} onReturn={() => setFirstShown(true)} articleHref={articleHref}/>
          </Suspense>
        </div> : null}
        <noscript><p>Для интерактивного исследования нужен JavaScript. <a href={articleHref}>Разбор доступен в обычном режиме чтения.</a></p></noscript>
      </div>
    </section>
  );
}
