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
  const {reducedMotion,experienceMode,documentVisible,forcedColors}=useExperienceQuality();
  const [paused,setPaused]=useState(false);
  const [visible,setVisible]=useState(true);
  const [entering,setEntering]=useState(false);
  const root=useRef<HTMLElement>(null);
  const videoRef=useRef<HTMLVideoElement>(null);
  const [videoReady,setVideoReady]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const diveHref=`/films/${filmSlug}/dive`;
  const articleHref=`/films/${filmSlug}`;
  // A hardware-decoded MP4 does not need the GPU tier used by the 3D scenes.
  const canMove=hydrated&&!reducedMotion&&experienceMode!=="lite"&&!forcedColors;
  const motion=canMove&&!paused;
  useEffect(()=>{
    if(!root.current||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));
    observer.observe(root.current);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>()=>{if(timer.current!==null)clearTimeout(timer.current)},[]);
  const videoSources=artwork.video;
  const [videoFailed,setVideoFailed]=useState(false);
  useEffect(()=>{
    const video=videoRef.current;
    if(!video||!videoSources||videoFailed)return;
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
    const dataSaver=connection?.saveData||["slow-2g","2g"].includes(connection?.effectiveType??"");
    const allowed=motion&&visible&&documentVisible&&!dataSaver;
    if(!allowed){video.pause();return;}
    const media=window.matchMedia("(max-width:760px)");
    let active=true;
    function playSelected(){
      if(!video||!videoSources||!active)return;
      const src=media.matches?videoSources.mobile:videoSources.desktop;
      if(video.getAttribute("src")!==src){video.setAttribute("src",src);video.load();}
      video.muted=true;
      void video.play().catch((error: unknown)=>{if(active && !(error instanceof DOMException && error.name==="AbortError"))setVideoReady(false);});
    }
    playSelected();
    media.addEventListener("change",playSelected);
    return ()=>{active=false;media.removeEventListener("change",playSelected);video.pause();};
  },[motion,visible,documentVisible,videoSources,videoFailed]);
  function enter(event:MouseEvent<HTMLAnchorElement>){
    if(!motion||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(entering)return;
    setEntering(true);
    timer.current=setTimeout(()=>{router.push(diveHref);timer.current=setTimeout(()=>setEntering(false),1800)},360);
  }
  return <section ref={root} className="observatoryHero" data-art={artwork.original?"observatory":"fallback"} data-motion={motion?"on":"off"} data-visible={visible&&documentVisible} data-entering={entering} data-video-ready={videoReady&&canMove} aria-labelledby="hero-title">
    <div className="observatoryScene" aria-hidden="true">
      <picture className="observatoryPicture">
        {artwork.mobile?<source media="(max-width:760px)" srcSet={artwork.mobile} sizes="100vw"/>:null}
        {/* Native art direction: each WebP is already encoded and sized; do not generate a second optimization or preload both crops. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork.src} srcSet={artwork.desktop} sizes="100vw" alt="" fetchPriority="high" decoding="async"/>
      </picture>
      {videoSources?<video ref={videoRef} className="observatoryVideo" muted loop playsInline preload="none" aria-hidden="true"
        disablePictureInPicture disableRemotePlayback
        onLoadStart={()=>setVideoReady(false)} onPlaying={()=>setVideoReady(true)} onError={()=>{setVideoReady(false);setVideoFailed(true);}}/>:null}
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
      <p className="observatoryKicker"><span aria-hidden="true"/> Интерактивный анализ кино <span aria-hidden="true"/></p>
      <h1 id="hero-title">Здесь кино становится исследованием</h1>
      <p className="observatoryIntro">Войдите в историю. Рассмотрите мотивы героев, исследуйте их выбор и откройте смысл фильма.</p>
      <div className="observatoryActions">
        <Link className="buttonPrimary observatoryCta" href={diveHref} onClick={enter}>
          <span className="observatoryCtaIcon" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="13"/><path d="M18 7v5m0 12v5M7 18h5m12 0h5"/><path d="m18 12 4 6-4 6-4-6z" fill="currentColor" stroke="none"/></svg></span>
          <span className="observatoryCtaCopy"><strong>Войти в исследование</strong><small>Интерактивное погружение</small></span>
          <svg className="observatoryCtaArrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
        </Link>
        <Link className="observatoryRead" href={articleHref}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v15M3 4c4 0 6 0 9 2 3-2 5-2 9-2v14c-4 0-6 0-9 2-3-2-5-2-9-2z"/></svg>Читать статью</Link>
      </div>
    </div>
    <div className="observatoryFeature">
      <div className="observatoryFeatureTitle">
        <small><i aria-hidden="true"/> Первое погружение · без спойлеров</small>
        <Link href={articleHref} className="observatoryFilmTitle">{filmTitle}</Link>
        <p>Что происходит, когда привычный мир начинает вызывать вопросы?</p>
      </div>
      <div className="observatoryStages" aria-label="Как устроено исследование">
        <div><span className="observatoryStageNumber">01</span><strong>Увидеть</strong><small>Деталь меняет взгляд</small></div>
        <div><span className="observatoryStageNumber">02</span><strong>Выбрать</strong><small>Развилка решений</small></div>
        <div><span className="observatoryStageNumber">03</span><strong>Осмыслить</strong><small>Смысл и последствия</small></div>
      </div>
    </div>
    {canMove?<button type="button" className="observatoryPause" aria-label={paused?"Оживить фон":"Остановить фон"} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{paused?<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>:<><path d="M9 5v14M15 5v14"/></>}</svg><span>{paused?"Оживить фон":"Остановить фон"}</span>
    </button>:null}
  </section>;
}
