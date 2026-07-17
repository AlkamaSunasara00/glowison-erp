import { useRouter } from "next/router";
import CustomerDetail from "@/components/customers/CustomerDetail";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/common/Loader";

const CustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/customers/${id}`)
        .then(res => {
          setCustomer(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load customer", err);
          setCustomer(null);
          setLoading(false);
        });
    }
  }, [id]);

  if (!id || loading) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-transparent">
        <Loader text="Loading customer details..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Customer not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The customer details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/customers")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return <CustomerDetail open={true} customer={customer} isPage={true} />;
};

export default CustomerDetailPage;
