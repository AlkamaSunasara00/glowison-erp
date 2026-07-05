import "@/styles/globals.css";
import Layout from "@/layout/Layout";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

// A wrapper component to handle auth redirection logic
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

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
    </AuthProvider>
  );
}
