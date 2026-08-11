import { ChevronLeft, ChevronRight, Package, Truck, MapPin, FileText, Settings, Users } from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeItem, onItemClick, isCollapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'delivery', label: 'Delivery Planning', icon: Truck },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className={`bg-[#2D4AA5] text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-[70px]' : 'w-[240px]'
      }`}
    >
      <div className={`px-4 py-4 flex items-center border-b border-white/10 ${
        isCollapsed ? 'justify-center' : 'gap-2 justify-between'
      }`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-white/10 p-1.5 rounded">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Logistics Buyer</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors ${
            isCollapsed ? '' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full px-4 py-3 flex items-center text-left transition-colors text-sm ${
                isActive 
                  ? 'bg-[#3D5BBF]' 
                  : 'hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}