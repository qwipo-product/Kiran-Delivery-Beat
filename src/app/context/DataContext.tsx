import { createContext, useContext, useState, ReactNode } from 'react';

// Type Definitions
export interface Customer {
  id: string;
  uid: string;
  businessName: string;
  mobile: string;
  latitude: number;
  longitude: number;
  address: string;
  bulk: boolean;
  lastUpdated: string;
  source: 'System' | 'Manual';
}

export interface Order {
  id: string;
  createdDate: string;
  orderDate: string;
  invoiceNumber: string;
  retailerName: string;
  orderType: 'Digital' | 'Sales';
  salesPerson: string;
  beatName: string;
  mobileNumber: string;
  status: 'Ready for Planning' | 'In Planning' | 'Trip Assigned' | 'In Transit' | 'Delivered' | 'Partial Return' | 'Returned' | 'Cancelled' | 'Discarded';
  tripNumber: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  invoiceValue?: number;
  volumetricWeight?: number;
  deliveryTime?: string;
  customerId?: string;
  deliveryType?: 'Self' | '3PL';
}

export interface Trip {
  id: string;
  tripNumber: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  driverName: string;
  vehicleNumber: string;
  startTime: string;
  endTime?: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalDistance: string;
  routeOptimization: string;
  orderIds: string[];
  plannedRoute?: { lat: number; lng: number }[];
  deliveredRoute?: { lat: number; lng: number }[];
}

export interface Beat {
  id: string;
  name: string;
  code: string;
  area: string;
  status: 'Active' | 'Inactive';
  source: 'System' | 'Manual' | 'Excel';
  createdDate: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  capacityKg: number;
  driverName: string;
  status: 'Available' | 'On Trip' | 'Inactive';
}

