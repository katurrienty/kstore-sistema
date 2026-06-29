import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'K-Store Sistema | Administración de Tienda',
  description: 'Sistema de administración de inventario, compras, ventas y reportes para K-Store — Tienda de repuestos para bicicletas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
