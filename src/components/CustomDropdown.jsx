import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

const CustomDropdown = ({
  options = [],
  value = [],
  onChange,
  onBlur,
  placeholder = 'Select...',
  multiSelect = false,
  searchable = true,
  disabled = false,
  className = '',
  initialOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        if (onBlur) onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const handleSelect = (option) => {
    if (multiSelect) {
      const isSelected = value && value.some(v => v && v.value === option.value);
      if (isSelected) {
        onChange(value.filter(v => v && v.value !== option.value));
      } else {
        onChange([...(value || []), option]);
      }
    } else {
      onChange([option]);
      setIsOpen(false);
      setSearchTerm('');
      if (onBlur) onBlur();
    }
  };

  const handleRemove = (optionValue) => {
    onChange(value.filter(v => v && v.value !== optionValue));
  };

  const getDisplayValue = () => {
    if (multiSelect) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) return value[0].label;
      if (value.length === 2) return `${value[0].label}, ${value[1].label}`;
      return `${value[0].label}, ${value[1].label}, +${value.length - 2} more`;
    }
    return value.length > 0 ? value[0].label : placeholder;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="truncate text-sm text-gray-900">
            {getDisplayValue()}
          </span>
          <FiChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden" style={{ minWidth: '200px' }}>
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value && value.some(v => v && v.value === option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-3 py-2 cursor-pointer transition-colors duration-150
                      flex items-center justify-between
                      ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-900'}
                    `}
                  >
                    <span className="text-sm flex-1 min-w-0 truncate">{option.label}</span>
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
