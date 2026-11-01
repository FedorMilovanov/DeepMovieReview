"use client";

import { useSyncExternalStore } from "react";

// The server and failed-script view remain useful until React has actually
// hydrated, rather than assuming that JavaScript merely being enabled worked.
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
