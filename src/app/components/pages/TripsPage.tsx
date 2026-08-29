import { useState, useRef, useEffect } from 'react';
import { Truck, BarChart3, CheckCircle2, Calendar, MapPin, Eye, Filter, Map as MapIcon, Hash, ClipboardList, Receipt, MoreHorizontal, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
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
  seller?: string;
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
    seller: 'Sree Venkateswara Traders',
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
    seller: 'Sri Sarda Enterprises',
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
    seller: 'Sree Venkateswara Traders',
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
    seller: 'SR Enterprises',
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
    seller: 'Sri Sarda Enterprises',
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
    seller: 'Sree Venkateswara Traders',
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
    seller: 'SR Enterprises',
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
    seller: 'Sree Venkateswara Traders',
  },
  {
    id: '9',
    tripNumber: 'Q-20260219094512-BLKW',
    provider: 'Qwiqo Logistics',
    sla: 'Next Day Delivery',
    status: 'Planned',
    dropPoints: 7,
    arrivalTime: '2026-02-19 09:45 AM',
    charges: '₹ 2,300.00',
    deliveryType: '3pl',
    seller: 'Balaji Wholesale Traders',
  },
  {
    id: '10',
    tripNumber: 'Q-20260219104233-RPST',
    provider: 'Blue Dart',
    sla: 'Same Day Delivery',
    status: 'Planned',
    dropPoints: 10,
    arrivalTime: '2026-02-19 10:42 AM',
    charges: '₹ 3,100.00',
    deliveryType: '3pl',
    seller: 'Ramesh Provision Stores',
  },
  {
    id: '11',
    tripNumber: 'Q-20260219113805-ANDT',
    provider: 'DTDC Courier',
    sla: 'Standard Delivery',
    status: 'Planned',
    dropPoints: 4,
    arrivalTime: '2026-02-19 11:38 AM',
    charges: '₹ 1,850.00',
    deliveryType: '3pl',
    seller: 'Anand Distributors',
  },
];

// Pool of SKUs used to synthesize an indent-style pickup list per trip.
interface PickupSku {
  name: string;
  mrp: number;
  upc: number;
  gstRate: number;
}

const PICKUP_SKU_POOL: PickupSku[] = [
  { name: 'Goyal Gold Yellow Jowari -1 Bag, 50 Kg', mrp: 7000, upc: 0, gstRate: 0 },
  { name: 'Shalimar R Atta (Poori) -1 Kg, 1 Pack', mrp: 60, upc: 25, gstRate: 5 },
  { name: 'Shalimar Suji (Bombay Rava) -1 Kg, 1 Pack', mrp: 80, upc: 25, gstRate: 5 },
  { name: 'Balaji Urad Gundu, 50 KG Bag', mrp: 8000, upc: 0, gstRate: 0 },
  { name: 'Goyal Gold Fine Premium Quality Green Moong -1 Bag, 10 Kg', mrp: 2500, upc: 0, gstRate: 0 },
  { name: 'Goyal Gold Kabuli Chana -1 Bag, 10 Kg', mrp: 2500, upc: 0, gstRate: 0 },
  { name: 'Apple Brand Kabutar Jowari, 50 Kg Bag', mrp: 2000, upc: 0, gstRate: 0 },
  { name: 'Double Diamond Premium Sharbati Wheat, 50 KG Bag', mrp: 2500, upc: 0, gstRate: 0 },
  { name: 'Farm Gold Chakki Atta -1 Bag, 26 Kg', mrp: 1200, upc: 0, gstRate: 0 },
  { name: 'Shalimar Maida, 1 KG Pack', mrp: 80, upc: 25, gstRate: 5 },
  { name: 'Shivtara Bakery Maida, 50 KG Bag', mrp: 2500, upc: 0, gstRate: 0 },
  { name: 'Sri Lohitha Soft Idly Ravva, 26 KG Bag', mrp: 1500, upc: 0, gstRate: 0 },
];

// Directory of pickup sellers' own business details, used as the "from" letterhead
// on the Seller Wise Orders PDF (replacing a generic company letterhead).
interface SellerInfo {
  address: string;
  phone: string;
  gstin: string;
}

