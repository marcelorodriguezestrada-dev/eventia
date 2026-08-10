"use client";
import { useState, useEffect, useCallback } from "react";
import { listarCronograma, reemplazarCronograma, agregarItemCronograma, actualizarItemCronograma, borrarItemCronograma } from "@/lib/cronograma";

export default function TabCronograma({ evento }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({ hora: "", actividad: "" });
  const [opcionesIA, setOpcionesIA] = useState({ duracion_horas: 4, hora_inicio: "16:00", notas: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await listarCronograma(evento.id));
    setLoading(false);
  }, [evento.id]);

  useEffect(() => { load(); }, [load]);

  const handleGenerar = async () => {
    setGenerando(true);
    setError("");
    try {
      const res = await fetch("/api/cronograma/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: evento.tipo,
          edad: evento.edad_cumplido,
          cantidad_invitados: evento.cantidad_invitados,
          duracion_horas: opcionesIA.duracion_horas,
          hora_inicio: opcionesIA.hora_inicio,
          notas: opcionesIA.notas,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await reemplazarCronograma(evento.id, data.items || []);
      await load();
    } catch (e) {
      setError("Error generando el cronograma: " + e.message);
    } finally {
      setGenerando(false);
    }
  };

  const handleAgregarManual = async (e) => {
    e.preventDefault();
    if (!nuevo.actividad.trim()) return;
    await agregarItemCronograma(evento.id, nuevo, items.length);
    setNuevo({ hora: "", actividad: "" });
    load();
  };

  const handleBorrar = async (id) => {
    await borrarItemCronograma(evento.id, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-[#7c3aed] uppercase tracking-widest mb-4">🤖 Generar cronograma con IA</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Hora de inicio</label>
            <input
              type="time" value={opcionesIA.hora_inicio}
              onChange={(e) => setOpcionesIA({ ...opcionesIA, hora_inicio: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Duración (horas)</label>
            <input
              type="number" value={opcionesIA.duracion_horas}
              onChange={(e) => setOpcionesIA({ ...opcionesIA, duracion_horas: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <input
          value={opcionesIA.notas}
          onChange={(e) => setOpcionesIA({ ...opcionesIA, notas: e.target.value })}
          placeholder="Algo especial que quieras incluir (opcional)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
        />
        <button onClick={handleGenerar} disabled={generando} className="bg-[#7c3aed] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
          {generando ? "⟳ Generando..." : "✨ Generar cronograma"}
        </button>
        {items.length > 0 && <p className="text-xs text-gray-400 mt-2">Ojo: esto reemplaza el cronograma actual.</p>}
        {error && <p className="text-red-600 text-sm mt-2">⚠ {error}</p>}
      </div>

      <form onSubmit={handleAgregarManual} className="flex gap-2 flex-wrap">
        <input
          type="time" value={nuevo.hora} onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28"
        />
        <input
          value={nuevo.actividad} onChange={(e) => setNuevo({ ...nuevo, actividad: e.target.value })}
          placeholder="Agregar actividad manual..." className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">+ Agregar</button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Todavía no hay cronograma. Generalo con IA o agregá items a mano.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-4 items-start py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm font-mono text-[#7c3aed] font-semibold w-14 flex-shrink-0">{item.hora || "—"}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.actividad}</p>
                {item.notas && <p className="text-xs text-gray-400 mt-0.5">{item.notas}</p>}
              </div>
              <button onClick={() => handleBorrar(item.id)} className="text-xs text-gray-300 hover:text-red-500">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
