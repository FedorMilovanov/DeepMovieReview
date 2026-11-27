"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SiriusJourney from "./sirius-journey";

export function DiveExperience({title,articleHref,observation,report}: {title:string;articleHref:string;observation:string;report:string}) {
  const router = useRouter();
  return (
    <section className="diveStandalone" aria-labelledby="dive-standalone-title">
      <div className="diveStandaloneInner">
        <header className="diveStandaloneHeader">
          <div>
            <div className="diveEyebrow">DIVE / Погружение 01 · SIRIUS</div>
            <h1 id="dive-standalone-title">{title}</h1>
            <p>Один странный предмет. Несколько объяснений. Исследуйте сцену и постройте собственное суждение. Первое путешествие без спойлеров.</p>
          </div>
          <Link className="diveStandaloneRead" href={articleHref}>Читать статью вместо погружения →</Link>
        </header>
        <SiriusJourney observation={observation} report={report} standalone onFinish={() => router.push(articleHref+"#truman-article-method-4")}/>
        <noscript><p>Для интерактивного исследования нужен JavaScript. <a href={articleHref}>Полный разбор доступен в обычном режиме чтения.</a></p></noscript>
      </div>
    </section>
  );
}
