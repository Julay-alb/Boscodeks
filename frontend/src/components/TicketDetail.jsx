import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TicketDetail = ({
  ticket,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
}) => {
  const [comment, setComment] = useState("");

  const handleStatusChange = (newStatus) => {
    onUpdate(ticket.id, { status: newStatus });
    toast({
      title: "Estado actualizado",
      description: `El ticket ahora está ${
        newStatus === "open"
          ? "abierto"
          : newStatus === "in-progress"
          ? "en progreso"
          : "cerrado"
      }`,
    });
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este ticket?")) {
      onDelete(ticket.id);
      toast({
        title: "Ticket eliminado",
        description: "El ticket ha sido eliminado correctamente",
      });
      onClose();
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onAddComment(ticket.id, comment);
    setComment("");
    toast({
      title: "Comentario añadido",
      description: "Tu comentario ha sido agregado correctamente",
    });
  };

  const priorityConfig = {
    low: { label: "Baja", color: "bg-blue-500" },
    medium: { label: "Media", color: "bg-yellow-500" },
    high: { label: "Alta", color: "bg-orange-500" },
    urgent: { label: "Urgente", color: "bg-red-500" },
  };

  const statusConfig = {
    open: { label: "Abierto", color: "bg-red-500" },
    "in-progress": { label: "En Progreso", color: "bg-yellow-500" },
    closed: { label: "Cerrado", color: "bg-green-500" },
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-effect rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              {ticket.title}
            </h2>
            <div className="flex gap-3 flex-wrap">
              <span
                className={`${
                  priorityConfig[ticket.priority].color
                } px-3 py-1 rounded-lg text-white text-sm font-bold`}
              >
                {priorityConfig[ticket.priority].label}
              </span>
              <span
                className={`${
                  statusConfig[ticket.status].color
                } px-3 py-1 rounded-lg text-white text-sm font-bold`}
              >
                {statusConfig[ticket.status].label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-200 mb-3">
              Descripción
            </h3>
            <p className="text-white leading-relaxed">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-effect rounded-xl p-4">
              <p className="text-sm text-purple-400 mb-1">Creado</p>
              <p className="text-white font-semibold">
                {new Date(ticket.createdAt).toLocaleString("es-ES")}
              </p>
            </div>
            <div className="glass-effect rounded-xl p-4">
              <p className="text-sm text-purple-400 mb-1">
                última actualización
              </p>
              <p className="text-white font-semibold">
                {new Date(ticket.updatedAt).toLocaleString("es-ES")}
              </p>
            </div>
          </div>

          {ticket.assignedTo && (
            <div className="glass-effect rounded-xl p-4">
              <p className="text-sm text-purple-400 mb-1">Asignado a</p>
              <p className="text-white font-semibold">{ticket.assignedTo}</p>
            </div>
          )}

          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-200 mb-4">
              Cambiar Estado
            </h3>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => handleStatusChange("open")}
                className={`${
                  ticket.status === "open" ? "bg-red-600" : "bg-red-600/50"
                } hover:bg-red-700 text-white`}
              >
                Abierto
              </Button>
              <Button
                onClick={() => handleStatusChange("in-progress")}
                className={`${
                  ticket.status === "in-progress"
                    ? "bg-yellow-600"
                    : "bg-yellow-600/50"
                } hover:bg-yellow-700 text-white`}
              >
                En Progreso
              </Button>
              <Button
                onClick={() => handleStatusChange("closed")}
                className={`${
                  ticket.status === "closed"
                    ? "bg-green-600"
                    : "bg-green-600/50"
                } hover:bg-green-700 text-white`}
              >
                Cerrado
              </Button>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-300" />
              <h3 className="text-lg font-semibold text-purple-200">
                Comentarios ({ticket.comments?.length || 0})
              </h3>
            </div>

            <div className="space-y-4 mb-4">
              {ticket.comments?.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-300">
                      {comment.author}
                    </span>
                    <span className="text-sm text-purple-400">
                      {new Date(comment.createdAt).toLocaleString("es-ES")}
                    </span>
                  </div>
                  <p className="text-white">{comment.text}</p>
                </motion.div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>

          <Button
            onClick={handleDelete}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 rounded-xl"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar Ticket
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TicketDetail;
