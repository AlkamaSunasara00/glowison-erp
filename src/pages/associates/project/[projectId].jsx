import { useRouter } from "next/router";
import ProjectDetail from "@/components/associates/ProjectDetail";
import Loader from "@/common/Loader";

const ProjectDetailPage = () => {
  const router = useRouter();
  const { projectId } = router.query;

  if (!router.isReady) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-transparent">
        <Loader text="Loading..." />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="text-base font-bold text-gray-950">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The project details could not be found or the ID is invalid.
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
      <ProjectDetail projectId={projectId} />
    </div>
  );
};

export default ProjectDetailPage;
