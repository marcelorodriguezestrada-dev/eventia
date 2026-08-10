import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const sub = (eventoId) => collection(db, "eventos", eventoId, "lugares");

export async function guardarLugar(eventoId, data) {
  const ref = await addDoc(sub(eventoId), {
    nombre: data.nombre,
    direccion: data.direccion || "",
    telefono: data.telefono || "",
    rating: data.rating || null,
    place_id: data.place_id || null,
    notas: "",
    contactado: false,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function listarLugares(eventoId) {
  const q = query(sub(eventoId), orderBy("created_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarLugar(eventoId, lugarId, data) {
  await updateDoc(doc(db, "eventos", eventoId, "lugares", lugarId), data);
}

export async function borrarLugar(eventoId, lugarId) {
  await deleteDoc(doc(db, "eventos", eventoId, "lugares", lugarId));
}
