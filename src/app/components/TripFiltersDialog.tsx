import { useEffect, useRef, useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TripFiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pickupDate: string;
  status: string;
  selectedProviders: string[];
  providerNames: string[];
  onPickupDateChange: (date: string) => void;
  onStatusChange: (status: string) => void;
  onSelectedProvidersChange: (providers: string[]) => void;
  onClearAll: () => void;
  onApplyFilters: () => void;
}

export function TripFiltersDialog({
  isOpen,
  onClose,
  pickupDate,
  status,
  selectedProviders,
  providerNames,
  onPickupDateChange,
  onStatusChange,
  onSelectedProvidersChange,
  onClearAll,
  onApplyFilters,
}: TripFiltersDialogProps) {
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!providerDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target as Node)) {
        setProviderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [providerDropdownOpen]);

  const toggleProvider = (name: string) => {
    if (selectedProviders.includes(name)) {
      onSelectedProvidersChange(selectedProviders.filter(p => p !== name));
    } else {
      onSelectedProvidersChange([...selectedProviders, name]);
    }
  };

  const triggerLabel =
    selectedProviders.length === 0
      ? 'All'
      : selectedProviders.length === 1
        ? selectedProviders[0]
        : `${selectedProviders.length} selected`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Trip Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - 2x2 Grid Layout */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Pickup Date */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                Pickup Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => onPickupDateChange(e.target.value)}
                  className="w-full h-12 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent text-gray-900 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                Status
              </label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Provider Name */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                Provider Name
              </label>
              <div className="relative" ref={providerDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProviderDropdownOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={providerDropdownOpen}
                  className="w-full h-12 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent text-left text-gray-900 flex items-center justify-between bg-white"
                >
                  <span className={selectedProviders.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                    {triggerLabel}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {providerDropdownOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                  >
                    {/* All option = clear selection */}
                    <button
                      type="button"
                      onClick={() => onSelectedProvidersChange([])}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer"
                    >
                      <span>All</span>
                      {selectedProviders.length === 0 && <Check className="w-4 h-4 text-[#2D6EF5]" />}
                    </button>
                    {providerNames.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No providers</div>
                    )}
                    {providerNames.map(name => (
                      <label
                        key={name}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedProviders.includes(name)}
                          onCheckedChange={() => toggleProvider(name)}
                          className="w-4 h-4"
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 px-8 py-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClearAll}
            className="px-8 py-2.5 text-base font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 rounded-lg h-12"
          >
            Clear All
          </Button>
          <Button
            onClick={onApplyFilters}
            className="px-8 py-2.5 text-base font-medium bg-[#2D6EF5] hover:bg-[#2557D6] text-white rounded-lg h-12"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}