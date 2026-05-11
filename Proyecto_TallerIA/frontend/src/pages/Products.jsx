import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', sku: '' });
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => api.get('/products').then(r => setProducts(r.data));
  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', sku: '' });
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, sku: p.sku || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
      } else {
        await api.post('/products', form);
      }
      setModal(false);
      fetchProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto? También se eliminará su historial de ventas.')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const fields = [
    { label: 'Nombre', key: 'name', required: true, placeholder: 'Ej: Tomate cherry' },
    { label: 'SKU', key: 'sku', placeholder: 'Ej: TOM-001' },
    { label: 'Precio', key: 'price', type: 'number', required: true, step: '0.01', min: '0', placeholder: '0.00' },
    { label: 'Descripción', key: 'description', placeholder: 'Descripción opcional' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Productos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nombre', 'SKU', 'Precio', 'Stock', 'Acciones'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{p.name}</p>
                  {p.description && <p className="text-slate-400 text-sm">{p.description}</p>}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{p.sku || '—'}</td>
                <td className="px-6 py-4 font-medium text-slate-800">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (p.inventoryItem?.quantity ?? 0) <= (p.inventoryItem?.minStock ?? 5)
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {p.inventoryItem?.quantity ?? 0} uds.
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ label, key, ...props }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    {...props}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
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
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
