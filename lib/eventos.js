import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDoc,
  getDocs, orderBy, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "eventos";

export const TIPOS_EVENTO = [
  { id: "cumple_infantil", label: "Cumpleaños infantil", emoji: "🎈" },
  { id: "cumple_adulto", label: "Cumpleaños adulto", emoji: "🎂" },
  { id: "casamiento", label: "Casamiento", emoji: "💍" },
  { id: "otro", label: "Otro evento", emoji: "🎉" },
];

export async function crearEvento(userId, data) {
  const ref = await addDoc(collection(db, COLLECTION), {
    user_id: userId,
    nombre: data.nombre,
    tipo: data.tipo,
    fecha: data.fecha || null,
    edad_cumplido: data.edad_cumplido || null,
    cantidad_invitados: Number(data.cantidad_invitados) || 0,
    presupuesto_total: Number(data.presupuesto_total) || 0,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function obtenerEvento(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listarMisEventos(userId) {
  const q = query(collection(db, COLLECTION), where("user_id", "==", userId), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarEvento(id, data) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function borrarEvento(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
