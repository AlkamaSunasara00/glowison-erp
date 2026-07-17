import { useRouter } from "next/router";
import EditOrder from "@/components/orders/ordersModal/EditOrder";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/common/Loader";

const EditOrderPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (id) {
      api.get(`/orders/${id}`)
        .then(res => {
          setOrder(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load order", err);
          setOrder(null);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (!id || loading) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-transparent">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The order details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/orders")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return <EditOrder open={true} initialData={order} isPage={true} />;
};

export default EditOrderPage;
