import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDoc,
  getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const sub = (eventoId) => collection(db, "eventos", eventoId, "invitados");

export async function agregarInvitado(eventoId, data, eventoInfo) {
  const ref = await addDoc(sub(eventoId), {
    nombre: data.nombre,
    telefono: data.telefono || "",
    confirmado: "pendiente", // pendiente | si | no
    evento_nombre: eventoInfo?.nombre || "",
    evento_fecha: eventoInfo?.fecha || "",
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function listarInvitados(eventoId) {
  const q = query(sub(eventoId), orderBy("created_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarInvitado(eventoId, invitadoId, data) {
  await updateDoc(doc(db, "eventos", eventoId, "invitados", invitadoId), data);
}

export async function borrarInvitado(eventoId, invitadoId) {
  await deleteDoc(doc(db, "eventos", eventoId, "invitados", invitadoId));
}

// ── Para la página pública de RSVP (sin login) ──────────────────────────────
export async function obtenerInvitadoPublico(eventoId, invitadoId) {
  const snap = await getDoc(doc(db, "eventos", eventoId, "invitados", invitadoId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function confirmarAsistenciaPublico(eventoId, invitadoId, confirmado) {
  await updateDoc(doc(db, "eventos", eventoId, "invitados", invitadoId), { confirmado });
}