export interface Cluster {
  id: string;
  name: string;
  code: string;
  beatIds: string[];
  vehicleId: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export interface DeliveryRoute {
  id: string;
  createdDate: string;
  routeId: string;
  dropPoints: number;
  sla: string;
  weight: string;
  volume: string;
  routeExpiry: string;
  actionType: 'view' | 'request';
  orderIds: string[];
}

interface DataContextType {
  customers: Customer[];
  orders: Order[];
  trips: Trip[];
  deliveryRoutes: DeliveryRoute[];
  logisticsSelection: 'both' | 'self' | '3pl';
  setLogisticsSelection: (value: 'both' | 'self' | '3pl') => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status'], tripNumber?: string) => void;
  createTrip: (trip: Trip) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  markOrderDelivered: (orderId: string, tripId: string) => void;
  reassignOrders: (orderIds: string[], newTripNumber: string) => void;
  createDeliveryRoute: (route: DeliveryRoute) => void;
  deleteDeliveryRoute: (id: string) => void;
  beats: Beat[];
  vehicles: Vehicle[];
  clusters: Cluster[];
  addBeat: (beat: Omit<Beat, 'id' | 'createdDate'>) => void;
  addBeats: (beats: Omit<Beat, 'id' | 'createdDate'>[]) => void;
  updateBeat: (id: string, beat: Partial<Beat>) => void;
  deleteBeat: (id: string) => void;
  addCluster: (cluster: Omit<Cluster, 'id' | 'createdDate'>) => void;
  updateCluster: (id: string, cluster: Partial<Cluster>) => void;
  deleteCluster: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Data
const initialCustomers: Customer[] = [
  {
    id: 'C001',
    uid: '1B0601946257',
    businessName: 'METRO SUPERMART',
    mobile: '9182234567',
    latitude: 17.4925,
    longitude: 78.3967,
    address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049',
    bulk: false,
    lastUpdated: '10/03/26',
    source: 'System',
  },
  {
    id: 'C002',
    uid: '1B0602216484',
    businessName: 'FRESH BAZAAR',
    mobile: '9876123456',
    latitude: 17.4400,
    longitude: 78.3489,
    address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032',
    bulk: false,
    lastUpdated: '10/03/26',
    source: 'System',
  },
  {
    id: 'C003',
    uid: '1B0602110145',
    businessName: 'SMART RETAIL',
    mobile: '9192837465',
    latitude: 17.4126,
    longitude: 78.4306,
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    bulk: true,
    lastUpdated: '09/03/26',
    source: 'Manual',
  },
  {
    id: 'C004',
    uid: 'C2022000427700',
    businessName: 'GREEN VALLEY STORE',
    mobile: '9345678901',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    bulk: true,
    lastUpdated: '09/03/26',
    source: 'Manual',
  },
  {
    id: 'C005',
    uid: 'HYR002710',
    businessName: 'FRESH CORNER',
    mobile: '9123456789',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    bulk: false,
    lastUpdated: '09/03/26',
    source: 'System',
  },
  {
    id: 'C006',
    uid: 'C2022000047007',
    businessName: 'CITY MART',
    mobile: '9876543210',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Dilsukhnagar Main Road, Hyderabad, Telangana 500036',
    bulk: false,
    lastUpdated: '08/03/26',
    source: 'System',
  },
  {
    id: 'C007',
    uid: 'HYW00212',
    businessName: 'SUNRISE TRADERS',
    mobile: '9988776655',
    latitude: 17.4483,
    longitude: 78.3915,
    address: 'Nizampet Road, Bachupally, Hyderabad, Telangana 500090',
    bulk: false,
    lastUpdated: '08/03/26',
    source: 'Manual',
  },
  {
    id: 'C008',
    uid: '1B0602203347',
    businessName: 'QUICK SHOP',
    mobile: '9966554433',
    latitude: 17.3850,
    longitude: 78.4867,
    address: 'LB Nagar Main Road, Hyderabad, Telangana 500074',
    bulk: false,
    lastUpdated: '08/03/26',
    source: 'System',
  },
  {
    id: 'C009',
    uid: '1B0602022529',
    businessName: 'ROYAL STORES',
    mobile: '9182115778',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    bulk: true,
    lastUpdated: '07/03/26',
    source: 'System',
  },
  {
    id: 'C010',
    uid: 'C2022000536741',
    businessName: 'COMMUNITY STORE',
    mobile: '9901234567',
    latitude: 17.4933,
    longitude: 78.3986,
    address: 'Nizampet Circle, Hyderabad, Telangana 500090',
    bulk: false,
    lastUpdated: '07/03/26',
    source: 'Manual',
  },
  {
    id: 'C011',
    uid: '1B0602118246',
    businessName: 'SUPER BAZAR',
    mobile: '9701234567',
    latitude: 17.4250,
    longitude: 78.3356,
    address: 'Patancheru Main Road, Hyderabad, Telangana 502319',
    bulk: false,
    lastUpdated: '07/03/26',
    source: 'System',
  },
  {
    id: 'C012',
    uid: '1B0601945081',
    businessName: 'PREMIUM MART',
    mobile: '9885470982',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    bulk: true,
    lastUpdated: '06/03/26',
    source: 'System',
  },
];

const initialOrders: Order[] = [
  {
    id: 'O001',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-001',
    retailerName: 'METRO SUPERMART',
    orderType: 'Digital',
    salesPerson: 'Rajesh Kumar',
    beatName: 'Kphb',
    mobileNumber: '9182234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4925,
    longitude: 78.3967,
    address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049',
    invoiceValue: 4100.00,
    volumetricWeight: 22.50,
    deliveryTime: '2026-03-13 10:00 AM',
    customerId: 'C001',
  },
  {
    id: 'O002',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-002',
    retailerName: 'FRESH BAZAAR',
    orderType: 'Digital',
    salesPerson: 'Priya Sharma',
    beatName: 'Beat 2',
    mobileNumber: '9876123456',
    status: 'In Transit',
    tripNumber: 'Q-20260313091234-ABCD',
    latitude: 17.4400,
    longitude: 78.3489,
    address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032',
    invoiceValue: 2800.90,
    volumetricWeight: 16.80,
    deliveryTime: '2026-03-13 09:12 AM',
    customerId: 'C002',
  },
  {
    id: 'O003',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-003',
    retailerName: 'SMART RETAIL',
    orderType: 'Digital',
    salesPerson: 'Kumar Reddy',
    beatName: 'Beat 3',
    mobileNumber: '9192837465',
    status: 'Delivered',
    tripNumber: 'Q-20260312161144-DHZA',
    latitude: 17.4126,
    longitude: 78.4306,
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    invoiceValue: 5200.00,
    volumetricWeight: 28.30,
    deliveryTime: '2026-03-12 04:22 PM',
    customerId: 'C003',
  },
  {
    id: 'O004',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-004',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Digital',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 650.50,
    volumetricWeight: 9.50,
    deliveryTime: '2026-03-13 12:30 PM',
    customerId: 'C004',
  },
  {
    id: 'O005',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-005',
    retailerName: 'FRESH CORNER',
    orderType: 'Digital',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 1850.75,
    volumetricWeight: 12.00,
    deliveryTime: '2026-03-13 02:00 PM',
    customerId: 'C005',
  },
  {
    id: 'O006',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-006',
    retailerName: 'CITY MART',
    orderType: 'Sales',
    salesPerson: 'Vikram Patel',
    beatName: 'Beat 5',
    mobileNumber: '9876543210',
    status: 'Trip Assigned',
    tripNumber: 'Q-20260313091234-ABCD',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Dilsukhnagar Main Road, Hyderabad, Telangana 500036',
    invoiceValue: 3200.00,
    volumetricWeight: 18.50,
    deliveryTime: '2026-03-13 11:00 AM',
    customerId: 'C006',
  },
  {
    id: 'O007',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-007',
    retailerName: 'SUNRISE TRADERS',
    orderType: 'Sales',
    salesPerson: 'Deepak Sharma',
    beatName: 'Beat 2',
    mobileNumber: '9988776655',
    status: 'In Transit',
    tripNumber: 'Q-20260313091234-ABCD',
    latitude: 17.4483,
    longitude: 78.3915,
    address: 'Nizampet Road, Bachupally, Hyderabad, Telangana 500090',
    invoiceValue: 2100.50,
    volumetricWeight: 14.20,
    deliveryTime: '2026-03-12 03:30 PM',
    customerId: 'C007',
  },
  {
    id: 'O008',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-008',
    retailerName: 'QUICK SHOP',
    orderType: 'Digital',
    salesPerson: 'Neha Gupta',
    beatName: 'Beat 6',
    mobileNumber: '9966554433',
    status: 'Delivered',
    tripNumber: 'Q-20260312161144-DHZA',
    latitude: 17.3850,
    longitude: 78.4867,
    address: 'LB Nagar Main Road, Hyderabad, Telangana 500074',
    invoiceValue: 1750.00,
    volumetricWeight: 11.30,
    deliveryTime: '2026-03-12 05:15 PM',
    customerId: 'C008',
  },
  {
    id: 'O009',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-009',
    retailerName: 'ROYAL STORES',
    orderType: 'Sales',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'In Planning',
    tripNumber: '-',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 4500.00,
    volumetricWeight: 25.00,
    deliveryTime: '2026-03-13 01:00 PM',
    customerId: 'C009',
  },
  {
    id: 'O010',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-010',
    retailerName: 'COMMUNITY STORE',
    orderType: 'Digital',
    salesPerson: 'Sanjay Kumar',
    beatName: 'Beat 2',
    mobileNumber: '9901234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4933,
    longitude: 78.3986,
    address: 'Nizampet Circle, Hyderabad, Telangana 500090',
    invoiceValue: 2650.00,
    volumetricWeight: 17.50,
    deliveryTime: '2026-03-13 03:00 PM',
    customerId: 'C010',
  },
  {
    id: 'O011',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-011',
    retailerName: 'SUPER BAZAR',
    orderType: 'Digital',
    salesPerson: 'Pooja Reddy',
    beatName: 'Beat 8',
    mobileNumber: '9701234567',
    status: 'Delivered',
    tripNumber: 'Q-20260312161144-DHZA',
    latitude: 17.4250,
    longitude: 78.3356,
    address: 'Patancheru Main Road, Hyderabad, Telangana 502319',
    invoiceValue: 3800.00,
    volumetricWeight: 20.00,
    deliveryTime: '2026-03-12 02:00 PM',
    customerId: 'C011',
  },
  {
    id: 'O012',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-012',
    retailerName: 'PREMIUM MART',
    orderType: 'Sales',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 5600.00,
    volumetricWeight: 30.00,
    deliveryTime: '2026-03-13 04:00 PM',
    customerId: 'C012',
  },
  {
    id: 'O013',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-013',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Digital',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 1200.00,
    volumetricWeight: 8.50,
    deliveryTime: '2026-03-13 03:30 PM',
    customerId: 'C004',
  },
  {
    id: 'O014',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-014',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Sales',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 2800.00,
    volumetricWeight: 15.00,
    deliveryTime: '2026-03-13 04:30 PM',
    customerId: 'C004',
  },
  {
    id: 'O015',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-015',
    retailerName: 'FRESH CORNER',
    orderType: 'Digital',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 950.00,
    volumetricWeight: 6.50,
    deliveryTime: '2026-03-13 02:30 PM',
    customerId: 'C005',
  },
  {
    id: 'O016',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-016',
    retailerName: 'FRESH CORNER',
    orderType: 'Sales',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'In Planning',
    tripNumber: '-',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 2200.00,
    volumetricWeight: 13.50,
    deliveryTime: '2026-03-13 05:00 PM',
    customerId: 'C005',
  },
  {
    id: 'O017',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-017',
    retailerName: 'ROYAL STORES',
    orderType: 'Digital',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'In Planning',
    tripNumber: '-',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 3200.00,
    volumetricWeight: 18.00,
    deliveryTime: '2026-03-13 02:00 PM',
    customerId: 'C009',
  },
  {
    id: 'O018',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-018',
    retailerName: 'ROYAL STORES',
    orderType: 'Sales',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 1800.00,
    volumetricWeight: 10.50,
    deliveryTime: '2026-03-13 03:30 PM',
    customerId: 'C009',
  },
  {
    id: 'O019',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-019',
    retailerName: 'COMMUNITY STORE',
    orderType: 'Digital',
    salesPerson: 'Sanjay Kumar',
    beatName: 'Beat 2',
    mobileNumber: '9901234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4933,
    longitude: 78.3986,
    address: 'Nizampet Circle, Hyderabad, Telangana 500090',
    invoiceValue: 1450.00,
    volumetricWeight: 9.00,
    deliveryTime: '2026-03-13 04:00 PM',
    customerId: 'C010',
  },
  {
    id: 'O020',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-020',
    retailerName: 'PREMIUM MART',
    orderType: 'Digital',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 3400.00,
    volumetricWeight: 19.00,
    deliveryTime: '2026-03-13 05:30 PM',
    customerId: 'C012',
  },
  {
    id: 'O021',
    createdDate: '13/03/26',
    orderDate: '13/03/26',
    invoiceNumber: 'INV-2026-021',
    retailerName: 'PREMIUM MART',
    orderType: 'Sales',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'In Planning',
    tripNumber: '-',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 2700.00,
    volumetricWeight: 14.50,
    deliveryTime: '2026-03-13 06:00 PM',
    customerId: 'C012',
  },
  {
    id: 'O022',
    createdDate: '10/03/26',
    orderDate: '10/03/26',
    invoiceNumber: 'INV-2026-022',
    retailerName: 'METRO SUPERMART',
    orderType: 'Digital',
    salesPerson: 'Rajesh Kumar',
    beatName: 'Kphb',
    mobileNumber: '9182234567',
    status: 'Delivered',
    tripNumber: 'Q-20260310081234-WXYZ',
    latitude: 17.4925,
    longitude: 78.3967,
    address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049',
    invoiceValue: 3200.00,
    volumetricWeight: 18.50,
    deliveryTime: '2026-03-10 10:00 AM',
    customerId: 'C001',
  },
  {
    id: 'O023',
    createdDate: '10/03/26',
    orderDate: '10/03/26',
    invoiceNumber: 'INV-2026-023',
    retailerName: 'FRESH BAZAAR',
    orderType: 'Sales',
    salesPerson: 'Priya Sharma',
    beatName: 'Beat 2',
    mobileNumber: '9876123456',
    status: 'Delivered',
    tripNumber: 'Q-20260310081234-WXYZ',
    latitude: 17.4400,
    longitude: 78.3489,
    address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032',
    invoiceValue: 2100.00,
    volumetricWeight: 14.00,
    deliveryTime: '2026-03-10 11:30 AM',
    customerId: 'C002',
  },
  {
    id: 'O024',
    createdDate: '10/03/26',
    orderDate: '10/03/26',
    invoiceNumber: 'INV-2026-024',
    retailerName: 'SMART RETAIL',
    orderType: 'Digital',
    salesPerson: 'Kumar Reddy',
    beatName: 'Beat 3',
    mobileNumber: '9192837465',
    status: 'Delivered',
    tripNumber: 'Q-20260310141234-MNOP',
    latitude: 17.4126,
    longitude: 78.4306,
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    invoiceValue: 4800.00,
    volumetricWeight: 25.00,
    deliveryTime: '2026-03-10 02:00 PM',
    customerId: 'C003',
  },
  {
    id: 'O025',
    createdDate: '10/03/26',
    orderDate: '10/03/26',
    invoiceNumber: 'INV-2026-025',
    retailerName: 'CITY MART',
    orderType: 'Digital',
    salesPerson: 'Vikram Patel',
    beatName: 'Beat 5',
    mobileNumber: '9876543210',
    status: 'Delivered',
    tripNumber: 'Q-20260310141234-MNOP',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Tarnaka, Hyderabad, Telangana 500017',
    invoiceValue: 1900.00,
    volumetricWeight: 11.50,
    deliveryTime: '2026-03-10 03:30 PM',
    customerId: 'C006',
  },
  {
    id: 'O026',
    createdDate: '11/03/26',
    orderDate: '11/03/26',
    invoiceNumber: 'INV-2026-026',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Sales',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Delivered',
    tripNumber: 'Q-20260311091234-PQRS',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 3500.00,
    volumetricWeight: 20.00,
    deliveryTime: '2026-03-11 09:00 AM',
    customerId: 'C004',
  },
  {
    id: 'O027',
    createdDate: '11/03/26',
    orderDate: '11/03/26',
    invoiceNumber: 'INV-2026-027',
    retailerName: 'FRESH CORNER',
    orderType: 'Digital',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'Delivered',
    tripNumber: 'Q-20260311091234-PQRS',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 1650.00,
    volumetricWeight: 10.00,
    deliveryTime: '2026-03-11 10:30 AM',
    customerId: 'C005',
  },
  {
    id: 'O028',
    createdDate: '11/03/26',
    orderDate: '11/03/26',
    invoiceNumber: 'INV-2026-028',
    retailerName: 'SUPER BAZAR',
    orderType: 'Digital',
    salesPerson: 'Deepak Jain',
    beatName: 'Beat 8',
    mobileNumber: '9701234567',
    status: 'Delivered',
    tripNumber: 'Q-20260311131234-TUVW',
    latitude: 17.4250,
    longitude: 78.3356,
    address: 'Patancheru Main Road, Hyderabad, Telangana 502319',
    invoiceValue: 2800.00,
    volumetricWeight: 16.00,
    deliveryTime: '2026-03-11 01:00 PM',
    customerId: 'C011',
  },
  {
    id: 'O029',
    createdDate: '11/03/26',
    orderDate: '11/03/26',
    invoiceNumber: 'INV-2026-029',
    retailerName: 'ROYAL STORES',
    orderType: 'Sales',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'Delivered',
    tripNumber: 'Q-20260311131234-TUVW',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 4200.00,
    volumetricWeight: 23.00,
    deliveryTime: '2026-03-11 02:30 PM',
    customerId: 'C009',
  },
  {
    id: 'O030',
    createdDate: '11/03/26',
    orderDate: '11/03/26',
    invoiceNumber: 'INV-2026-030',
    retailerName: 'COMMUNITY STORE',
    orderType: 'Digital',
    salesPerson: 'Sanjay Kumar',
    beatName: 'Beat 2',
    mobileNumber: '9901234567',
    status: 'Delivered',
    tripNumber: 'Q-20260311131234-TUVW',
    latitude: 17.4933,
    longitude: 78.3986,
    address: 'Nizampet Circle, Hyderabad, Telangana 500090',
    invoiceValue: 1750.00,
    volumetricWeight: 12.00,
    deliveryTime: '2026-03-11 04:00 PM',
    customerId: 'C010',
  },
  {
    id: 'O031',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-031',
    retailerName: 'PREMIUM MART',
    orderType: 'Digital',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'Delivered',
    tripNumber: 'Q-20260312161144-DHZA',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 3900.00,
    volumetricWeight: 21.00,
    deliveryTime: '2026-03-12 02:00 PM',
    customerId: 'C012',
  },
  {
    id: 'O032',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-032',
    retailerName: 'METRO SUPERMART',
    orderType: 'Sales',
    salesPerson: 'Rajesh Kumar',
    beatName: 'Kphb',
    mobileNumber: '9182234567',
    status: 'Delivered',
    tripNumber: 'Q-20260312101234-EFGH',
    latitude: 17.4925,
    longitude: 78.3967,
    address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049',
    invoiceValue: 2900.00,
    volumetricWeight: 17.00,
    deliveryTime: '2026-03-12 10:30 AM',
    customerId: 'C001',
  },
  {
    id: 'O033',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-033',
    retailerName: 'FRESH BAZAAR',
    orderType: 'Digital',
    salesPerson: 'Priya Sharma',
    beatName: 'Beat 2',
    mobileNumber: '9876123456',
    status: 'Delivered',
    tripNumber: 'Q-20260312101234-EFGH',
    latitude: 17.4400,
    longitude: 78.3489,
    address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032',
    invoiceValue: 3300.00,
    volumetricWeight: 19.50,
    deliveryTime: '2026-03-12 11:30 AM',
    customerId: 'C002',
  },
  {
    id: 'O034',
    createdDate: '12/03/26',
    orderDate: '12/03/26',
    invoiceNumber: 'INV-2026-034',
    retailerName: 'CITY MART',
    orderType: 'Digital',
    salesPerson: 'Vikram Patel',
    beatName: 'Beat 5',
    mobileNumber: '9876543210',
    status: 'Delivered',
    tripNumber: 'Q-20260312101234-EFGH',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Tarnaka, Hyderabad, Telangana 500017',
    invoiceValue: 2200.00,
    volumetricWeight: 13.50,
    deliveryTime: '2026-03-12 01:00 PM',
    customerId: 'C006',
  },
  {
    id: 'O035',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-035',
    retailerName: 'SMART RETAIL',
    orderType: 'Digital',
    salesPerson: 'Kumar Reddy',
    beatName: 'Beat 3',
    mobileNumber: '9192837465',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4126,
    longitude: 78.4306,
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    invoiceValue: 4500.00,
    volumetricWeight: 24.00,
    deliveryTime: '2026-03-14 10:00 AM',
    customerId: 'C003',
  },
  {
    id: 'O036',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-036',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Sales',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 1800.00,
    volumetricWeight: 11.00,
    deliveryTime: '2026-03-14 11:30 AM',
    customerId: 'C004',
  },
  {
    id: 'O037',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-037',
    retailerName: 'FRESH CORNER',
    orderType: 'Digital',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 2400.00,
    volumetricWeight: 15.00,
    deliveryTime: '2026-03-14 01:00 PM',
    customerId: 'C005',
  },
  {
    id: 'O038',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-038',
    retailerName: 'SUPER BAZAR',
    orderType: 'Sales',
    salesPerson: 'Deepak Jain',
    beatName: 'Beat 8',
    mobileNumber: '9701234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4250,
    longitude: 78.3356,
    address: 'Patancheru Main Road, Hyderabad, Telangana 502319',
    invoiceValue: 3100.00,
    volumetricWeight: 18.50,
    deliveryTime: '2026-03-14 02:30 PM',
    customerId: 'C011',
  },
  {
    id: 'O039',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-039',
    retailerName: 'ROYAL STORES',
    orderType: 'Digital',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 2700.00,
    volumetricWeight: 16.00,
    deliveryTime: '2026-03-14 03:30 PM',
    customerId: 'C009',
  },
  {
    id: 'O040',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-040',
    retailerName: 'COMMUNITY STORE',
    orderType: 'Digital',
    salesPerson: 'Sanjay Kumar',
    beatName: 'Beat 2',
    mobileNumber: '9901234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4933,
    longitude: 78.3986,
    address: 'Nizampet Circle, Hyderabad, Telangana 500090',
    invoiceValue: 1950.00,
    volumetricWeight: 12.50,
    deliveryTime: '2026-03-14 04:00 PM',
    customerId: 'C010',
  },
  {
    id: 'O041',
    createdDate: '14/03/26',
    orderDate: '14/03/26',
    invoiceNumber: 'INV-2026-041',
    retailerName: 'PREMIUM MART',
    orderType: 'Sales',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 3600.00,
    volumetricWeight: 20.50,
    deliveryTime: '2026-03-14 05:00 PM',
    customerId: 'C012',
  },
  {
    id: 'O042',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-042',
    retailerName: 'METRO SUPERMART',
    orderType: 'Digital',
    salesPerson: 'Rajesh Kumar',
    beatName: 'Kphb',
    mobileNumber: '9182234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4925,
    longitude: 78.3967,
    address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049',
    invoiceValue: 3800.00,
    volumetricWeight: 22.00,
    deliveryTime: '2026-03-15 09:00 AM',
    customerId: 'C001',
  },
  {
    id: 'O043',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-043',
    retailerName: 'FRESH BAZAAR',
    orderType: 'Sales',
    salesPerson: 'Priya Sharma',
    beatName: 'Beat 2',
    mobileNumber: '9876123456',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4400,
    longitude: 78.3489,
    address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032',
    invoiceValue: 2600.00,
    volumetricWeight: 15.50,
    deliveryTime: '2026-03-15 10:30 AM',
    customerId: 'C002',
  },
  {
    id: 'O044',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-044',
    retailerName: 'SMART RETAIL',
    orderType: 'Digital',
    salesPerson: 'Kumar Reddy',
    beatName: 'Beat 3',
    mobileNumber: '9192837465',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4126,
    longitude: 78.4306,
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    invoiceValue: 5100.00,
    volumetricWeight: 27.00,
    deliveryTime: '2026-03-15 11:30 AM',
    customerId: 'C003',
  },
  {
    id: 'O045',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-045',
    retailerName: 'CITY MART',
    orderType: 'Digital',
    salesPerson: 'Vikram Patel',
    beatName: 'Beat 5',
    mobileNumber: '9876543210',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Tarnaka, Hyderabad, Telangana 500017',
    invoiceValue: 1700.00,
    volumetricWeight: 10.50,
    deliveryTime: '2026-03-15 01:00 PM',
    customerId: 'C006',
  },
  {
    id: 'O046',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-046',
    retailerName: 'GREEN VALLEY STORE',
    orderType: 'Sales',
    salesPerson: 'Anita Rao',
    beatName: 'Beat 4',
    mobileNumber: '9345678901',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4851,
    longitude: 78.4851,
    address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014',
    invoiceValue: 2900.00,
    volumetricWeight: 17.50,
    deliveryTime: '2026-03-15 02:00 PM',
    customerId: 'C004',
  },
  {
    id: 'O047',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-047',
    retailerName: 'FRESH CORNER',
    orderType: 'Digital',
    salesPerson: 'Amit Singh',
    beatName: 'Beat 1',
    mobileNumber: '9123456789',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4435,
    longitude: 78.3913,
    address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072',
    invoiceValue: 2100.00,
    volumetricWeight: 13.00,
    deliveryTime: '2026-03-15 03:00 PM',
    customerId: 'C005',
  },
  {
    id: 'O048',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-048',
    retailerName: 'SUPER BAZAR',
    orderType: 'Digital',
    salesPerson: 'Deepak Jain',
    beatName: 'Beat 8',
    mobileNumber: '9701234567',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4250,
    longitude: 78.3356,
    address: 'Patancheru Main Road, Hyderabad, Telangana 502319',
    invoiceValue: 3400.00,
    volumetricWeight: 19.50,
    deliveryTime: '2026-03-15 04:00 PM',
    customerId: 'C011',
  },
  {
    id: 'O049',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-049',
    retailerName: 'ROYAL STORES',
    orderType: 'Sales',
    salesPerson: 'Arjun Mehta',
    beatName: 'Beat 7',
    mobileNumber: '9182115778',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.4067,
    longitude: 78.5520,
    address: 'Uppal Main Road, Hyderabad, Telangana 500039',
    invoiceValue: 4100.00,
    volumetricWeight: 23.50,
    deliveryTime: '2026-03-15 05:00 PM',
    customerId: 'C009',
  },
  {
    id: 'O050',
    createdDate: '15/03/26',
    orderDate: '15/03/26',
    invoiceNumber: 'INV-2026-050',
    retailerName: 'PREMIUM MART',
    orderType: 'Digital',
    salesPerson: 'Rahul Verma',
    beatName: 'Beat 9',
    mobileNumber: '9885470982',
    status: 'Ready for Planning',
    tripNumber: '-',
    latitude: 17.3616,
    longitude: 78.4747,
    address: 'Santosh Nagar, Hyderabad, Telangana 500059',
    invoiceValue: 3200.00,
    volumetricWeight: 18.50,
    deliveryTime: '2026-03-15 06:00 PM',
    customerId: 'C012',
  },
];

const initialTrips: Trip[] = [
  {
    id: 'T001',
    tripNumber: 'Q-20260313091234-ABCD',
    status: 'In Progress',
    driverName: 'Ramesh Kumar',
    vehicleNumber: 'TS09AB1234',
    startTime: '13/03/26 09:00 AM',
    totalOrders: 3,
    deliveredOrders: 0,
    pendingOrders: 3,
    totalDistance: '35.2 km',
    routeOptimization: 'AI Optimized',
    orderIds: ['O002', 'O006', 'O007'],
    plannedRoute: [
      { lat: 17.4925, lng: 78.3967 },
      { lat: 17.4400, lng: 78.3489 },
      { lat: 17.4239, lng: 78.4738 },
      { lat: 17.4483, lng: 78.3915 },
    ],
    deliveredRoute: [
      { lat: 17.4925, lng: 78.3967 },
      { lat: 17.4400, lng: 78.3489 },
    ],
  },
  {
    id: 'T002',
    tripNumber: 'Q-20260312161144-DHZA',
    status: 'Completed',
    driverName: 'Suresh Reddy',
    vehicleNumber: 'TS09CD5678',
    startTime: '12/03/26 02:00 PM',
    endTime: '12/03/26 06:30 PM',
    totalOrders: 4,
    deliveredOrders: 4,
    pendingOrders: 0,
    totalDistance: '42.8 km',
    routeOptimization: 'Manual',
    orderIds: ['O003', 'O008', 'O011'],
    plannedRoute: [
      { lat: 17.4925, lng: 78.3967 },
      { lat: 17.4126, lng: 78.4306 },
      { lat: 17.3850, lng: 78.4867 },
      { lat: 17.4250, lng: 78.3356 },
    ],
    deliveredRoute: [
      { lat: 17.4925, lng: 78.3967 },
      { lat: 17.4126, lng: 78.4306 },
      { lat: 17.3850, lng: 78.4867 },
      { lat: 17.4250, lng: 78.3356 },
    ],
  },
];

const initialDeliveryRoutes: DeliveryRoute[] = [
  {
    id: 'DR001',
    createdDate: 'Mar 13, 2026, 1:17:55 PM',
    routeId: 'O-20260313131752-GFJZ',
    dropPoints: 2,
    sla: 'Same Day',
    weight: '32.00 Kgs',
    volume: '32.00 Kgs',
    routeExpiry: '2m 50s left',
    actionType: 'view',
    orderIds: ['O001', 'O004'],
  },
];

// dd/mm/yy — the date format used across the app's tables
function todayLabel() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

// Beats currently referenced by orders in this LBNP
const initialBeats: Beat[] = [
  { id: 'B1', name: 'Kphb', code: 'BT-001', area: 'Kukatpally', status: 'Active', source: 'System', createdDate: '01/03/26' },
  { id: 'B2', name: 'Beat 1', code: 'BT-002', area: 'Madhapur', status: 'Active', source: 'System', createdDate: '01/03/26' },
  { id: 'B3', name: 'Beat 2', code: 'BT-003', area: 'Gachibowli', status: 'Active', source: 'System', createdDate: '01/03/26' },
  { id: 'B4', name: 'Beat 3', code: 'BT-004', area: 'Kondapur', status: 'Active', source: 'System', createdDate: '01/03/26' },
  { id: 'B5', name: 'Beat 4', code: 'BT-005', area: 'Miyapur', status: 'Active', source: 'System', createdDate: '02/03/26' },
  { id: 'B6', name: 'Beat 5', code: 'BT-006', area: 'Ameerpet', status: 'Active', source: 'System', createdDate: '02/03/26' },
  { id: 'B7', name: 'Beat 6', code: 'BT-007', area: 'Begumpet', status: 'Active', source: 'System', createdDate: '02/03/26' },
  { id: 'B8', name: 'Beat 7', code: 'BT-008', area: 'Secunderabad', status: 'Active', source: 'System', createdDate: '03/03/26' },
  { id: 'B9', name: 'Beat 8', code: 'BT-009', area: 'LB Nagar', status: 'Active', source: 'System', createdDate: '03/03/26' },
  { id: 'B10', name: 'Beat 9', code: 'BT-010', area: 'Uppal', status: 'Active', source: 'System', createdDate: '03/03/26' },
];

// Vehicles available to this LBNP (synced from the LSP: Resources > Vehicles)
const initialVehicles: Vehicle[] = [
  { id: 'V1', vehicleNumber: 'TS09AB1234', type: 'Tata Ace', capacityKg: 750, driverName: 'Ramesh Kumar', status: 'On Trip' },
  { id: 'V2', vehicleNumber: 'TS09CD5678', type: 'Mahindra Bolero Pickup', capacityKg: 1250, driverName: 'Suresh Reddy', status: 'On Trip' },
  { id: 'V3', vehicleNumber: 'TS09EF9012', type: 'Tata 407', capacityKg: 2500, driverName: 'Mahesh Babu', status: 'Available' },
  { id: 'V4', vehicleNumber: 'TS10GH3456', type: 'Ashok Leyland Dost', capacityKg: 1500, driverName: 'Venkat Rao', status: 'Available' },
  { id: 'V5', vehicleNumber: 'TS10IJ7890', type: 'Tata Ace', capacityKg: 750, driverName: 'Kiran Kumar', status: 'Available' },
  { id: 'V6', vehicleNumber: 'TS11KL2345', type: 'Eicher Pro 1049', capacityKg: 4000, driverName: 'Naveen Chandra', status: 'Available' },
  { id: 'V7', vehicleNumber: 'TS11MN6789', type: 'Mahindra Jeeto', capacityKg: 600, driverName: 'Prakash Rao', status: 'Inactive' },
];

const initialClusters: Cluster[] = [
  {
    id: 'CL1',
    name: 'West Hyderabad Cluster',
    code: 'CLU-001',
    beatIds: ['B1', 'B2', 'B5'],
    vehicleId: 'V3',
    status: 'Active',
    createdDate: '05/03/26',
  },
  {
    id: 'CL2',
    name: 'Central Cluster',
    code: 'CLU-002',
    beatIds: ['B6', 'B7'],
    vehicleId: 'V4',
    status: 'Active',
    createdDate: '06/03/26',
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>(initialDeliveryRoutes);
  const [logisticsSelection, setLogisticsSelection] = useState<'both' | 'self' | '3pl'>('both');
  const [beats, setBeats] = useState<Beat[]>(initialBeats);
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);

  // Beat Actions
  const addBeat = (beat: Omit<Beat, 'id' | 'createdDate'>) => {
    setBeats(prev => [...prev, { ...beat, id: nextId('B'), createdDate: todayLabel() }]);
  };

  const addBeats = (newBeats: Omit<Beat, 'id' | 'createdDate'>[]) => {
    setBeats(prev => [
      ...prev,
      ...newBeats.map(b => ({ ...b, id: nextId('B'), createdDate: todayLabel() })),
    ]);
  };

  const updateBeat = (id: string, beatUpdate: Partial<Beat>) => {
    setBeats(prev => prev.map(b => (b.id === id ? { ...b, ...beatUpdate } : b)));
  };

  const deleteBeat = (id: string) => {
    setBeats(prev => prev.filter(b => b.id !== id));
    // Drop the beat from any cluster that referenced it
    setClusters(prev => prev.map(c => ({ ...c, beatIds: c.beatIds.filter(bId => bId !== id) })));
  };

  // Cluster Actions
  const addCluster = (cluster: Omit<Cluster, 'id' | 'createdDate'>) => {
    setClusters(prev => [...prev, { ...cluster, id: nextId('CL'), createdDate: todayLabel() }]);
  };

  const updateCluster = (id: string, clusterUpdate: Partial<Cluster>) => {
    setClusters(prev => prev.map(c => (c.id === id ? { ...c, ...clusterUpdate } : c)));
  };

  const deleteCluster = (id: string) => {
    setClusters(prev => prev.filter(c => c.id !== id));
  };

  // Customer Actions
  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (id: string, customerUpdate: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...customerUpdate } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Order Actions
  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrder = (id: string, orderUpdate: Partial<Order>) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...orderUpdate } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const updateOrderStatus = (id: string, status: Order['status'], tripNumber?: string) => {
    setOrders(prev => prev.map(o =>
      o.id === id
        ? { ...o, status, tripNumber: tripNumber || o.tripNumber }
        : o
    ));
  };

