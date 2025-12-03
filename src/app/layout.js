import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'] 
});

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
            {/* 👇 TOASTER MEJORADO */}
            <Toaster 
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000, // 4 segundos (más tiempo para leer)
                style: {
                  background: '#ffffff',
                  color: '#334155',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  maxWidth: '420px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderLeft: '4px solid #10b981',
                  },
                },
                error: {
                  duration: 5000, // Más tiempo para errores
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderLeft: '4px solid #ef4444',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderLeft: '4px solid #3b82f6',
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
