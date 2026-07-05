import { useRouter } from "next/router";
import InvoiceDetail from "@/components/invoice/InvoiceDetail";
import { invoiceData } from "@/components/invoice/invoice";

const InvoiceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading invoice details...</p>
      </div>
    );
  }

  const invoice = invoiceData.find((i) => String(i.id) === String(id));

  if (!invoice) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Invoice not found</h3>
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

  return <InvoiceDetail open={true} invoice={invoice} isPage={true} />;
};

export default InvoiceDetailPage;
