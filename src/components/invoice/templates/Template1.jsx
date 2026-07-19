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

// basic number to words for rupees
const numToWords = (amount) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (num) => {
        if ((num = num.toString()).length > 9) return 'overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
        return str;
    };
    
    let parts = amount.toString().split('.');
    let rupees = parseInt(parts[0], 10);
    let paise = parts.length > 1 ? parseInt(parts[1].padEnd(2, '0').slice(0, 2), 10) : 0;
    
    let str = inWords(rupees) + 'Rupees';
    if(paise > 0) {
        str += ' and ' + inWords(paise) + 'Paise';
    }
    return str + ' Only';
};

const Template1 = ({ data, detailInfo, settings, items }) => {
  return (
    <div className="print-area bg-white max-w-[800px] mx-auto text-blue-900 border border-blue-800 font-sans relative">
      <div className="flex flex-col border-b border-blue-800">
        {/* Header Section */}
        <div className="flex justify-between items-center p-4 min-h-[120px]">
          <div className="w-1/4">
             <img src={settings?.logoUrl || "/image/logo1.png"} alt="Logo" className="max-h-24 object-contain" />
          </div>
          <div className="w-2/4 text-center">
             <h2 className="text-xl font-bold uppercase">{settings?.companyName || 'Glowison'}</h2>
             <p className="text-sm mt-1">{formatAddress(settings?.address) || 'Glowison Headquarters'}</p>
             {settings?.gstin && <p className="text-[10px] font-semibold mt-1">GSTIN: {settings.gstin}</p>}
          </div>
          <div className="w-1/4"></div>
        </div>

        {/* Invoice Title Bar */}
        <div className="border-t border-blue-800 py-1 text-center bg-blue-50">
          <h1 className="text-xl font-semibold">Invoice</h1>
        </div>

        {/* Details Section */}
        <div className="flex border-t border-blue-800 text-[11px] leading-relaxed">
          <div className="w-1/3 border-r border-blue-800 p-2">
            <p className="text-gray-600 mb-1">Billed To & Shipped To</p>
            <p className="font-bold text-sm">{data.customer?.name || data.customer}</p>
            {data.customer?.address && <p>{formatAddress(data.customer.address)}</p>}
            {data.customer?.phone && <p>Phone: {data.customer.phone}</p>}
          </div>
          
          <div className="w-1/3 border-r border-blue-800 p-2">
            <p className="text-gray-600 mb-1">Shipped From</p>
            <p className="font-bold text-sm">{settings?.companyName || 'Glowison'}</p>
            {settings?.address && <p>{formatAddress(settings.address)}</p>}
            {settings?.phone && <p>Phone: {settings.phone}</p>}
          </div>

          <div className="w-1/3 p-0">
             <table className="w-full h-full text-[11px] whitespace-nowrap">
               <tbody>
                 <tr className="border-b border-blue-100">
                   <td className="p-1 pl-2 text-gray-600">Invoice #</td>
                   <td className="p-1 font-bold">{data.invoiceNumber}</td>
                 </tr>
                 <tr className="border-b border-blue-100">
                   <td className="p-1 pl-2 text-gray-600">Invoice Date</td>
                   <td className="p-1 font-bold">{detailInfo["Invoice Date"]}</td>
                 </tr>
                 <tr className="border-b border-blue-100">
                   <td className="p-1 pl-2 text-gray-600">Due Date</td>
                   <td className="p-1 font-bold">{detailInfo["Due Date"]}</td>
                 </tr>
                 <tr className="border-b border-blue-100">
                   <td className="p-1 pl-2 text-gray-600">Country of Supply:</td>
                   <td className="p-1 font-bold">India</td>
                 </tr>
                 <tr>
                   <td className="p-1 pl-2 text-gray-600">Place of Supply:</td>
                   <td className="p-1 font-bold">{settings?.state || 'Gujarat'}</td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="w-full border-b border-blue-800">
        <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-blue-800">
               <th className="border-r border-blue-800 p-1 w-6 text-center"></th>
               <th className="border-r border-blue-800 p-1">Item</th>
               <th className="border-r border-blue-800 p-1 text-center">HSN/SAC</th>
               <th className="border-r border-blue-800 p-1 text-center w-12">GST<br/>Rate</th>
               <th className="border-r border-blue-800 p-1 text-center w-16">Quantity</th>
               <th className="border-r border-blue-800 p-1 text-center w-16">Rate</th>
               <th className="border-r border-blue-800 p-1 text-right w-20">Amount</th>
               <th className="border-r border-blue-800 p-1 text-right w-16">IGST</th>
               <th className="p-1 text-right w-20">Total</th>
            </tr>
          </thead>
          <tbody>
             {items.map((item, idx) => (
                <tr key={idx} className="border-b border-blue-100 last:border-b-0 align-top">
                   <td className="border-r border-blue-800 p-1 text-center">{idx + 1}.</td>
                   <td className="border-r border-blue-800 p-1">
                      <p className="font-bold">{item.product}</p>
                      {item.description && <p className="text-[10px] text-gray-600">{item.description}</p>}
                   </td>
                   <td className="border-r border-blue-800 p-1 text-center">{item.hsn || ''}</td>
                   <td className="border-r border-blue-800 p-1 text-center">{item.taxRate || 0}%</td>
                   <td className="border-r border-blue-800 p-1 text-center">{item.quantity}</td>
                   <td className="border-r border-blue-800 p-1 text-center">₹{Number(item.unitPrice).toFixed(2)}</td>
                   <td className="border-r border-blue-800 p-1 text-right">₹{Number((item.quantity * item.unitPrice)).toFixed(2)}</td>
                   <td className="border-r border-blue-800 p-1 text-right">₹{Number(((item.quantity * item.unitPrice) * (item.taxRate || 0)) / 100).toFixed(2)}</td>
                   <td className="p-1 text-right">₹{Number(item.lineTotal).toFixed(2)}</td>
                </tr>
             ))}
             {/* Empty space filler */}
             <tr className="h-20 border-b border-blue-800">
                <td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td className="border-r border-blue-800"></td><td></td>
             </tr>
             <tr className="border-b border-blue-200">
               <td colSpan="6" className="border-r border-blue-800 p-1 text-right font-bold">Amount</td>
               <td className="border-r border-blue-800 p-1 text-right font-bold">₹{Number(data.subtotal || 0).toFixed(2)}</td>
               <td className="border-r border-blue-800 p-1 text-right font-bold">₹{Number(data.tax || 0).toFixed(2)}</td>
               <td className="p-1 text-right font-bold">₹{Number(data.grandTotal || 0).toFixed(2)}</td>
             </tr>
             <tr className="border-b border-blue-200">
               <td colSpan="8" className="border-r border-blue-800 p-1 text-right font-bold">IGST</td>
               <td className="p-1 text-right font-bold">₹{Number(data.tax || 0).toFixed(2)}</td>
             </tr>
             <tr>
               <td colSpan="8" className="border-r border-blue-800 p-1 text-right font-bold">Total (INR)</td>
               <td className="p-1 text-right font-bold">₹{Number(data.grandTotal || 0).toFixed(2)}</td>
             </tr>
          </tbody>
        </table>
      </div>

      <div className="border-b border-blue-800 p-1 text-[11px]">
        <span className="text-gray-600">Total (in words) : </span>
        <span className="font-bold capitalize">{numToWords(data.grandTotal || 0)}</span>
      </div>

      {/* Footer Section (UPI & Signature) */}
      <div className="flex min-h-[160px]">
         <div className="w-1/2 border-r border-blue-800 p-4 flex flex-col justify-start">
            <p className="font-bold text-[12px] mb-2">Payment Details</p>
            {settings?.accountNo && (
               <div className="mb-2 text-[10px] grid grid-cols-[60px_1fr] gap-x-2">
                  <span className="text-gray-600">A/C Name:</span><span>{settings.companyName || 'Glowison'}</span>
                  <span className="text-gray-600">A/C No:</span><span>{settings.accountNo}</span>
               </div>
            )}
            {settings?.upiId && (
               <>
                  <QRCodeSVG value={`upi://pay?pa=${settings.upiId}&pn=${settings.companyName || 'Company'}&am=${data.grandTotal}`} size={80} className="mb-2" />
                  <p className="text-[10px] leading-tight text-gray-700 max-w-[150px]">
                     Maximum of 1 lakh can be transferred via upi in a single day
                  </p>
                  <p className="text-[10px] mt-1 font-mono">{settings.upiId}</p>
               </>
            )}
         </div>
         
         <div className="w-1/2 p-4 flex flex-col justify-end items-end relative">
            {settings?.signatureUrl && (
               <img src={settings.signatureUrl} alt="Signature" className="h-16 mb-2 object-contain absolute bottom-8 right-4" />
            )}
            <p className="font-bold text-[11px] pt-8 border-t border-transparent z-10 w-48 text-right">
               Authorised Signatory
            </p>
         </div>
      </div>

      <div className="border-t border-blue-800 p-1 text-center text-[10px] bg-blue-50">
         {data.notes || `For any enquiry, reach out via email at ${settings?.email || 'support@glowison.com'}, call on ${settings?.phone || '+91 00000 00000'}`}
      </div>
    </div>
  );
};

export default Template1;
