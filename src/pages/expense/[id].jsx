import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import StatusBadge from '@/common/StatusBadge';
import EditExpense from '@/components/expense/expenseModal/EditExpense';

const ExpenseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchExpense = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/expenses/${id}`);
      setExpense(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch expense details');
      router.push('/expense');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!expense) return null;

  return (
    <div className="flex flex-col min-h-screen w-full relative gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/expense')} className="px-2!">
            <Icons name="ArrowLeft" size={20} className="text-gray-500" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{expense.expenseNumber}</h1>
              <StatusBadge status={expense.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(expense.createdAt).toLocaleDateString('en-CA')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)} leftIcon={(props) => <Icons name="Pencil" {...props} />}>
            Edit Expense
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">
              Expense Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">Rs. {parseFloat(expense.amount).toLocaleString()}</p>
                  {expense.status === 'PARTIALLY_PAID' && (
                    <span className="text-sm font-medium text-amber-600">
                      (Due: Rs. {parseFloat(expense.dueAmount).toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Expense</p>
                <p className="text-base text-gray-900 mt-1 font-medium">{new Date(expense.spentOn).toLocaleDateString('en-CA')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-base text-gray-900 mt-1 font-medium">
                  {expense.category === 'OTHER' ? expense.categoryOther : expense.category.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Paid To ({expense.paidToType})</p>
                <p className="text-base text-gray-900 mt-1 font-medium">
                  {expense.paidToType === 'SUPPLIER' && expense.supplier 
                    ? expense.supplier.name 
                    : (expense.paidToName || "N/A")}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Notes / Description</p>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{expense.note || "No notes provided."}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Method</p>
                <p className="text-base text-gray-900 mt-1 font-medium">{expense.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Status</p>
                <div className="mt-1"><StatusBadge status={expense.status} /></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reference / Txn ID</p>
                <p className="text-base text-gray-900 mt-1 font-medium">{expense.referenceNumber || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Receipt & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">
              Receipt Attachment
            </h3>
            {expense.receiptUrl ? (
              <div className="space-y-4">
                <div className="aspect-video w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                   {expense.receiptUrl.toLowerCase().endsWith('.pdf') ? (
                     <Icons name="FileText" size={48} className="text-gray-400" />
                   ) : (
                     <img src={expense.receiptUrl} alt="Receipt" className="w-full h-full object-contain" />
                   )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(expense.receiptUrl, '_blank')}
                  leftIcon={(props) => <Icons name="ExternalLink" {...props} />}
                >
                  View Receipt
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                <Icons name="ImageOff" size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No receipt attached</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditExpense 
          open={isEditOpen} 
          onClose={() => { setIsEditOpen(false); fetchExpense(); }} 
          initialData={expense} 
        />
      )}
    </div>
  );
};

export default ExpenseDetail;
