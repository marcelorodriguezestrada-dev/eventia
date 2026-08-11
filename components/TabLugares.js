"use client";
import { useState, useEffect, useCallback } from "react";
import { guardarLugar, listarLugares, actualizarLugar, borrarLugar } from "@/lib/lugares";

export default function TabLugares({ evento }) {
  const [query, setQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState("");
  const [guardados, setGuardados] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setGuardados(await listarLugares(evento.id));
    setLoading(false);
  }, [evento.id]);

  useEffect(() => { load(); }, [load]);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBuscando(true);
    setError("");
    try {
      const res = await fetch("/api/lugares/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultados(data.resultados || []);
    } catch (e2) {
      setError("Error buscando: " + e2.message);
    } finally {
      setBuscando(false);
    }
  };

  const handleGuardar = async (lugar) => {
    await guardarLugar(evento.id, {
      nombre: lugar.nombre, direccion: lugar.direccion, rating: lugar.rating, place_id: lugar.place_id,
    });
    load();
  };

  const handleToggleContactado = async (lugar) => {
    await actualizarLugar(evento.id, lugar.id, { contactado: !lugar.contactado });
    setGuardados((prev) => prev.map((l) => (l.id === lugar.id ? { ...l, contactado: !l.contactado } : l)));
  };

  const handleBorrar = async (id) => {
    await borrarLugar(evento.id, id);
    setGuardados((prev) => prev.filter((l) => l.id !== id));
  };

  const mensajeWA = (lugar) =>
    encodeURIComponent(`¡Hola! Te escribo por ${lugar.nombre}. Quiero cotizar para un evento el ${evento.fecha || "(fecha a coordinar)"} con ${evento.cantidad_invitados || "X"} invitados. ¿Me pasás info y disponibilidad?`);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleBuscar} className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-[#7c3aed] uppercase tracking-widest mb-3">🔍 Buscar lugares y proveedores</p>
        <p className="text-xs text-gray-400 mb-3">Datos de © OpenStreetMap contributors — sin ratings, pero gratis y sin API key.</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="ej. salón de fiestas infantiles en Berazategui"
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button disabled={buscando} className="bg-[#7c3aed] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">⚠ {error}</p>}
      </form>

      {resultados.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resultados</p>
          {resultados.map((r) => (
            <div key={r.place_id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium">{r.nombre}</p>
                <p className="text-xs text-gray-400">{r.direccion} {r.rating ? `· ⭐ ${r.rating} (${r.total_ratings})` : ""}</p>
              </div>
              <button onClick={() => handleGuardar(r)} className="text-xs bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] px-3 py-1.5 rounded-md font-semibold">
                + Guardar
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lugares guardados</p>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
        ) : guardados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Todavía no guardaste ningún lugar.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {guardados.map((l) => (
              <div key={l.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-medium">{l.nombre}</p>
                  <p className="text-xs text-gray-400">{l.direccion}</p>
                </div>
                <a
                  href={`https://wa.me/?text=${mensajeWA(l)}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-md font-semibold"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => handleToggleContactado(l)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${l.contactado ? "bg-green-50 border-green-200 text-green-600" : "border-gray-200 text-gray-400"}`}
                >
                  {l.contactado ? "✓ Contactado" : "Sin contactar"}
                </button>
                <button onClick={() => handleBorrar(l.id)} className="text-xs text-gray-300 hover:text-red-500">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
