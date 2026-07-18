import { useRouter } from "next/router";
import AssociateDetail from "@/components/associates/AssociateDetail";
import Loader from "@/common/Loader";

const AssociateDetailPage = () => {
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
        <h3 className="text-base font-bold text-gray-950">Associate not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The associate details could not be found or the ID is invalid.
        </p>
        <button
          onClick={() => router.push("/associates")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/95"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <AssociateDetail open={true} itemId={id} isPage={true} />
    </div>
  );
};

export default AssociateDetailPage;
