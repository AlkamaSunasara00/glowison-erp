import { useRouter } from "next/router";
import LeadDetail from "@/components/leads/LeadDetail";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const LeadDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/leads/${id}`)
        .then(res => {
          setLead(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load lead", err);
          setLead(null);
          setLoading(false);
        });
    }
  }, [id]);

  if (!id || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white rounded-xl border border-gray-100">
        <p className="text-sm text-gray-500">Loading lead details...</p>
      </div>
    );
  }

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
