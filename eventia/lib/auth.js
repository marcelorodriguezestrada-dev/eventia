import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function registrarUsuario(nombre, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: nombre });
  await setDoc(doc(db, "perfiles", cred.user.uid), {
    nombre,
    created_at: serverTimestamp(),
  });
  return cred.user;
}

export async function iniciarSesion(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function cerrarSesion() {
  await fbSignOut(auth);
}
