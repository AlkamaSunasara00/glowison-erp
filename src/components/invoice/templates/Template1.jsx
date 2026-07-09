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

const Template1 = ({ data, detailInfo, settings, items }) => {
  return (
    <div className="print-area bg-white max-w-[800px] mx-auto text-gray-900 border border-gray-200">
      <div className="p-8 pb-4 flex justify-between items-start">
        <div className="flex flex-col">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
          ) : (
            <div className="text-2xl font-bold text-blue-700 uppercase tracking-widest">{settings?.companyName || 'COMPANY NAME'}</div>
          )}
          <div className="text-sm mt-2 text-gray-600 space-y-0.5 font-medium">
             <p>{settings?.phone || '+1-9879 987 987'}</p>
             <p>{settings?.email || 'info@companyname.com'}</p>
             {settings?.website && <p>{settings.website}</p>}
          </div>
        </div>
        <div className="w-64">
           <table className="w-full text-sm font-medium text-gray-700">
             <tbody>
               <tr>
                 <td className="text-right py-1 pr-2 text-blue-700 font-bold">Date:</td>
                 <td className="border border-gray-400 px-2 py-1 bg-white">{detailInfo["Invoice Date"]}</td>
               </tr>
               <tr>
                 <td className="text-right py-1 pr-2 text-blue-700 font-bold">Inv No.:</td>
                 <td className="border border-gray-400 px-2 py-1 bg-white">{data.invoiceNumber || '—'}</td>
               </tr>
               <tr>
                 <td className="text-right py-1 pr-2 text-blue-700 font-bold">P.O. No:</td>
                 <td className="border border-gray-400 px-2 py-1 bg-white">{data.order?.orderNumber ? `ORD-${data.order.orderNumber}` : '—'}</td>
               </tr>
             </tbody>
           </table>
        </div>
      </div>

      <div className="bg-blue-700 text-white px-8 py-2 w-3/4 mb-6 mt-4">
         <h1 className="text-xl font-medium tracking-widest">INVOICE | DELIVERY NOTE</h1>
      </div>

      <div className="px-8 mb-8">
        <h3 className="text-blue-700 font-bold uppercase tracking-wider mb-2">CLIENT INFORMATION:</h3>
        <div className="border-t border-b border-gray-400 py-3">
           <p className="font-bold text-lg">{data.customer?.name || data.customer}</p>
           {data.customer?.address && <p className="text-sm text-gray-700">{formatAddress(data.customer.address)}</p>}
           {data.customer?.phone && <p className="text-sm text-gray-700">{data.customer.phone}</p>}
           {data.customer?.email && <p className="text-sm text-gray-700">{data.customer.email}</p>}
        </div>
      </div>

      <div className="px-8 min-h-[400px]">
        <table className="w-full text-left border-collapse border border-blue-700 text-sm">
          <thead>
            <tr className="bg-blue-700 text-white font-medium">
              <th className="py-2 px-3 border-r border-blue-600 w-12 text-center">No.</th>
              <th className="py-2 px-3 border-r border-blue-600">Item Description</th>
              <th className="py-2 px-3 border-r border-blue-600 text-center w-24">Units</th>
              <th className="py-2 px-3 border-r border-blue-600 text-right w-24">Price</th>
              <th className="py-2 px-3 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-blue-700 h-10">
                <td className="border-r border-blue-700 text-center">{idx + 1}</td>
                <td className="border-r border-blue-700 px-3">
                   <p className="font-semibold">{item.product}</p>
                   {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                </td>
                <td className="border-r border-blue-700 text-center">{item.quantity} {item.unit}</td>
                <td className="border-r border-blue-700 text-right px-3">{Number(item.unitPrice).toFixed(2)}</td>
                <td className="text-right px-3">{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty filler rows if needed */}
            {items.length < 5 && Array.from({length: 5 - items.length}).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-blue-700 h-10">
                <td className="border-r border-blue-700"></td><td className="border-r border-blue-700"></td><td className="border-r border-blue-700"></td><td className="border-r border-blue-700"></td><td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex border-t border-blue-700">
         <div className="w-1/2 p-6 border-r border-blue-700 text-sm space-y-1">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-blue-700 font-bold uppercase mb-2">PAYMENT DETAILS:</h4>
                {settings?.companyName && <p><span className="text-gray-600">Acc Name:</span> <span className="font-semibold break-words">{settings.companyName}</span></p>}
                {settings?.accountNo && <p><span className="text-gray-600">Account No:</span> <span className="font-semibold break-all">{settings.accountNo}</span></p>}
                {settings?.gstin && <p><span className="text-gray-600">GSTIN:</span> <span className="font-semibold break-all">{settings.gstin}</span></p>}
                {settings?.upiId && <p><span className="text-gray-600">UPI ID:</span> <span className="font-semibold break-all">{settings.upiId}</span></p>}
                {settings?.address && <p><span className="text-gray-600">Address:</span> <span className="font-semibold">{formatAddress(settings.address)}</span></p>}
              </div>
              {settings?.upiId && (
                <div className="text-center shrink-0 bg-white p-2 rounded-xl border border-blue-100 shadow-sm">
                  <QRCodeSVG value={`upi://pay?pa=${settings.upiId}&pn=${settings.companyName || 'Company'}&am=${data.grandTotal}`} size={64} />
                  <p className="text-[9px] mt-1.5 text-blue-700 font-bold tracking-wider uppercase">Scan to Pay</p>
                </div>
              )}
            </div>
            
            {settings?.signatureUrl && (
              <div className="mt-8">
                <img src={settings.signatureUrl} alt="Signature" className="h-16 object-contain" />
                <p className="text-xs text-gray-500 border-t w-32 pt-1 mt-1">Authorized Sign</p>
              </div>
            )}
         </div>
         <div className="w-1/2 p-0 flex flex-col justify-end text-sm">
            <div className="flex justify-between px-6 py-2 border-b border-blue-700">
              <span className="font-semibold text-gray-700">Sub Total:</span>
              <span>{Number(data.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-6 py-2 border-b border-blue-700">
              <span className="font-semibold text-gray-700">Tax:</span>
              <span>{Number(data.tax || 0).toFixed(2)}</span>
            </div>
            {Number(data.discount) > 0 && (
              <div className="flex justify-between px-6 py-2 border-b border-blue-700 text-red-600">
                <span className="font-semibold">Discount:</span>
                <span>-{Number(data.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between px-6 py-3 font-bold text-lg bg-gray-50">
              <span className="text-blue-700">Total:</span>
              <span>{Number(data.grandTotal || 0).toFixed(2)}</span>
            </div>
         </div>
      </div>
      <div className="bg-blue-700 text-white text-center py-3 text-sm font-medium tracking-wide">
         "Thank you so much for your business"
      </div>
    </div>
  );
};

export default Template1;