  // Trip Actions
  const createTrip = (trip: Trip) => {
    setTrips([...trips, trip]);
    
    // Update orders to reflect trip assignment
    trip.orderIds.forEach(orderId => {
      updateOrderStatus(orderId, 'Trip Assigned', trip.tripNumber);
    });
  };

  const updateTrip = (id: string, tripUpdate: Partial<Trip>) => {
    setTrips(trips.map(t => t.id === id ? { ...t, ...tripUpdate } : t));
  };

  const markOrderDelivered = (orderId: string, tripId: string) => {
    // Update order status
    updateOrderStatus(orderId, 'Delivered');
    
    // Update trip statistics
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      updateTrip(tripId, {
        deliveredOrders: trip.deliveredOrders + 1,
        pendingOrders: trip.pendingOrders - 1,
      });
    }
  };

  const reassignOrders = (orderIds: string[], newTripNumber: string) => {
    // Find the new trip
    const newTrip = trips.find(t => t.tripNumber === newTripNumber);
    
    orderIds.forEach(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Remove from old trip if exists
        const oldTrip = trips.find(t => t.tripNumber === order.tripNumber);
        if (oldTrip) {
          updateTrip(oldTrip.id, {
            orderIds: oldTrip.orderIds.filter(id => id !== orderId),
            totalOrders: oldTrip.totalOrders - 1,
            pendingOrders: oldTrip.pendingOrders - 1,
          });
        }
        
        // Add to new trip
        if (newTrip) {
          updateTrip(newTrip.id, {
            orderIds: [...newTrip.orderIds, orderId],
            totalOrders: newTrip.totalOrders + 1,
            pendingOrders: newTrip.pendingOrders + 1,
          });
        }
        
        // Update order
        updateOrderStatus(orderId, 'Trip Assigned', newTripNumber);
      }
    });
  };

  // Delivery Route Actions
  const createDeliveryRoute = (route: DeliveryRoute) => {
    setDeliveryRoutes([...deliveryRoutes, route]);
    
    // Update orders to "In Planning" status
    route.orderIds.forEach(orderId => {
      updateOrderStatus(orderId, 'In Planning');
    });
  };

  const deleteDeliveryRoute = (id: string) => {
    const route = deliveryRoutes.find(r => r.id === id);
    if (route) {
      // Reset orders back to "Ready for Planning"
      route.orderIds.forEach(orderId => {
        updateOrderStatus(orderId, 'Ready for Planning', '-');
      });
    }
    setDeliveryRoutes(deliveryRoutes.filter(r => r.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        orders,
        trips,
        deliveryRoutes,
        logisticsSelection,
        setLogisticsSelection,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        createTrip,
        updateTrip,
        markOrderDelivered,
        reassignOrders,
        createDeliveryRoute,
        deleteDeliveryRoute,
        beats,
        vehicles,
        clusters,
        addBeat,
        addBeats,
        updateBeat,
        deleteBeat,
        addCluster,
        updateCluster,
        deleteCluster,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}