const SELLER_DIRECTORY: Record<string, SellerInfo> = {
  'Sree Venkateswara Traders': { address: '8-2-120, Road No 3, Banjara Hills, Hyderabad, Telangana 500034', phone: '9182399613', gstin: '36ABCVS1234A1Z5' },
  'Sri Sarda Enterprises': { address: '12-3-45, Nagarjuna Nagar Colony, Hyderabad, Telangana 500073', phone: '9948123456', gstin: '36ABCSS5678B1Z2' },
  'SR Enterprises': { address: '4-5-67, Kukatpally Y Junction, Hyderabad, Telangana 500072', phone: '9848234567', gstin: '36ABCSR9012C1Z8' },
  'Balaji Wholesale Traders': { address: '2-8-90, Secunderabad Main Road, Secunderabad, Telangana 500003', phone: '9866345678', gstin: '36ABCBW3456D1Z1' },
  'Ramesh Provision Stores': { address: '15-6-23, Malakpet Colony, Hyderabad, Telangana 500036', phone: '9963456789', gstin: '36ABCRP7890E1Z4' },
  'Anand Distributors': { address: '9-1-34, Ameerpet Circle, Hyderabad, Telangana 500016', phone: '9491567890', gstin: '36ABCAD1234F1Z6' },
};

function getSellerInfo(seller: string): SellerInfo {
  return SELLER_DIRECTORY[seller] ?? { address: 'Hyderabad, Telangana, India', phone: '-', gstin: 'UNREGISTERED' };
}

// Retailers each seller's orders can be "sold to" for the Seller Wise Orders PDF.
interface RetailerInfo {
  name: string;
  address: string;
  phone: string;
}

