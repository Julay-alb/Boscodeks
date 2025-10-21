import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const AREAS = ['BILBAO', 'CHUNIZA', 'SAN JOSE', 'ESTRELLITA', 'SEDE ADMINISTRATIVA'];

const UserManagement = ({ onClose, onCreateUser }) => {
  const [form, setForm] = useState({ username: '', full_name: '', role: 'agent', areas: [] });

  const toggleArea = (a) => {
    setForm((s) => ({
      ...s,
      areas: s.areas.includes(a) ? s.areas.filter((x) => x !== a) : [...s.areas, a],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast({
        title: 'Error',
        description: 'El usuario necesita un nombre de usuario',
        variant: 'destructive',
      });
      return;
    }
    const user = { ...form, id: Date.now().toString() };
    if (typeof onCreateUser === 'function') onCreateUser(user);
    toast({ title: 'Usuario creado', description: `Usuario ${user.username} creado` });
    onClose();
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
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              Crear Usuario
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
