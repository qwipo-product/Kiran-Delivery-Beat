import { useState } from 'react';
import { Menu, User } from 'lucide-react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { OrdersPage } from './components/pages/OrdersPage';
import { CreateOrderPage } from './components/pages/CreateOrderPage';
import { DeliveryPlanningPage } from './components/pages/DeliveryPlanningPage';
import { TripsPage } from './components/pages/TripsPage';
import type { Trip } from './components/pages/TripsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { CustomersPage } from './components/pages/CustomersPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AddClusterPage } from './components/pages/AddClusterPage';
import type { Cluster } from './context/DataContext';
import { QuickOrderPage } from './components/pages/QuickOrderPage';
import { SelfLogisticsDialog } from './components/SelfLogisticsDialog';
import { CreateDeliveryRoutePage } from './components/pages/CreateDeliveryRoutePage';
import { OrderDetailsPage } from './components/pages/OrderDetailsPage';
import { DataProvider } from './context/DataContext';
import type { Order } from './components/OrdersTable';
import type { MergedOrder } from './components/MergeOrdersDialog';

export default function App() {
  const [activeTab, setActiveTab] = useState<'3pl' | 'self'>('3pl');
  const [activeMenuItem, setActiveMenuItem] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showSelfLogisticsDialog, setShowSelfLogisticsDialog] = useState(false);
  const [showCreateDeliveryRoute, setShowCreateDeliveryRoute] = useState(false);
  const [selectedOrdersForRoute, setSelectedOrdersForRoute] = useState<Order[]>([]);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | MergedOrder | null>(null);
  const [allOrders, setAllOrders] = useState<(Order | MergedOrder)[]>([]);
  const [confirmedTrips, setConfirmedTrips] = useState<Trip[]>([]);
  const [showAddCluster, setShowAddCluster] = useState(false);
  const [clusterToEdit, setClusterToEdit] = useState<Cluster | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState('profile');

  const renderPage = () => {
    if (selectedOrderForDetails) {
      return (
        <OrderDetailsPage
          order={selectedOrderForDetails}
          onBack={() => setSelectedOrderForDetails(null)}
          onBookingConfirmed={(trip) => {
            setConfirmedTrips(prev => [trip as Trip, ...prev]);
            setSelectedOrderForDetails(null);
            setActiveMenuItem('trips');
          }}
        />
      );
    }

    if (showCreateOrder) {
      return <CreateOrderPage onBack={() => setShowCreateOrder(false)} />;
    }

    if (showQuickOrder) {
      return (
        <QuickOrderPage
          onBack={() => setShowQuickOrder(false)}
          onSave={(newOrder) => {
            setShowQuickOrder(false);
            setSelectedOrderForDetails(newOrder);
          }}
        />
      );
    }

    if (showAddCluster) {
      return (
        <AddClusterPage
          cluster={clusterToEdit}
          onBack={() => {
            setShowAddCluster(false);
            setClusterToEdit(null);
          }}
        />
      );
    }

    if (showCreateDeliveryRoute) {
      return (
        <CreateDeliveryRoutePage
          onBack={() => setShowCreateDeliveryRoute(false)}
          activeTab={activeTab}
          onConfirm={(selectedOrders, deliveryDate) => {
            console.log('Route confirmed with orders:', selectedOrders, 'Date:', deliveryDate);
            setShowCreateDeliveryRoute(false);
          }}
        />
      );
    }

    switch (activeMenuItem) {
      case 'orders':
        return (
          <OrdersPage
            onNavigateToCreateOrder={() => setShowCreateOrder(true)}
            onNavigateToQuickOrder={() => setShowQuickOrder(true)}
            onNavigateToCreateDeliveryRoute={(selectedOrders) => {
              setSelectedOrdersForRoute(selectedOrders);
              setShowCreateDeliveryRoute(true);
            }}
            onNavigateToOrderDetails={(order) => {
              setSelectedOrderForDetails(order);
            }}
          />
        );
      case 'delivery':
        return (
          <DeliveryPlanningPage
            activeTab={activeTab}
            onTripsCreated={(trips) => {
              setConfirmedTrips(prev => [...trips, ...prev]);
              setActiveMenuItem('trips');
            }}
          />
        );
      case 'trips':
        return <TripsPage extraTrips={confirmedTrips} activeTab={activeTab} />;
      case 'reports':
        return <ReportsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'settings':
        return (
          <SettingsPage
            initialTab={settingsInitialTab}
            onNavigateToAddCluster={(cluster) => {
              setClusterToEdit(cluster ?? null);
              setSettingsInitialTab('clusters');
              setShowAddCluster(true);
            }}
          />
        );
      default:
        return (
          <OrdersPage
            onNavigateToCreateOrder={() => setShowCreateOrder(true)}
            onNavigateToQuickOrder={() => setShowQuickOrder(true)}
            onNavigateToCreateDeliveryRoute={(selectedOrders) => {
              setSelectedOrdersForRoute(selectedOrders);
              setShowCreateDeliveryRoute(true);
            }}
            onNavigateToOrderDetails={(order) => {
              setSelectedOrderForDetails(order);
            }}
          />
        );
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-[#F9FAFB]">
        <Toaster position="top-right" richColors />
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar 
            activeItem={activeMenuItem} 
            onItemClick={(item) => {
              setActiveMenuItem(item);
              setSidebarOpen(false);
              // Entering Settings from the nav always starts on Profile
              setSettingsInitialTab('profile');
            }}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 flex flex-col overflow-hidden min-h-0">
            {renderPage()}
          </main>
        </div>

        {/* Self Logistics Dialog */}
        <SelfLogisticsDialog
          open={showSelfLogisticsDialog}
          onOpenChange={setShowSelfLogisticsDialog}
        />
      </div>
    </DataProvider>
  );
}