import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock, CheckCircle, MessageSquare } from "lucide-react";

const TicketCard = ({ ticket, onClick, index }) => {
  const statusConfig = {
    open: {
      label: "Abierto",
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/50",
    },
    "in-progress": {
      label: "En Progreso",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/50",
    },
    closed: {
      label: "Cerrado",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/50",
    },
  };

  const priorityConfig = {
    low: { label: "Baja", color: "bg-blue-500" },
    medium: { label: "Media", color: "bg-yellow-500" },
    high: { label: "Alta", color: "bg-orange-500" },
    urgent: { label: "Urgente", color: "bg-red-500" },
  };

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className={`glass-effect rounded-2xl p-6 cursor-pointer border-2 ${status.border} hover:shadow-2xl transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${status.bg} ${status.color} px-3 py-1 rounded-lg flex items-center gap-2`}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{status.label}</span>
        </div>
        <div
          className={`${priority.color} px-3 py-1 rounded-lg text-white text-xs font-bold`}
        >
          {priority.label}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
        {ticket.title}
      </h3>
      <p className="text-purple-300 text-sm mb-4 line-clamp-3">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-purple-400">
          <MessageSquare className="w-4 h-4" />
          <span>{ticket.comments?.length || 0} comentarios</span>
        </div>
        <span className="text-purple-400">
          {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
        </span>
      </div>

      {ticket.assignedTo && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-purple-400">Asignado a:</p>
          <p className="text-sm text-white font-semibold">
            {ticket.assignedTo}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TicketCard;
