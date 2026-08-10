"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { crearEvento, TIPOS_EVENTO } from "@/lib/eventos";
import Navbar from "@/components/Navbar";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [form, setForm] = useState({
    nombre: "", tipo: "cumple_infantil", fecha: "", edad_cumplido: "",
    cantidad_invitados: "", presupuesto_total: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!form.nombre.trim()) { setError("Ponele un nombre al evento."); return; }
    setError("");
    setGuardando(true);
    try {
      const id = await crearEvento(user.uid, form);
      router.push(`/eventos/${id}`);
    } catch (err) {
      setError("Error al crear el evento: " + err.message);
      setGuardando(false);
    }
  };

  if (user === undefined) return <><Navbar /><div className="text-center py-24 text-gray-400">Cargando...</div></>;
  if (!user) return <><Navbar /><div className="text-center py-24 text-gray-500">Necesitás iniciar sesión primero.</div></>;

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Nuevo evento</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Nombre del evento</label>
            <input
              value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
              placeholder="ej. Cumple de Lola - 3 años"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipo de evento</label>
            <div className="flex gap-2 flex-wrap">
              {TIPOS_EVENTO.map((t) => (
                <button
                  key={t.id} type="button" onClick={() => set("tipo", t.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${form.tipo === t.id ? "bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed]" : "border-gray-200 text-gray-500"}`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Fecha</label>
              <input
                type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {(form.tipo === "cumple_infantil" || form.tipo === "cumple_adulto") && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Edad que cumple</label>
                <input
                  type="number" value={form.edad_cumplido} onChange={(e) => set("edad_cumplido", e.target.value)}
                  placeholder="3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Cantidad de invitados</label>
              <input
                type="number" value={form.cantidad_invitados} onChange={(e) => set("cantidad_invitados", e.target.value)}
                placeholder="20"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Presupuesto total ($)</label>
              <input
                type="number" value={form.presupuesto_total} onChange={(e) => set("presupuesto_total", e.target.value)}
                placeholder="500000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button disabled={guardando} className="bg-[#7c3aed] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">
            {guardando ? "Creando..." : "Crear evento"}
          </button>
        </form>
      </div>
    </>
  );
}
