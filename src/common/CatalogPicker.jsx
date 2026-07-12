import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Icons from "@/common/Icons";
import api from "@/lib/api";

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: 'auto',
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

const CatalogPicker = ({ value, onChange, error, placeholder = "Search catalog or type custom product..." }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/catalog?limit=500');
        const formatted = res.data.data.map(item => ({
          value: item.id,
          label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
          data: item
        }));
        setItems(formatted);
      } catch (error) {
        console.error("Failed to fetch catalog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleChange = (selected) => {
    if (!selected) {
      onChange(null, null);
      return;
    }

    if (selected.__isNew__) {
      // User typed a custom item
      onChange(selected.value, { name: selected.value, __isNew__: true });
    } else {
      // User selected from catalog
      onChange(selected.data.name, selected.data);
    }
  };

  // Find the selected option. Since we might have a custom value passed in 'value', 
  // we check if it matches an item's name or id. If not, create a custom option for it.
  const getSelectedOption = () => {
    if (!value) return null;
    const found = items.find(i => i.data.name === value || i.value === value);
    if (found) return found;
    return { value, label: value, __isNew__: true };
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <CreatableSelect
        value={getSelectedOption()}
        onChange={handleChange}
        options={items}
        isLoading={loading}
        styles={customStyles}
        placeholder={placeholder}
        isClearable
        formatCreateLabel={(inputValue) => `Add custom: "${inputValue}"`}
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

export default CatalogPicker;
