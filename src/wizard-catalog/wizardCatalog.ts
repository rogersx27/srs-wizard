import type { WizardSection } from "./types";

export const WIZARD_CATALOG: WizardSection[] = [
  {
    id: "contexto",
    title: "Cuéntanos de tu proyecto",
    subtitle: "Nada técnico por aquí, solo queremos entender tu idea.",
    ieee830Category: "CONTEXT",
    questions: [
      {
        id: "contexto-pitch",
        prompt: "En pocas palabras, ¿de qué se trata tu proyecto?",
        helpText: "Imagina que se lo explicas a un amigo en 30 segundos.",
        placeholder: "Ej: Una app para que mis clientes agenden citas sin llamarme por WhatsApp.",
        kind: "long_text",
        isRequirement: false,
        ieee830Category: "CONTEXT",
      },
      {
        id: "contexto-usuarios",
        prompt: "¿Quién va a usar esto principalmente?",
        helpText: "Puedes mencionar varios tipos de usuario si aplica.",
        placeholder: "Ej: Mis clientes finales y yo como administrador.",
        kind: "long_text",
        isRequirement: false,
        ieee830Category: "CONTEXT",
      },
    ],
  },
  {
    id: "usuario",
    title: "Lo que necesitas como usuario",
    subtitle: "Describe tus necesidades con tus propias palabras, sin pensar en tecnología.",
    ieee830Category: "USER",
    questions: [
      {
        id: "usuario-necesidades",
        prompt: "¿Qué necesitas poder hacer tú (o tus usuarios) con este sistema?",
        helpText: "Agrega una necesidad por línea. Ejemplo: 'Quiero ver mis citas del día'.",
        kind: "requirement_list",
        isRequirement: true,
        ieee830Category: "USER",
      },
    ],
  },
  {
    id: "sistema",
    title: "Piezas que debe tener el sistema",
    subtitle: "Cosas con las que el sistema debe poder conectarse o integrarse.",
    ieee830Category: "SYSTEM",
    questions: [
      {
        id: "sistema-integraciones",
        prompt: "¿Hay algo con lo que el sistema deba conectarse?",
        helpText: "Ej: WhatsApp, una pasarela de pagos, tu sistema de inventario actual. Si no hay ninguna, puedes dejarlo en blanco.",
        kind: "requirement_list",
        isRequirement: true,
        ieee830Category: "SYSTEM",
      },
      {
        id: "sistema-dispositivos",
        prompt: "¿Dónde lo van a usar principalmente?",
        kind: "single_choice",
        options: ["Celular", "Computador", "Ambos por igual", "No estoy seguro"],
        isRequirement: false,
        ieee830Category: "SYSTEM",
      },
    ],
  },
  {
    id: "funcional",
    title: "Lo que el sistema debe hacer",
    subtitle: "Las funcionalidades concretas, una por una.",
    ieee830Category: "FUNCTIONAL",
    questions: [
      {
        id: "funcional-caracteristicas",
        prompt: "Lista las funcionalidades principales que necesitas",
        helpText: "Una por línea. Ej: 'Permitir agendar una cita', 'Enviar recordatorio por correo'.",
        kind: "requirement_list",
        isRequirement: true,
        ieee830Category: "FUNCTIONAL",
      },
    ],
  },
  {
    id: "no_funcional",
    title: "Cómo debe comportarse el sistema",
    subtitle: "No son funciones, sino cualidades: qué tan rápido, seguro o fácil debe ser.",
    ieee830Category: "NON_FUNCTIONAL",
    questions: [
      {
        id: "nofuncional-cualidades",
        prompt: "¿Qué es importante para ti en cuanto a velocidad, seguridad o facilidad de uso?",
        helpText: "Ej: 'Debe cargar rápido incluso con mala señal', 'Solo el administrador puede ver los pagos'.",
        kind: "requirement_list",
        isRequirement: true,
        ieee830Category: "NON_FUNCTIONAL",
      },
    ],
  },
];
