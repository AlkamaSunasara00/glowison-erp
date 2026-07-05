import React, { useState } from "react";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import StatusBadge from "@/common/StatusBadge";
import AddPriceItem from "./priceListModal/AddPriceItem";
import EditPriceItem from "./priceListModal/EditPriceItem";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import { useRouter } from "next/router";

export const priceListData = [
  { id: "PL-001", name: "Wedding Card Design - Premium", category: "Card Design", size: "Standard", price: 500, unit: "Per Piece", notes: "Includes 2 revisions", image: "" },
  { id: "PL-002", name: "Shop Board Signage", category: "Signage Board", size: "Custom", price: 250, unit: "Per Sq Ft", notes: "With LED backlight", image: "" },
  { id: "PL-003", name: "Birthday Banner", category: "Banner", size: "6x4 ft", price: 15, unit: "Per Sq Ft", notes: "Star flex material", image: "" },
  { id: "PL-004", name: "Die Cut Sticker", category: "Sticker", size: "2x2 inch", price: 5, unit: "Per Piece", notes: "Minimum 100 pcs", image: "" },
  { id: "PL-005", name: "Normal Flex Design", category: "Flex Design", size: "Any", price: 12, unit: "Per Sq Ft", notes: "Normal quality", image: "" },
];


const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Card Design", label: "Card Design" },
  { value: "Flex Design", label: "Flex Design" },
  { value: "Banner", label: "Banner" },
  { value: "Sticker", label: "Sticker" },
  { value: "Signage Board", label: "Signage Board" },
  { value: "Other", label: "Other" },
];

const PriceList = () => {
  const router = useRouter();
  
  // State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  const [items, setItems] = useState(priceListData);

  // Filters
  const hasActiveFilters = categoryFilter !== "all";

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleRowClick = (item) => {
    router.push(`/price-list/${item.id}`);
  };

  // KPIs
  const totalItems = items.length;
  const designItems = items.filter(i => i.category.includes("Design")).length;
  const printItems = totalItems - designItems; // Just as an example metric

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Price List</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">Manage printing and design rates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="solid" onClick={() => setIsAddOpen(true)} leftIcon={(props) => <Icons name="Plus" color="white" {...props} />}>
              Add Price Item
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Items</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Design Services</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{designItems}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Print & Signage</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{printItems}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons name="Search" size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
              />
            </div>
            
            <div className="w-48 hidden sm:block">
              <Input
                type="select"
                options={categoryOptions}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" leftIcon={(props) => <Icons name="Download" {...props} />}>Export</Button>
          </div>
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon="List"
            title="No price items found"
            description={
              hasActiveFilters 
                ? "No items match your current filters. Try adjusting them."
                : "Get started by adding your first price list item."
            }
            action={hasActiveFilters ? "Clear filters" : "Add item"}
            onAction={() => {
              setSearch("");
              setCategoryFilter("all");
              if (!hasActiveFilters) setIsAddOpen(true);
            }}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map(item => (
                      <tr 
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-[10px] text-gray-500">{item.id}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                             {item.category}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.size}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          Rs. {item.price}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.unit}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                               <Icons name="Pencil" size={16} className="text-gray-500 hover:text-primary" />
                             </Button>
                             <Button variant="ghost" size="sm" onClick={() => setDeleteItem(item)} className="px-2!">
                               <Icons name="Trash2" size={16} className="text-gray-400 hover:text-rose-500 transition-colors" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddOpen && <AddPriceItem open={isAddOpen} onClose={() => setIsAddOpen(false)} />}
      {editItem && <EditPriceItem open={!!editItem} onClose={() => setEditItem(null)} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={() => {
            setItems(items.filter(i => i.id !== deleteItem.id));
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default PriceList;
