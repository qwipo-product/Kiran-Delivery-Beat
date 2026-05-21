import { ArrowLeft, Calendar, Store, User, MapPin, Hash, IndianRupee, Weight, Package, X, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useState, useMemo } from 'react';
import { OptimizedRoutesModal } from '../OptimizedRoutesModal';
import { useData } from '../../context/DataContext';

interface Order {
  id: string;
  orderDate: string;
  retailerName: string;
  salesPerson: string;
  beatName: string;
  refOrderNumber: string;
  invoiceValue: number;
  totalWeight: number;
  totalVolWeight: number;
  deliveryType: '3PL' | 'Self';
}

interface CreateDeliveryRoutePageProps {
  onBack: () => void;
  onConfirm: (selectedOrders: Order[], deliveryDate: string) => void;
  onTripsCreated?: (trips: any[]) => void;
  activeTab?: '3pl' | 'self';
}

export function CreateDeliveryRoutePage({ onBack, onConfirm, onTripsCreated, activeTab = '3pl' }: CreateDeliveryRoutePageProps) {
  const { orders: contextOrders, logisticsSelection } = useData();
  const [deliveryDate, setDeliveryDate] = useState('2026-02-20');
  const [selectedOrderDates, setSelectedOrderDates] = useState<string[]>(['7-1-2025']);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showOptimizedModal, setShowOptimizedModal] = useState(false);
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<Set<'3pl' | 'self'>>(() => {
    if (logisticsSelection === 'self') return new Set<'3pl' | 'self'>(['self']);
    if (logisticsSelection === '3pl') return new Set<'3pl' | 'self'>(['3pl']);
    return new Set<'3pl' | 'self'>(['3pl', 'self']); // 'both'
  });

  // Map DataContext orders to local Order format, excluding Offline Orders
  const allOrders: Order[] = useMemo(() => contextOrders
    .filter(o => o.status !== 'Offline Order')
    .map(o => ({
      id: o.id,
      orderDate: o.orderDate,
      retailerName: o.retailerName,
      salesPerson: o.salesPerson || 'N/A',
      beatName: o.beatName || 'N/A',
      refOrderNumber: o.invoiceNumber,
      invoiceValue: o.invoiceValue || 0,
      totalWeight: o.volumetricWeight || 0,
      totalVolWeight: o.volumetricWeight || 0,
      deliveryType: (o.deliveryType || 'Self') as '3PL' | 'Self',
    })), [contextOrders]);

  // Available order dates derived from actual orders
  const orderDates = useMemo(() => {
    const dates = new Set(allOrders.map(o => {
      const parts = o.orderDate.split('/');
      if (parts.length === 3) return `${parseInt(parts[0])}-${parseInt(parts[1])}-${parseInt(parts[2])}`;
      return o.orderDate;
    }));
    return Array.from(dates);
  }, [allOrders]);

  const filteredOrders = useMemo(() =>
    allOrders.filter(o => {
      const type = o.deliveryType === '3PL' ? '3pl' : 'self';
      return selectedDeliveryTypes.has(type);
    })
  , [allOrders, selectedDeliveryTypes]);

  const handleOrderDateToggle = (date: string) => {
    setSelectedOrderDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleRemoveOrderDate = (date: string) => {
    setSelectedOrderDates(prev => prev.filter(d => d !== date));
  };

  const handleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const next = prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      setSelectAll(next.length === filteredOrders.length);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    }
    setSelectAll(!selectAll);
  };

  const selectedOrders = filteredOrders.filter(order => selectedOrderIds.includes(order.id));
  const totalInvoiceValue = selectedOrders.reduce((sum, order) => sum + order.invoiceValue, 0);
  const totalVolWeight = selectedOrders.reduce((sum, order) => sum + order.totalVolWeight, 0);

  const handleConfirm = () => {
    setShowOptimizedModal(true);
  };

  const handleCloseModal = () => {
    setShowOptimizedModal(false);
  };

  return (
    <>
      <div className="h-full flex flex-col px-6 py-4 bg-gray-50">
        {/* Page Header */}
        <div className="mb-3 flex items-center flex-shrink-0">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors mr-3"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2D6EF5] rounded flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Create Delivery Route</h1>
          </div>
        </div>

        {/* Controls — Delivery Date + Filter stacked */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 flex-shrink-0">
          {/* Delivery Date + Delivery Type side by side */}
          <div className="flex items-end gap-8 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Delivery Date
              </label>
              <div className="relative w-44">
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2D6EF5] focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Delivery Type radio buttons */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Delivery Type
              </label>
              <div className="flex items-center gap-5 h-9">
                {([{ value: 'self', label: 'Self' }, { value: '3pl', label: '3PL' }] as { value: '3pl' | 'self', label: string }[]).map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedDeliveryTypes.has(opt.value)}
                      onCheckedChange={(checked) => {
                        setSelectedDeliveryTypes(prev => {
                          const next = new Set(prev);
                          if (checked) next.add(opt.value);
                          else next.delete(opt.value);
                          return next;
                        });
                        setSelectedOrderIds([]);
                        setSelectAll(false);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-3" />

          {/* Filter by Order Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Orders Date
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {orderDates.map((date) => (
                <label
                  key={date}
                  className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 border rounded-md text-xs transition-colors flex-shrink-0 ${
                    selectedOrderDates.includes(date)
                      ? 'border-[#2D6EF5] bg-blue-50 text-[#2D6EF5]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Checkbox
                    checked={selectedOrderDates.includes(date)}
                    onCheckedChange={() => handleOrderDateToggle(date)}
                    className="w-3.5 h-3.5"
                  />
                  <span className="whitespace-nowrap">{date}</span>
                </label>
              ))}
            </div>
            {selectedOrderDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedOrderDates.map((date) => (
                  <div
                    key={date}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-[#2D6EF5] rounded text-xs font-medium"
                  >
                    {date}
                    <button
                      onClick={() => handleRemoveOrderDate(date)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders Table — takes remaining space */}
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Table Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">
                Available Orders
              </span>
              {selectedOrderIds.length > 0 && (
                <span className="text-xs text-[#2D6EF5] bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                  {selectedOrderIds.length} selected
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          </div>

          {/* Scrollable Table */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left w-12 bg-gray-50">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Order Date
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Store className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Retailer Name
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Sales Person
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Beat Name
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Hash className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Ref Order Number
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-right bg-gray-50">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <IndianRupee className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Invoice Value
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-right bg-gray-50">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Weight className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Total Weight (Kg)
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-right bg-gray-50">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Package className="w-3.5 h-3.5 text-[#2D6EF5]" />
                      Total Vol. Weight (Kg)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOrderSelection(order.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedOrderIds.includes(order.id)
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={() => handleOrderSelection(order.id)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">
                      {order.orderDate}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 font-medium">
                      {order.retailerName}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                      {order.salesPerson}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                      {order.beatName}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                      {order.refOrderNumber}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 whitespace-nowrap text-right font-medium">
                      ₹ {order.invoiceValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap text-right">
                      {order.totalWeight.toFixed(2)} Kg
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap text-right">
                      {order.totalVolWeight.toFixed(2)} Kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="flex items-center justify-end gap-8 px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-[#2D6EF5]" />
              <span className="text-sm text-gray-600">Selected Orders:</span>
              <span className="text-sm font-bold text-gray-900">{selectedOrderIds.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#2D6EF5]" />
              <span className="text-sm text-gray-600">Total Invoice Value:</span>
              <span className="text-sm font-bold text-gray-900">₹ {totalInvoiceValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2D6EF5]" />
              <span className="text-sm text-gray-600">Total Vol. Weight:</span>
              <span className="text-sm font-bold text-gray-900">{totalVolWeight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kgs</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 flex-shrink-0">
          <Button
            onClick={onBack}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedOrderIds.length === 0}
            className="px-5 py-2 bg-[#2D6EF5] hover:bg-[#2557D6] text-white disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Plan Route ({selectedOrderIds.length})
          </Button>
        </div>
      </div>
      {showOptimizedModal && (
        <OptimizedRoutesModal
          isOpen={true}
          onClose={handleCloseModal}
          selectedOrders={selectedOrders}
          deliveryDate={deliveryDate}
          onConfirmRoutes={(trips) => {
            handleCloseModal();
            if (onTripsCreated) onTripsCreated(trips);
          }}
        />
      )}
    </>
  );
}
