import { NextResponse } from "next/server";

// Usa OpenStreetMap Nominatim: gratis, sin API key, sin tarjeta.
// Único requisito de su política de uso: un User-Agent identificable
// y no pasarse de 1 request por segundo (nuestro uso es manual, así que sobra).
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Escribí qué estás buscando (ej. 'salón de fiestas infantiles en Berazategui')." }, { status: 400 });
    }

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");
    url.searchParams.set("countrycodes", "ar");
    url.searchParams.set("accept-language", "es");

    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim exige un User-Agent identificable — no funciona sin esto.
        "User-Agent": "EventIA/1.0 (app de organizacion de eventos)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Nominatim respondió con error ${res.status}` }, { status: 500 });
    }

    const data = await res.json();

    const resultados = (data || []).map((r) => ({
      place_id: String(r.place_id),
      nombre: r.name || r.display_name.split(",")[0],
      direccion: r.display_name,
      rating: null, // OpenStreetMap no tiene ratings, a diferencia de Google
      total_ratings: null,
    }));

    return NextResponse.json({ resultados });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}
