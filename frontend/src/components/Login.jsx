import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import auth from '@/lib/auth';

const Login = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await auth.login(username.trim(), password);
      toast({
        title: 'Sesión iniciada',
        description: `Bienvenido ${user.name}`,
      });
      if (onLoginSuccess) onLoginSuccess(user);
      if (onClose) onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-2">Iniciar sesion</h2>
        <p className="text-sm text-purple-200 mb-4">Accede a tu cuenta de "BoscoDesk"</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded-md p-3 bg-white/5 border border-white/10 text-white"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />

          <input
            className="rounded-md p-3 bg-white/5 border border-white/10 text-white"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
