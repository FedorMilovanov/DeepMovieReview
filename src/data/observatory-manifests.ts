import type { VisualAssetManifest } from "@/lib/visual-assets";

const provenance = {
  sourceKind:"generated" as const,
  generator:"ChatGPT image generation",
  createdAt:"2026-11-28",
  promptVersion:"observatory-v1",
  sourceReference:"sha256:abeeefd70519b7cd02fb4a6951d2e65c3bb1096b9c101a61c789118af5189565",
  editorialNotes:"Original text-free platform illustration; contemplative figure in an imagined underwater cinema observatory. Not a film frame. Portrait art direction is a centered crop of the same original, not an independently generated scene.",
};
export const observatoryDesktopAsset: VisualAssetManifest = {
  schemaVersion:1,id:"platform-observatory-desktop",role:"background",title:"Обсерватория глубины — широкий экран",alt:"",decorative:true,
  aspectRatio:16/9,focalPoint:{x:.54,y:.62},textSafeZones:[{x:.22,y:.08,width:.56,height:.42}],subjectSafeZone:{x:.42,y:.5,width:.23,height:.35},
  variants:[
    {id:"observatory-desktop-960",purpose:"display",src:"/art/observatory-960.webp",format:"webp",width:960,height:540,byteSize:59322},
    {id:"observatory-desktop-1600",purpose:"display",src:"/art/observatory-1600.webp",format:"webp",width:1600,height:900,byteSize:127114},
  ],provenance,
};
export const observatoryMobileAsset: VisualAssetManifest = {
  schemaVersion:1,id:"platform-observatory-mobile",role:"background",title:"Обсерватория глубины — портретная композиция",alt:"",decorative:true,
  aspectRatio:9/16,focalPoint:{x:.49,y:.63},textSafeZones:[{x:.04,y:.05,width:.92,height:.42}],subjectSafeZone:{x:.19,y:.52,width:.62,height:.32},
  variants:[
    {id:"observatory-mobile-540",purpose:"display",src:"/art/observatory-mobile-540.webp",format:"webp",width:540,height:960,byteSize:28390},
    {id:"observatory-mobile-720",purpose:"display",src:"/art/observatory-mobile-720.webp",format:"webp",width:720,height:1280,byteSize:39904},
  ],provenance,
};