const RETAILER_POOL: RetailerInfo[] = [
  { name: 'Metro Supermart', address: 'Plot 45, Miyapur Main Road, Hyderabad, Telangana 500049' , phone: '9182234567' },
  { name: 'Fresh Bazaar', address: 'Cyber Towers, Gachibowli, Hyderabad, Telangana 500032', phone: '9876123456' },
  { name: 'Smart Retail', address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034', phone: '9192837465' },
  { name: 'Green Valley Store', address: 'Kompally Circle, Kompally, Hyderabad, Telangana 500014', phone: '9345678901' },
  { name: 'Fresh Corner', address: 'Kukatpally Housing Board Colony, Hyderabad, Telangana 500072', phone: '9123456789' },
  { name: 'City Mart', address: 'Dilsukhnagar Main Road, Hyderabad, Telangana 500036', phone: '9876543210' },
  { name: 'Sunrise Traders', address: 'Nizampet Road, Bachupally, Hyderabad, Telangana 500090', phone: '9988776655' },
  { name: 'Quick Shop', address: 'LB Nagar Main Road, Hyderabad, Telangana 500074', phone: '9966554433' },
  { name: 'Royal Stores', address: 'Uppal Main Road, Hyderabad, Telangana 500039', phone: '9182115778' },
  { name: 'Community Store', address: 'Nizampet Circle, Hyderabad, Telangana 500090', phone: '9901234567' },
  { name: 'Super Bazar', address: 'Patancheru Main Road, Hyderabad, Telangana 502319', phone: '9701234567' },
  { name: 'Premium Mart', address: 'Santosh Nagar, Hyderabad, Telangana 500059', phone: '9885470982' },
];

interface SellerOrderLineItem {
  description: string;
  mrp: number;
  qty: number;
  css: number;
  pcs: number;
  taxableAmt: number;
  sgst: number;
  cgst: number;
  price: number;
  total: number;
}

interface SellerOrder {
  orderNo: string;
  orderDate: string;
  invoiceNo: string;
  invoiceDate: string;
  retailer: RetailerInfo;
  items: SellerOrderLineItem[];
}

/** Deterministic pseudo-random set of retailer orders for a trip's pickup, seeded off the trip id. */
function generateSellerOrders(trip: Trip): SellerOrder[] {
  const seed = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const orderDate = trip.arrivalTime.slice(0, 10);
  const orderCount = 2 + (seed % 2); // 2-3 orders per trip

  return Array.from({ length: orderCount }, (_, oi) => {
    const retailer = RETAILER_POOL[(seed + oi * 3) % RETAILER_POOL.length];
    const lineCount = 1 + ((seed + oi) % 2); // 1-2 line items
    const items: SellerOrderLineItem[] = Array.from({ length: lineCount }, (_, ii) => {
      const sku = PICKUP_SKU_POOL[(seed + oi * 5 + ii * 7) % PICKUP_SKU_POOL.length];
      const qty = sku.upc > 0 ? sku.upc * (1 + ((seed + ii) % 3)) : 1 + ((seed + oi + ii) % 3);
      const css = sku.upc > 0 ? Math.floor(qty / sku.upc) : 0;
      const pcs = sku.upc > 0 ? qty % sku.upc : qty;
      const unitPrice = Math.round(sku.mrp * (0.72 + ((seed + ii) % 20) / 100) * 100) / 100;
      const total = Math.round(unitPrice * qty * 100) / 100;
      const taxableAmt = Math.round((total / (1 + sku.gstRate / 100)) * 100) / 100;
      const gstEach = Math.round(((total - taxableAmt) / 2) * 100) / 100;
      return { description: sku.name, mrp: sku.mrp, qty, css, pcs, taxableAmt, sgst: gstEach, cgst: gstEach, price: unitPrice, total };
    });

    return {
      orderNo: `QWIP${(1000000000000000 + seed * 97 + oi * 313).toString().slice(0, 16)}`,
      orderDate,
      invoiceNo: `SINV-26-${(96000 + seed * 3 + oi).toString().padStart(8, '0')}`,
      invoiceDate: orderDate,
      retailer,
      items,
    };
  });
}

/** Build a printable PDF of a seller's orders, styled like a consolidated receipt per order. */
function buildSellerOrdersPdf(seller: string, orders: SellerOrder[]) {
  const sellerInfo = getSellerInfo(seller);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  orders.forEach((order, orderIndex) => {
    if (orderIndex > 0) doc.addPage();

    let y = 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(seller, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const sellerAddrLines = doc.splitTextToSize(sellerInfo.address, 58);
    doc.text(sellerAddrLines, 14, y + 5);
    let sellerY = y + 5 + sellerAddrLines.length * 3.6;
    doc.text(`Phone: ${sellerInfo.phone}`, 14, sellerY);
    doc.text(`GSTIN: ${sellerInfo.gstin}`, 14, sellerY + 4);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(order.retailer.name, 78, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const retailerAddrLines = doc.splitTextToSize(order.retailer.address, 58);
    doc.text(retailerAddrLines, 78, y + 5);
    let retailerY = y + 5 + retailerAddrLines.length * 3.6;
    doc.text(`Phone: ${order.retailer.phone}`, 78, retailerY);
    doc.text('GSTIN: UNREGISTERED', 78, retailerY + 4);

    doc.setFontSize(8.5);
    doc.text(`Order No: ${order.orderNo}`, 196, y, { align: 'right' });
    doc.text(`Order Date: ${order.orderDate}`, 196, y + 4, { align: 'right' });
    doc.text(`Invoice No: ${order.invoiceNo}`, 196, y + 8, { align: 'right' });
    doc.text(`Invoice Date: ${order.invoiceDate}`, 196, y + 12, { align: 'right' });

    const headerBottom = Math.max(sellerY + 8, retailerY + 8, y + 16);

    autoTable(doc, {
      startY: headerBottom,
      head: [['S.no', 'Item Description', 'MRP', 'Qty', 'Css', 'Pcs', 'Taxable Amt', 'SGST', 'CGST', 'Price', 'Total']],
      body: order.items.map((item, i) => [
        i + 1,
        item.description,
        item.mrp.toFixed(2),
        item.qty,
        item.css,
        item.pcs,
        item.taxableAmt.toFixed(2),
        item.sgst.toFixed(2),
        item.cgst.toFixed(2),
        item.price.toFixed(2),
        item.total.toFixed(2),
      ]),
      styles: { fontSize: 7.5 },
      headStyles: { fillColor: [45, 110, 245] },
      margin: { left: 14, right: 14 },
    });

    const subTotal = order.items.reduce((s, i) => s + i.taxableAmt, 0);
    const tax = order.items.reduce((s, i) => s + i.sgst + i.cgst, 0);
    const grandTotal = subTotal + tax;

    const slabMap = new Map<number, { sgst: number; cgst: number }>();
    order.items.forEach(item => {
      const rate = Math.round(((item.sgst + item.cgst) / (item.taxableAmt || 1)) * 100);
      const existing = slabMap.get(rate) ?? { sgst: 0, cgst: 0 };
      existing.sgst += item.sgst;
      existing.cgst += item.cgst;
      slabMap.set(rate, existing);
    });

    const afterItemsY = (doc as any).lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: afterItemsY,
      head: [['SLAB (%)', 'SGST', 'CGST', 'TOTAL GST']],
      body: Array.from(slabMap.entries()).map(([rate, v]) => [
        rate.toFixed(1), v.sgst.toFixed(2), v.cgst.toFixed(2), (v.sgst + v.cgst).toFixed(2),
      ]),
      foot: [['Total', ...['sgst', 'cgst'].map(k =>
        Array.from(slabMap.values()).reduce((s, v) => s + (v as any)[k], 0).toFixed(2)
      ), tax.toFixed(2)]],
      styles: { fontSize: 7.5 },
      headStyles: { fillColor: [230, 230, 230], textColor: 20 },
      footStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: 'bold' },
      margin: { left: 14 },
      tableWidth: 90,
    });

    autoTable(doc, {
      startY: afterItemsY,
      body: [
        ['Sub-Total:', subTotal.toFixed(2)],
        ['Tax:', tax.toFixed(2)],
        ['Delivery Charges:', '0.00'],
        ['Total Amount:', grandTotal.toFixed(2)],
        ['Discount:', '0.00'],
        ['Grand Total:', grandTotal.toFixed(2)],
        ['Rounded Total:', Math.round(grandTotal).toFixed(2)],
      ],
      styles: { fontSize: 7.5 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
      theme: 'grid',
      margin: { left: 110 },
      tableWidth: 72,
    });

    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      'This is a consolidated receipt for proof of purchase only and does not replace individual tax invoices. For tax purposes, please refer to the original invoices.',
      pageWidth / 2, pageHeight - 14, { align: 'center' }
    );
    doc.text(`System Generated Receipt - No Signature Required, Order Number: ${order.orderNo}.`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0);
  });

  return doc;
}

