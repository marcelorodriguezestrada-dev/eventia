"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listarMisEventos, TIPOS_EVENTO } from "@/lib/eventos";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [user, setUser] = useState(undefined);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        setEventos(await listarMisEventos(u.uid));
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined || loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-24 text-gray-400">Cargando...</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Organizá cualquier evento sin perder el hilo</h1>
          <p className="text-gray-500 mb-8">
            Presupuesto, cronograma armado con IA y lugares para tu cumpleaños, casamiento o evento — todo en un solo lugar.
          </p>
          <Link href="/auth/register" className="bg-[#7c3aed] text-white px-6 py-3 rounded-lg font-semibold">
            Empezar gratis
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Mis eventos</h1>
          <Link href="/eventos/nuevo" className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-semibold">
            + Nuevo evento
          </Link>
        </div>

        {eventos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 text-sm mb-4">Todavía no creaste ningún evento.</p>
            <Link href="/eventos/nuevo" className="text-[#7c3aed] font-medium text-sm">Crear el primero →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventos.map((ev) => {
              const tipoInfo = TIPOS_EVENTO.find((t) => t.id === ev.tipo);
              return (
                <Link
                  key={ev.id}
                  href={`/eventos/${ev.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#7c3aed] transition"
                >
                  <span className="text-2xl">{tipoInfo?.emoji || "🎉"}</span>
                  <p className="font-semibold mt-2">{ev.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {tipoInfo?.label} {ev.fecha ? `· ${ev.fecha}` : ""} · {ev.cantidad_invitados} invitados
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
