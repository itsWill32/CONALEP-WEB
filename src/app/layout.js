import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata = {
  title: "CONALEP 022 - Panel Administrativo",
  description: "Sistema de gestión escolar Chiapa de Corzo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <AuthProvider>
          <DataProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#ffffff',
                  color: '#334155',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