interface PickupListItem {
  pickupOrder: number;
  skuName: string;
  vendor: string;
  mrp: number;
  upc: number;
  quantity: number;
  cases: number;
  pieces: number;
  orderNumbers: string[];
}

/** Deterministic pseudo-random SKU breakdown for a trip's pickup, seeded off the trip id. */
function generatePickupItems(trip: Trip, pickupOrder: number): PickupListItem[] {
  const seed = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const itemCount = 3 + (seed % 4); // 3-6 SKUs
  const vendor = trip.seller ?? 'Unassigned Seller';

  return Array.from({ length: itemCount }, (_, i) => {
    const sku = PICKUP_SKU_POOL[(seed + i * 5) % PICKUP_SKU_POOL.length];
    const multiplier = 1 + ((seed + i * 7) % 5);
    const quantity = sku.upc > 0 ? sku.upc * multiplier : multiplier;
    const cases = sku.upc > 0 ? Math.floor(quantity / sku.upc) : 0;
    const pieces = sku.upc > 0 ? quantity % sku.upc : quantity;
    return {
      pickupOrder,
      skuName: sku.name,
      vendor,
      mrp: sku.mrp,
      upc: sku.upc,
      quantity,
      cases,
      pieces,
      orderNumbers: [trip.tripNumber],
    };
  });
}

const PICKUP_SHEET_HEADERS = ['Pickup Order', 'SKU Name', 'Vendor', 'MRP', 'UPC', 'Quantity', 'Cases', 'Pieces', 'Order Numbers'];
const PICKUP_COLUMN_WIDTHS = [{ wch: 12 }, { wch: 45 }, { wch: 22 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 26 }];

