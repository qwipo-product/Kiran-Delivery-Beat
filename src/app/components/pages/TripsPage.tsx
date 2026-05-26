import { useState } from 'react';
import { Truck, BarChart3, CheckCircle2, Calendar, MapPin, Eye, Filter, Map, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pagination } from '../Pagination';
import { TripDetailsPage } from './TripDetailsPage';
import { TripsMapViewDialog } from '../TripsMapViewDialog';
import { TripRouteMapDialog } from '../TripRouteMapDialog';
import { TripFiltersDialog } from '../TripFiltersDialog';
import { TripActionsMenu } from '../TripActionsMenu';
import React from 'react';

export interface Trip {
  id: string;
  tripNumber: string;
  provider: string;
  sla: string;
  status: string;
  dropPoints: number;
  arrivalTime: string;
  charges: string;
  deliveryType?: '3pl' | 'self';
}

const mockTrips: Trip[] = [
  {
    id: '1',
    tripNumber: 'Q-20260217213117-NDET',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'In Progress',
    dropPoints: 3,
    arrivalTime: '2026-02-18 09:40 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
  {
    id: '2',
    tripNumber: 'Q-20260217213117-MuVZ',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Planned',
    dropPoints: 12,
    arrivalTime: '2026-02-18 09:00 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
  {
    id: '3',
    tripNumber: 'Q-20260216204505-8UCM',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Completed',
    dropPoints: 14,
    arrivalTime: '2026-02-17 09:34 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
  {
    id: '4',
    tripNumber: 'Q-20260216204505-VSZF',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Completed',
    dropPoints: 8,
    arrivalTime: '2026-02-17 09:56 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
  {
    id: '5',
    tripNumber: 'Q-20260216204525-AKIU',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Completed',
    dropPoints: 1,
    arrivalTime: '2026-02-17 05:15 PM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
  {
    id: '6',
    tripNumber: 'Q-20260213221811-GDMY',
    provider: 'Blue Dart',
    sla: 'Same Day Delivery',
    status: 'Completed',
    dropPoints: 18,
    arrivalTime: '2026-02-14 11:08 AM',
    charges: '₹ 3,100.00',
    deliveryType: '3pl',
  },
  {
    id: '7',
    tripNumber: 'Q-20260212201413-VNYO',
    provider: 'DTDC Courier',
    sla: 'Standard Delivery',
    status: 'Completed',
    dropPoints: 15,
    arrivalTime: '2026-02-13 11:40 AM',
    charges: '₹ 1,850.00',
    deliveryType: '3pl',
  },
  {
    id: '8',
    tripNumber: 'Q-20260218103045-XPQR',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Cancelled',
    dropPoints: 5,
    arrivalTime: '2026-02-18 10:30 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
  },
];

interface TripsPageProps {
  extraTrips?: Trip[];
  activeTab?: '3pl' | 'self';
}

export function TripsPage({ extraTrips = [], activeTab = '3pl' }: TripsPageProps) {
  const allTrips = React.useMemo(() => [...extraTrips, ...mockTrips], [extraTrips]);
  const trips = React.useMemo(
    () => allTrips.filter(t => (t.deliveryType ?? '3pl') === activeTab),
    [allTrips, activeTab]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isMapViewDialogOpen, setIsMapViewDialogOpen] = useState(false);
  const [selectedTripForMap, setSelectedTripForMap] = useState<Trip | null>(null);
  const [isTripRouteMapOpen, setIsTripRouteMapOpen] = useState(false);
  const [expandedTripIds, setExpandedTripIds] = useState<Set<string>>(new Set());
  
  // Filter state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterPickupDate, setFilterPickupDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProvider, setFilterProvider] = useState<string[]>([]);
  const [appliedPickupDate, setAppliedPickupDate] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('All');
  const [appliedProvider, setAppliedProvider] = useState<string[]>([]);

  // Unique provider names from all trips
  const providerNames = React.useMemo(() => {
    const names = Array.from(new Set(trips.map(t => t.provider).filter(Boolean)));
    return names.sort();
  }, [trips]);

  // Selection state
  const [selectedTripIds, setSelectedTripIds] = useState<Set<string>>(new Set());

  // Apply filters to trips
  const filteredTrips = trips.filter(trip => {
    // Status filter
    if (appliedStatus !== 'All' && trip.status !== appliedStatus) return false;

    // Provider filter (multi-select: empty array means show all)
    if (appliedProvider.length > 0 && !appliedProvider.includes(trip.provider)) return false;

    // Pickup date filter
    if (appliedPickupDate) {
      const tripDate = new Date(trip.arrivalTime);
      const filterDate = new Date(appliedPickupDate);
      const tripDateOnly = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());
      const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      if (tripDateOnly.getTime() !== filterDateOnly.getTime()) return false;
    }

    return true;
  });

  const totalTrips = filteredTrips.length;
  const inProgressTrips = filteredTrips.filter(t => t.status === 'In Progress').length;
  const completedTrips = filteredTrips.filter(t => t.status === 'Completed').length;
  const plannedTrips = filteredTrips.filter(t => t.status === 'Planned').length;

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-[#E3D5FF] text-[#6B21A8] hover:bg-[#E3D5FF]';
      case 'Completed':
        return 'bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE]';
      case 'Planned':
        return 'bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE]';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const toggleRowExpansion = (tripId: string) => {
    const newExpanded = new Set(expandedTripIds);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTripIds(newExpanded);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedTripIds.size === paginatedTrips.length) {
      // Deselect all on current page
      const newSelected = new Set(selectedTripIds);
      paginatedTrips.forEach(trip => newSelected.delete(trip.id));
      setSelectedTripIds(newSelected);
    } else {
      // Select all on current page
      const newSelected = new Set(selectedTripIds);
      paginatedTrips.forEach(trip => newSelected.add(trip.id));
      setSelectedTripIds(newSelected);
    }
  };

  const handleToggleTrip = (tripId: string) => {
    const newSelected = new Set(selectedTripIds);
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId);
    } else {
      newSelected.add(tripId);
    }
    setSelectedTripIds(newSelected);
  };

  const isAllSelected = paginatedTrips.length > 0 && paginatedTrips.every(trip => selectedTripIds.has(trip.id));
  const isSomeSelected = paginatedTrips.some(trip => selectedTripIds.has(trip.id)) && !isAllSelected;
  const selectAllChecked = isAllSelected || (isSomeSelected ? 'indeterminate' as any : false);

  // Get selected trips for map view
  const getTripsForMapView = () => {
    if (selectedTripIds.size > 0) {
      return filteredTrips.filter(trip => selectedTripIds.has(trip.id));
    }
    return filteredTrips;
  };

  // If a trip is selected, show trip details page
  if (selectedTripId) {
    const selectedTrip = trips.find(t => t.id === selectedTripId) ?? null;
    return <TripDetailsPage tripId={selectedTripId} trip={selectedTrip} onBack={() => setSelectedTripId(null)} />;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2D6EF5]" />
            <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsMapViewDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              Map View
            </Button>
            <Button 
              onClick={() => setIsFilterDialogOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Track and manage delivery trips, routes, and drivers.
        </p>
      </div>

      {/* Page Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 py-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Trips</p>
                  <p className="text-3xl font-bold text-gray-900">{totalTrips}</p>
                </div>
                <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#059669]" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">All Time</p>
              <p className="text-xs text-gray-700 font-medium">Logistics Network</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{inProgressTrips}</p>
                </div>
                <div className="w-10 h-10 bg-[#E9D5FF] rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#9333EA]" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Active Trips</p>
              <p className="text-xs text-gray-700 font-medium">On the road</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{completedTrips}</p>
                </div>
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Completed Trips</p>
              <p className="text-xs text-gray-700 font-medium">Successfully delivered</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Planned</p>
                  <p className="text-3xl font-bold text-gray-900">{plannedTrips}</p>
                </div>
                <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#D97706]" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Upcoming Trips</p>
              <p className="text-xs text-gray-700 font-medium">Scheduled for delivery</p>
            </div>
          </div>

          {/* Trips Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="overflow-x-auto flex-1 min-h-0 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-[#2D6EF5] focus:ring-2 focus:ring-[#2D6EF5] focus:ring-offset-0 cursor-pointer bg-white checked:bg-white checked:border-[#2D6EF5] appearance-none checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwLjY2NjcgMS41TDQgOC4xNjY2N0wxLjMzMzMzIDUuNSIgc3Ryb2tlPSIjMkQ2RUY1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] checked:bg-center checked:bg-no-repeat"
                      />
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      {/* Empty header for accordion */}
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <Hash className="w-4 h-4 text-[#2D6EF5]" />
                        Trip Number
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Provider
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        SLA
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Drop Points
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Arrival Time
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Trip Charges
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left bg-gray-50 sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedTrips.map((trip) => {
                    const isExpanded = expandedTripIds.has(trip.id);
                    const rows = [
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTripIds.has(trip.id)}
                            onChange={() => handleToggleTrip(trip.id)}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-[#2D6EF5] focus:ring-2 focus:ring-[#2D6EF5] focus:ring-offset-0 cursor-pointer bg-white checked:bg-white checked:border-[#2D6EF5] appearance-none checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwLjY2NjcgMS41TDQgOC4xNjY2N0wxLjMzMzMzIDUuNSIgc3Ryb2tlPSIjMkQ2RUY1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] checked:bg-center checked:bg-no-repeat"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => toggleRowExpansion(trip.id)}
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.tripNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.provider}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.sla}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${getStatusColor(trip.status)} rounded-full px-3`}>
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.dropPoints}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.arrivalTime}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trip.charges}</td>
                        <td className="px-4 py-3">
                          <TripActionsMenu
                            onCancel={() => console.log('Cancel trip:', trip.id)}
                            onMapView={() => {
                              setSelectedTripForMap(trip);
                              setIsTripRouteMapOpen(true);
                            }}
                            onViewDetails={() => setSelectedTripId(trip.id)}
                            tripStatus={trip.status}
                          />
                        </td>
                      </tr>
                    ];
                    
                    if (isExpanded) {
                      rows.push(
                        <tr key={`${trip.id}-expanded`} className="bg-gray-50">
                          <td colSpan={10} className="px-4 py-6">
                            <div className="grid grid-cols-3 gap-6">
                              {/* Route Overview */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 border-l-4 border-[#2D6EF5] pl-2">
                                  Route Overview
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-[#2D6EF5]" />
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Vehicle</p>
                                      <p className="text-sm text-gray-900">AP09TA7790</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Driver Name</p>
                                      <p className="text-sm text-gray-900">kalyan</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Contact Number</p>
                                      <p className="text-sm text-gray-900">6302473072</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Helper</p>
                                      <p className="text-sm text-gray-900">N/A</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-[#2D6EF5]" />
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Start Time</p>
                                      <p className="text-sm text-gray-900">2026-03-11 02:16 PM</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-[#2D6EF5]" />
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Estimated Completion</p>
                                      <p className="text-sm text-gray-900">2026-03-11 02:40 PM</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Pickup OTP</p>
                                      <p className="text-sm text-gray-900">0663</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Return OTP</p>
                                      <p className="text-sm text-gray-900">1147</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Collection Summary */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 border-l-4 border-[#2D6EF5] pl-2">
                                  Collection Summary
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Total Sale Value</p>
                                      <p className="text-sm text-gray-900">₹ 96.34</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Total Delivered Value</p>
                                      <p className="text-sm text-gray-900">₹ -31.78</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Total Return Value</p>
                                      <p className="text-sm text-gray-900">₹ 127.12</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-[#2D6EF5]" />
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Total Delivery Points</p>
                                      <p className="text-sm text-gray-900">1</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">COD Collection</p>
                                      <p className="text-sm text-gray-900">₹0</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Digital Collection</p>
                                      <p className="text-sm text-gray-900">₹0</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#2D6EF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500">Net Sale Collection</p>
                                      <p className="text-sm text-gray-900">₹0</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Route */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 border-l-4 border-[#2D6EF5] pl-2">
                                  Delivery Route
                                </h3>
                                <div className="space-y-4">
                                  {/* Warehouse/Store */}
                                  <div className="relative">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-semibold text-gray-900">Sree Venkateswara Traders</p>
                                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-2 py-0">
                                            Order Picked Up
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                          Store, 676 Prosacco Divide, Hyderabad, Telangana, 676 Prosacco Divide
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">2026-03-11 02:16 PM</p>
                                        <Badge className="bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE] text-xs px-2 py-0 mt-1">
                                          OTP: 0663
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery Point */}
                                  <div className="relative pl-4 border-l-2 border-gray-200 ml-4">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 -ml-[21px]">
                                        <span className="text-xs font-semibold text-gray-900">1</span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">NEW HANUMAN K/G/S</p>
                                        <p className="text-xs text-gray-600">
                                          A-79PHASE 1ROAD NO.15FILM NAGAR,9291573032, A-79PHASE 1ROAD NO.15FILM NAGAR,9291573032, A-79PHASE 1ROAD NO.15FILM NAGAR,9291573032, A-79PHASE 1ROAD, Telangana, 500081
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">2026-03-11 02:17 PM</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className="bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#DBEAFE] text-xs px-2 py-0">
                                            OTP: 6317
                                          </Badge>
                                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs px-2 py-0">
                                            Returned
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalTrips}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>

      {/* Trips Map View Dialog */}
      <TripsMapViewDialog
        isOpen={isMapViewDialogOpen}
        onClose={() => setIsMapViewDialogOpen(false)}
        trips={getTripsForMapView()}
      />

      {/* Trip Route Map Dialog */}
      <TripRouteMapDialog
        isOpen={isTripRouteMapOpen}
        onClose={() => setIsTripRouteMapOpen(false)}
        trip={selectedTripForMap}
      />

      {/* Trip Filters Dialog */}
      <TripFiltersDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        pickupDate={filterPickupDate}
        status={filterStatus}
        selectedProviders={filterProvider}
        providerNames={providerNames}
        onPickupDateChange={setFilterPickupDate}
        onStatusChange={setFilterStatus}
        onSelectedProvidersChange={setFilterProvider}
        onClearAll={() => {
          setFilterPickupDate('');
          setFilterStatus('All');
          setFilterProvider([]);
        }}
        onApplyFilters={() => {
          setAppliedPickupDate(filterPickupDate);
          setAppliedStatus(filterStatus);
          setAppliedProvider(filterProvider);
          setIsFilterDialogOpen(false);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}