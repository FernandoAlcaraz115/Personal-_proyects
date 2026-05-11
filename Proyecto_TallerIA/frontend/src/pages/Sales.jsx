import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/axios';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customerId: '', items: [] });
  const [loading, setLoading] = useState(false);

  const fetchData = () => Promise.all([
    api.get('/sales').then(r => setSales(r.data)),
    api.get('/products').then(r => setProducts(r.data)),
    api.get('/customers').then(r => setCustomers(r.data)),
  ]);

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm({ customerId: '', items: [] });
    setModal(true);
  };

  const addItem = () => {
    if (products.length === 0) return;
    setForm(f => ({ ...f, items: [...f.items, { productId: products[0].id, quantity: 1 }] }));
  };

  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const updateItem = (idx, field, value) =>
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const getTotal = () => form.items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? parseFloat(product.price) * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return alert('Agrega al menos un producto');
    setLoading(true);
    try {
      await api.post('/sales', { ...form, customerId: form.customerId || null });
      setModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ventas</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Nueva Venta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Fecha', 'Cliente', 'Productos', 'Total', 'Estado'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map(sale => (
              <tr key={sale.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {new Date(sale.createdAt).toLocaleDateString('es-MX')}
                </td>
                <td className="px-6 py-4 text-slate-700">{sale.customer?.name || 'Público general'}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{sale.items.length} ítem(s)</td>
                <td className="px-6 py-4 font-semibold text-slate-800">${parseFloat(sale.total).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No hay ventas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Nueva Venta</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (opcional)</label>
                <select
                  value={form.customerId}
                  onChange={e => setForm({ ...form, customerId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Público general</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Productos</label>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={products.length === 0}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-40 text-sm font-medium"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>

                {form.items.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-slate-300 rounded-lg">
                    Agrega productos a la venta
                  </p>
                )}

                <div className="space-y-2">
                  {form.items.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={item.productId}
                          onChange={e => updateItem(idx, 'productId', e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${parseFloat(p.price).toFixed(2)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm font-medium text-slate-700 w-20 text-right">
                          ${product ? (parseFloat(product.price) * item.quantity).toFixed(2) : '0.00'}
                        </p>
                        <button type="button" onClick={() => removeItem(idx)} className="p-1 hover:bg-red-50 rounded text-red-400">
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {form.items.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="text-xl font-bold text-slate-800">${getTotal().toFixed(2)}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || form.items.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Registrando...' : 'Registrar Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
