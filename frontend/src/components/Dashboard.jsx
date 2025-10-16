import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";

const Dashboard = ({ tickets }) => {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const cards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Abiertos",
      value: stats.open,
      icon: AlertCircle,
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-500/20 to-pink-500/20",
    },
    {
      title: "En Progreso",
      value: stats.inProgress,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
      title: "Cerrados",
      value: stats.closed,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/20 to-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`glass-effect rounded-2xl p-6 bg-gradient-to-br ${card.bgGradient} hover:scale-105 transition-transform duration-300 cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl shadow-lg`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="text-4xl font-bold text-white"
            >
              {card.value}
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold text-purple-200">
            {card.title}
          </h3>
        </motion.div>
      ))}
    </div>
  );
};

export default Dashboard;
