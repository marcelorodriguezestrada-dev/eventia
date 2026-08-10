"use client";
import { useState, useEffect, useCallback } from "react";
import { agregarGasto, listarGastos, actualizarGasto, borrarGasto, RUBROS } from "@/lib/gastos";
import { fmt } from "@/lib/firebase";

export default function TabPresupuesto({ evento }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rubro: "lugar", descripcion: "", monto_estimado: "", monto_real: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setGastos(await listarGastos(evento.id));
    setLoading(false);
  }, [evento.id]);

  useEffect(() => { load(); }, [load]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim()) return;
    await agregarGasto(evento.id, form);
    setForm({ rubro: form.rubro, descripcion: "", monto_estimado: "", monto_real: "" });
    load();
  };

  const handleTogglePagado = async (g) => {
    await actualizarGasto(evento.id, g.id, { pagado: !g.pagado });
    setGastos((prev) => prev.map((x) => (x.id === g.id ? { ...x, pagado: !x.pagado } : x)));
  };

  const handleBorrar = async (id) => {
    await borrarGasto(evento.id, id);
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  const totalEstimado = gastos.reduce((s, g) => s + (g.monto_estimado || 0), 0);
  const totalReal = gastos.reduce((s, g) => s + (g.monto_real || 0), 0);
  const presupuesto = evento.presupuesto_total || 0;
  const pctUsado = presupuesto > 0 ? Math.min((totalReal / presupuesto) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Presupuesto</span>
          <span className="text-sm text-gray-500">{fmt(totalReal)} de {fmt(presupuesto)}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all ${pctUsado > 90 ? "bg-red-500" : pctUsado > 70 ? "bg-amber-500" : "bg-[#7c3aed]"}`}
            style={{ width: `${pctUsado}%` }}
          />
        </div>
        <div className="flex gap-4 text-xs text-gray-400 mt-2">
          <span>Estimado: {fmt(totalEstimado)}</span>
          <span>Real: {fmt(totalReal)}</span>
        </div>
      </div>

      <form onSubmit={handleAgregar} className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Agregar gasto</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {RUBROS.map((r) => (
            <button
              key={r.id} type="button" onClick={() => setForm({ ...form, rubro: r.id })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${form.rubro === r.id ? "bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed]" : "border-gray-200 text-gray-500"}`}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción" className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-1"
          />
          <input
            type="number" value={form.monto_estimado} onChange={(e) => setForm({ ...form, monto_estimado: e.target.value })}
            placeholder="Estimado $" className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number" value={form.monto_real} onChange={(e) => setForm({ ...form, monto_real: e.target.value })}
            placeholder="Real $ (opcional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button className="mt-3 bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Agregar</button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
      ) : gastos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Todavía no cargaste ningún gasto.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {gastos.map((g) => {
            const rubroInfo = RUBROS.find((r) => r.id === g.rubro);
            return (
              <div key={g.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
                <span className="text-lg">{rubroInfo?.emoji}</span>
                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm font-medium">{g.descripcion}</p>
                  <p className="text-xs text-gray-400">{rubroInfo?.label} · est. {fmt(g.monto_estimado)} · real {fmt(g.monto_real)}</p>
                </div>
                <button
                  onClick={() => handleTogglePagado(g)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${g.pagado ? "bg-green-50 border-green-200 text-green-600" : "border-gray-200 text-gray-400"}`}
                >
                  {g.pagado ? "✓ Pagado" : "Pendiente"}
                </button>
                <button onClick={() => handleBorrar(g.id)} className="text-xs text-gray-300 hover:text-red-500">🗑</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
