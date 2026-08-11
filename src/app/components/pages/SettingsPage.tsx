import { useState } from 'react';
import { Settings as SettingsIcon, User, Truck, List, CreditCard, Users, Clock, CalendarX, Plus, Trash2, RotateCcw, Save, Pencil, ChevronLeft, ChevronRight, Settings2, CircleCheck, Store, MapPin, Layers } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import type { Cluster } from '../../context/DataContext';
import { BeatsPanel, ClustersPanel } from './BeatsClusterPanels';

const warehouseAddresses = [
  {
    id: 1,
    name: 'Big C Mobiles',
    address: 'Madhapur Rd, opp Petrol Bunk, Megha Hills, Sri Sai Nagar, Madhapur, Serilingampalle, Hyderabad, Telangana, Hyderabad - 500081',
    isDefault: true,
  },
  {
    id: 2,
    name: '676 Prosacco Divide',
    address: 'Apt. 848, Hyderabad - 500032',
    isDefault: false,
  },
  {
    id: 3,
    name: 'hyd',
    address: 'hyd, hyd - 500072',
    isDefault: false,
  },
  {
    id: 4,
    name: 'PS 2 BLR Handpickd',
    address: 'XPM6+MC4, NCPR Industrial Layout, Doddanakundi Industrial Area 2, Seetharampalya, Hoodi, Bengaluru - 560048',
    isDefault: false,
  },
];

interface SettingsPageProps {
  onNavigateToAddCluster: (cluster?: Cluster) => void;
  /** Tab to open on mount, so returning from the cluster builder lands back on Clusters. */
  initialTab?: string;
}

