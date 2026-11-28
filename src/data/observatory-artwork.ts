import { existsSync } from "node:fs";
import { join } from "node:path";
import { observatoryDesktopAsset, observatoryMobileAsset } from "@/data/observatory-manifests";
export type ObservatoryArtwork = { src:string; desktop?:string; mobile?:string; original:boolean };
export function getObservatoryArtwork(): ObservatoryArtwork {
  const desktop=observatoryDesktopAsset.variants;
  const mobile=observatoryMobileAsset.variants;
  const exists=[...desktop,...mobile].every(item=>existsSync(join(process.cwd(),"public",item.src.slice(1))));
  if (!exists) return {src:"/art/hero-master.jpg",original:false};
  const srcSet=(items:typeof desktop)=>items.map(item=>item.src+" "+item.width+"w").join(", ");
  return {src:desktop[desktop.length-1].src,desktop:srcSet(desktop),mobile:srcSet(mobile),original:true};
}
