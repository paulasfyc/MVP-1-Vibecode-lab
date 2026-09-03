import './globals.css';

export const metadata = {
  title: 'VibeCargo - Cotizador Inteligente',
  description: 'Calcula el costo de tu mudanza de manera inteligente.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
