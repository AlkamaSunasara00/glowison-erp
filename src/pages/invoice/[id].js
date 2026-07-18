import { useRouter } from "next/router";
import InvoiceDetail from "@/components/invoice/InvoiceDetail";
import Loader from "@/common/Loader";

const InvoiceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!router.isReady) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-transparent">
        <Loader text="Loading..." />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-bold text-gray-950">Invoice not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The invoice details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/invoice")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <InvoiceDetail open={true} invoiceId={id} isPage={true} />
    </div>
  );
};

export default InvoiceDetailPage;
