import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Input from '@/common/Input';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';
import Loader from '@/common/Loader';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    gstin: '',
    logoUrl: '',
    signatureUrl: '',
    accountNo: '',
    upiId: ''
  });
  const sigCanvas = useRef(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/company');
      if (res.data.data) {
        setSettings(res.data.data);
        if (res.data.data.signatureUrl) {
          setShowSignaturePad(false);
        } else {
          setShowSignaturePad(true);
        }
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleClearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setSettings(prev => ({ ...prev, signatureUrl: '' }));
    setShowSignaturePad(true);
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const url = sigCanvas.current.getCanvas().toDataURL('image/png');
      setSettings(prev => ({ ...prev, signatureUrl: url }));
      setShowSignaturePad(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings/company', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50/50">
        <Loader text="Loading Settings..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Company Settings | Glowison ERP</title>
      </Head>
      
      <div className="flex flex-col min-h-screen w-full relative bg-transparent overflow-hidden pb-20">
        
        {/* PREMIUM HERO HEADER */}
        <div className="relative overflow-hidden bg-transparent border-b border-gray-200/60 shadow-sm shrink-0">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full -z-10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full -z-10 blur-3xl" />
          
          <div className="max-w-5xl mx-auto px-6 py-10 lg:px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <Icons name="Settings" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Company Settings</h1>
                <p className="mt-1.5 text-sm font-medium text-gray-500 max-w-xl">
                  Configure your business profile, financial details, and customized branding for all generated documents and invoices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* General Info Section */}
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
               <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icons name="Building2" size={18} /></div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Business Identity</h3>
                    <p className="text-[11px] font-medium text-gray-500">Core details about your organization</p>
                 </div>
               </div>
               <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company Name</label>
                   <Input name="companyName" value={settings.companyName || ''} onChange={handleChange} required className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">GSTIN Number</label>
                   <Input name="gstin" value={settings.gstin || ''} onChange={handleChange} className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                   <Input type="email" name="email" value={settings.email || ''} onChange={handleChange} className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                   <Input name="phone" value={settings.phone || ''} onChange={handleChange} className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Website</label>
                   <Input name="website" value={settings.website || ''} onChange={handleChange} className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Logo URL (Optional)</label>
                   <Input name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} placeholder="https://..." className="h-11 shadow-sm" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Registered Address</label>
                   <textarea 
                     name="address" 
                     value={settings.address || ''} 
                     onChange={handleChange} 
                     rows={3}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all shadow-sm resize-none"
                   />
                 </div>
               </div>
            </div>

            {/* Financial Info Section */}
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
               <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons name="CreditCard" size={18} /></div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Payment Details</h3>
                    <p className="text-[11px] font-medium text-gray-500">Bank and UPI information for collecting payments</p>
                 </div>
               </div>
               <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bank Account Number</label>
                   <Input name="accountNo" value={settings.accountNo || ''} onChange={handleChange} placeholder="e.g. 1234567890" className="h-11 shadow-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Primary UPI ID</label>
                   <Input name="upiId" value={settings.upiId || ''} onChange={handleChange} placeholder="e.g. business@bank" className="h-11 shadow-sm" />
                 </div>
               </div>
            </div>

            {/* Signature Section */}
            <div className="bg-transparent rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
               <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Icons name="PenTool" size={18} /></div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Authorised Signature</h3>
                    <p className="text-[11px] font-medium text-gray-500">Draw your signature for use on generated invoices</p>
                 </div>
               </div>
               <div className="p-6 md:p-8">
                  <div className="max-w-xl mx-auto">
                    {!showSignaturePad && settings.signatureUrl ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 text-center flex flex-col items-center justify-center transition-all hover:border-blue-200 hover:bg-blue-50/30">
                        <img src={settings.signatureUrl} alt="Signature" className="h-28 object-contain mb-6 mix-blend-multiply" />
                        <Button type="button" variant="outline" size="sm" onClick={handleClearSignature} className="bg-white">
                          <Icons name="RefreshCcw" size={14} className="mr-2" /> Redraw Signature
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-indigo-200 rounded-2xl overflow-hidden shadow-sm bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <SignatureCanvas 
                          ref={sigCanvas}
                          penColor="#0f172a"
                          canvasProps={{className: 'sigCanvas w-full h-48 cursor-crosshair'}} 
                        />
                        <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-indigo-100">
                          <p className="text-xs text-gray-500 font-medium">Draw your signature smoothly above.</p>
                          <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" size="sm" onClick={handleClearSignature} className="text-gray-500 hover:text-rose-600">
                              Clear
                            </Button>
                            <Button type="button" size="sm" onClick={handleSaveSignature} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 shadow-md shadow-indigo-500/20">
                              Save Signature
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 pb-8">
               <Button type="submit" isLoading={saving}>
                 Save Changes
               </Button>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
}
