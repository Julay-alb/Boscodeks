import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const AREAS = ['BILBAO', 'CHUNIZA', 'SAN JOSE', 'ESTRELLITA', 'SEDE ADMINISTRATIVA'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const UserManagement = ({ onClose, onUserCreated }) => {
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'agent',
    areas: [],
  });
  const [loading, setLoading] = useState(false);

  const toggleArea = (a) => {
    setForm((s) => ({
      ...s,
      areas: s.areas.includes(a) ? s.areas.filter((x) => x !== a) : [...s.areas, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      toast({
        title: 'Error',
        description: 'El usuario y la contraseña son obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al crear el usuario');
      }

      const newUser = await res.json();
      toast({
        title: 'Usuario creado',
        description: `Usuario ${newUser.username} creado correctamente.`,
      });

      if (typeof onUserCreated === 'function') onUserCreated(newUser);
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-effect rounded-2xl p-8 max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <button onClick={onClose} className="text-purple-300 p-2 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Usuario</label>
            <input
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">
              Nombre completo
            </label>
            <input
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3"
            >
              <option value="agent">Agente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-200 mb-2">Áreas</label>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <label key={a} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.areas.includes(a)}
                    onChange={() => toggleArea(a)}
                  />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UserManagement;