function pickupItemRow(item: PickupListItem) {
  return [
    item.pickupOrder,
    item.skuName,
    item.vendor,
    item.mrp,
    item.upc,
    item.quantity,
    item.cases,
    item.pieces,
    item.orderNumbers.join(', '),
  ];
}

/** Strip characters that are illegal in Windows/macOS file names. */
function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Build a printable PDF (title + indent table + summary table) for one seller's pickup list. */
function buildPickupListPdf(seller: string, generatedOn: string, items: PickupListItem[], summaryItems: PickupListItem[]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(13);
  doc.text(`${seller} - Indent Sheet generated on ${generatedOn}`, 14, 15);

  autoTable(doc, {
    startY: 20,
    head: [PICKUP_SHEET_HEADERS],
    body: items.map(pickupItemRow),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [45, 110, 245] },
  });

  const afterFirstTable = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.text('Summary', 14, afterFirstTable);
  autoTable(doc, {
    startY: afterFirstTable + 5,
    head: [PICKUP_SHEET_HEADERS],
    body: summaryItems.map(pickupItemRow),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [45, 110, 245] },
  });

  return doc;
}

/** Aggregate line items belonging to the same SKU + vendor, merging their order numbers. */
function summarizePickupItems(items: PickupListItem[]): PickupListItem[] {
  const bySku = new Map<string, PickupListItem>();
  items.forEach(item => {
    const key = `${item.skuName}::${item.vendor}`;
    const existing = bySku.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.cases += item.cases;
      existing.pieces += item.pieces;
      existing.orderNumbers = [...existing.orderNumbers, ...item.orderNumbers];
    } else {
      bySku.set(key, { ...item, orderNumbers: [...item.orderNumbers] });
    }
  });
  return Array.from(bySku.values());
}

interface TripsPageProps {
  extraTrips?: Trip[];
  activeTab?: '3pl' | 'self';
}

