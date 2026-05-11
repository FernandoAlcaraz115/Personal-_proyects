import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../api/axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const fetchCustomers = () => api.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '' });
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/customers/${editing.id}`, form);
    } else {
      await api.post('/customers', form);
    }
    setModal(false);
    fetchCustomers();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/customers/${id}`);
    fetchCustomers();
  };

  const fields = [
    { label: 'Nombre', key: 'name', required: true, placeholder: 'Nombre completo' },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
    { label: 'Teléfono', key: 'phone', placeholder: '+52 555 000 0000' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nombre', 'Email', 'Teléfono', 'Acciones'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                <td className="px-6 py-4 text-slate-600">{c.email || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{c.phone || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No hay clientes registrados
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
              <h3 className="text-lg font-bold text-slate-800">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
