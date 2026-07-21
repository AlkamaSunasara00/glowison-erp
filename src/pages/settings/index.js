import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Input from '@/common/Input';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';
import Loader from '@/common/Loader';
import { useInstall } from '@/context/InstallContext';

export default function Settings() {
  const { deferredPrompt, isAppInstalled, installApp } = useInstall();
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
      <div className="flex flex-col min-h-[400px] items-center justify-center bg-white rounded-sm border border-gray-100 shadow-sm">
        <Loader text="Loading Settings..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Company Settings | Glowison ERP</title>
      </Head>
      
      <div className="flex flex-col min-h-screen w-full relative gap-4">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="page-header text-2xl font-bold text-gray-900">Company Settings</h1>
            <p className="text-sm text-gray-500 max-w-md lg:max-w-xl">
              Configure your business profile, financial details, and customized branding for all generated documents and invoices.
            </p>
          </div>

          {!isAppInstalled && deferredPrompt && (
            <div className="flex-shrink-0">
              <Button type="button" variant="solid" onClick={installApp}>
                <Icons name="Download" size={16} className="mr-2" /> Install App
              </Button>
            </div>
          )}
        </div>

        {/* MAIN FORM */}
        <div className="w-full mt-2 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Info Section */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden min-w-0">
               <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                 <Icons name="Building2" size={16} className="text-gray-400" />
                 <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business Identity</h3>
                 </div>
               </div>
               <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                   <Input name="companyName" value={settings.companyName || ''} onChange={handleChange} required className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">GSTIN Number</label>
                   <Input name="gstin" value={settings.gstin || ''} onChange={handleChange} className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                   <Input type="email" name="email" value={settings.email || ''} onChange={handleChange} className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                   <Input name="phone" value={settings.phone || ''} onChange={handleChange} className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Website</label>
                   <Input name="website" value={settings.website || ''} onChange={handleChange} className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Logo URL (Optional)</label>
                   <Input name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} placeholder="https://..." className="h-10" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Address</label>
                   <textarea 
                     name="address" 
                     value={settings.address || ''} 
                     onChange={handleChange} 
                     rows={3}
                     className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all resize-none"
                   />
                 </div>
               </div>
            </div>

            {/* Financial Info Section */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden min-w-0">
               <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                 <Icons name="CreditCard" size={16} className="text-gray-400" />
                 <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Details</h3>
                 </div>
               </div>
               <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Account Number</label>
                   <Input name="accountNo" value={settings.accountNo || ''} onChange={handleChange} placeholder="e.g. 1234567890" className="h-10" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Primary UPI ID</label>
                   <Input name="upiId" value={settings.upiId || ''} onChange={handleChange} placeholder="e.g. business@bank" className="h-10" />
                 </div>
               </div>
            </div>

            {/* Signature Section */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden min-w-0">
               <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                 <Icons name="PenTool" size={16} className="text-gray-400" />
                 <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Authorised Signature</h3>
                 </div>
               </div>
               <div className="p-5">
                  <div className="max-w-xl mx-auto">
                    {!showSignaturePad && settings.signatureUrl ? (
                      <div className="border border-dashed border-gray-200 rounded-sm p-6 bg-gray-50/50 text-center flex flex-col items-center justify-center transition-all hover:border-primary hover:bg-primary/5">
                        <img src={settings.signatureUrl} alt="Signature" className="h-28 object-contain mb-6 mix-blend-multiply" />
                        <Button type="button" variant="outline" size="sm" onClick={handleClearSignature} className="bg-white">
                          <Icons name="RefreshCcw" size={14} className="mr-2" /> Redraw Signature
                        </Button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-sm overflow-hidden bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <SignatureCanvas 
                          ref={sigCanvas}
                          penColor="#0f172a"
                          canvasProps={{className: 'sigCanvas w-full h-48 cursor-crosshair', style: { touchAction: 'none' }}} 
                        />
                        <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Draw carefully</p>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleClearSignature} className="text-gray-500 hover:text-rose-600 bg-white">
                              Clear
                            </Button>
                            <Button type="button" variant="solid" size="sm" onClick={handleSaveSignature}>
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
            <div className="flex justify-end pt-2 pb-8">
               <Button type="submit" variant="solid" isLoading={saving}>
                 Save Changes
               </Button>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
}
