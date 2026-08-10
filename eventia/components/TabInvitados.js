"use client";
import { useState, useEffect, useCallback } from "react";
import { agregarInvitado, listarInvitados, borrarInvitado } from "@/lib/invitados";

export default function TabInvitados({ evento }) {
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [copiadoId, setCopiadoId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setInvitados(await listarInvitados(evento.id));
    setLoading(false);
  }, [evento.id]);

  useEffect(() => { load(); }, [load]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    await agregarInvitado(evento.id, form, { nombre: evento.nombre, fecha: evento.fecha });
    setForm({ nombre: "", telefono: "" });
    load();
  };

  const handleBorrar = async (id) => {
    await borrarInvitado(evento.id, id);
    setInvitados((prev) => prev.filter((i) => i.id !== id));
  };

  const linkRSVP = (invitadoId) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp/${evento.id}/${invitadoId}`;

  const copiarLink = (invitadoId) => {
    navigator.clipboard.writeText(linkRSVP(invitadoId));
    setCopiadoId(invitadoId);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const confirmados = invitados.filter((i) => i.confirmado === "si").length;
  const rechazados = invitados.filter((i) => i.confirmado === "no").length;
  const pendientes = invitados.filter((i) => i.confirmado === "pendiente").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 flex-wrap">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-1 min-w-[100px] text-center">
          <p className="text-xl font-bold text-green-600">{confirmados}</p>
          <p className="text-xs text-gray-400">Confirmados</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-1 min-w-[100px] text-center">
          <p className="text-xl font-bold text-gray-400">{pendientes}</p>
          <p className="text-xs text-gray-400">Pendientes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-1 min-w-[100px] text-center">
          <p className="text-xl font-bold text-red-500">{rechazados}</p>
          <p className="text-xs text-gray-400">No vienen</p>
        </div>
      </div>

      <form onSubmit={handleAgregar} className="flex gap-2 flex-wrap">
        <input
          value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Nombre del invitado" className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          placeholder="Teléfono (opcional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40"
        />
        <button className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Agregar</button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
      ) : invitados.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Todavía no agregaste invitados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invitados.map((inv) => (
            <div key={inv.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm font-medium">{inv.nombre}</p>
                {inv.telefono && <p className="text-xs text-gray-400">{inv.telefono}</p>}
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  inv.confirmado === "si" ? "bg-green-50 border-green-200 text-green-600"
                  : inv.confirmado === "no" ? "bg-red-50 border-red-200 text-red-500"
                  : "border-gray-200 text-gray-400"
                }`}
              >
                {inv.confirmado === "si" ? "✓ Confirmó" : inv.confirmado === "no" ? "✗ No viene" : "Pendiente"}
              </span>
              <button
                onClick={() => copiarLink(inv.id)}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium"
              >
                {copiadoId === inv.id ? "✓ Copiado" : "🔗 Link RSVP"}
              </button>
              <button onClick={() => handleBorrar(inv.id)} className="text-xs text-gray-300 hover:text-red-500">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
