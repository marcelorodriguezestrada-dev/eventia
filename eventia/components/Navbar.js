"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cerrarSesion } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const logout = async () => {
    await cerrarSesion();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
      <Link href="/" className="font-bold text-lg">
        Event<span className="text-[#7c3aed]">IA</span>
      </Link>
      <div className="flex items-center gap-4">
        {user === undefined ? null : user ? (
          <>
            <span className="text-sm text-gray-500 hidden sm:block">{user.displayName}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-black">Salir</button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-black">Ingresar</Link>
            <Link href="/auth/register" className="bg-[#7c3aed] text-white text-sm px-4 py-1.5 rounded-full font-medium">
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
