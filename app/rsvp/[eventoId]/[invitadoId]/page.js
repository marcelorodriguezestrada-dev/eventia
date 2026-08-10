"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { obtenerInvitadoPublico, confirmarAsistenciaPublico } from "@/lib/invitados";

export default function RSVPPage() {
  const { eventoId, invitadoId } = useParams();
  const [invitado, setInvitado] = useState(undefined);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      setInvitado(await obtenerInvitadoPublico(eventoId, invitadoId));
    })();
  }, [eventoId, invitadoId]);

  const responder = async (confirmado) => {
    setGuardando(true);
    await confirmarAsistenciaPublico(eventoId, invitadoId, confirmado);
    setInvitado((prev) => ({ ...prev, confirmado }));
    setGuardando(false);
  };

  if (invitado === undefined) {
    return <div className="text-center py-24 text-gray-400">Cargando...</div>;
  }
  if (!invitado) {
    return <div className="text-center py-24 text-gray-500">No encontramos esta invitación.</div>;
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">🎉</p>
      <h1 className="text-2xl font-semibold mb-1">{invitado.evento_nombre || "¡Estás invitado!"}</h1>
      {invitado.evento_fecha && <p className="text-gray-500 text-sm mb-6">{invitado.evento_fecha}</p>}
      <p className="text-gray-700 mb-6">Hola {invitado.nombre}, ¿venís?</p>

      {invitado.confirmado !== "pendiente" ? (
        <p className="text-sm font-medium">
          {invitado.confirmado === "si" ? "✓ Ya confirmaste tu asistencia 🎉" : "Marcaste que no vas a poder venir."}
        </p>
      ) : (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => responder("si")} disabled={guardando}
            className="bg-[#7c3aed] text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            ¡Sí, voy! 🎉
          </button>
          <button
            onClick={() => responder("no")} disabled={guardando}
            className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            No puedo
          </button>
        </div>
      )}

      {invitado.confirmado !== "pendiente" && (
        <button onClick={() => responder("pendiente")} className="text-xs text-gray-400 mt-4 underline">
          Cambiar respuesta
        </button>
      )}
    </div>
  );
}
