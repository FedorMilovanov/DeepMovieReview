"use client";

import { lazy, Suspense, useRef, useState } from "react";

const SiriusJourney = lazy(() => import("./sirius-journey"));

export function DiveEntry({ observation, report }: { observation: string; report: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const entry = useRef<HTMLButtonElement>(null);
  const [started, setStarted] = useState(false);
  function open() {
    setStarted(true);
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
  }
  return (
    <aside className="diveEntry" aria-labelledby="dive-entry-title">
      <div className="diveEntryOrb" aria-hidden="true"><i /><i /><i /><span>01</span></div>
      <div className="diveEntryCopy">
        <p className="diveEyebrow">DIVE / Погружение 01</p>
        <h3 id="dive-entry-title">Кому верить?</h3>
        <p>Один странный предмет. Несколько объяснений. Попробуйте самостоятельно установить, что из них заслуживает доверия.</p>
        <button ref={entry} type="button" className="diveEntryAction" onClick={open}>
          {started ? "Вернуться к исследованию" : "Войти в исследование"} <span aria-hidden="true">↗</span>
        </button>
        <small>3–5 минут · без спойлеров · можно выйти в любой момент</small>
      </div>
      <dialog ref={dialog} className="diveDialog" aria-label="Погружение: кому верить" onClose={() => entry.current?.focus({ preventScroll: true })}>
        <div className="diveDialogBar">
          <span className="diveEyebrow">Глубокие воды <span aria-hidden="true">/</span> DIVE</span>
          <button type="button" className="diveExit" onClick={close}>Выйти к статье <span aria-hidden="true">×</span></button>
        </div>
        {started ? <Suspense fallback={<p role="status" className="diveLoading">Открываем исследование…</p>}>
          <SiriusJourney observation={observation} report={report} onFinish={close} />
        </Suspense> : null}
      </dialog>
    </aside>
  );
}
