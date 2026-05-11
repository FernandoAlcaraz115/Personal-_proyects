import { useState, useEffect } from 'react';
import { AlertTriangle, Pencil, X } from 'lucide-react';
import api from '../api/axios';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', minStock: '' });

  const fetchInventory = () => api.get('/inventory').then(r => setInventory(r.data));
  useEffect(() => { fetchInventory(); }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ quantity: item.quantity, minStock: item.minStock });
  };

  const handleSave = async () => {
    await api.patch(`/inventory/${editing.id}`, form);
    setEditing(null);
    fetchInventory();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Inventario</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado', 'Ajustar'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(item => {
              const low = item.quantity <= item.minStock;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.product.name}</td>
                  <td className="px-6 py-4 text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-4 text-slate-500">{item.minStock}</td>
                  <td className="px-6 py-4">
                    {low ? (
                      <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                        <AlertTriangle size={14} /> Stock bajo
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No hay productos en inventario
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Ajustar Stock</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <p className="text-slate-600 mb-4 font-medium">{editing.product.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={e => setForm({ ...form, minStock: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
