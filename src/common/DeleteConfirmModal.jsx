import React, { useState, useEffect } from "react";
import Button from "./Button";
import Icons from "./Icons";
import Input from "./Input";
import Loader from "./Loader";

const DeleteConfirmModal = ({ open, onClose, onConfirm, entityName = "this item" }) => {
  const [confirmCode, setConfirmCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      // Generate a random 4 digit number
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setConfirmCode(code);
      setInputCode("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleConfirm = async () => {
    if (inputCode === confirmCode) {
      setIsDeleting(true);
      try {
        await onConfirm();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isMatched = inputCode === confirmCode;

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          open ? "animate-overlay-in" : "animate-overlay-out"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative flex w-full max-w-sm flex-col overflow-hidden rounded-sm bg-white shadow-2xl border border-gray-100 ${
          open ? "animate-modal-in" : "animate-modal-out"
        }`}
      >
        {isDeleting && <Loader fullScreen text="Deleting..." />}
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Icons name="AlertTriangle" size={28} />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900">Confirm Deletion</h2>
          <p className="mb-6 text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-800">{entityName}</span>? This action cannot be undone.
          </p>

          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
             <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Enter code to confirm:</p>
             <div className="text-xl font-bold tracking-widest text-gray-900 mb-3 select-none">{confirmCode}</div>
             <Input 
                value={inputCode} 
                onChange={(e) => setInputCode(e.target.value)} 
                placeholder="Type the 4-digit code" 
                className="text-center font-semibold tracking-widest"
                maxLength={4}
             />
          </div>

          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1 rounded-sm border-gray-200 shadow-sm" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="solid" className={`flex-1 rounded-sm shadow-md ${isMatched ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 hover:shadow-rose-600/30' : 'bg-rose-300 pointer-events-none'}`} onClick={handleConfirm} disabled={!isMatched || isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
