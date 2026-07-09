import React from 'react';
import Icons from '@/common/Icons';

const templates = [
  { id: 'template1', name: 'Classic Blue', color: 'bg-blue-600' },
  { id: 'template2', name: 'Modern Green', color: 'bg-[#84cc16]' },
  { id: 'template3', name: 'Professional Orange', color: 'bg-orange-500' },
  { id: 'template4', name: 'Elegant Gold', color: 'bg-[#0f172a]' },
];

const TemplateSelectModal = ({ open, onClose, selected, onSelect }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Select Invoice Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icons name="X" size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {templates.map(t => (
            <div 
              key={t.id} 
              onClick={() => { onSelect(t.id); onClose(); }}
              className={`cursor-pointer rounded-xl border-2 transition-all p-4 flex flex-col items-center justify-center h-48 group ${selected === t.id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
            >
              <div className={`w-24 h-24 rounded-full ${t.color} mb-4 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                 <Icons name="FileText" size={32} />
              </div>
              <p className={`font-semibold ${selected === t.id ? 'text-primary' : 'text-gray-700'}`}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectModal;
