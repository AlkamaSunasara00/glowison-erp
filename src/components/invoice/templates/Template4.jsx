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

const Template4 = ({ data, detailInfo, settings, items }) => {
  return (
    <div className="print-area bg-white max-w-[800px] mx-auto text-gray-800 relative overflow-hidden shadow-lg border border-gray-100">
      
      {/* Decorative Top */}
      <div className="absolute top-0 right-0 w-3/4 h-40 bg-[#0f172a] rounded-bl-full z-0 transform translate-x-10 -translate-y-4"></div>
      <div className="absolute top-0 right-0 w-3/4 h-40 bg-[#d4af37] rounded-bl-full z-0 transform translate-x-14 -translate-y-6"></div>
      
      <div className="relative z-10 px-12 pt-16 pb-8 flex justify-between items-end">
         <div>
           <h1 className="text-6xl font-black text-[#0f172a] tracking-tighter mb-1">INVOICE</h1>
           <h2 className="text-2xl font-bold text-[#d4af37] tracking-wider">{settings?.companyName || 'Company Name'}</h2>
         </div>
         {settings?.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain bg-white/50 backdrop-blur-sm p-1 rounded-lg" />
         )}
      </div>

      <div className="px-12 flex justify-between mb-8 text-sm">
         <div>
            <div className="grid grid-cols-[100px_1fr] gap-y-1 mb-2">
              <span className="font-semibold text-gray-700">Invoice No :</span>
              <span className="text-gray-900">{data.invoiceNumber}</span>
              <span className="font-semibold text-gray-700">Date :</span>
              <span className="text-gray-900">{detailInfo["Invoice Date"]}</span>
            </div>
         </div>
         <div className="text-right">
            <p className="font-semibold text-[#d4af37] mb-1">Invoice To</p>
            <h3 className="text-xl font-bold text-[#0f172a] mb-1">{data.customer?.name || data.customer}</h3>
            {data.customer?.email && <p className="text-gray-600">{data.customer.email}</p>}
            {data.customer?.address && <p className="text-gray-600 max-w-[200px] text-right ml-auto">{formatAddress(data.customer.address)}</p>}
         </div>
      </div>

      <div className="px-12 mb-8">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-white text-sm">
              <th className="py-4 px-4 text-left rounded-tl-lg">Description</th>
              <th className="py-4 px-4 w-20">Qty</th>
              <th className="py-4 px-4 w-32">Cost</th>
              <th className="py-4 px-4 w-32 text-right rounded-tr-lg">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {items.map((item, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#f8f9fa]' : 'bg-[#e9ecef]'}`}>
                <td className="py-4 px-4 text-left border-r border-white/20 text-[#0f172a]">{item.product}</td>
                <td className="py-4 px-4 border-r border-white/20 text-gray-600">{item.quantity}</td>
                <td className="py-4 px-4 border-r border-white/20 text-gray-600">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-bold text-[#0f172a]">${Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-12 flex justify-between mb-24">
         <div className="w-1/2 pr-8 text-sm text-gray-600">
            <h4 className="font-bold text-[#d4af37] mb-2 text-base">Payment Details :</h4>
            <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
              <div className="grid grid-cols-[100px_1fr] gap-y-1 flex-1 min-w-0">
                <span className="font-medium">Account Name:</span><span className="text-[#0f172a] font-semibold break-words">{settings?.companyName}</span>
                {settings?.accountNo && <><span className="font-medium">Account No:</span><span className="text-[#0f172a] break-all">{settings.accountNo}</span></>}
                {settings?.upiId && <><span className="font-medium">UPI ID:</span><span className="text-[#0f172a] break-all">{settings.upiId}</span></>}
                <span className="font-medium">GSTIN:</span><span className="text-[#0f172a] break-all">{settings?.gstin || 'N/A'}</span>
              </div>
              {settings?.upiId && (
                <div className="text-center shrink-0 bg-white p-2 rounded-xl border border-[#d4af37]/30 shadow-sm">
                  <QRCodeSVG value={`upi://pay?pa=${settings.upiId}&pn=${settings.companyName || 'Company'}&am=${data.grandTotal}`} size={64} />
                  <p className="text-[9px] mt-1.5 text-[#d4af37] font-bold uppercase tracking-widest">Scan to Pay</p>
                </div>
              )}
            </div>

            <h4 className="font-bold text-[#d4af37] mb-2 text-base">Contact Us :</h4>
            <div className="space-y-1">
              {settings?.phone && <p>{settings.phone}</p>}
              {settings?.email && <p>{settings.email}</p>}
              {settings?.address && <p>{formatAddress(settings.address)}</p>}
              {settings?.website && <p>{settings.website}</p>}
            </div>
         </div>

         <div className="w-1/2">
            <div className="bg-[#e9ecef] rounded-lg p-6 mb-8 text-sm">
               <div className="flex justify-between mb-2 font-medium">
                 <span className="text-gray-700">Subtotal</span>
                 <span className="text-gray-900">${Number(data.subtotal || 0).toFixed(2)}</span>
               </div>
               <div className="flex justify-between mb-2 font-medium">
                 <span className="text-gray-700">Tax</span>
                 <span className="text-gray-900">${Number(data.tax || 0).toFixed(2)}</span>
               </div>
               {Number(data.discount) > 0 && (
                 <div className="flex justify-between mb-2 font-medium text-red-600">
                   <span>Discount</span>
                   <span>-${Number(data.discount || 0).toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between mt-4 pt-2 border-t border-gray-300 font-bold text-[#0f172a] text-lg">
                 <span>Grand Total</span>
                 <span>${Number(data.grandTotal || 0).toFixed(2)}</span>
               </div>
            </div>

            <div className="flex flex-col items-center">
               <h3 className="text-2xl font-bold text-gray-700 mb-2">Thank You</h3>
               {settings?.signatureUrl ? (
                  <img src={settings.signatureUrl} alt="Signature" className="h-16 object-contain opacity-80 mix-blend-multiply" />
               ) : (
                  <div className="h-16 flex items-center justify-center font-[cursive] text-3xl text-gray-400 opacity-60">Signature</div>
               )}
               <div className="w-48 border-t border-gray-400 mt-1"></div>
               <p className="text-gray-600 text-sm mt-1 uppercase tracking-widest">Administrator</p>
            </div>
         </div>
      </div>

      {/* Decorative Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[#0f172a] rounded-tr-[100%] z-0 transform translate-y-4 origin-bottom scale-x-110"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[#d4af37] rounded-tr-[100%] z-0 transform translate-y-6 origin-bottom scale-x-110"></div>
    </div>
  );
};

export default Template4;
