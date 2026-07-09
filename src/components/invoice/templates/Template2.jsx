import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const formatAddress = (addr) => {
  if (!addr) return null;
  if (typeof addr === 'string') {
    try {
      const parsed = JSON.parse(addr);
      return [parsed.line1, parsed.line2, parsed.city, parsed.state, parsed.pincode].filter(Boolean).join(', ');
    } catch { return addr; }
  }
  if (typeof addr === 'object') {
     return [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  }
  return addr;
};

const Template2 = ({ data, detailInfo, settings, items }) => {
  return (
    <div className="print-area bg-white max-w-[800px] mx-auto text-gray-800 shadow-md">
      <div className="flex">
        <div className="bg-[#1f2937] text-white p-8 w-[60%] clip-path-header">
           {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain mb-2 bg-white p-1 rounded" />
           ) : (
              <div className="text-3xl font-bold tracking-wider mb-2 flex items-center gap-2">
                <span className="text-[#84cc16] text-4xl">◩</span> {settings?.companyName || 'COMPANY'}
              </div>
           )}
           <p className="text-xs text-gray-300 uppercase tracking-widest">{settings?.website || 'COMPANY TAGLINE HERE'}</p>
        </div>
        <div className="w-[40%] flex flex-col items-end justify-center pr-12">
           <h1 className="text-5xl font-bold text-[#84cc16] mb-2 tracking-wide">INVOICE</h1>
           <div className="grid grid-cols-2 gap-x-4 text-xs">
             <span className="text-gray-500 text-right">Invoice Number:</span>
             <span className="font-semibold">{data.invoiceNumber}</span>
             <span className="text-gray-500 text-right">Invoice Date:</span>
             <span className="font-semibold">{detailInfo["Invoice Date"]}</span>
           </div>
        </div>
      </div>

      <div className="flex px-12 mt-12 mb-10">
        <div className="w-1/2">
           <p className="text-[#84cc16] font-semibold text-sm mb-2">Invoice To:</p>
           <h2 className="text-xl font-bold text-gray-900 mb-1">{data.customer?.name || data.customer}</h2>
           <div className="text-xs text-gray-600 space-y-1">
             {data.customer?.address && <p>{formatAddress(data.customer.address)}</p>}
             {data.customer?.phone && <p>Phone: {data.customer.phone}</p>}
             {data.customer?.email && <p>Email: {data.customer.email}</p>}
           </div>
        </div>
        <div className="w-1/2">
           <p className="text-[#84cc16] font-semibold text-sm mb-2">Invoice From:</p>
           <h2 className="text-xl font-bold text-gray-900 mb-1">{settings?.companyName}</h2>
           <div className="text-xs text-gray-600 space-y-1">
             {settings?.address && <p>{formatAddress(settings.address)}</p>}
             {settings?.phone && <p>Phone: {settings.phone}</p>}
             {settings?.email && <p>Email: {settings.email}</p>}
           </div>
        </div>
      </div>

      <div className="px-12 mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white text-xs uppercase tracking-wider bg-[#1f2937]">
              <th className="bg-[#84cc16] py-3 px-4 w-12 text-center">No.</th>
              <th className="bg-[#84cc16] py-3 px-4">Product Description</th>
              <th className="py-3 px-4 text-center">Price</th>
              <th className="py-3 px-4 text-center">Qty.</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                <td className="py-4 px-4 text-center text-gray-500 font-medium">{String(idx + 1).padStart(2, '0')}</td>
                <td className="py-4 px-4">
                  <p className="font-bold text-gray-900">{item.product}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                </td>
                <td className="py-4 px-4 text-center font-medium">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">${Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex px-12 mb-12 items-start">
         <div className="w-7/12 pr-8 text-xs text-gray-600">
            <p className="text-[#84cc16] font-semibold text-sm mb-3">Payment Method:</p>
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="grid grid-cols-[100px_1fr] gap-y-1 font-medium flex-1 min-w-0">
                {settings?.accountNo && <><span className="text-gray-500">Account No:</span><span className="text-gray-900 break-all">{settings.accountNo}</span></>}
                <span>Account Name:</span><span className="text-gray-900 break-words">{settings?.companyName}</span>
                {settings?.upiId && <><span className="text-gray-500">UPI ID:</span><span className="text-gray-900 break-all">{settings.upiId}</span></>}
                {settings?.gstin && <><span className="text-gray-500">GSTIN:</span><span className="text-gray-900 break-all">{settings.gstin}</span></>}
              </div>
              {settings?.upiId && (
                <div className="text-center shrink-0 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeSVG value={`upi://pay?pa=${settings.upiId}&pn=${settings.companyName || 'Company'}&am=${data.grandTotal}`} size={64} />
                  <p className="text-[9px] mt-1.5 text-[#84cc16] font-bold uppercase tracking-wider">Pay via UPI</p>
                </div>
              )}
            </div>

            <p className="text-[#84cc16] font-semibold text-sm mb-2">Terms & Conditions:</p>
            <p className="text-gray-500 leading-relaxed">
              {data.notes || 'Please pay within 15 days of receiving this invoice. Late payments may incur additional charges.'}
            </p>
         </div>
         <div className="w-5/12 pl-4">
            <div className="flex justify-between py-1.5 text-sm font-medium text-gray-600 border-b border-gray-100">
              <span>Subtotal:</span><span className="text-gray-900">${Number(data.subtotal || 0).toFixed(2)}</span>
            </div>
            {Number(data.discount) > 0 && (
              <div className="flex justify-between py-1.5 text-sm font-medium text-gray-600 border-b border-gray-100">
                <span>Discount:</span><span className="text-red-500">-${Number(data.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm font-medium text-gray-600 border-b border-gray-200">
              <span>Tax:</span><span className="text-gray-900">${Number(data.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-4 text-lg font-bold bg-[#84cc16] text-white px-4 mt-2 rounded-sm shadow-sm">
              <span>Total:</span><span>${Number(data.grandTotal || 0).toFixed(2)}</span>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center pt-4 border-t border-gray-200">
               {settings?.signatureUrl && (
                  <img src={settings.signatureUrl} alt="Signature" className="h-16 mb-2 object-contain mix-blend-multiply" />
               )}
               <p className="text-xs font-bold text-gray-900 uppercase">Authorised Sign</p>
            </div>
         </div>
      </div>

      <div className="bg-[#1f2937] text-white text-xs py-5 px-12 flex justify-between items-center">
         <div className="flex items-center gap-6 text-gray-300">
           <span className="flex items-center gap-1"><span className="text-[#84cc16]">📞</span> {settings?.phone}</span>
           <span className="flex items-center gap-1"><span className="text-[#84cc16]">✉</span> {settings?.email}</span>
           {settings?.website && <span className="flex items-center gap-1"><span className="text-[#84cc16]">🌍</span> {settings.website}</span>}
         </div>
         <div className="font-semibold text-sm">Thank You For Your Business</div>
      </div>
    </div>
  );
};

export default Template2;