export function TripsPage({ extraTrips = [], activeTab = '3pl' }: TripsPageProps) {
  const allTrips = React.useMemo(() => {
    // Newest-created trips first: dynamically booked trips (already prepended
    // newest-first) come before the seed trips, which are sorted by id descending.
    const sortedMockTrips = [...mockTrips].sort((a, b) => Number(b.id) - Number(a.id));
    return [...extraTrips, ...sortedMockTrips];
  }, [extraTrips]);
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

  // Bulk actions dropdown (shown once trips are selected)
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBulkActionsOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
        setIsBulkActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBulkActionsOpen]);

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

  // Trips currently selected, and whether they're eligible for a pickup list
  // (only trips still in "Planned" status haven't been picked up yet).
  const selectedTripsList = filteredTrips.filter(trip => selectedTripIds.has(trip.id));
  const isPickupListEnabled = selectedTripsList.length > 0 && selectedTripsList.every(trip => trip.status === 'Planned');

  // Download a separate Excel + PDF pickup list (indent sheet) per seller, for the selected trips.
  const handleDownloadPickupList = () => {
    if (selectedTripsList.length === 0) {
      toast.error('Select at least one trip to download its pickup list.');
      return;
    }
    if (!isPickupListEnabled) {
      toast.error('Pickup list can only be downloaded for trips that are still Planned.');
      return;
    }

    const sellerGroups = new Map<string, Trip[]>();
    selectedTripsList.forEach(trip => {
      const seller = trip.seller ?? 'Unassigned Seller';
      const group = sellerGroups.get(seller) ?? [];
      group.push(trip);
      sellerGroups.set(seller, group);
    });

    const generatedOn = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fileDate = new Date().toISOString().slice(0, 10);

    sellerGroups.forEach((sellerTrips, seller) => {
      const items = sellerTrips.flatMap((trip, i) => generatePickupItems(trip, i + 1));
      const summaryItems = summarizePickupItems(items);
      const fileBase = `${sanitizeFileName(seller)} - Pickup List - ${fileDate}`;

      // Excel workbook: raw indent-sheet rows plus a per-seller SKU summary
      const book = XLSX.utils.book_new();
      const detailSheet = XLSX.utils.aoa_to_sheet([
        [`${seller} - Indent Sheet generated on ${generatedOn}`],
        [],
        PICKUP_SHEET_HEADERS,
        ...items.map(pickupItemRow),
      ]);
      detailSheet['!cols'] = PICKUP_COLUMN_WIDTHS;
      XLSX.utils.book_append_sheet(book, detailSheet, 'Indent Sheet');

      const summarySheet = XLSX.utils.aoa_to_sheet([
        [`${seller} - Summary`],
        [],
        PICKUP_SHEET_HEADERS,
        ...summaryItems.map(pickupItemRow),
      ]);
      summarySheet['!cols'] = PICKUP_COLUMN_WIDTHS;
      XLSX.utils.book_append_sheet(book, summarySheet, 'Summary');

      XLSX.writeFile(book, `${fileBase}.xlsx`);

      // PDF with the same two tables, for printing/sharing
      const pdf = buildPickupListPdf(seller, generatedOn, items, summaryItems);
      pdf.save(`${fileBase}.pdf`);
    });

    toast.success(
      `Pickup list downloaded (Excel + PDF) for ${sellerGroups.size} seller${sellerGroups.size === 1 ? '' : 's'}.`
    );
  };

  // Download a seller-wise orders PDF (one invoice-style page per order) for the selected trips.
  const handleDownloadSellerOrders = () => {
    if (selectedTripsList.length === 0) {
      toast.error('Select at least one trip to download its seller-wise orders.');
      return;
    }
    if (!isPickupListEnabled) {
      toast.error('Seller-wise orders can only be downloaded for trips that are still Planned.');
      return;
    }

    const sellerGroups = new Map<string, Trip[]>();
    selectedTripsList.forEach(trip => {
      const seller = trip.seller ?? 'Unassigned Seller';
      const group = sellerGroups.get(seller) ?? [];
      group.push(trip);
      sellerGroups.set(seller, group);
    });

    const fileDate = new Date().toISOString().slice(0, 10);

    sellerGroups.forEach((sellerTrips, seller) => {
      const orders = sellerTrips.flatMap(trip => generateSellerOrders(trip));
      const pdf = buildSellerOrdersPdf(seller, orders);
      pdf.save(`${sanitizeFileName(seller)} - Orders - ${fileDate}.pdf`);
    });

    toast.success(
      `Seller-wise orders downloaded for ${sellerGroups.size} seller${sellerGroups.size === 1 ? '' : 's'}.`
    );
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
              <MapIcon className="w-4 h-4" />
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

          {/* Bulk selection actions bar */}
          {selectedTripIds.size > 0 && (
            <div className="flex items-center justify-end gap-3 mb-3">
              <span className="text-sm text-gray-600">{selectedTripIds.size} selected</span>
              <div className="relative" ref={bulkActionsRef}>
                <Button
                  onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                  variant="default"
                  className="gap-2 bg-[#2D6EF5] hover:bg-[#2D6EF5]/90"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  Actions
                  <ChevronDown className={`w-4 h-4 transition-transform ${isBulkActionsOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isBulkActionsOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {selectedTripIds.size} Trip{selectedTripIds.size === 1 ? '' : 's'} Selected
                    </p>

                    <button
                      onClick={() => {
                        if (!isPickupListEnabled) return;
                        handleDownloadPickupList();
                        setIsBulkActionsOpen(false);
                      }}
                      disabled={!isPickupListEnabled}
                      title={isPickupListEnabled ? undefined : 'Select only Planned trips to download their pickup list'}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                        isPickupListEnabled
                          ? 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <ClipboardList className={`w-5 h-5 ${isPickupListEnabled ? 'text-[#2D6EF5]' : 'text-gray-300'}`} />
                      <span className="text-sm">Seller Pickup List</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!isPickupListEnabled) return;
                        handleDownloadSellerOrders();
                        setIsBulkActionsOpen(false);
                      }}
                      disabled={!isPickupListEnabled}
                      title={isPickupListEnabled ? undefined : 'Select only Planned trips to download their seller-wise orders'}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                        isPickupListEnabled
                          ? 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <Receipt className={`w-5 h-5 ${isPickupListEnabled ? 'text-[#2D6EF5]' : 'text-gray-300'}`} />
                      <span className="text-sm">Seller Wise Orders</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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