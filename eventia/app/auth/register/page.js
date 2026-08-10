"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarUsuario } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registrarUsuario(form.nombre, form.email, form.password);
      router.push("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Ese email ya está registrado.");
      else if (err.code === "auth/weak-password") setError("La contraseña es demasiado débil.");
      else setError("No pudimos crear la cuenta. Probá de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required placeholder="Tu nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="email" required placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="password" required placeholder="Contraseña" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-[#7c3aed] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        ¿Ya tenés cuenta? <Link href="/auth/login" className="text-[#7c3aed] font-medium">Ingresá</Link>
      </p>
    </div>
  );
}
