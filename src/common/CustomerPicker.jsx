import React from "react";
import Select from "react-select";
import Icons from "@/common/Icons";

const mockCustomers = [
  { value: "1", label: "Rahul Sharma (Retail) - 9876543210", data: { id: "1", name: "Rahul Sharma", phone: "9876543210", type: "Retail", address: { line1: "123 Main St", city: "Mumbai", state: "MH" } } },
  { value: "2", label: "Glow Signages (Dealer) - 9988776655", data: { id: "2", name: "Glow Signages", phone: "9988776655", type: "Dealer", address: { line1: "Shop 4, Market", city: "Delhi", state: "DL" }, gstin: "22AAAAA0000A1Z5" } },
  { value: "3", label: "Priya Patel (Retail) - 9123456780", data: { id: "3", name: "Priya Patel", phone: "9123456780", type: "Retail", address: { line1: "45 MG Road", city: "Ahmedabad", state: "GJ" } } },
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    borderColor: state.isFocused ? 'var(--color-primary)' : '#f3f4f6', // gray-100
    boxShadow: state.isFocused ? '0 0 0 2px var(--color-secondary)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--color-primary)' : '#e5e7eb',
    },
    borderRadius: '2px', // rounded-sm
    fontSize: '0.875rem',
    backgroundColor: 'white',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: '#1f2937',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#9ca3af',
    '&:hover': {
      color: '#6b7280',
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? 'var(--color-primary)' : state.isFocused ? '#f9fafb' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    fontSize: '0.875rem',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? 'var(--color-primary)' : '#f3f4f6',
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 9999,
  }),
};

const CustomerPicker = ({ value, onChange, error, label, required }) => {
  const selectedOption = mockCustomers.find((c) => c.value === value) || null;

  const handleChange = (selected) => {
    // Pass both value and the full data object to the parent
    onChange(selected ? selected.value : "", selected ? selected.data : null);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-semibold text-gray-700 mb-0.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={mockCustomers}
        styles={customStyles}
        placeholder="Search and select customer..."
        isClearable
        classNamePrefix="react-select"
      />
      {error && (
        <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1">
          <Icons name="AlertCircle" size={12} />
          {error}
        </span>
      )}
    </div>
  );
};

export default CustomerPicker;
