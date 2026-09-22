"use client";

import { useEffect } from "react";
import type { Driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "srs-wizard-tour-seen";

export function WizardTour() {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(TOUR_KEY)) return;
    } catch {
      // The optional tour must never prevent access when storage is blocked.
      return;
    }

    let cancelled = false;
    let tourDriver: Driver | undefined;

    async function startTour() {
      try {
        const { driver } = await import("driver.js");
        if (cancelled || !document.querySelector('[data-tour-id="progress-bar"]')) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        tourDriver = driver({
          animate: !reduceMotion,
          smoothScroll: !reduceMotion,
          showProgress: true,
          progressText: "{{current}} de {{total}}",
          nextBtnText: "Siguiente",
          prevBtnText: "Atrás",
          doneBtnText: "Entendido",
          steps: [
            {
              element: '[data-tour-id="progress-bar"]',
              popover: {
                title: "Tu progreso",
                description: "Aquí ves cuánto falta. No toma más de unos minutos.",
              },
            },
            {
              element: '[data-tour-id="question-card"]',
              popover: {
                title: "Responde con calma",
                description: "Usa tus propias palabras, no necesitas saber de tecnología.",
              },
            },
            {
              element: '[data-tour-id="priority-selector"]',
              popover: {
                title: "Prioriza",
                description: "Cuéntanos qué tan importante es cada cosa para ti.",
              },
            },
            {
              element: '[data-tour-id="nav-continue"]',
              popover: {
                title: "Guardamos todo automáticamente",
                description: "Puedes cerrar esta página y volver cuando quieras.",
              },
            },
          ].filter((step) => document.querySelector(step.element)),
        });

        tourDriver.drive();
        try {
          window.localStorage.setItem(TOUR_KEY, "1");
        } catch {
          // A failed preference write does not affect the active tour.
        }
      } catch {
        // A network failure while loading the guide must leave the form usable.
        tourDriver?.destroy();
      }
    }

    void startTour();

    return () => {
      cancelled = true;
      tourDriver?.destroy();
    };
  }, []);

  return null;
}
