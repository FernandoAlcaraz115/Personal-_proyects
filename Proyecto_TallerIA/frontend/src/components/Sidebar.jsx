import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Productos' },
  { to: '/inventory', icon: Warehouse, label: 'Inventario' },
  { to: '/customers', icon: Users, label: 'Clientes' },
  { to: '/sales', icon: ShoppingCart, label: 'Ventas' },
];

export default function Sidebar() {
  const { tenant, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">Nexos ERP</h1>
        <p className="text-slate-400 text-sm mt-1 truncate">{tenant?.companyName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
