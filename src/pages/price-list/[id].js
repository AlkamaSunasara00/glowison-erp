import { useRouter } from "next/router";
import PriceListDetail from "@/components/price-list/PriceListDetail";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const PriceListDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then(res => {
          setItem(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load item", err);
          setItem(null);
          setLoading(false);
        });
    }
  }, [id]);

  if (!id || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Item not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The item "{id}" does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => router.push("/price-list")}
          className="mt-6 text-sm font-medium text-primary hover:text-primary/80"
        >
          &larr; Back to price list
        </button>
      </div>
    );
  }

  return <PriceListDetail item={item} open={true} isPage={true} />;
};

export default PriceListDetailPage;
