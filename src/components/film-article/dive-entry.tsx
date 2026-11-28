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
      <div className="diveEntryOrb" aria-hidden="true"><svg viewBox="0 0 160 160" fill="none"><g stroke="currentColor" strokeWidth="1.15"><circle cx="80" cy="80" r="61" opacity=".45"/><circle cx="80" cy="80" r="49"/><path d="M80 10v12m70 58h-12M80 150v-12M10 80h12" opacity=".75"/><path d="m80 31 32 19 17 30-17 30-32 19-32-19-17-30 17-30z" opacity=".45"/><path d="m80 43 23 43-23 27-23-27z"/><path d="M80 43v70M57 86h46" opacity=".55"/></g></svg><span>01</span></div>
      <div className="diveEntryCopy">
        <p className="diveEyebrow">DIVE / Погружение 01</p>
        <h3 id="dive-entry-title">Кому верить?</h3>
        <p>Один странный предмет. Несколько объяснений. Попробуйте самостоятельно установить, что из них заслуживает доверия.</p>
        <button ref={entry} type="button" className="diveEntryAction" aria-haspopup="dialog" onClick={open}>
          {started ? "Вернуться к исследованию" : "Войти в исследование"} <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-5 5 5-5 5"/></svg>
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
