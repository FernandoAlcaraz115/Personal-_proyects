import { useEffect, useState } from 'react';
import { Package, Warehouse, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { tenant } = useAuth();
  const [stats, setStats] = useState({ products: 0, lowStock: 0, customers: 0, sales: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/inventory'),
      api.get('/customers'),
      api.get('/sales')
    ]).then(([products, inventory, customers, sales]) => {
      setStats({
        products: products.data.length,
        lowStock: inventory.data.filter(i => i.quantity <= i.minStock).length,
        customers: customers.data.length,
        sales: sales.data.length,
        revenue: sales.data.reduce((sum, s) => sum + parseFloat(s.total), 0)
      });
    });
  }, []);

  const cards = [
    { label: 'Productos', value: stats.products, icon: Package, color: 'blue' },
    { label: 'Stock Bajo', value: stats.lowStock, icon: AlertTriangle, color: 'yellow' },
    { label: 'Clientes', value: stats.customers, icon: Users, color: 'green' },
    { label: 'Ventas', value: stats.sales, icon: ShoppingCart, color: 'purple' },
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h2>
      <p className="text-slate-500 mb-8">Bienvenido, {tenant?.companyName}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className={`inline-flex p-3 rounded-lg mb-4 ${colorMap[color]}`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 mb-2">Ingresos Totales</h3>
        <p className="text-4xl font-bold text-green-600">
          ${stats.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
