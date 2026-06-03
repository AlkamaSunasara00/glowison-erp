import { useRouter } from "next/router";
import LeadDetail from "@/components/leads/LeadDetail";
import { leadsData } from "@/components/leads/leads";

const LeadDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Wait until id is resolved from URL query
  if (!id) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading lead details...</p>
      </div>
    );
  }

  // Find dynamic lead item using ID from mock database
  const lead = leadsData.find((l) => String(l.id) === String(id));

  if (!lead) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-semibold text-gray-950">Lead not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The lead details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/leads")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <LeadDetail open={true} lead={lead} isPage={true} />
  );
};

export default LeadDetailPage;
