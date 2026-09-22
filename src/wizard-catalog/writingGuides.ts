import type { WritingGuide } from "./types";

export const PROJECT_GUIDE: WritingGuide = {
  title: "Ideas para contar tu proyecto",
  tip: "Cuenta qué hace tu negocio, qué quieres mejorar y para qué. No necesitas palabras técnicas.",
  groups: [
    { title: "Mi negocio se dedica a…", ideas: ["Vender productos", "Prestar servicios", "Atender citas", "Gestionar pedidos", "Dar clases o asesorías"] },
    { title: "Hoy me cuesta…", ideas: ["Encontrar información", "Llevar cuentas a mano", "Coordinar a mi equipo", "Responder a tiempo", "Evitar tareas repetidas"] },
    { title: "Quiero lograr…", ideas: ["Ahorrar tiempo", "Atender mejor", "Reducir errores", "Organizar el trabajo", "Ver cómo va el negocio"] },
  ],
  examples: [
    { title: "Ventas y pedidos", text: "Tengo un negocio de venta de productos. Quiero organizar los pedidos y consultar las existencias en un solo lugar para atender más rápido y evitar errores." },
    { title: "Citas y servicios", text: "Ofrezco servicios por cita. Quiero que mis clientes puedan reservar y que mi equipo consulte la agenda para evitar cruces de horarios." },
    { title: "Organización interna", text: "Quiero organizar las tareas y la información de mi negocio para que mi equipo sepa qué tiene pendiente y podamos hacer seguimiento al trabajo." },
  ],
};

export const USERS_GUIDE: WritingGuide = {
  title: "Ideas para describir a tus usuarios",
  tip: "Piensa quién entrará al sistema y qué necesita hacer. Puedes incluir varios grupos.",
  groups: [
    { title: "Personas del negocio", ideas: ["Dueño o administrador", "Equipo de ventas", "Personal de atención", "Encargado de inventario", "Equipo de contabilidad"] },
    { title: "Personas externas", ideas: ["Clientes", "Proveedores", "Aliados", "Repartidores"] },
    { title: "Qué necesitan hacer", ideas: ["Consultar información", "Registrar pedidos", "Reservar citas", "Actualizar datos", "Revisar reportes", "Aprobar solicitudes"] },
  ],
  examples: [
    { title: "Clientes y administrador", text: "Lo usarán mis clientes para consultar y solicitar nuestros servicios, y yo como administrador para gestionar las solicitudes y revisar cómo va el negocio." },
    { title: "Equipo interno", text: "Lo usará mi equipo para registrar y consultar el trabajo del día. Yo como administrador revisaré los reportes y controlaré los permisos de cada persona." },
    { title: "Ventas e inventario", text: "Lo usará el equipo de ventas para registrar pedidos y el encargado de inventario para actualizar existencias. Yo consultaré las ventas y los productos disponibles." },
  ],
};
