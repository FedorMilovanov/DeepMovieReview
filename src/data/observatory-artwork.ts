import { existsSync } from "node:fs";
import { join } from "node:path";

export type ObservatoryArtwork = { src:string; desktop?:string; mobile?:string; original:boolean };
/** Static build selects local optimized art only after the actual files land.
 * Never depend on the temporary transfer URL at runtime.
 */
export function getObservatoryArtwork(): ObservatoryArtwork {
  const names=["observatory-960.webp","observatory-1600.webp","observatory-mobile-540.webp","observatory-mobile-720.webp"];
  const exists=names.every(name=>existsSync(join(process.cwd(),"public","art",name)));
  if (!exists) return {src:"/art/hero-master.jpg",original:false};
  return {src:"/art/observatory-1600.webp",desktop:"/art/observatory-960.webp 960w, /art/observatory-1600.webp 1600w",mobile:"/art/observatory-mobile-540.webp 540w, /art/observatory-mobile-720.webp 720w",original:true};
}
