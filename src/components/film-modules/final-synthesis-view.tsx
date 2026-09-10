import { VerdictCore } from "@/components/experience/verdict-core";
import type { FinalSynthesisModule } from "@/lib/film-package";

export function FinalSynthesisModuleView({ module }: { module: FinalSynthesisModule }) {
  return (
    <section id={module.id} className="sectionShell sectionRule filmModule filmFinalSynthesis">
      <div className="sectionIndex">{module.eyebrow ?? "FINAL SYNTHESIS"}</div>
      <h2>{module.heading}</h2>

      <div className="filmFinalCoreGrid">
        <div className="filmFinalCoreThesis">
          <span className="microLabel">THESIS / NO MASTER SCORE</span>
          <p className="filmFinalThesis">{module.thesis}</p>
        </div>
        <VerdictCore />
      </div>

      <div className="filmSynthesisFacets" aria-label="Independent synthesis facets">
        {module.facets.map((facet) => (
          <article key={facet.key}>
            <span>{facet.label}</span>
            <strong>{facet.value}</strong>
          </article>
        ))}
      </div>

      <div className="filmFinalVerdict">
        <span className="microLabel">FINAL SYNTHESIS / CONFIDENCE {module.confidence}</span>
        <p>{module.verdict}</p>
        {module.qualifications.length > 0 ? (
          <ul>
            {module.qualifications.map((qualification) => <li key={qualification}>{qualification}</li>)}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
