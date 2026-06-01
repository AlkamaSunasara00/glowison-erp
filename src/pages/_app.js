import "@/styles/globals.css";
import Layout from "@/layout/Layout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // 🔥 pages WITHOUT layout
  const noLayoutRoutes = ["/login"];

  const isNoLayout = noLayoutRoutes.includes(router.pathname);

  return (
    isNoLayout ? (
      <Component {...pageProps} />
    ) : (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    )
  );
}
