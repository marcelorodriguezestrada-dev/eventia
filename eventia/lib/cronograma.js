import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, orderBy, query, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const sub = (eventoId) => collection(db, "eventos", eventoId, "cronograma");

export async function agregarItemCronograma(eventoId, data, orden) {
  const ref = await addDoc(sub(eventoId), {
    hora: data.hora || "",
    actividad: data.actividad,
    notas: data.notas || "",
    orden: orden ?? 999,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

// Reemplaza todo el cronograma (usado al generar con IA) por una lista nueva.
export async function reemplazarCronograma(eventoId, items) {
  const existentes = await getDocs(sub(eventoId));
  const batch = writeBatch(db);
  existentes.docs.forEach((d) => batch.delete(d.ref));
  items.forEach((item, i) => {
    const ref = doc(sub(eventoId));
    batch.set(ref, {
      hora: item.hora || "",
      actividad: item.actividad,
      notas: item.notas || "",
      orden: i,
      created_at: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function listarCronograma(eventoId) {
  const q = query(sub(eventoId), orderBy("orden", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarItemCronograma(eventoId, itemId, data) {
  await updateDoc(doc(db, "eventos", eventoId, "cronograma", itemId), data);
}

export async function borrarItemCronograma(eventoId, itemId) {
  await deleteDoc(doc(db, "eventos", eventoId, "cronograma", itemId));
}
