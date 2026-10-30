import type { ArticleSceneStill } from "@/lib/film-package";

// Four low-resolution quotations, selected from the owner-supplied exact-master grid.
const provenance = {
  sourceId: "truman-src-master-bdrip",
  masterDigest: "sha256:E8543F612DA5063D94A11DBC5D434489B8C24718932A30FDD21E78B124B3B575",
  credit: "«Шоу Трумана» (1998), реж. Питер Уир. Кадр для критического разбора; права у правообладателей.",
  use: "critical-review" as const,
  samplingIntervalSeconds: 30 as const,
  width: 800,
  height: 450,
};

export const trumanArticleStills = {
  light: { ...provenance, src: "/film-stills/truman-light-210.jpg", sampleTimeSeconds: 210,
    alt: "Труман рассматривает упавший осветительный прибор с маркировкой Sirius.", imageSha256: "14cbc377b9a506e47cdf023fba2ae648fe50b171070db6d7c0751e7b10bc96e6" },
  radio: { ...provenance, src: "/film-stills/truman-radio-1800.jpg", sampleTimeSeconds: 1800,
    alt: "Труман оглядывается из автомобиля, услышав по радио описание собственных движений.", imageSha256: "b07698208a85f9847d3156f1d478618e1f17fd60d198a14f5fcdd7fa459815ac" },
  kitchen: { ...provenance, src: "/film-stills/truman-kitchen-3240.jpg", sampleTimeSeconds: 3240,
    alt: "Рука Трумана на рекламном буклете рядом с кухонным приспособлением.", imageSha256: "74f5319030503ae437f6ebf7db2196ca5e5ed93b232b2caa7c82a6a1ab650142" },
  exit: { ...provenance, src: "/film-stills/truman-exit-5700.jpg", sampleTimeSeconds: 5700,
    alt: "Труман стоит спиной перед открытым выходом в искусственном небе.", imageSha256: "633d9275156257771724cf0a218fc4e65555749c7ab9679077848a4c586950ea" },
} satisfies Record<string, ArticleSceneStill>;
