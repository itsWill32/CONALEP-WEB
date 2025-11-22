import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata = {
  title: "CONALEP 022 - Panel Administrativo",
  description: "Sistema de gestión escolar Chiapa de Corzo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}