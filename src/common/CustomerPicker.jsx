import React, { useState, useEffect } from "react";
import Select from "react-select";
import Icons from "@/common/Icons";
import api from "@/lib/api";

const getCustomStyles = (size) => ({
  control: (base, state) => ({
    ...base,
    minHeight: size === 'lg' ? '40px' : '36px',
    height: size === 'lg' ? '40px' : '36px',
    borderColor: state.isFocused ? 'var(--color-primary)' : '#f3f4f6', // gray-100
    boxShadow: state.isFocused ? '0 0 0 2px var(--color-secondary)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--color-primary)' : '#e5e7eb',
    },
    borderRadius: '2px', // rounded-sm
    fontSize: size === 'lg' ? '0.875rem' : '0.875rem',
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
    fontSize: size === 'lg' ? '0.875rem' : '0.875rem',
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
});

const CustomerPicker = ({ value, onChange, error, label, required, size = "md" }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers?limit=200');
        const formatted = res.data.data.map(c => ({
          value: c.id,
          label: `${c.name} (${c.type === 'RETAIL' ? 'Retail' : 'Dealer'}) - ${c.phone}`,
          data: c
        }));
        setCustomers(formatted);
      } catch (error) {
        console.error("Failed to fetch customers for picker", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const selectedOption = customers.find((c) => c.value === value) || null;

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
        options={customers}
        isLoading={loading}
        styles={getCustomStyles(size)}
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
