"use client";

import { useEffect } from "react";
import "driver.js/dist/driver.css";

const TOUR_KEY = "srs-wizard-tour-seen";

export function WizardTour() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(TOUR_KEY)) return;

    let cancelled = false;

    import("driver.js").then(({ driver }) => {
      if (cancelled) return;

      const tourDriver = driver({
        showProgress: true,
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

      if (document.querySelector('[data-tour-id="progress-bar"]')) {
        tourDriver.drive();
        window.localStorage.setItem(TOUR_KEY, "1");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
