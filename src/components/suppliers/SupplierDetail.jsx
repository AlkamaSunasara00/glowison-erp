import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import api from "@/lib/api";
import StatusBadge from "@/common/StatusBadge";
import EditSupplier from "./supplierModal/EditSupplier";
import { formatDate } from "@/utils/formatters";

const SupplierDetail = ({ itemId }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers/${itemId}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleBack = () => {
    router.push('/suppliers');
  };

  if (loading || !data) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const totalSpent = data.purchases?.reduce((sum, p) => sum + Number(p.grandTotal), 0) || 0;
  const totalPaid = data.purchases?.reduce((sum, p) => sum + Number(p.paidAmount), 0) || 0;
  const totalDue = data.purchases?.reduce((sum, p) => sum + Number(p.dueAmount), 0) || 0;

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4 pb-10">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors shrink-0"
            title="Go back"
          >
            <Icons name="ArrowLeft" size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {data.name}
              <StatusBadge status={data.status} />
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{data.companyName || "No Company Name"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={(props) => <Icons name="Pencil" {...props} />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit Supplier
          </Button>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Spent</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">Rs. {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Total Paid</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">Rs. {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-rose-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-rose-600 uppercase tracking-wider">Total Due</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">Rs. {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 items-start">
        {/* ── LEFT ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-5 border-b pb-2">
              Supplier Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact Person</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.contactPerson}>{data.contactPerson}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Mobile</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.mobile}>{data.mobile}</span>
              </div>
              {data.alternateMobile && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Alternate Mobile</span>
                  <span className="text-base text-gray-800 font-medium truncate" title={data.alternateMobile}>{data.alternateMobile}</span>
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.email}>{data.email}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-5 border-b pb-2">
              Address & Taxation
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-1 col-span-1 sm:col-span-2 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Address</span>
                <span className="text-base text-gray-800 font-medium break-words">{data.address}, {data.city}, {data.state}, {data.country} - {data.pincode}</span>
              </div>
              {data.gstNumber && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">GST Number</span>
                  <span className="text-base text-gray-800 font-medium truncate" title={data.gstNumber}>{data.gstNumber}</span>
                </div>
              )}
              {data.panNumber && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">PAN Number</span>
                  <span className="text-base text-gray-800 font-medium truncate" title={data.panNumber}>{data.panNumber}</span>
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Payment Terms</span>
                <span className="text-base text-gray-800 font-medium truncate" title={data.paymentTerms}>{data.paymentTerms}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Opening Balance</span>
                <span className="text-base text-gray-800 font-medium truncate" title={`Rs. ${Number(data.openingBalance).toLocaleString()}`}>Rs. {Number(data.openingBalance).toLocaleString()}</span>
              </div>
            </div>
          </section>
          
          {data.notes && (
            <section>
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3 border-b pb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{data.notes}</p>
            </section>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 h-full">
          <section>
            <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4 border-b pb-2">
              Recent Purchases
            </h3>
            
            <div className="space-y-3 mt-4">
              {data.purchases?.length === 0 ? (
                <p className="text-sm text-gray-500">No purchases yet.</p>
              ) : (
                data.purchases?.map((purchase) => {
                  return (
                    <div key={purchase.id} onClick={() => router.push(`/purchase/${purchase.id}`)} className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 shadow-sm flex items-start justify-between cursor-pointer hover:border-primary/30 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          #{purchase.invoiceNumber}
                          <StatusBadge status={purchase.paymentStatus} />
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(purchase.purchaseDate)}</p>
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        Rs. {Number(purchase.grandTotal).toLocaleString()}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
      
      {isEditOpen && data && (
        <EditSupplier 
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          initialData={data} 
          onSuccess={() => { setIsEditOpen(false); fetchItem(); }}
        />
      )}
    </div>
  );
};

export default SupplierDetail;
