"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import { useHydrated } from "@/lib/use-hydrated";
import type { ObservatoryArtwork } from "@/data/observatory-artwork";

export function ObservatoryHero({artwork}:{artwork:ObservatoryArtwork}) {
  const hydrated=useHydrated();
  const {reducedMotion,experienceMode,documentVisible,forcedColors}=useExperienceQuality();
  const [paused,setPaused]=useState(false);
  const [visible,setVisible]=useState(true);
  const root=useRef<HTMLElement>(null);
  const videoRef=useRef<HTMLVideoElement>(null);
  const [videoReady,setVideoReady]=useState(false);
  // A hardware-decoded MP4 does not need the GPU tier used by the 3D scenes.
  const canMove=hydrated&&!reducedMotion&&experienceMode!=="lite"&&!forcedColors;
  const motion=canMove&&!paused;
  useEffect(()=>{
    if(!root.current||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));
    observer.observe(root.current);
    return ()=>observer.disconnect();
  },[]);
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
  return <section ref={root} className="observatoryHero" data-art={artwork.original?"observatory":"fallback"} data-motion={motion?"on":"off"} data-visible={visible&&documentVisible} data-video-ready={videoReady&&canMove} data-video-seam={videoAtSeam} aria-labelledby="hero-title">
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
          <a className="buttonPrimary observatoryCta" href="#films">
            <span className="observatoryCtaIcon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" opacity=".32"/><circle cx="24" cy="24" r="15"/><path d="m24 9 8.7 5L37 22l-5 9-9 5-9-5-4-9 5-9z" opacity=".55"/><path d="m24 13 8 14-8 9-8-9z"/><path d="M24 13v23m-8-9h16" opacity=".55"/><path d="M24 2v3m22 19h-3M24 46v-3M2 24h3"/></svg></span>
            <span className="observatoryCtaCopy"><strong>Выбрать фильм</strong><small lang="en">EXPLORE THE JOURNAL</small></span>
            <svg className="observatoryCtaArrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-5 5 5-5 5"/></svg>
          </a>
          <Link className="observatoryRead" href="/methodology"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v15M3 4c4 0 6 0 9 2 3-2 5-2 9-2v14c-4 0-6 0-9 2-3-2-5-2-9-2z"/></svg>О журнале</Link>
        </div>
      </div>
    </div>
    <div className="observatoryFeature">
      <div className="observatoryFeatureTitle"><div><small>DEEP WATERS · ЖУРНАЛ</small><p>История. Человек. Смысл.</p></div></div>
      {canMove?<button type="button" className="observatoryPause" aria-label={paused?"Оживить фон":"Остановить фон"} onClick={()=>setPaused(v=>!v)}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{paused?<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>:<><path d="M9 5v14M15 5v14"/></>}</svg><span>{paused?"Оживить фон":"Остановить фон"}</span>
      </button>:null}
    </div>
  </section>;
}
