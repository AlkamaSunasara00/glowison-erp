import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Input from '@/common/Input';
import Button from '@/common/Button';
import Icons from '@/common/Icons';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';

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

  return (
    <>
      <Head>
        <title>Company Settings | Glowison ERP</title>
      </Head>
      
      <div className="flex flex-col min-h-screen w-full relative gap-4 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="page-header">Company Settings</h1>
              <p className="page-desc">Manage your company profile and invoice signature</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <Input name="companyName" value={settings.companyName || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <Input name="gstin" value={settings.gstin || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" name="email" value={settings.email || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input name="phone" value={settings.phone || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <Input name="website" value={settings.website || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account No.</label>
                    <Input name="accountNo" value={settings.accountNo || ''} onChange={handleChange} placeholder="e.g. 1234567890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <Input name="upiId" value={settings.upiId || ''} onChange={handleChange} placeholder="e.g. name@bank" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea 
                      name="address" 
                      value={settings.address || ''} 
                      onChange={handleChange} 
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all shadow-sm bg-white"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-8">Authorized Signature</h3>
                <p className="text-sm text-gray-500 mb-4">This signature will be displayed on your generated invoices.</p>
                
                <div className="max-w-md">
                  {!showSignaturePad && settings.signatureUrl ? (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img src={settings.signatureUrl} alt="Signature" className="h-24 object-contain mb-4" />
                      <Button type="button" variant="outline" size="sm" onClick={handleClearSignature}>
                        Redraw Signature
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{width: 400, height: 150, className: 'sigCanvas bg-white w-full'}} 
                      />
                      <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t">
                        <Button type="button" variant="outline" size="sm" onClick={handleClearSignature}>Clear</Button>
                        <Button type="button" size="sm" onClick={handleSaveSignature}>Save Signature</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" isLoading={saving}>Save Changes</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
