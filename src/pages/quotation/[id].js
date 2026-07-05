import { useRouter } from "next/router";
import QuotationDetail from "@/components/quotation/QuotationDetail";
import { quotationData } from "@/components/quotation/quotation";

const QuotationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading quotation details...</p>
      </div>
    );
  }

  const quotation = quotationData.find((q) => String(q.id) === String(id));

  if (!quotation) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Quotation not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The quotation details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/quotation")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return <QuotationDetail open={true} quotation={quotation} isPage={true} />;
};

export default QuotationDetailPage;
