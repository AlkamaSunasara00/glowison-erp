import React, { useState } from "react";
import Button from "@/common/Button";
import Icons from "@/common/Icons";
import Input from "@/common/Input";
import { useRouter } from "next/router";

export const TravelClaims = () => {
  const router = useRouter();

  // Initial claims data based on the design mockup image
  const [claims, setClaims] = useState([
    {
      id: 1,
      name: "Arjun Patel",
      initials: "AP",
      purpose: "Clinic visit — Dr. Priya Sharma",
      date: "May 21",
      km: "24.8",
      amount: "₹890",
      status: "Pending",
      theme: { bg: "bg-violet-100 text-violet-700" },
    },
    {
      id: 2,
      name: "Sneha Mehta",
      initials: "SM",
      purpose: "Meeting — Dr. Ritu Patel",
      date: "May 21",
      km: "18.2",
      amount: "₹655",
      status: "Approved",
      theme: { bg: "bg-emerald-50 text-emerald-700" },
    },
    {
      id: 3,
      name: "Rohit Shah",
      initials: "RS",
      purpose: "Cold call run — Gandhinagar",
      date: "May 20",
      km: "38.6",
      amount: "₹1,390",
      status: "Pending",
      theme: { bg: "bg-amber-100 text-amber-700" },
    },
    {
      id: 4,
      name: "Arjun Patel",
      initials: "AP",
      purpose: "Demo device transport — Rajkot",
      date: "May 18",
      km: "112",
      amount: "₹4,032",
      status: "Approved",
      theme: { bg: "bg-violet-100 text-violet-700" },
    },
  ]);

  // Form states for creating a new claim
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [newClaimForm, setNewClaimForm] = useState({
    employee: "Arjun Patel",
    purpose: "",
    km: "",
    amount: "",
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Dynamic metrics calculations
  const totalClaimsCount = claims.length;
  const totalClaimsValue = claims.reduce(
    (acc, curr) =>
      acc + parseInt(curr.amount.toString().replace(/[^\d]/g, "") || 0),
    0
  );

  const pendingCount = claims.filter((c) => c.status === "Pending").length;
  const pendingValue = claims
    .filter((c) => c.status === "Pending")
    .reduce(
      (acc, curr) =>
        acc + parseInt(curr.amount.toString().replace(/[^\d]/g, "") || 0),
      0
    );

  const approvedCount = claims.filter((c) => c.status === "Approved").length;
  const approvedValue = claims
    .filter((c) => c.status === "Approved")
    .reduce(
      (acc, curr) =>
        acc + parseInt(curr.amount.toString().replace(/[^\d]/g, "") || 0),
      0
    );

  const avgPerTrip =
    totalClaimsCount > 0 ? Math.round(totalClaimsValue / totalClaimsCount) : 0;

  // Actions
  const handleApprove = (id) => {
    setClaims((prev) =>
      prev.map((claim) => {
        if (claim.id === id) {
          return { ...claim, status: "Approved" };
        }
        return claim;
      })
    );
  };

  const handleCreateClaim = (e) => {
    e.preventDefault();
    if (!newClaimForm.purpose || !newClaimForm.km || !newClaimForm.amount) {
      return;
    }

    const employeeInitials =
      newClaimForm.employee === "Arjun Patel"
        ? "AP"
        : newClaimForm.employee === "Sneha Mehta"
        ? "SM"
        : "RS";

    const employeeTheme =
      newClaimForm.employee === "Arjun Patel"
        ? { bg: "bg-violet-100 text-violet-700" }
        : newClaimForm.employee === "Sneha Mehta"
        ? { bg: "bg-emerald-50 text-emerald-700" }
        : { bg: "bg-amber-100 text-amber-700" };

    const formattedAmount = newClaimForm.amount.startsWith("₹")
      ? newClaimForm.amount
      : `₹${newClaimForm.amount}`;

    const newClaim = {
      id: Date.now(),
      name: newClaimForm.employee,
      initials: employeeInitials,
      purpose: newClaimForm.purpose,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      km: newClaimForm.km,
      amount: formattedAmount,
      status: "Pending",
      theme: employeeTheme,
    };

    setClaims((prev) => [newClaim, ...prev]);
    setIsNewClaimOpen(false);
    setNewClaimForm({
      employee: "Arjun Patel",
      purpose: "",
      km: "",
      amount: "",
    });
  };

  // Filtered rows
  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" || c.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 animate-fade-in relative">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between py-2">
        <div>
          <h1 className="page-header">Travel claims</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit, review, and manage mileage and travel reimbursement claims for field agents.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            size="md"
            variant="outline"
            leftIcon={(props) => <Icons name="Download" {...props} />}
          >
            Export
          </Button>
            <Button
              variant="solid"
              size="md"
              leftIcon={(props) => <Icons name="Plus"{...props} />}
              onClick={() => setIsNewClaimOpen(true)}
            >
              New claim
            </Button>
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
          <p className="text-sm text-gray-400">
            Claims this month
          </p>
          <p className="text-2xl font-extrabold text-gray-900 leading-none mt-1">
            {totalClaimsCount}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            ₹{totalClaimsValue.toLocaleString("en-IN")} total
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
          <p className="text-sm text-gray-400">
            Pending approval
          </p>
          <p className="text-2xl font-extrabold text-amber-600 leading-none mt-1">
            {pendingCount}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            ₹{pendingValue.toLocaleString("en-IN")} pending
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
          <p className="text-sm text-gray-400">
            Approved
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 leading-none mt-1">
            {approvedCount}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            ₹{approvedValue.toLocaleString("en-IN")} approved
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col gap-1">
          <p className="text-sm text-gray-400">
            Avg. per trip
          </p>
          <p className="text-2xl font-extrabold text-gray-900 leading-none mt-1">
            ₹{avgPerTrip.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">this month</p>
        </div>
      </div>

      {/* ── CLAIMS TABLE BLOCK ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
        {/* Table Filter Actions Header */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1.5 rounded-lg">
              {["all", "pending", "approved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="w-full sm:w-100">
              <Input
                id="search-claims"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or purpose..."
                endIcon={
                  <Icons name="Search" size={15} className="text-gray-400" />
                }
              />
            </div>
          </div>
        </div>

        {/* Table Render */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-primary text-white text-[12px] font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-center">KM</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-slate-50/50 transition-colors text-[13px] text-gray-700"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${claim.theme.bg}`}
                      >
                        {claim.initials}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {claim.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 max-w-[280px] truncate" title={claim.purpose}>
                    {claim.purpose}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{claim.date}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                    {claim.km} km
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                    {claim.amount}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        claim.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-55/10 text-amber-700 border-amber-200/50"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {claim.status === "Pending" ? (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(claim.id)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                    No travel claims found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE NEW CLAIM DIALOG (MODAL) ───────────────────── */}
      {/* {isNewClaimOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setIsNewClaimOpen(false)}
          />

          <div className="relative bg-white border border-slate-200/60 rounded-xl w-full max-w-md p-6 shadow-2xl z-10 mx-4 animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Submit travel claim</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setIsNewClaimOpen(false)}
              >
                <Icons name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <Input
                  type="select"
                  value={newClaimForm.employee}
                  onChange={(e) =>
                    setNewClaimForm((prev) => ({ ...prev, employee: e.target.value }))
                  }
                  options={[
                    { value: "Arjun Patel", label: "Arjun Patel" },
                    { value: "Sneha Mehta", label: "Sneha Mehta" },
                    { value: "Rohit Shah", label: "Rohit Shah" },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Travel Purpose / Destination <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newClaimForm.purpose}
                  onChange={(e) =>
                    setNewClaimForm((prev) => ({ ...prev, purpose: e.target.value }))
                  }
                  placeholder="e.g. Clinic visit — Dr. Priya Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Distance (KM) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newClaimForm.km}
                    onChange={(e) =>
                      setNewClaimForm((prev) => ({ ...prev, km: e.target.value }))
                    }
                    placeholder="e.g. 24.8"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Reimbursement Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newClaimForm.amount}
                    onChange={(e) =>
                      setNewClaimForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="e.g. 890"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewClaimOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="solid">
                  Submit Claim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TravelClaims;
