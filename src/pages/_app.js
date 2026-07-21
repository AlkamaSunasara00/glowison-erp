import "@/styles/globals.css";
import Layout from "@/layout/Layout";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { InstallProvider } from "@/context/InstallContext";
import { Toaster } from 'react-hot-toast';

import Image from "next/image";

// A wrapper component to handle auth redirection logic
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm transition-opacity duration-300">
        <div className="flex flex-col items-center">
          <div className="relative mb-6 drop-shadow-md">
            <Image 
              src="/image/logo1.png" 
              alt="Glowison" 
              width={160} 
              height={50} 
              priority 
              className="h-auto w-auto object-contain animate-pulse" 
            />
          </div>
          <div className="w-56 h-1.5 bg-gray-200/50 rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="absolute top-0 bottom-0 left-0 bg-primary rounded-full"
              style={{
                width: '50%',
                animation: 'loading-bar 1.5s ease-in-out infinite'
              }}
            ></div>
          </div>
          <style jsx>{`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user && router.pathname !== '/login') {
    router.push('/login');
    return null;
  }

  return children;
};

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // 🔥 pages WITHOUT layout
  const noLayoutRoutes = ["/login"];

  const isNoLayout = noLayoutRoutes.includes(router.pathname);

  return (
    <AuthProvider>
      <InstallProvider>
        <ThemeProvider>
          <Toaster position="top-right" />
          {isNoLayout ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ProtectedRoute>
          )}
        </ThemeProvider>
      </InstallProvider>
    </AuthProvider>
  );
}
