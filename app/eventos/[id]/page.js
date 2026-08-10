"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { obtenerEvento, TIPOS_EVENTO } from "@/lib/eventos";
import Navbar from "@/components/Navbar";
import TabPresupuesto from "@/components/TabPresupuesto";
import TabCronograma from "@/components/TabCronograma";
import TabLugares from "@/components/TabLugares";
import TabInvitados from "@/components/TabInvitados";

export default function EventoPage() {
  const { id } = useParams();
  const [user, setUser] = useState(undefined);
  const [evento, setEvento] = useState(undefined);
  const [tab, setTab] = useState("presupuesto");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setEvento(await obtenerEvento(id));
      else setEvento(null);
    });
    return () => unsub();
  }, [id]);

  if (user === undefined || evento === undefined) {
    return <><Navbar /><div className="text-center py-24 text-gray-400">Cargando...</div></>;
  }
  if (!user) {
    return <><Navbar /><div className="text-center py-24 text-gray-500">Necesitás iniciar sesión.</div></>;
  }
  if (!evento || evento.user_id !== user.uid) {
    return <><Navbar /><div className="text-center py-24 text-gray-500">No encontramos este evento (o no es tuyo).</div></>;
  }

  const tipoInfo = TIPOS_EVENTO.find((t) => t.id === evento.tipo);
  const TABS = [
    { id: "presupuesto", label: "💰 Presupuesto" },
    { id: "cronograma", label: "🗓️ Cronograma" },
    { id: "lugares", label: "📍 Lugares" },
    { id: "invitados", label: "👥 Invitados" },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="text-3xl">{tipoInfo?.emoji}</span>
          <h1 className="text-2xl font-semibold mt-2">{evento.nombre}</h1>
          <p className="text-sm text-gray-400">
            {tipoInfo?.label} {evento.fecha ? `· ${evento.fecha}` : ""} · {evento.cantidad_invitados} invitados
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                tab === t.id ? "bg-[#7c3aed] text-white border-[#7c3aed]" : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "presupuesto" && <TabPresupuesto evento={evento} />}
        {tab === "cronograma" && <TabCronograma evento={evento} />}
        {tab === "lugares" && <TabLugares evento={evento} />}
        {tab === "invitados" && <TabInvitados evento={evento} />}
      </div>
    </>
  );
}
