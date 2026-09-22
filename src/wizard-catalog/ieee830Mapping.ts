import type { Ieee830Category } from "./types";

export const IEEE830_LABELS: Record<Ieee830Category, string> = {
  CONTEXT: "Contexto",
  USER: "Requisitos de Usuario",
  SYSTEM: "Requisitos del Sistema",
  FUNCTIONAL: "Requisitos Funcionales",
  NON_FUNCTIONAL: "Requisitos No Funcionales",
};

export const IEEE830_PREFIX: Partial<Record<Ieee830Category, string>> = {
  USER: "RU",
  SYSTEM: "RS",
  FUNCTIONAL: "RF",
  NON_FUNCTIONAL: "RNF",
};

export const IEEE830_REQUIREMENT_ORDER: Ieee830Category[] = [
  "USER",
  "SYSTEM",
  "FUNCTIONAL",
  "NON_FUNCTIONAL",
];
