import { useRouter } from "next/router";
import OrderDetail from "@/components/orders/OrderDetail";
import { ordersData } from "@/components/orders/orders";

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  const order = ordersData.find((o) => String(o.id) === String(id));

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

  return <OrderDetail open={true} order={order} isPage={true} />;
};

export default OrderDetailPage;
