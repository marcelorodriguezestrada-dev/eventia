import "./globals.css";

export const metadata = {
  title: "EventIA — Organizá tu evento",
  description: "Presupuesto, cronograma con IA y lugares para tu evento, todo en un lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
