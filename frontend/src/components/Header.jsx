import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import auth from '@/lib/auth';

const Header = ({ onNewTicket, user }) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-effect border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Don Bosco</h1>
              <p className="text-sm text-purple-300">
                Sistema de Gestion de Tickets "Consorcio Salesianos"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-purple-100 mr-2">{user.name}</div>
                {user.role === 'admin' && (
                  <Button
                    onClick={() => (typeof onManageUsers === 'function' ? onManageUsers() : null)}
                    variant="outline"
                    className="mr-2"
                  >
                    Usuarios
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => auth.logout()}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesion
                </Button>
              </>
            ) : (
              <Button
                onClick={onNewTicket}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Ticket
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
