import { NextResponse } from "next/server";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

const TIPOS = {
  cumple_infantil: "cumpleaños infantil",
  cumple_adulto: "cumpleaños de adulto",
  casamiento: "casamiento",
  otro: "evento",
};

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Falta configurar GROQ_API_KEY en el servidor." }, { status: 500 });
    }

    const body = await req.json();
    const { tipo, edad, cantidad_invitados, duracion_horas, hora_inicio, notas } = body;
    const tipoLabel = TIPOS[tipo] || tipo;

    const prompt = `Armá un cronograma detallado hora por hora para un ${tipoLabel} en Argentina.

DATOS DEL EVENTO:
- Tipo: ${tipoLabel}
${edad ? `- Edad que cumple: ${edad} años` : ""}
- Cantidad de invitados: ${cantidad_invitados || "no especificado"}
- Duración total: ${duracion_horas || 4} horas
- Hora de inicio: ${hora_inicio || "16:00"}
${notas ? `- Pedidos especiales del organizador: ${notas}` : ""}

Si es un cumpleaños infantil, tené en cuenta que los chicos necesitan: recepción, tiempo de juego libre antes de la comida, comer temprano (antes que los adultos si hace falta), un momento de show/animación bien ubicado (ni muy al principio ni muy al final), la torta como cierre emotivo, y tiempo de despedida con souvenirs. Los adultos suelen comer después o en simultáneo en otra zona.

Si es casamiento, seguí la estructura típica argentina: recepción con tragos, ceremonia (si aplica), entrada de novios, primer brindis, cena, discursos, primer vals, apertura de pista, torta, cotillón/after.

Respondé ÚNICAMENTE con este JSON, sin markdown ni texto extra:
{
  "items": [
    { "hora": "16:00", "actividad": "Recepción de invitados", "notas": "breve aclaración práctica" }
  ]
}`;

    const groqRes = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `Sos un organizador de eventos profesional en Argentina, con experiencia en cumpleaños infantiles, cumpleaños de adultos y casamientos. Armás cronogramas prácticos y realistas, pensando en el flujo real del día (comidas, shows, tiempos muertos). Respondés SOLO con JSON válido, sin markdown, sin texto extra.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json({ error: `Groq error ${groqRes.status}: ${errText}` }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error desconocido" }, { status: 500 });
  }
}
