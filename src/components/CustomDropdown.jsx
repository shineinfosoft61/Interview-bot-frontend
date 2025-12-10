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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);



  
  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // Estimated max height of dropdown
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let topPosition;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Not enough space below, show above
        topPosition = rect.top + window.scrollY - dropdownHeight;
      } else {
        // Show below (default)
        topPosition = rect.bottom + window.scrollY;
      }
      
      const newPosition = {
        top: topPosition,
        left: rect.left + window.scrollX,
        width: rect.width
      };
      
      
      setDropdownPosition(newPosition);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Recalculate on scroll and resize
      const handleScroll = () => {
        updateDropdownPosition();
      };
      const handleResize = () => {
        updateDropdownPosition();
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      const isSelected = value && Array.isArray(value) && value.some(v => {
        if (!v) return false;
        const currentValue = typeof v === 'string' ? v : v.value;
        const optionValue = typeof option.value === 'string' ? option.value : option.value.toString();
        return currentValue === optionValue;
      });
      
      if (isSelected) {
        // Remove the option
        const newValue = value.filter(v => {
          if (!v) return false;
          const currentValue = typeof v === 'string' ? v : v.value;
          const optionValue = typeof option.value === 'string' ? option.value : option.value.toString();
          return currentValue !== optionValue;
        });
        onChange(newValue);
      } else {
        // Add the option
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
    const newValue = value.filter(v => {
      if (!v) return false;
      const currentValue = typeof v === 'string' ? v : v.value;
      const targetValue = typeof optionValue === 'string' ? optionValue : optionValue.toString();
      return currentValue !== targetValue;
    });
    onChange(newValue);
  };

  const getDisplayValue = () => {
    
    if (multiSelect) {
      if (!value || value.length === 0) return placeholder;
      
      // Extract labels from values (handle both string and object formats)
      const labels = value.map(v => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        return v.label || v.value || '';
      }).filter(Boolean);
      
      
      if (labels.length === 0) return placeholder;
      if (labels.length === 1) return labels[0];
      if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
      return `${labels[0]}, ${labels[1]}, +${labels.length - 2} more`;
    }
    
    if (!value || value.length === 0) return placeholder;
    const firstValue = value[0];
    if (typeof firstValue === 'string') return firstValue;
    return firstValue.label || firstValue.value || placeholder;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
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
        <div 
          className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden" 
          style={{ 
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999
          }}
        >
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
                const isSelected = value && Array.isArray(value) && value.some(v => {
                  if (!v) return false;
                  // Handle both string values and object values
                  const currentValue = typeof v === 'string' ? v : v.value;
                  const optionValue = typeof option.value === 'string' ? option.value : option.value.toString();
                  return currentValue === optionValue;
                });
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
