# 🎉 EventIA

Organizá cualquier evento (cumpleaños infantil, cumpleaños adulto, casamiento u otro):
presupuesto, cronograma generado con IA, buscador de lugares/proveedores, e invitados con RSVP.

## Stack
- Next.js 14 + Tailwind CSS
- Firebase (Auth + Firestore)
- Groq (generador de cronograma con IA)
- Google Places API (buscador de lugares)

## Setup rápido

```bash
npm install
cp .env.example .env.local
# completar las variables
npm run dev
```

## Variables de entorno

Ver `.env.example`. Necesitás:
1. Un proyecto de Firebase con **Authentication (Email/Password)** y **Firestore Database** activados
2. Una API key de **Groq** (gratis en console.groq.com/keys)
3. Una API key de **Google Places** (console.cloud.google.com → habilitar "Places API")

## Base de datos (Firestore)

Deployá las reglas y el índice antes de usar la app:

```bash
firebase login
firebase use --add    # elegí tu proyecto
firebase deploy --only firestore:rules,firestore:indexes
```

O pegá el contenido de `firestore.rules` directo en Firebase Console → Firestore Database → Rules → Publish.

## Estructura de datos

```
eventos/{eventoId}
  ├─ user_id, nombre, tipo, fecha, edad_cumplido, cantidad_invitados, presupuesto_total
  ├─ gastos/{gastoId}        — rubro, descripción, monto estimado/real, pagado
  ├─ cronograma/{itemId}     — hora, actividad, notas, orden
  ├─ lugares/{lugarId}       — lugares/proveedores guardados de la búsqueda
  └─ invitados/{invitadoId}  — nombre, teléfono, confirmado (pendiente/si/no)
```

Cada invitado tiene un link público de confirmación (`/rsvp/[eventoId]/[invitadoId]`)
que no requiere cuenta — solo puede leer su propia invitación y cambiar su
respuesta, nada más (así protegemos el presupuesto y el resto de tus datos).

## Cómo pensar el negocio (uso personal + profesional)

La app funciona igual para alguien organizando su propio evento que para un
organizador profesional con muchos eventos en simultáneo — cada evento vive
separado en su propio documento, así que un organizador simplemente va a
tener más tarjetas en "Mis eventos".

## Roadmap sugerido (no incluido en este MVP)

- Contacto automático por llamada con proveedores (requiere integración de
  voz tipo Twilio — bastante más grande que el resto, dejalo para una v2)
- Exportar cronograma/lista de invitados a PDF
- Panel de "próximas tareas" consolidando presupuesto pendiente + invitados sin confirmar

## Deploy

Vercel — conectar el repo y setear las env vars (todas con prefijo
`NEXT_PUBLIC_` excepto `GROQ_API_KEY` y `GOOGLE_PLACES_API_KEY`, que quedan
ocultas en el servidor).
