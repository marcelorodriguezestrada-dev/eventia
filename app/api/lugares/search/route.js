import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: "Falta configurar GOOGLE_PLACES_API_KEY en el servidor." }, { status: 500 });
    }

    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Escribí qué estás buscando (ej. 'salón de fiestas infantiles')." }, { status: 400 });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("language", "es");
    url.searchParams.set("region", "ar");
    url.searchParams.set("key", process.env.GOOGLE_PLACES_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({ error: `Google Places: ${data.status} — ${data.error_message || ""}` }, { status: 500 });
    }

    const resultados = (data.results || []).slice(0, 10).map((r) => ({
      place_id: r.place_id,
      nombre: r.name,
      direccion: r.formatted_address,
      rating: r.rating || null,
      total_ratings: r.user_ratings_total || null,
    }));

    return NextResponse.json({ resultados });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}
