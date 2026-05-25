import { useState } from 'react';
import { Eye, Calendar, Hash, Building2, ShoppingCart, User, MapPin, Phone, Activity, Truck } from 'lucide-react';
import { Badge } from './ui/badge';
import { Pagination } from './Pagination';

export interface Order {
  id: string;
  createdDate: string;
  orderDate: string;
  invoiceNumber: string;
  retailerName: string;
  orderType: string;
  salesPerson: string;
  beatName: string;
  mobileNumber: string;
  status: string;
  tripNumber: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  invoiceValue?: number;
  volumetricWeight?: number;
  deliveryTime?: string;
  deliveryType?: 'Self' | '3PL';
}

interface OrdersTableProps {
  orders: Order[];
  onDeleteOrder?: (id: string) => void;
  selectedOrderId?: string | null;
  onSelectOrder?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onViewOrder?: (id: string) => void;
  onMake3PL?: (id: string) => void;
  onCancelOrder?: (id: string) => void;
  onMarkDeliveredDirect?: (id: string) => void;
}

type SortField = 'createdDate' | 'orderDate' | 'invoiceNumber' | 'retailerName' | 'orderType' | 'salesPerson' | 'beatName' | 'mobileNumber' | 'status' | 'tripNumber';
type SortDirection = 'asc' | 'desc';

export function OrdersTable({ orders, onDeleteOrder, selectedOrderId, onSelectOrder, onMarkDelivered, onViewOrder, onMake3PL, onCancelOrder, onMarkDeliveredDirect }: OrdersTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready for planning':
        return 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FEF3C7]';
      case 'in planning':
        return 'bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE]';
      case 'trip assigned':
        return 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#D1FAE5]';
      case 'in transit':
        return 'bg-[#E0E7FF] text-[#3730A3] hover:bg-[#E0E7FF]';
      case 'delivered':
        return 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#D1FAE5]';
      case 'partial return':
        return 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FEF3C7]';
      case 'returned':
        return 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2]';
      case 'cancelled':
        return 'bg-[#F3F4F6] text-[#374151] hover:bg-[#F3F4F6]';
      case 'discarded':
        return 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2]';
      case 'offline order':
        return 'bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFF7ED]';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getOrderTypeColor = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    
    switch (type.toLowerCase()) {
      case 'sales':
        return 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FEF3C7]';
      case 'digital':
        return 'bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE]';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const ColumnHeader = ({ field, icon: Icon, label }: { field: SortField; icon: any; label: string }) => (
    <th 
      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
        <Icon className="w-4 h-4 text-[#2D6EF5]" />
        {label}
        {sortField === field && (
          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <ColumnHeader field="createdDate" icon={Calendar} label="Created Date" />
              <ColumnHeader field="orderDate" icon={Calendar} label="Order Date" />
              <ColumnHeader field="invoiceNumber" icon={Hash} label="Invoice Number" />
              <ColumnHeader field="retailerName" icon={Building2} label="Retailer Name" />
              <ColumnHeader field="orderType" icon={ShoppingCart} label="Order Type" />
              <ColumnHeader field="salesPerson" icon={User} label="Sales Person" />
              <ColumnHeader field="beatName" icon={MapPin} label="Beat Name" />
              <ColumnHeader field="mobileNumber" icon={Phone} label="Mobile Number" />
              <ColumnHeader field="status" icon={Activity} label="Status" />
              <ColumnHeader field="tripNumber" icon={Truck} label="Trip Number" />
              <th className="px-4 py-3 text-left bg-gray-50">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-[#2D6EF5]"/>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map((order) => (
              <tr 
                key={order.id} 
                className={`transition-colors ${
                  selectedOrderId === order.id 
                    ? 'bg-blue-100 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{order.createdDate}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.orderDate}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.retailerName}</td>
                <td className="px-4 py-3">
                  <Badge className={`${getOrderTypeColor(order.orderType)} rounded px-3`}>
                    {order.orderType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.salesPerson}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.beatName}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.mobileNumber}</td>
                <td className="px-4 py-3">
                  <Badge className={`${getStatusColor(order.status)} rounded px-3`}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {order.tripNumber && order.tripNumber !== '-' ? (
                    <a href="#" className="text-sm text-[#2D6EF5] hover:underline">
                      {order.tripNumber}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewOrder?.(order.id)}
                    aria-label="View order details"
                    title="View Details"
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4 text-[#2D6EF5]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}