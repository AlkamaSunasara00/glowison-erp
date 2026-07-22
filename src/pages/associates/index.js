import React, { useState } from "react";
import Head from "next/head";
import AssociatesList from "@/components/associates/AssociatesList";
import ProjectsList from "@/components/projects/ProjectsList";
import Button from "@/common/Button";

const AssociatesPage = () => {
  const [activeTab, setActiveTab] = useState("projects"); // Default to projects

  return (
    <>
      <Head>
        <title>Projects & Associates | Glowison ERP</title>
      </Head>
      <div className="flex flex-col min-h-screen w-full relative gap-4">
        
        {/* Top Tabs */}
        <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-lg shadow-sm w-fit">
          <Button
            variant={activeTab === "projects" ? "solid" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("projects")}
            className={activeTab === "projects" ? "" : "text-gray-500 hover:text-gray-900"}
          >
            Projects
          </Button>
          <Button
            variant={activeTab === "associates" ? "solid" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("associates")}
            className={activeTab === "associates" ? "" : "text-gray-500 hover:text-gray-900"}
          >
            Associates
          </Button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full animate-fade-in-up">
          {activeTab === "projects" && <ProjectsList />}
          {activeTab === "associates" && <AssociatesList />}
        </div>
      </div>
    </>
  );
};

export default AssociatesPage;
