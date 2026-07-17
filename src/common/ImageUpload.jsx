import React, { useRef, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { UploadCloud, X, FileText } from "lucide-react";

const ImageUpload = ({ value, onChange, onUploadStateChange, folder = "erp/general", disabled = false, multiple = false, accept = "image/*", className = "", variant = "default" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fd = new FormData();
    files.forEach(file => fd.append('images', file));
    fd.append('folder', folder);

    try {
      setUploading(true);
      if (onUploadStateChange) onUploadStateChange(true);
      
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success && res.data.urls && res.data.urls.length > 0) {
        if (multiple) {
          onChange([...(Array.isArray(value) ? value : []), ...res.data.urls]);
        } else {
          onChange(res.data.urls[0]);
        }
        toast.success(multiple ? "Files uploaded successfully" : "File uploaded successfully");
      } else {
         throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (e, indexToRemove = 0) => {
    e.preventDefault();
    e.stopPropagation();
    if (multiple) {
      onChange((Array.isArray(value) ? value : []).filter((_, i) => i !== indexToRemove));
    } else {
      onChange("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = uploading;
  const isDisabled = disabled || isUploading;
  
  const hasValue = multiple ? (Array.isArray(value) && value.length > 0) : !!value;
  const showDropzone = multiple ? true : !hasValue;

  const isPdf = (url) => typeof url === 'string' && url.toLowerCase().endsWith('.pdf');

  return (
    <div className={`w-full ${className}`}>
      {variant === "avatar" ? (
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center group shrink-0">
          <input 
            type="file" 
            ref={fileInputRef}
            accept={accept}
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isDisabled}
          />
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          ) : hasValue ? (
            <>
              <img src={value} alt="Avatar Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-600 transition-colors">
              <UploadCloud size={20} className="mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
            </div>
          )}
        </div>
      ) : showDropzone ? (
        <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-indigo-600 overflow-hidden group mb-3">
          <input 
            type="file" 
            ref={fileInputRef}
            accept={accept}
            multiple={multiple}
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isDisabled}
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600 mb-2"></div>
              <span className="text-sm font-medium text-indigo-600">Uploading...</span>
            </div>
          ) : (
            <>
              <UploadCloud size={24} className="mb-2 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              <span className="text-sm font-medium">Click to upload or drag and drop</span>
              <span className="text-xs mt-1 text-gray-400">Max file size 5MB</span>
            </>
          )}
        </div>
      ) : null}

      {hasValue && variant !== "avatar" && (
        <div className={multiple ? "flex flex-wrap gap-3 mt-3" : "relative w-full max-w-sm rounded-lg overflow-hidden border border-gray-200"}>
          {multiple ? (
             (value || []).map((url, idx) => (
               <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group/item bg-gray-50">
                 {isPdf(url) ? (
                   <a href={url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors p-2">
                     <FileText size={24} />
                     <span className="text-[10px] mt-1 font-medium truncate w-full text-center">PDF</span>
                   </a>
                 ) : (
                   <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                 )}
                 <button 
                   type="button" 
                   onClick={(e) => removeImage(e, idx)} 
                   className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity z-20"
                 >
                   <X size={12} />
                 </button>
               </div>
             ))
          ) : (
             <>
               {isPdf(value) ? (
                 <a href={value} target="_blank" rel="noopener noreferrer" className="w-full h-32 flex flex-col items-center justify-center bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors border-2 border-transparent hover:border-indigo-100 rounded-lg">
                   <FileText size={32} />
                   <span className="text-sm mt-2 font-medium">View PDF Document</span>
                 </a>
               ) : (
                 <img src={value} alt="Preview" className="w-full h-auto object-cover" />
               )}
               <button 
                 type="button" 
                 onClick={(e) => removeImage(e, 0)} 
                 className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors z-20"
                 title="Remove File"
               >
                 <X size={16} />
               </button>
             </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