export function SettingsPage({ onNavigateToAddCluster, initialTab }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'profile');
  const [addresses, setAddresses] = useState(warehouseAddresses);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'beats', label: 'Beats', icon: MapPin },
    { id: 'clusters', label: 'Clusters', icon: Layers },
    { id: 'category', label: 'Category Sequence', icon: List },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'users', label: 'Users & Permissions', icon: Users },
  ];

  const handleSetDefault = (id: number) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleDelete = (id: number) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-[#2D6EF5]" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-sm text-gray-600">
          Customize your preferences, manage account details, and configure app options.
        </p>
      </div>

      {/* Page Content */}
      <div className="px-6 py-4">
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                      isActive
                        ? 'border-[#2D6EF5] text-[#2D6EF5]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Two-column layout: left = Business Details + Warehouse Locations, right = Store Timings */}
              <div className="grid grid-cols-2 gap-6 items-start">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Business Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Business Details</h2>
                    <p className="text-sm text-gray-500 mb-6">Manage your personal and business information</p>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Name</label>
                        <Input type="text" defaultValue="Sree Venkateswara" className="w-full" disabled />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Email Address</label>
                        <Input type="email" defaultValue="deekshith017@gmail.com" className="w-full" disabled />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Business Name</label>
                        <Input type="text" defaultValue="Sree Venkateswara Traders" className="w-full" disabled />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Phone Number</label>
                        <Input type="tel" defaultValue="9182399613" className="w-full" disabled />
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Locations */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Warehouse Locations</h2>
                        <p className="text-sm text-gray-500">Manage your warehouse and pickup addresses</p>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2D6EF5] text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        Add Address
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{addr.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{addr.address}</p>
                              {addr.isDefault ? (
                                <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-[#2D6EF5] text-xs rounded-full border border-blue-100">
                                  Default Address
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="mt-2 text-sm text-[#2D6EF5] hover:underline"
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleDelete(addr.id)}
                                className="ml-4 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column: Store Timings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Store Timings</h2>
                  <p className="text-sm text-gray-500 mb-6">Configure your business operating hours and non-operating days</p>

                  <div className="space-y-4">
                    {/* Business Hours */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-[#2D6EF5]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Business Hours</p>
                          <p className="text-xs text-gray-500">Configure your business operating hours and open days</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                    </div>

                    {/* Non-Operating Days */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                          <CalendarX className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Non-Operating Days</p>
                          <p className="text-xs text-gray-500">Manage holidays and other non-operating days</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && <DeliveryTab />}

          {/* Beats Tab */}
          {activeTab === 'beats' && <BeatsPanel />}

          {/* Clusters Tab */}
          {activeTab === 'clusters' && (
            <ClustersPanel onNavigateToAddCluster={onNavigateToAddCluster} />
          )}

          {/* Other tabs placeholder */}
          {!['profile', 'delivery', 'beats', 'clusters'].includes(activeTab) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600">
                Configure your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} preferences
              </p>
            </div>
          )}
        </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Delivery Tab
───────────────────────────────────────────── */
const exclusionsData = [
  { id: 1, sno: 1, fieldName: 'UID', value: '1234', status: 'Inactive' },
  { id: 2, sno: 2, fieldName: 'DsType', value: 'Anjiswar', status: 'Active' },
];

function DeliveryTab() {
  const { logisticsSelection, setLogisticsSelection } = useData();
  const [pendingLogistics, setPendingLogistics] = useState<'both' | 'self' | '3pl'>(logisticsSelection);
  const [routeConfig, setRouteConfig] = useState({
    serviceTime: '12',
    maxTravelTime: '8.5',
    maxStops: '30',
    maxDistance: '50',
  });
  const [ondcCategory, setOndcCategory] = useState('Grocery');
  const [exclusions, setExclusions] = useState(exclusionsData);
  const [routeEngine, setRouteEngine] = useState<'route' | 'beat' | 'clusterBeat'>('route');
  const [otpConfig, setOtpConfig] = useState({ seller: true, retailer: true });
  const [savedOtpConfig, setSavedOtpConfig] = useState({ seller: true, retailer: true });

  const otpDirty =
    otpConfig.seller !== savedOtpConfig.seller || otpConfig.retailer !== savedOtpConfig.retailer;

  const handleDeleteExclusion = (id: number) => {
    setExclusions(prev => prev.filter(e => e.id !== id));
  };

  const handleResetDefaults = () => {
    setRouteConfig({ serviceTime: '12', maxTravelTime: '8.5', maxStops: '30', maxDistance: '50' });
  };

  const handleSaveOtp = () => {
    setSavedOtpConfig(otpConfig);
    toast.success('Proof of Delivery settings saved.');
  };

  return (
    <div className="space-y-6">

      {/* Route Planning Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">Route Planning Configuration</h2>
          <div className="flex gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900">
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Service Time per Stop */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Service Time per Stop</p>
                <p className="text-xs text-gray-500">Time spent at each delivery point</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={routeConfig.serviceTime}
                onChange={e => setRouteConfig(p => ({ ...p, serviceTime: e.target.value }))}
                className="w-20 text-center font-semibold"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Max Travel Time */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Max Travel Time</p>
                <p className="text-xs text-gray-500">Maximum travel time per route</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={routeConfig.maxTravelTime}
                onChange={e => setRouteConfig(p => ({ ...p, maxTravelTime: e.target.value }))}
                className="w-20 text-center font-semibold"
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>
          </div>

          {/* Max Stops per Vehicle */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Max Stops per Vehicle</p>
                <p className="text-xs text-gray-500">Maximum delivery stops per route</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={routeConfig.maxStops}
                onChange={e => setRouteConfig(p => ({ ...p, maxStops: e.target.value }))}
                className="w-20 text-center font-semibold"
              />
              <span className="text-sm text-gray-500">stops</span>
            </div>
          </div>

          {/* Max Distance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Max Distance</p>
                <p className="text-xs text-gray-500">Maximum delivery distance per route</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={routeConfig.maxDistance}
                onChange={e => setRouteConfig(p => ({ ...p, maxDistance: e.target.value }))}
                className="w-20 text-center font-semibold"
              />
              <span className="text-sm text-gray-500">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Engine */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Settings2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">Route Engine</p>
            <p className="text-xs text-gray-500 mt-0.5">Algorithm used for route planning</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              value: 'route' as const,
              label: 'Route Optimizer',
              badge: 'Default',
              lines: [
                'Distributes orders across trips to optimise for route efficiency and vehicle load balancing. Beats may be split across multiple trips.',
              ],
            },
            {
              value: 'beat' as const,
              label: 'Beat Optimizer',
              badge: null,
              lines: [
                'Keeps all orders belonging to the same beat in a single trip. Beats are never split across multiple trips. Routing and load optimisation remain unchanged.',
              ],
            },
            {
              value: 'clusterBeat' as const,
              label: 'Cluster Beat Optimizer',
              badge: null,
              lines: [
                'All orders belonging to a tagged beat must be generated into the same assigned vehicle and must never be split across multiple vehicles.',
              ],
            },
          ].map(option => {
            const isSelected = routeEngine === option.value;
            return (
              <label
                key={option.value}
                className={`block border rounded-lg p-4 cursor-pointer transition-colors group ${
                  isSelected
                    ? 'border-[#2D6EF5] bg-indigo-50/40'
                    : 'border-gray-200 bg-white hover:border-[#2D6EF5]'
                }`}
                onClick={() => setRouteEngine(option.value)}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-2 ${
                  isSelected
                    ? 'border-[#2D6EF5] bg-white'
                    : 'border-gray-300 bg-white group-hover:border-[#2D6EF5]'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#2D6EF5]" />}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-[#2D6EF5]' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  {option.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      option.badge === 'New'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {option.badge}
                    </span>
                  )}
                </div>
                {option.lines.map(line => (
                  <p key={line} className="text-xs text-gray-600">{line}</p>
                ))}
              </label>
            );
          })}
        </div>
      </div>

      {/* Proof of Delivery (OTP) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <CircleCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Proof of Delivery (OTP)</h2>
          </div>
          <button
            onClick={handleSaveOtp}
            disabled={!otpDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'seller' as const, label: 'Seller OTP', caption: '(Pickup & Return)', icon: Store },
            { key: 'retailer' as const, label: 'Retailer OTP', caption: '(Delivery)', icon: Truck },
          ].map(item => {
            const Icon = item.icon;
            const isEnabled = otpConfig[item.key];
            return (
              <div key={item.key} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.caption}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${
                    isEnabled ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`${item.label} ${item.caption}`}
                    onClick={() => setOtpConfig(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      isEnabled ? 'bg-[#2D6EF5]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ONDC Search Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">ONDC Search Configuration</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Controls the product category sent during <strong>Search Vehicles</strong> requests to the ONDC network.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={ondcCategory}
              onChange={e => setOndcCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Grocery</option>
              <option>Electronics</option>
              <option>Apparel</option>
              <option>Food</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900">
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Logistics Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Logistics Selection</h2>
          <button
            onClick={() => { setLogisticsSelection(pendingLogistics); toast.success('Logistics selection saved.'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-5">Choose the default logistics mode used across the platform.</p>
        <div className="flex items-center gap-8">
          {[
            { value: 'self', label: 'Self', description: 'Self logistics only' },
            { value: '3pl', label: '3PL', description: '3PL logistics only' },
            { value: 'both', label: 'Self + 3PL', description: 'Default' },
          ].map(option => (
            <label
              key={option.value}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => setPendingLogistics(option.value as 'both' | 'self' | '3pl')}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                pendingLogistics === option.value
                  ? 'border-[#2D6EF5] bg-white'
                  : 'border-gray-300 bg-white group-hover:border-[#2D6EF5]'
              }`}>
                {pendingLogistics === option.value && (
                  <div className="w-2 h-2 rounded-full bg-[#2D6EF5]" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${pendingLogistics === option.value ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.label}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Exclusions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Exclusions</h2>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            <Plus className="w-4 h-4" />
            Add Exclusion
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">S NO</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Field Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Value</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exclusions.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="py-4 pr-4 text-sm text-gray-700">{row.sno}</td>
                <td className="py-4 pr-4 text-sm text-gray-900">{row.fieldName}</td>
                <td className="py-4 pr-4 text-sm text-gray-700">{row.value}</td>
                <td className="py-4 pr-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    row.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button className="text-[#2D6EF5] hover:text-blue-700">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExclusion(row.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700">
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span className="text-sm text-gray-500">1–{exclusions.length} of {exclusions.length}</span>
          <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
