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
  const [videoAtSeam,setVideoAtSeam]=useState(true);
  useEffect(()=>{
    const video=videoRef.current;
    if(!video||!videoSources)return;
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
    const dataSaver=connection?.saveData||["slow-2g","2g"].includes(connection?.effectiveType??"");
    const allowed=motion&&visible&&documentVisible&&!dataSaver;
    if(!allowed){video.pause();return;}
    const media=window.matchMedia("(max-width:760px)");
    let active=true;
    function playSelected(){
      if(!video||!videoSources||!active)return;
      const src=media.matches?videoSources.mobile:videoSources.desktop;
      if(video.getAttribute("src")!==src){setVideoAtSeam(true);video.setAttribute("src",src);video.load();}
      if(video.error)return;
      video.muted=true;
      void video.play().catch((error: unknown)=>{if(active && !(error instanceof DOMException && error.name==="AbortError"))setVideoReady(false);});
    }
    playSelected();
    media.addEventListener("change",playSelected);
    return ()=>{active=false;media.removeEventListener("change",playSelected);video.pause();};
  },[motion,visible,documentVisible,videoSources]);
  function enter(event:MouseEvent<HTMLAnchorElement>){
    if(!motion||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(entering)return;
    setEntering(true);
    timer.current=setTimeout(()=>{router.push(diveHref);timer.current=setTimeout(()=>setEntering(false),1800)},360);
  }
  return <section ref={root} className="observatoryHero" data-art={artwork.original?"observatory":"fallback"} data-motion={motion?"on":"off"} data-visible={visible&&documentVisible} data-entering={entering} data-video-ready={videoReady&&canMove} data-video-seam={videoAtSeam} aria-labelledby="hero-title">
    <div className="observatoryScene" aria-hidden="true">
      <picture className="observatoryPicture">
        {artwork.mobile?<source media="(max-width:760px)" srcSet={artwork.mobile} sizes="100vw"/>:null}
        {/* Native art direction: each WebP is already encoded and sized; do not generate a second optimization or preload both crops. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork.src} srcSet={artwork.desktop} sizes="100vw" alt="" fetchPriority="high" decoding="async"/>
      </picture>
      {videoSources?<video ref={videoRef} className="observatoryVideo" muted loop playsInline preload="none" aria-hidden="true"
        disablePictureInPicture disableRemotePlayback
        onLoadStart={()=>{setVideoReady(false);setVideoAtSeam(true);}} onPlaying={()=>setVideoReady(true)}
        onTimeUpdate={event=>{const video=event.currentTarget;setVideoAtSeam(Number.isFinite(video.duration)&&(video.currentTime<.45||video.duration-video.currentTime<1.15));}}
        onError={()=>setVideoReady(false)}/>:null}
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
      <div className="observatoryEditorial">
        <p className="observatoryKicker" lang="en"><span aria-hidden="true"/> CINEMA · HUMAN NATURE · WORLDVIEW</p>
        <h1 id="hero-title" lang="en"><span>Look beyond</span><em>the frame.</em></h1>
        <p className="observatoryPromise">Здесь кино становится исследованием.</p>
        <p className="observatoryIntro">Разгадывайте мотивы героев, исследуйте последствия их решений и открывайте глубинный смысл истории.</p>
        <div className="observatoryActions">
          <Link className="buttonPrimary observatoryCta" href={diveHref} onClick={enter}>
            <span className="observatoryCtaIcon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" opacity=".32"/><circle cx="24" cy="24" r="15"/><path d="m24 9 8.7 5L37 22l-5 9-9 5-9-5-4-9 5-9z" opacity=".55"/><path d="m24 13 8 14-8 9-8-9z"/><path d="M24 13v23m-8-9h16" opacity=".55"/><path d="M24 2v3m22 19h-3M24 46v-3M2 24h3"/></svg></span>
            <span className="observatoryCtaCopy"><strong>Войти в исследование</strong><small lang="en">DIVE INTO THE STORY</small></span>
            <svg className="observatoryCtaArrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-5 5 5-5 5"/></svg>
          </Link>
          <Link className="observatoryRead" href={articleHref}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v15M3 4c4 0 6 0 9 2 3-2 5-2 9-2v14c-4 0-6 0-9 2-3-2-5-2-9-2z"/></svg>Читать статью</Link>
        </div>
      </div>
    </div>
    <div className="observatoryFeature">
      <div className="observatoryFeatureTitle">
        <span className="observatoryEdition" lang="en">ISSUE <span>01</span></span>
        <div>
          <small>Первое погружение · без спойлеров</small>
          <Link href={articleHref} className="observatoryFilmTitle">{filmTitle}</Link>
          <p>Что происходит, когда привычный мир начинает вызывать вопросы?</p>
        </div>
      </div>
      <div className="observatoryStages" aria-label="Как устроено исследование">
        <div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12c3-4 6-6 10-6s7 2 10 6c-3 4-6 6-10 6S5 16 2 12Z"/><circle cx="12" cy="12" r="2.8"/></svg><span className="observatoryStageNumber" lang="en">OBSERVE</span><strong>Увидеть</strong></div>
        <div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V10m0 0L5 3m7 7 7-7M5 3v5M5 3h5m9 0v5m0-5h-5"/><circle cx="12" cy="20" r="1.5"/></svg><span className="observatoryStageNumber" lang="en">CHOOSE</span><strong>Выбрать</strong></div>
        <div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m12 4 5 8-5 8-5-8zM4 12h16"/></svg><span className="observatoryStageNumber" lang="en">REFLECT</span><strong>Осмыслить</strong></div>
      </div>
      {canMove?<button type="button" className="observatoryPause" aria-label={paused?"Оживить фон":"Остановить фон"} onClick={()=>setPaused(v=>!v)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{paused?<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>:<><path d="M9 5v14M15 5v14"/></>}</svg><span>{paused?"Оживить фон":"Остановить фон"}</span>
      </button>:null}
    </div>
  </section>;
}
