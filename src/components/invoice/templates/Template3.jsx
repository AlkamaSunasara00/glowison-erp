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

const Template3 = ({ data, detailInfo, settings, items }) => {
  return (
    <div className="print-area bg-white max-w-[800px] mx-auto text-gray-900 relative overflow-hidden">
      {/* Top abstract shape */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-orange-500 opacity-20 transform rotate-45 translate-x-20 -translate-y-16"></div>
      <div className="absolute top-0 right-10 w-32 h-64 bg-blue-800 opacity-10 transform -rotate-45 translate-x-10 -translate-y-20"></div>

      <div className="p-12 relative z-10 flex justify-between items-center pb-8 border-b-4 border-orange-500">
        <div>
           <img src="/image/logo1.png" alt="Logo" className="h-16 object-contain mb-2" />
           {settings?.address && <p className="text-xs text-gray-500 mt-1">{formatAddress(settings.address)}</p>}
        </div>
        <div className="text-right">
           <h1 className="text-5xl font-bold text-orange-500 mb-4 tracking-wider uppercase">INVOICE</h1>
           <div className="grid grid-cols-[auto_120px] gap-2 text-sm justify-end text-left">
              <span className="font-semibold text-gray-700 text-right">Invoice #:</span>
              <span className="border border-blue-900 px-2 py-0.5 bg-gray-50">{data.invoiceNumber}</span>
              <span className="font-semibold text-gray-700 text-right">Date:</span>
              <span className="px-2">{detailInfo["Invoice Date"]}</span>
           </div>
        </div>
      </div>

      <div className="px-12 py-8 flex">
        <div className="w-1/2">
           <p className="text-blue-900 font-bold mb-1">Invoice To</p>
           <h2 className="text-xl font-bold text-orange-500 mb-2">{data.customer?.name || data.customer}</h2>
           {data.customer?.address && <p className="text-sm text-gray-600 mb-1">{formatAddress(data.customer.address)}</p>}
           {data.customer?.phone && <p className="text-sm text-gray-600">Phone: {data.customer.phone}</p>}
        </div>
      </div>

      <div className="px-12 mb-8 relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white text-sm font-semibold uppercase">
              <th className="bg-orange-500 py-3 px-4 w-12 text-center">No</th>
              <th className="bg-blue-900 py-3 px-4">Item Description</th>
              <th className="bg-blue-900 py-3 px-4 text-center">Price</th>
              <th className="bg-blue-900 py-3 px-4 text-center">Qty</th>
              <th className="bg-orange-500 py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item, idx) => (
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} border-b-2 border-white`}>
                <td className="py-3 px-4 text-center font-medium text-gray-700">{String(idx + 1).padStart(2, '0')}</td>
                <td className="py-3 px-4 text-gray-800 font-medium">{item.product}</td>
                <td className="py-3 px-4 text-center text-gray-700">₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">₹{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-12 mb-8 flex pb-12 relative z-10">
         <div className="w-7/12 pr-8 text-sm">
            <h3 className="text-blue-900 font-bold mb-3 uppercase tracking-wider">Payment Info</h3>
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="grid grid-cols-[100px_1fr] gap-y-2 text-gray-600 flex-1 min-w-0">
                {settings?.accountNo && <><span className="font-semibold text-gray-800">Account #:</span><span className="break-all">{settings.accountNo}</span></>}
                <span className="font-semibold text-gray-800">A/C Name:</span><span className="break-words">{settings?.companyName}</span>
                {settings?.upiId && <><span className="font-semibold text-gray-800">UPI ID:</span><span className="break-all">{settings.upiId}</span></>}
              </div>
              {settings?.upiId && (
                <div className="text-center shrink-0 bg-white p-2 rounded-xl border border-orange-100 shadow-sm mr-4">
                  <QRCodeSVG value={`upi://pay?pa=${settings.upiId}&pn=${settings.companyName || 'Company'}&am=${data.grandTotal}`} size={64} />
                  <p className="text-[9px] mt-1.5 text-orange-500 font-bold uppercase tracking-wider">Pay via UPI</p>
                </div>
              )}
            </div>
         </div>
         <div className="w-5/12">
            <div className="flex justify-between py-2 text-sm font-semibold border-b border-gray-200">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-900">₹{Number(data.subtotal || 0).toFixed(2)}</span>
            </div>
            {Number(data.discount) > 0 && (
              <div className="flex justify-between py-2 text-sm font-semibold border-b border-gray-200">
                <span className="text-gray-600">Discount</span>
                <span className="text-red-500">-₹{Number(data.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm font-semibold border-b border-gray-200">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">₹{Number(data.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 text-lg font-bold text-white bg-blue-900 relative overflow-hidden px-4">
              <div className="absolute inset-y-0 left-0 w-16 bg-orange-500 text-center py-3 flex items-center justify-center">Total</div>
              <span className="pl-16"></span>
              <span>₹{Number(data.grandTotal || 0).toFixed(2)}</span>
            </div>

            <div className="mt-8 flex flex-col items-center border-t-2 border-orange-200 pt-2 w-48 ml-auto text-center">
               {settings?.signatureUrl && (
                  <img src={settings.signatureUrl} alt="Signature" className="h-12 -mt-10 mb-1 object-contain" />
               )}
               <p className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4 w-full">Authorised Sign</p>
            </div>
            <div className="mt-4 text-right pr-2">
               <p className="text-xs text-blue-900 font-bold mb-1 uppercase tracking-wider">Terms & Conditions</p>
               <p className="text-black text-[10px] leading-relaxed">
                  {data.notes || 'For any enquiry, reach out via email at javexplastic@gmail.com, call on +91 74879 64767'}
               </p>
            </div>
         </div>
      </div>

      {/* Bottom abstract shape */}
      <div className="absolute bottom-0 left-0 w-64 h-32 bg-blue-900 opacity-90 transform -rotate-45 -translate-x-20 translate-y-16 z-0"></div>
      <div className="absolute bottom-0 left-10 w-32 h-64 bg-orange-500 opacity-80 transform rotate-45 -translate-x-10 translate-y-20 z-0"></div>
    </div>
  );
};

export default Template3;
