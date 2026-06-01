import React from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";

const EmptyState = ({
  search = "",
  entityName = "Items",
  entityIcon = "Folder",
  onClearSearch,
  onAdd,
  addLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-[15%] text-center p-4">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icons
          name={search ? "SearchX" : entityIcon}
          className="text-primary"
          size={28}
        />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">
        {search ? "No Results Found" : `No ${entityName} Yet`}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-4">
        {search
          ? `No ${entityName.toLowerCase()} matched "${search}". Try a different keyword.`
          : `Start by adding your first ${entityName.toLowerCase()}.`}
      </p>
      {search ? (
        <Button variant="outline" onClick={onClearSearch}>
          Clear Search
        </Button>
      ) : (
        onAdd && (
          <Button variant="solid" onClick={onAdd}>
            {addLabel || `Add ${entityName}`}
          </Button>
        )
      )}
    </div>
  );
};

export default EmptyState;