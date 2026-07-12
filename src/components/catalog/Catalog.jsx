import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Button from "@/common/Button";
import EmptyState from "@/common/EmptyState";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import AddCatalogItem from "./catalogModal/AddCatalogItem";
import EditCatalogItem from "./catalogModal/EditCatalogItem";
import DeleteConfirmModal from "@/common/DeleteConfirmModal";
import toast from "react-hot-toast";
import { formatDate } from "@/utils/formatters";

const Catalog = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/catalog?limit=100');
      setItems(res.data.data.map(i => ({
        ...i,
        created: formatDate(i.createdAt),
      })));
    } catch (error) {
      toast.error('Failed to load catalog items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();
    return query.length === 0 || item.name.toLowerCase().includes(query) || (item.sku || "").toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      <div className="flex flex-col gap-4 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Catalogue</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Manage your products for quick order entry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="solid"
              onClick={() => setIsAddItemOpen(true)}
              leftIcon={(props) => (
                <Icons name="Plus" color="white" {...props} />
              )}
            >
              Add Product
            </Button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-80">
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or sku..."
              startIcon={<Icons name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Table View"
            >
              <Icons name="List" size={18} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "card" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              title="Card View"
            >
              <Icons name="Grid" size={18} />
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            search={search}
            entityName="Products"
            entityIcon="Package"
            onClearSearch={() => setSearch("")}
            addLabel="Add Product"
          />
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-1 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Product Name & SKU</th>
                    <th className="px-4 py-3">Details (Size/Color)</th>
                    <th className="px-4 py-3">Retail Price</th>
                    <th className="px-4 py-3">Dealer Price</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {item.imageUrl ? (
                           <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                        ) : (
                           <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                              <Icons name="Image" size={20} className="text-gray-400" />
                           </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.sku && <div className="text-[11px] text-gray-500 mt-0.5">SKU: {item.sku}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.size && <div>Size: {item.size}</div>}
                        {item.color && <div>Color: {item.color}</div>}
                        {item.unit && <div>Unit: {item.unit}</div>}
                        {!item.size && !item.color && !item.unit && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{Number(item.retailPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">
                        ₹{Number(item.dealerPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="px-2!">
                            <Icons name="Pencil" size={16} className="text-gray-400 hover:text-indigo-600 transition-colors" />
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 relative group"
              >
                <div className="aspect-[4/3] w-full rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative mb-2">
                  {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                     <Icons name="Package" size={32} className="text-gray-400" />
                  )}
                  
                  {/* Floating Action Buttons inside image */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                     <button onClick={() => setEditItem(item)} className="bg-white/90 backdrop-blur-sm p-2 text-gray-600 hover:text-indigo-600 rounded-md shadow-sm transition-colors border border-gray-200"><Icons name="Pencil" size={14}/></button>
                     <button onClick={() => setDeleteItem(item)} className="bg-white/90 backdrop-blur-sm p-2 text-gray-600 hover:text-rose-500 rounded-md shadow-sm transition-colors border border-gray-200"><Icons name="Trash2" size={14}/></button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                  {item.sku && <p className="text-[11px] text-gray-500 mt-0.5 truncate">SKU: {item.sku}</p>}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.size && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">Size: {item.size}</span>}
                  {item.color && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">Color: {item.color}</span>}
                  {item.unit && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">Unit: {item.unit}</span>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Retail</span>
                     <span className="text-sm font-semibold text-gray-900">₹{Number(item.retailPrice).toFixed(2)}</span>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">Dealer</span>
                     <span className="text-sm font-semibold text-indigo-600">₹{Number(item.dealerPrice).toFixed(2)}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddItemOpen && <AddCatalogItem open={isAddItemOpen} onClose={() => { setIsAddItemOpen(false); fetchItems(); }} />}
      {editItem && <EditCatalogItem open={!!editItem} onClose={() => { setEditItem(null); fetchItems(); }} initialData={editItem} />}
      {deleteItem && (
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          entityName={deleteItem.name}
          onConfirm={async () => {
            try {
              await api.delete(`/catalog/${deleteItem.id}`);
              toast.success("Product deleted");
              setItems(items.filter(i => i.id !== deleteItem.id));
            } catch (err) {
              toast.error("Failed to delete product");
            }
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Catalog;
