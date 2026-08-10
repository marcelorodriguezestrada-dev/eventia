"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { iniciarSesion } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await iniciarSesion(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError("Email o contraseña incorrectos.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-semibold mb-6">Ingresar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        ¿No tenés cuenta? <Link href="/auth/register" className="text-[#7c3aed] font-medium">Creá una</Link>
      </p>
    </div>
  );
}
