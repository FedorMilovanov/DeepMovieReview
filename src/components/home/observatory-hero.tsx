"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import { useHydrated } from "@/lib/use-hydrated";
import type { ObservatoryArtwork } from "@/data/observatory-artwork";

export function ObservatoryHero({filmTitle,filmSlug,artwork}:{filmTitle:string;filmSlug:string;artwork:ObservatoryArtwork}) {
  const router=useRouter();
  const hydrated=useHydrated();
  const {reducedMotion,tier,documentVisible,forcedColors}=useExperienceQuality();
  const [paused,setPaused]=useState(false);
  const [visible,setVisible]=useState(true);
  const [entering,setEntering]=useState(false);
  const root=useRef<HTMLElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const diveHref=`/films/${filmSlug}/dive`;
  const articleHref=`/films/${filmSlug}`;
  const canMove=hydrated&&!reducedMotion&&tier!=="LITE"&&!forcedColors;
  const motion=canMove&&!paused;
  useEffect(()=>{
    if(!root.current||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));
    observer.observe(root.current);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>()=>{if(timer.current!==null)clearTimeout(timer.current)},[]);
  function enter(event:MouseEvent<HTMLAnchorElement>){
    if(!motion||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(entering)return;
    setEntering(true);
    timer.current=setTimeout(()=>{router.push(diveHref);timer.current=setTimeout(()=>setEntering(false),1800)},360);
  }
  return <section ref={root} className="observatoryHero" data-art={artwork.original?"observatory":"fallback"} data-motion={motion?"on":"off"} data-visible={visible&&documentVisible} data-entering={entering} aria-labelledby="hero-title">
    <div className="observatoryScene" aria-hidden="true">
      <picture className="observatoryPicture">
        {artwork.mobile?<source media="(max-width:760px)" srcSet={artwork.mobile} sizes="100vw"/>:null}
        {/* Native art direction: each WebP is already encoded and sized; do not generate a second optimization or preload both crops. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork.src} srcSet={artwork.desktop} sizes="100vw" alt="" fetchPriority="high" decoding="async"/>
      </picture>
      <div className="observatoryLight"/>
      {artwork.original?<div className="observatoryWater">
        <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="observatorySuspension" aria-hidden="true">
          <g fill="#b9e2f2" opacity=".45">
            {[[318,184,1.2],[393,112,.9],[482,247,1.4],[546,141,.8],[590,203,1.3],[618,276,1.1],[654,164,.8],[685,225,1.5],[731,110,1.3],[754,304,1.1],[804,188,.8],[360,313,.9],[447,339,1.2],[692,350,1.1]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r}/>)}
          </g>
        </svg>
        <div className="observatoryCaustics"/>
      </div>:null}
      <div className="observatoryShade"/>
    </div>
    <div className="observatoryMain">
      <p className="observatoryKicker">Интерактивный анализ фильмов · DIVE</p>
      <h1 id="hero-title">Здесь кино становится исследованием</h1>
      <p className="observatoryIntro">Войдите в историю. Исследуйте поступки, отношения и идеи, принимайте решения и открывайте смысл.</p>
      <div className="observatoryActions">
        <Link className="buttonPrimary observatoryCta" href={diveHref} onClick={enter}>Войти в исследование <span aria-hidden="true">→</span></Link>
        <Link className="observatoryRead" href={articleHref}>Читать статью</Link>
      </div>
    </div>
    <div className="observatoryFeature">
      <div className="observatoryFeatureTitle"><small>Первое погружение · без спойлеров</small><strong>{filmTitle}</strong><p>Истина, страх и право на собственную жизнь.</p></div>
      <div className="observatoryStages"><span>Наблюдение</span><span>Выбор</span><span>Осмысление</span></div>
    </div>
    {canMove?<button type="button" className="observatoryPause" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?"Оживить фон":"Остановить фон"}</button>:null}
  </section>;
}
