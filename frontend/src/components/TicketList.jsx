import React from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import TicketCard from "@/components/TicketCard";

const TicketList = ({
  tickets,
  onSelectTicket,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) => {
  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-300" />
            <span className="font-semibold text-purple-200">Filtros:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="in-progress">En Progreso</option>
            <option value="closed">Cerrados</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="all">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full glass-effect rounded-2xl p-12 text-center"
          >
            <p className="text-xl text-purple-300">
              No hay tickets que mostrar
            </p>
            <p className="text-sm text-purple-400 mt-2">
              Crea tu primer ticket para comenzar
            </p>
          </motion.div>
        ) : (
          tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onSelectTicket(ticket)}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;
