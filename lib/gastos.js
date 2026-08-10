import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const RUBROS = [
  { id: "lugar", label: "Lugar / Salón", emoji: "🏠" },
  { id: "comida", label: "Comida y bebida", emoji: "🍽️" },
  { id: "animacion", label: "Animación / Show", emoji: "🎭" },
  { id: "decoracion", label: "Decoración", emoji: "🎈" },
  { id: "torta", label: "Torta / Postre", emoji: "🎂" },
  { id: "fotografia", label: "Fotografía / Video", emoji: "📸" },
  { id: "regalos", label: "Souvenirs / Regalos", emoji: "🎁" },
  { id: "otro", label: "Otro", emoji: "📦" },
];

const sub = (eventoId) => collection(db, "eventos", eventoId, "gastos");

export async function agregarGasto(eventoId, data) {
  const ref = await addDoc(sub(eventoId), {
    rubro: data.rubro,
    descripcion: data.descripcion || "",
    monto_estimado: Number(data.monto_estimado) || 0,
    monto_real: Number(data.monto_real) || 0,
    pagado: !!data.pagado,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function listarGastos(eventoId) {
  const q = query(sub(eventoId), orderBy("created_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarGasto(eventoId, gastoId, data) {
  await updateDoc(doc(db, "eventos", eventoId, "gastos", gastoId), data);
}

export async function borrarGasto(eventoId, gastoId) {
  await deleteDoc(doc(db, "eventos", eventoId, "gastos", gastoId));
}
